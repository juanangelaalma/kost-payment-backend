const { MidtransError } = require("midtrans-client")
const BillService = require("../services/bill.service")
const PaymentMethodService = require("../services/payment-method.service")
const PaymentService = require("../services/payment.service")
const createApiResponse = require("../utils/createApiResponse")
const formatCurrency = require("../utils/formatCurrency")
const generateInvoiceNumber = require("../utils/generateInvoiceNumber")

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

    let formattedBills = bills.map((bill) => {
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

    // Filter by status
    const statuses = req.query.status
    if (statuses) {
      const arrayOfStatuses = statuses.split('|')
      formattedBills = formattedBills.filter(bill => arrayOfStatuses.includes(bill.status))
    }

    // Limit the number of bills
    const limit = req.query.limit
    if (limit) {
      formattedBills = formattedBills.slice(0, limit)
    }

    return res.send(createApiResponse(true, formattedBills, null))
  } catch (error) {
    return res.status(500).send(createApiResponse(false, null, error.message))
  }
}

const payBillHandler = async (req, res) => {
  const user = res.locals.user
  const billId = req.params.id

  try {
    const { paymentMethod: paymentMethodName } = req.body

    const bill = await BillService.getBillById(billId)

    if (!bill) {
      return res.status(404).send(createApiResponse(false, null, 'Bill not found'))
    }

    if (getBillStatus(bill) === 'paid') {
      return res.status(400).send(createApiResponse(false, null, 'Bill sudah dibayar'))
    }

    if (getBillStatus(bill) === 'pending') {
      return res.status(400).send(createApiResponse(false, null, 'Bill sedang menunggu pembayaran'))
    }

    const paymentMethod = await PaymentMethodService.getPaymentMethodByName(paymentMethodName)

    if (!paymentMethod) {
      return res.status(404).send(createApiResponse(false, null, 'Payment method not found'))
    }

    const invoice = generateInvoiceNumber()

    const midtransPayment = await PaymentService.createPaymentMidtrans({
      invoice, amount: bill.amount, paymentMethod: paymentMethod.name,
      userEmail: user.email, userName: user.name
    })

    const payment = await PaymentService.createPayment({
      billId: bill.id, paymentMethodId: paymentMethod.id,
      invoice, amount: bill.amount, vaNumber: midtransPayment.va_number
    })

    const responseData = {
      invoice,
      status: 'pending',
      _links: {
        instruction: `/api/payments/${invoice}/instruction`,
      }
    }

    return res.status(201).send(createApiResponse(true, responseData, null))
  } catch (error) {
    if (error instanceof MidtransError) {
      return res.status(500).send(createApiResponse(false, null, 'Midtrans error'))
    }
    return res.status(500).send(createApiResponse(false, null, error.message))
  }
}

const BillController = {
  getTotalBillsHandler,
  getBillsUserHandler,
  payBillHandler,
}

module.exports = BillController