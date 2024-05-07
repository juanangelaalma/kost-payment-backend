const { Op } = require("sequelize")
const { Bill, Payment, User, Room } = require("../models")

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
    order: [['date', 'DESC']]
  })
}

const getBillById = (id) => {
  return Bill.findByPk(id, {
    include: [
      {
        model: Payment,
        required: false,
        as: 'payments',
      },
    ],
  })
}

const getCountBills = async () => {
  const total = await Bill.count({
    where: {
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

  return total
}

const getBillsWithRoomByStatus = async (status) => {
  const paymentCondition = status ? (
    status === 'paid'
      ? {
        [Op.and]: [
          { '$payments.id$': { [Op.not]: null } },
          { '$payments.status$': 'paid' }
        ]
      } : {
        [Op.or]: [
          { '$payments.id$': { [Op.eq]: null } },
          { '$payments.status$': 'failed' }
        ]
      }
  ) : {}

  const includeOptions = [
    {
      model: Payment,
      required: false,
      as: 'payments',
    },
    {
      model: User,
      required: true,
      as: 'user',
      include: [
        {
          model: Room,
          required: true,
          as: 'room',
        }
      ]
    }
  ];

  const bills = await Bill.findAll({
    where: paymentCondition,
    include: includeOptions,
    order: [['date', 'DESC']]
  });

  return bills;
};

const createBillUser = async (userId, amount, date) => Bill.create({
  userId: userId,
  amount,
  date
})

const BillService = {
  getTotalBillsUser,
  getBillsUser,
  getBillById,
  getCountBills,
  getBillsWithRoomByStatus,
  createBillUser
}

module.exports = BillService