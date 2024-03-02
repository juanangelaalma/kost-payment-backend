const validateRequest = require("./middlewares/validateRequest")
const UserController = require("./controllers/user.controller")
const LoginSchema = require("./schemas/login.schema")

const routes = (app) => {
  app.post('/api/login', validateRequest(LoginSchema.createLoginSchema), UserController.loginHandler)
}

module.exports = routes