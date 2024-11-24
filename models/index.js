const { Sequelize, DataTypes } = require('sequelize');

// Set up Sequelize connection
const sequelize = new Sequelize('car_auction', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

// Importing the models
const Auction = require('./auction')(sequelize, DataTypes);
const Bid = require('./bid')(sequelize, DataTypes);
const User = require('./user')(sequelize, DataTypes);

// Define model relationships
Auction.hasMany(Bid, { foreignKey: 'auction_id' });
Bid.belongsTo(Auction, { foreignKey: 'auction_id' });

User.hasMany(Bid, { foreignKey: 'user_id' });
Bid.belongsTo(User, { foreignKey: 'user_id' });

// Sync models
sequelize.sync()
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Error syncing database:', err));

module.exports = { Auction, Bid, User, sequelize };
