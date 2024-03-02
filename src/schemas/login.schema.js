const { object, string } = require('yup');

const createLoginSchema = object({
  body: object({
    email: string().email('Email tidak valid').required('Email wajib diisi'),
    password: string().required('Password wajib diisi')
  })
})

const LoginSchema = {
  createLoginSchema
}

module.exports = LoginSchema