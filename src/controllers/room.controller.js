const RoomService = require("../services/room.service")
const createApiResponse = require("../utils/createApiResponse")

const getRoomsHandler = async (req, res) => {
  try {
    const rooms = await RoomService.getAllRooms()

    const formattedResponse = rooms.map(room => {
      return { id: room.id, code: room.code, available: room.userId === null }
    })

    res.send(createApiResponse(true, formattedResponse))
  } catch (error) {
    res.status(500).send(createApiResponse(false, null, error.message))
  }
}

const createRoomHandler = async (req, res) => {
  try {
    const { code } = req.body

    const room = await RoomService.createRoom({ code })

    res.status(201).send(createApiResponse(true, room))
  } catch (error) {
    res.status(500).send(createApiResponse(false, null, error.message))
  }
}

const RoomController = {
  getRoomsHandler,
  createRoomHandler
}

module.exports = RoomController