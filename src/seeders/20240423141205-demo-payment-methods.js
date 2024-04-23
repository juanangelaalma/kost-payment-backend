'use strict';
const PaymentMethodFactory = require('../factories/payment-method.factory');
const { Bill, PaymentMethod } = require('../models');
const generateInvoiceNumber = require('../utils/generateInvoiceNumber');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const bniPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ title: 'BNI Virtual Account', name: 'bni' });
    const briPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ title: 'BRI Virtual Account', name: 'bri' });
    const bcaPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ title: 'BCA Virtual Account', name: 'bca' });
  },

  async down(queryInterface, Sequelize) {
    
  }
};
