const { Auction } = require('../models');

// Create a new auction
async function createAuction(req, res) {
  const { carId, startTime, endTime } = req.body;
  try {
    const auction = await Auction.create({
      car_id: carId,
      start_time: startTime,
      end_time: endTime,
    });
    res.status(201).json(auction);
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({ message: 'Error creating auction' });
  }
}

// Get all auctions
async function getAllAuctions(req, res) {
  try {
    const auctions = await Auction.findAll();
    res.status(200).json(auctions);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ message: 'Error fetching auctions' });
  }
}

module.exports = {
  createAuction,
  getAllAuctions,
};
