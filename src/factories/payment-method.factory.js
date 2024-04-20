const { faker } = require("@faker-js/faker")
const { PaymentMethod } = require('../models')

const getBank = () => {
  const banks = ['bri', 'bca', 'bni'];

  const randomIndex = Math.floor(Math.random() * banks.length);

  const randomBank = banks[randomIndex];

  return randomBank
}

const createPaymentMethod = (data) => {
  return PaymentMethod.create({
    name: data?.name || getBank(),
    title: data?.title || faker.finance.accountName(),
    logo: data?.logo || faker.image.avatar()
  })
}

const PaymentMethodFactory = {
  createPaymentMethod
}

module.exports = PaymentMethodFactory