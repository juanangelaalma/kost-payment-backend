const { Bill } = require('../models')

const createBillUser = (user, amount, date = new Date) => {
  const userId = user.id

  return Bill.create({
    userId,
    date: date,
    amount: amount,
  })
}

const BillFactory = {
  createBillUser
}

module.exports = BillFactory