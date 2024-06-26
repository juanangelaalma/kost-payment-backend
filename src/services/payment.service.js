const BankTransfer = require("../payments/BankTransfer")
const { Payment, PaymentMethod, Bill } = require('../models')
const { where } = require("sequelize")

const createPaymentMidtrans = async ({ invoice, amount, paymentMethod, userEmail, userName }) => {
  const itemDetails = {
    id: invoice,
    price: amount,
    quantity: 1,
    name: `Invoice ${invoice}`,
  }

  const customerDetails = {
    first_name: userName,
    email: userEmail,
  }

  const newTransaction = {
    invoice,
    amount,
    paymentType: 'bank_transfer',
    name: userName,
    email: userEmail,
    customerDetails,
    itemDetails,
    paymentMethod
  }

  const midtransResponse = await createBankTransfer(newTransaction)
  return midtransResponse
}

const createBankTransfer = async (newTransaction) => {
  try {
    const core = new BankTransfer({
      payment_type: newTransaction.paymentType,
      order_id: newTransaction.invoice,
      amount: newTransaction.amount,
      item_details: newTransaction.itemDetails,
      customer_details: newTransaction.customerDetails,
      bank: newTransaction.paymentMethod,
    })
    const midtransResponse = await core.charge()
    return midtransResponse
  } catch (error) {
    throw error
  }
}

const createPayment = async ({ billId, paymentMethodId, invoice, amount, vaNumber }) => {
  const currentDate = new Date()
  const deadline = new Date(currentDate.getTime() + (24 * 60 * 60 * 1000))

  return Payment.create({
    billId,
    paymentMethodId,
    invoice,
    amount,
    vaNumber,
    deadline,
    status: 'pending',
    paidAt: null
  })
}

const getPayment = async (invoice, userId) => {
  return Payment.findOne({
    where: {
      invoice,
      '$bill.userId$': userId
    },
    include: [
      {
        model: PaymentMethod,
        as: 'paymentMethod',
        attributes: ['title', 'logo', 'name']
      },
      {
        model: Bill,
        as: 'bill',
        where: { userId }
      }
    ]
  });
}

const getPaymentById = (id) => {
  return Payment.findByPk(id)
}

const getPaymentByInvoice = (invoice) => {
  return Payment.findOne({
    where: {
      invoice
    }
  })
}

const getPayments = () => {
  return Payment.findAll()
}

const PaymentService = {
  createPaymentMidtrans,
  createPayment,
  getPayment,
  getPaymentById,
  getPaymentByInvoice,
  getPayments
}

module.exports = PaymentService