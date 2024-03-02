const UserController = require("./controllers/user.controller")

const routes = (app) => {
  app.post('/api/login', UserController.loginHandler)
}

module.exports = routes