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

const getTenantById = async (id) => {
  return User.findByPk(id)
}

const deleteTenantById = async (id) => {
  return User.destroy({
    where: {
      id
    }
  })
}

const getTenantsWithRooms = async () => {
  return User.findAll({
    where: {
      role: 'tenant'
    },
    include: [
      {
        model: Room,
        as: 'room'
      }
    ],
    order: [['createdAt', 'DESC']]
  })
}

const UserService = {
  findByEmailPassword,
  getTenantByEmail,
  createTenant,
  getTenantByEmailIncludeRoom,
  getTenantById,
  deleteTenantById,
  getTenantsWithRooms
}

module.exports = UserService