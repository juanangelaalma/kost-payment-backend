const { faker } = require('@faker-js/faker');
const generateInvoiceNumber = require('../utils/generateInvoiceNumber');
const { Payment } = require('../models')

const createPaymentBill = (data) => {
  const currentDate = new Date()

  return Payment.create({
    billId: data.bill.id,
    paymentMethodId: data.paymentMethod.id,
    invoice: data.invoice || generateInvoiceNumber(),
    amount: data.amount || data.bill.amount,
    status: data.status || 'pending',
    vaNumber: data.vaNumber || faker.finance.account(),
    deadline: data.deadline || new Date(currentDate.getTime() + (24 * 60 * 60 * 1000)),
    paidAt: data.paidAt || null
  })
}

const PaymentFactory = {
  createPaymentBill
}

module.exports = PaymentFactory