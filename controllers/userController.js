const { User } = require('../models');

// Create a new user
async function createUser(req, res) {
  const { username } = req.body;
  try {
    const user = await User.create({ username });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
}

// Get a user by ID
async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
}

module.exports = {
  createUser,
  getUserById,
};
