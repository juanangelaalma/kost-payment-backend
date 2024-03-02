const { User } = require('../models')

const findByEmailPassword = async (email, password) => {
  return User.findOne({
    where: {
      email, password
    }
  })
}

const UserService = {
  findByEmailPassword
}

module.exports = UserService