const { Bill } = require('../models')

const createBillUser = (user, amount) => {
  const userId = user.id

  return Bill.create({
    userId,
    date: new Date(),
    amount: amount,
  })
}

const BillFactory = {
  createBillUser
}

module.exports = BillFactory