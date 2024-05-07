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
      userId: newTenant.id
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

const getTenantsHandler = async (req, res) => {
  try {
    const tenants = await UserService.getTenantsWithRooms()

    const formattedTenants = tenants.map(tenant => {
      console.log('room code', tenant.room.code)
      return {
        id: tenant.id,
        email: tenant.email,
        name: tenant.name,
        startDate: tenant.startDate,
        roomCode: tenant.room.code,
      }
    })

    return res.status(200).send(createApiResponse(true, formattedTenants, ''))
  } catch (error) {
    return res.status(500).send(createApiResponse(false, null, error.message))
  }
}

const TenantController = {
  createTenantHandler,
  deleteTenantHandler,
  getTenantsHandler
}

module.exports = TenantController