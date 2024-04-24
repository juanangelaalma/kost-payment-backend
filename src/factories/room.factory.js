const { faker } = require("@faker-js/faker")
const { Room } = require("../models")

const createRoomUser = ({ user, code }) => {
  return Room.create({
    userId: user.id,
    code: code || faker.random.alphaNumeric(6)
  })
}

const RoomFactory = {
  createRoomUser
}

module.exports = RoomFactory