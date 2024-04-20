'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bill extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Bill.init({
    userId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    date: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    amount: {
      allowNull: false,
      type: DataTypes.BIGINT,
    },
    createdAt: {
      allowNull: true,
      type: 'TIMESTAMP',
    },
    updatedAt: {
      type: 'TIMESTAMP',
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Bill'
  });

  Bill.prototype.__defineGetter__('month', function () {
    return this.date.getMonth() + 1;
  });

  Bill.prototype.__defineGetter__('year', function () {
    return this.date.getFullYear();
  });

  Bill.associate = (models) => {
    Bill.hasMany(models.Payment, { as: 'payments', foreignKey: 'billId' });
  }
  return Bill;
};