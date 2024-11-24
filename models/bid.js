module.exports = (sequelize, DataTypes) => {
    const Bid = sequelize.define('Bid', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      auction_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bid_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });
  
    return Bid;
  };
  