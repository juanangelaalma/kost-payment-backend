const { string, object } = require("yup")

const createTenantSchema = object({
  body: object({
    email: string().email('Email tidak valid').required('Email wajib diisi'),
    name: string().required('Nama wajib diisi'),
    password: string().required('Password wajib diisi'),
    roomCode: string().required('Kode kamar wajib diisi'),
    startDate: string()
  })
})

const TenantSchema = {
  createTenantSchema
}

module.exports = TenantSchema