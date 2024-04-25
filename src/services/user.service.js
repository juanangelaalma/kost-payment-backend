const { User, Room } = require('../models')

const findByEmailPassword = async (email, password) => {
  return User.findOne({
    where: {
      email, password
    }
  })
}

const getTenantByEmail = async (email) => {
  return User.findOne({
    where: {
      email,
      role: 'tenant'
    }
  })
}

const getTenantByEmailIncludeRoom = async (email) => {
  return User.findOne({
    where: {
      email,
      role: 'tenant'
    },
    include: [
      {
        model: Room,
        as: 'room'
      }
    ]
  })
}

const createTenant = async (data) => {
  return User.create({
    ...data,
    role: 'tenant'
  })
}

const UserService = {
  findByEmailPassword,
  getTenantByEmail,
  createTenant,
  getTenantByEmailIncludeRoom
}

module.exports = UserService