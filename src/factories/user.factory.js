const { faker } = require('@faker-js/faker');
const { User } = require('../models')

const createRandomUser = (attr = {}) => {
  return User.create({
    name: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: 'tenant',
    ...attr
  })
}

const UserFactory = {
  createRandomUser
}

module.exports = UserFactory