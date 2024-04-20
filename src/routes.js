const validateRequest = require("./middlewares/validateRequest")
const UserController = require("./controllers/user.controller")
const LoginSchema = require("./schemas/login.schema")
const requireUser = require("./middlewares/requireUser")
const BillController = require("./controllers/bill.controller")

const routes = (app) => {
  app.post('/api/login', validateRequest(LoginSchema.createLoginSchema), UserController.loginHandler)

  app.get('/api/total-bills', requireUser, BillController.getTotalBillsHandler)
}

module.exports = routes