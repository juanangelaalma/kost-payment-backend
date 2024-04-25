'use strict';

const RoomFactory = require('../factories/room.factory');
const UserFactory = require('../factories/user.factory');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const tenant = await UserFactory.createRandomUser({
      name: 'User Name',
      email: 'user@gmail.com',
      password: 'password',
      role: 'tenant',
    })
    const admin = await UserFactory.createRandomUser({
      name: 'Admin Name',
      email: 'admin@gmail.com',
      password: 'password',
      role: 'admin',
    })

    const room = await RoomFactory.createRoomUser({ user: tenant, code: 'K-101' })
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
