const { get } = require('lodash')
const UserService = require("../services/user.service")

const deserializeUser = async (req, res, next) => {
  const email = get(req, "headers.email", "")
  const password = get(req, "headers.password", "")

  if (!email || !password) {
    return next()
  }

  const user = await UserService.findByEmailPassword(email, password)

  if (user) {
    res.locals.user = user
  }

  return next()
}

module.exports = deserializeUser