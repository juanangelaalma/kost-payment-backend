const { Op } = require("sequelize")
const { Bill, Payment } = require("../models")

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

const getBillsUser = (user) => {
  return Bill.findAll({
    where: {
      userId: user.id
    },
    include: [
      {
        model: Payment,
        required: false,
        as: 'payments',
      },
    ],
  })
}

const BillService = {
  getTotalBillsUser,
  getBillsUser
}

module.exports = BillService