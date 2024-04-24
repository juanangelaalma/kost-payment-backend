'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Room.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    code: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Room',
  });

  Room.associate = (models) => {
    Room.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
  }

  return Room;
};