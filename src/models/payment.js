'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Payment.init({
    billId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Bills',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    paymentMethodId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PaymentMethods',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    invoice: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'failed', 'paid'),
      allowNull: false,
      defaultValue: 'pending'
    },
    vaNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deadline: {
      type: 'TIMESTAMP',
      allowNull: false
    },
    paidAt: {
      type: 'TIMESTAMP',
      allowNull: true
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
    modelName: 'Payment',
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Bill, { as: 'bill', foreignKey: 'billId' });
  }

  return Payment;
};