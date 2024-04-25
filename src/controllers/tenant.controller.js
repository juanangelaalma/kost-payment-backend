const RoomService = require("../services/room.service")
const UserService = require("../services/user.service")
const createApiResponse = require("../utils/createApiResponse")

const createTenantHandler = async (req, res) => {
  try {
    const { email, name, password, roomCode, startDate } = req.body

    console.log(email, name, password, roomCode, startDate)

    const existingTenant = await UserService.getTenantByEmail(email)
    if (existingTenant) {
      return res.status(400).send(createApiResponse(false, null, 'Email sudah digunakan'))
    }

    const existingRoom = await RoomService.getRoomByCode(roomCode)
    if (existingRoom) {
      return res.status(400).send(createApiResponse(false, null, 'Kode kamar harus unik'))
    }

    const newTenant = await UserService.createTenant({
      email, name, password, roomCode, startDate
    })

    const room = await RoomService.createRoom({
      code: roomCode,
      userId: newTenant.id,
      startDate
    })

    return res.status(201).send(createApiResponse(true, { ...newTenant.dataValues, roomCode: room.code, startDate: room.startDate }, 'Tenant berhasil dibuat'))
  } catch (error) {
    return res.status(500).send(createApiResponse(false, null, error.message))
  }
}

const TenantController = {
  createTenantHandler
}

module.exports = TenantController