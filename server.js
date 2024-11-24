const WebSocket = require('ws');
const redis = require('redis');
const auctionController = require('./controllers/auctionController');
const bidController = require('./controllers/bidController');
const userController = require('./controllers/userController'); // Placeholder if user-related actions are added

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8080 });

// Redis client setup
const redisClient = redis.createClient();

// Track auction rooms and active clients
const auctionRooms = new Map();

wss.on('connection', (ws) => {
  console.log('A new user connected');

  ws.on('message', async (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      console.log('Received message:', parsedMessage);

      switch (parsedMessage.action) {
        case 'joinAuction':
          await handleJoinAuction(ws, parsedMessage);
          break;

        case 'placeBid':
          await handlePlaceBid(parsedMessage);
          break;

        case 'auctionEnd':
          handleAuctionEnd(parsedMessage);
          break;

        default:
          ws.send(
            JSON.stringify({
              event: 'error',
              message: 'Invalid action',
            })
          );
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(
        JSON.stringify({
          event: 'error',
          message: 'An error occurred while processing your request.',
        })
      );
    }
  });

  ws.on('close', () => {
    console.log('A user disconnected');
    cleanUpDisconnectedClient(ws);
  });
});

console.log('WebSocket server is running on ws://localhost:8080');

// Handle user joining an auction
async function handleJoinAuction(ws, { auctionId }) {
  let room = auctionRooms.get(auctionId);
  if (!room) {
    room = [];
    auctionRooms.set(auctionId, room);
    console.log(`Auction room ${auctionId} created.`);
  }

  room.push(ws);

  ws.send(
    JSON.stringify({
      event: 'joinedAuction',
      auctionId,
      message: `You have joined Auction ${auctionId}`,
    })
  );

  // Fetch current highest bid from Redis
  redisClient.get(auctionId, (err, bid) => {
    if (err) {
      console.error(`Redis error: ${err}`);
      return;
    }
    ws.send(
      JSON.stringify({
        event: 'currentBid',
        auctionId,
        bidAmount: bid || 0,
      })
    );
  });
}

// Handle placing a bid
async function handlePlaceBid({ userId, auctionId, bidAmount }) {
  try {
    // Call bidController to store the bid
    await bidController.placeBid({ userId, auctionId, bidAmount });

    // Update current highest bid in Redis
    redisClient.set(auctionId, bidAmount);

    // Notify all clients in the auction room about the new bid
    const room = auctionRooms.get(auctionId);
    if (room) {
      room.forEach((client) =>
        client.send(
          JSON.stringify({
            event: 'newBid',
            auctionId,
            bidAmount,
          })
        )
      );
    }
  } catch (error) {
    console.error('Error placing bid:', error);
  }
}

// Handle auction end
function handleAuctionEnd({ auctionId }) {
  const room = auctionRooms.get(auctionId);
  if (room) {
    room.forEach((client) =>
      client.send(
        JSON.stringify({
          event: 'auctionEnd',
          auctionId,
          message: 'The auction has ended!',
        })
      )
    );
  }
  auctionRooms.delete(auctionId);
  console.log(`Auction room ${auctionId} ended and cleaned up.`);
}

// Clean up disconnected clients
function cleanUpDisconnectedClient(ws) {
  auctionRooms.forEach((room, auctionId) => {
    const index = room.indexOf(ws);
    if (index !== -1) {
      room.splice(index, 1);
      console.log(`Client removed from auction room ${auctionId}`);
    }
    if (room.length === 0) {
      auctionRooms.delete(auctionId);
      console.log(`Auction room ${auctionId} deleted as it is empty.`);
    }
  });
}
