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

const BillController = {
  getTotalBillsHandler
}

module.exports = BillController