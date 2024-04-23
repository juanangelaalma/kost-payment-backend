const PaymentService = require('../services/payment.service')
const createApiResponse = require('../utils/createApiResponse')
const generateSignatureKey = require('../utils/generateSignatureKey')

const notificationHandler = async (req, res) => {
  const { transaction_status, fraud_status, settlement_time, order_id, signature_key, status_code, gross_amount } = req.body

  try {
    if (!(generateSignatureKey(order_id, status_code, gross_amount) === signature_key)) {
      return res.status(400).send(createApiResponse(false, null, "Invalid signature"))
    }

    const payment = await PaymentService.getPaymentByInvoice(order_id)

    if (!payment) {
      return res.status(404).send(createApiResponse(false, null, 'Payment not found'))
    }

    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        await payment.update({ status: 'paid', paidAt: settlement_time })
      }
    } else if (transaction_status === 'settlement') {
      await payment.update({ status: 'paid', paidAt: settlement_time })
    }
    else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      await payment.update({ status: 'failed' })
    } else if (transaction_status === 'pending') {
      await payment.update({ status: 'pending' })
    }

    return res.sendStatus(200)
  } catch (error) {
    console.log(error)
    return res.status(500).send(createApiResponse(false, null, error.message))
  }
}

const MidtransController = {
  notificationHandler
}

module.exports = MidtransController