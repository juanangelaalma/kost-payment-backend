const crypto = require('crypto')
const { midtransServerKey } = require('../config/payments')

const generateSignatureKeyHash = (orderId, statusCode, grossAmount) => {
  const signatureKey = `${orderId}${statusCode}${grossAmount}${midtransServerKey}`
  const hash = crypto.createHash("sha512")
  hash.update(signatureKey)
  const signature = hash.digest("hex")
  return signature
}

module.exports = generateSignatureKeyHash