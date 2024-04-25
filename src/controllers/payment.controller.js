const PaymentService = require("../services/payment.service")
const createApiResponse = require("../utils/createApiResponse")
const formatCurrency = require("../utils/formatCurrency")
const formatTimestamp = require("../utils/formatTimestamp")

const getPaymentHandler = async (req, res) => {
  const user = res.locals.user
  const invoice = req.params.invoice

  try {
    const payment = await PaymentService.getPayment(invoice, user.id)

    if (!payment) {
      return res.status(404).send(createApiResponse(false, null, 'Payment not found'))
    }

    const formattedPayment = {
      id: payment.id,
      invoice: payment.invoice,
      amount: formatCurrency(payment.amount),
      formattedDeadline: formatTimestamp(payment.deadline),
      deadline: payment.deadline,
      status: payment.status,
      payment: {
        title: payment.paymentMethod.title,
        logo: payment.paymentMethod.logo,
        name: payment.paymentMethod.name,
        vaNumber: payment.vaNumber
      }
    }

    return res.send(createApiResponse(true, formattedPayment, null))
  } catch (error) {
    return res.status(500).send(createApiResponse(false, null, error.message))
  }
}

const PaymentController = {
  getPaymentHandler
}

module.exports = PaymentController