const { Op } = require('sequelize')
const { Room, User } = require('../models')

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
  const users = await User.findAll({
    where: {
      startDate: {
        [Op.gte]: currentDate, // Membandingkan tanggal mulai dari hari ini
        [Op.lt]: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000) // Kurang dari mulai hari besok
      }
    },
    include: [
      {
        model: Room,
        as: 'room'
      }
    ]
  })

  const rooms = users.map(user => {
    return user.room
  });

  return rooms
}

const getAllRooms = async () => {
  return Room.findAll()
}

const deleteRoomById = (id) => {
  return Room.destroy({
    where: {
      id
    }
  })
}

const getRoomById = async (id) => {
  return Room.findOne({
    where: {
      id
    }
  })
}

const RoomService = {
  getRoomByCode,
  createRoom,
  getRoomsStartingFromToday,
  getAllRooms,
  deleteRoomById,
  getRoomById
}

module.exports = RoomService