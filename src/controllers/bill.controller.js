const BillService = require("../services/bill.service")
const createApiResponse = require("../utils/createApiResponse")
const formatCurrency = require("../utils/formatCurrency")

const getTotalBillsHandler = async (req, res) => {
  const user = res.locals.user

  try {
    const totalBil = await BillService.getTotalBillsUser(user)

    const formattedTotalBills = formatCurrency(totalBil)

    return res.send(createApiResponse(true, { total: formattedTotalBills }, null))
  } catch (error) {
    return res.status(500).send(createApiResponse(false, null, error.message))
  }
}

const getBillStatus = (bill) => {
  if (bill.payments.length === 0) {
    return 'unpaid'
  }
  if (bill.payments.some(payment => payment.status === 'paid')) {
    return 'paid'
  }

  return bill.payments[0].status
}

const getBillsUserHandler = async (req, res) => {
  const user = res.locals.user

  try {
    const bills = await BillService.getBillsUser(user)

    const formattedBills = bills.map((bill) => {
      return {
        id: bill.id,
        month: bill.month,
        year: bill.year,
        amount: formatCurrency(bill.amount),
        status: getBillStatus(bill),
        _links: {
          pay: `/api/bills/${bill.id}/pay`,
          details: `/api/bills/${bill.id}/details`,
        }
      }
    })

    return res.send(createApiResponse(true, formattedBills, null))
  } catch (error) {
    throw error
    return res.status(500).send(createApiResponse(false, null, error.message))
  }
}

const BillController = {
  getTotalBillsHandler,
  getBillsUserHandler
}

module.exports = BillController