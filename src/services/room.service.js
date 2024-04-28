const { Op } = require('sequelize')
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

const getRoomsStartingFromToday = async (currentDate) => {
  return Room.findAll({
    where: {
      startDate: {
        [Op.gte]: currentDate, // Membandingkan tanggal mulai dari hari ini
        [Op.lt]: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000) // Kurang dari mulai hari besok
      }
    }
  })
}

const getAllRooms = async () => {
  return Room.findAll()
}

const RoomService = {
  getRoomByCode,
  createRoom,
  getRoomsStartingFromToday,
  getAllRooms
}

module.exports = RoomService