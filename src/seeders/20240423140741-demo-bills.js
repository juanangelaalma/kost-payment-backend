'use strict';
const { User } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const user = await User.findOne({
      limit: 1
    })
    await queryInterface.bulkInsert('Bills', [{
      userId: user.id,
      date: now,
      amount: 100000,
      createdAt: now,
      updatedAt: now,
    }], {});
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
