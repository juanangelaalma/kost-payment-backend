const { Room } = require('../models')

const getRoomByCode = async (code) => {
  return Room.findOne({
    where: {
      code
    }
  })
}

const createRoom = async (data) => {
  return Room.create(data)
}

const RoomService = {
  getRoomByCode,
  createRoom
}

module.exports = RoomService