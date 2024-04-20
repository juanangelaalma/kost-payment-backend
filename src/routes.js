const validateRequest = require("./middlewares/validateRequest")
const UserController = require("./controllers/user.controller")
const LoginSchema = require("./schemas/login.schema")
const BillSchema = require("./schemas/bill.schema")
const requireUser = require("./middlewares/requireUser")
const BillController = require("./controllers/bill.controller")

const routes = (app) => {
  app.post('/api/login', validateRequest(LoginSchema.createLoginSchema), UserController.loginHandler)

  app.get('/api/total-bills', requireUser, BillController.getTotalBillsHandler)
  app.get('/api/bills', requireUser, BillController.getBillsUserHandler)

  app.post('/api/bills/:id/pay', requireUser, validateRequest(BillSchema.paySchema), BillController.payBillHandler)
}

module.exports = routes