const RoomService = require("../services/room.service")
const UserService = require("../services/user.service")
const createApiResponse = require("../utils/createApiResponse")

const createTenantHandler = async (req, res) => {
  try {
    const { email, name, password, roomCode, startDate } = req.body

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

const deleteTenantHandler = async (req, res) => {
  try {
    const { id } = req.params

    const tenant = await UserService.getTenantById(id)
    if (!tenant) {
      return res.status(404).send(createApiResponse(false, null, 'Tenant tidak ditemukan'))
    }

    await UserService.deleteTenantById(id)

    return res.status(200).send(createApiResponse(true, null, 'Tenant berhasil dihapus'))
  } catch (error) {
    return res.status(500).send(createApiResponse(false, null, error.message))
  }
}

const TenantController = {
  createTenantHandler,
  deleteTenantHandler
}

module.exports = TenantController