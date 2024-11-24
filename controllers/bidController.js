const { Bid, Auction } = require('../models');
const redis = require('redis');
const redisClient = redis.createClient();

// Place a bid in an auction
async function placeBid(req, res) {
  const { userId, auctionId, bidAmount } = req.body;
  
  try {
    // Find the auction to ensure it exists
    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Save the bid to the database
    const bid = await Bid.create({
      user_id: userId,
      auction_id: auctionId,
      bid_amount: bidAmount,
    });

    // Update the current highest bid in Redis
    redisClient.set(auctionId, bidAmount);

    // Broadcast the bid (this would be part of the WebSocket functionality)
    // Example: broadcastNewBid(auctionId, bidAmount);

    res.status(201).json(bid);
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ message: 'Error placing bid' });
  }
}

// Get all bids for a specific auction
async function getBidsForAuction(req, res) {
  const { auctionId } = req.params;
  try {
    const bids = await Bid.findAll({ where: { auction_id: auctionId } });
    res.status(200).json(bids);
  } catch (error) {
    console.error('Error fetching bids:', error);
    res.status(500).json({ message: 'Error fetching bids' });
  }
}

module.exports = {
  placeBid,
  getBidsForAuction,
};
