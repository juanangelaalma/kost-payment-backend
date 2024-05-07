const { logModuleNames, logLevel } = require("./configs")
const wLogger = require("./wLogger")

const createUserInitiatedPaymentLog = (user, payment) => {
  return JSON.stringify({
    message: 'User initiated payment process',
    user,
    payment
  })
}

const createMidtransNotificationErrorLog = (message, notification) => {
  return JSON.stringify({
    message,
    notification
  })
}

const createUserCompletedPaymentProcessLog = (notification) => {
  return JSON.stringify({
    message: 'User completed payment process',
    notification
  })
}

const paymentLogger = wLogger({ logName: logModuleNames.PAYMENT, level: logLevel })

module.exports = { paymentLogger, createUserInitiatedPaymentLog, createMidtransNotificationErrorLog, createUserCompletedPaymentProcessLog }