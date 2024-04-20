const { PaymentMethod } = require('../models')

const getPaymentMethodByName = (name) => {
  return PaymentMethod.findOne({ where: { name } })
}

const PaymentMethodService = {
  getPaymentMethodByName
}

module.exports = PaymentMethodService