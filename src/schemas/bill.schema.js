const { object, string } = require('yup');

const paySchema = object({
  body: object({
    paymentMethod: string().required('Payment method wajib diisi')
  })
})

const BillSchema = {
  paySchema
}

module.exports = BillSchema