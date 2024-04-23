const validateRequest = require("./middlewares/validateRequest")
const UserController = require("./controllers/user.controller")
const LoginSchema = require("./schemas/login.schema")
const BillSchema = require("./schemas/bill.schema")
const requireUser = require("./middlewares/requireUser")
const BillController = require("./controllers/bill.controller")
const PaymentController = require("./controllers/payment.controller")
const MidtransController = require("./controllers/midtrans.controller")

const routes = (app) => {
  app.post('/api/login', validateRequest(LoginSchema.createLoginSchema), UserController.loginHandler)

  app.get('/api/total-bills', requireUser, BillController.getTotalBillsHandler)
  app.get('/api/bills', requireUser, BillController.getBillsUserHandler)

  app.post('/api/bills/:id/pay', requireUser, validateRequest(BillSchema.paySchema), BillController.payBillHandler)

  app.get('/api/payments/:invoice', requireUser, PaymentController.getPaymentHandler)

  app.post('/api/midtrans-notification', MidtransController.notificationHandler)
}

module.exports = routes