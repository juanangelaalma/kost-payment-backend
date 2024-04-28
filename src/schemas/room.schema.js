const { object, string } = require('yup');

const createRoomSchema = object({
  body: object({
    code: string().required('Code wajib diisi')
  })
})

const RoomSchema = {
  createRoomSchema
}

module.exports = RoomSchema