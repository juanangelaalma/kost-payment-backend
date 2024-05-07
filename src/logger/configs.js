const logModuleNames = {
  PAYMENT: 'Payment',
}

const logLevel = process.env.LOG_LEVEL || 'info'

module.exports = { logModuleNames, logLevel }