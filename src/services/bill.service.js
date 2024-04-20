const { Op } = require("sequelize")
const { Bill, Payment, Sequelize } = require("../models")

const getTotalBillsUser = async (user) => {
  const bills = await Bill.findAll({
    where: {
      userId: user.id,
      [Op.or]: [
        { '$payments.id$': null },
        { '$payments.status$': { [Op.not]: 'paid' } }
      ]
    },
    include: [
      {
        model: Payment,
        required: false,
        as: 'payments',
      },
    ],
  })

  const total = bills.reduce((accumulator, bill) => {
    return accumulator + bill.amount
  }, 0)

  return total
}

const BillService = {
  getTotalBillsUser
}

module.exports = BillService