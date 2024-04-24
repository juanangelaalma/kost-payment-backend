const request = require("supertest");
const { app, server } = require("../../../app");
const BillFactory = require("../../../factories/bill.factory")
const PaymentMethodFactory = require("../../../factories/payment-method.factory")
const PaymentFactory = require("../../../factories/payment.factory")
const UserFactory = require("../../../factories/user.factory")
const BillService = require("../../../services/bill.service")
const getBillStatus = require("../../utils/getBillStatus");
const PaymentService = require("../../../services/payment.service");
const truncateTables = require("../../../utils/truncateTables");

function parseDateTimeToISO(dateTimeString) {
  const isoDateString = dateTimeString.replace(' ', 'T') + 'Z';
  return new Date(isoDateString)
}

describe('Midtrans', () => {
  afterEach(async () => {
    await truncateTables()
  });

  afterAll((done) => {
    server.close(done)
  })

  describe('/api/midtrans-callback', () => {
    describe('settlement', () => {
      it('should update payment and bill to successfully paid', async () => {
        const user = await UserFactory.createRandomUser();

        const bill = await BillFactory.createBillUser(user, 150000);

        const bniPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ name: 'bni' });

        const invoice = 'INV123456'
        const payment = await PaymentFactory.createPaymentBill({ bill: bill, paymentMethod: bniPaymentMethod, invoice, status: 'pending' })

        const sampleRequestBody = {
          "va_numbers": [
            {
              "va_number": "3333000000111111",
              "bank": "bni"
            }
          ],
          "transaction_time": "2021-06-23 11:41:33",
          "transaction_status": "settlement",
          "transaction_id": "9aed5972-5b6a-401e-894b-a32c91ed1a3a",
          "status_message": "midtrans payment notification",
          "status_code": "200",
          "signature_key": "7796a70214d32d2054b1ff82573c409402926e4ffaba898b6b69288027a23f80460f4a11070d19290444f96f074b00aa2cc61948a59e907098b83c115c92133e",
          "settlement_time": "2021-06-23 11:42:03",
          "payment_type": "bank_transfer",
          "payment_amounts": [
            {
              "paid_at": "2021-06-23 11:42:02",
              "amount": "150000.00"
            }
          ],
          "order_id": invoice,
          "merchant_id": "G141532850",
          "gross_amount": "150000.00",
          "fraud_status": "accept",
          "currency": "IDR"
        }

        const response = await request(app)
          .post(`/api/midtrans-notification`)
          .send(sampleRequestBody)

        expect(response.body).toEqual({})
        expect(response.status).toEqual(200)

        await payment.reload()
        const updatedBill = await BillService.getBillById(bill.id)

        expect(payment.status).toEqual('paid')
        expect(payment.paidAt).toEqual(parseDateTimeToISO(sampleRequestBody.settlement_time))
        expect(getBillStatus(updatedBill)).toEqual('paid')
      })
    })

    describe('capture', () => {
      it('should update payment and bill to successfully paid', async () => {
        const user = await UserFactory.createRandomUser();

        const bill = await BillFactory.createBillUser(user, 150000);

        const briPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ name: 'bni' });

        const invoice = 'INV123456'
        const payment = await PaymentFactory.createPaymentBill({ bill: bill, paymentMethod: briPaymentMethod, invoice, status: 'pending' })

        const sampleRequestBody = {
          "va_numbers": [
            {
              "va_number": "123456789123456789",
              "bank": "bri"
            }
          ],
          "transaction_time": "2021-06-23 11:41:33",
          "transaction_status": "capture",
          "transaction_id": "9aed5972-5b6a-401e-894b-a32c91ed1a3a",
          "status_message": "midtrans payment notification",
          "status_code": "200",
          "signature_key": "7796a70214d32d2054b1ff82573c409402926e4ffaba898b6b69288027a23f80460f4a11070d19290444f96f074b00aa2cc61948a59e907098b83c115c92133e",
          "settlement_time": "2021-06-23 11:42:03",
          "payment_type": "bank_transfer",
          "payment_amounts": [],
          "order_id": invoice,
          "merchant_id": "G141532850",
          "gross_amount": "150000.00",
          "fraud_status": "accept",
          "currency": "IDR"
        }

        const response = await request(app)
          .post(`/api/midtrans-notification`)
          .send(sampleRequestBody)

        expect(response.body).toEqual({})
        expect(response.status).toEqual(200)

        await payment.reload()
        const updatedBill = await BillService.getBillById(bill.id)

        expect(payment.status).toEqual('paid')
        expect(payment.paidAt).toEqual(parseDateTimeToISO(sampleRequestBody.settlement_time))
        expect(getBillStatus(updatedBill)).toEqual('paid')
      })
    })

    describe('deny', () => {
      it('should update payment and bill failed and bill unpaid', async () => {
        const user = await UserFactory.createRandomUser();

        const bill = await BillFactory.createBillUser(user, 150000);

        const bcaPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ name: 'bca' });

        const invoice = 'INV123456'
        const payment = await PaymentFactory.createPaymentBill({ bill: bill, paymentMethod: bcaPaymentMethod, invoice, status: 'pending' })

        const sampleRequestBody = {
          "va_numbers": [
            {
              "va_number": "333333333333333",
              "bank": "bca"
            }
          ],
          "transaction_time": "2021-06-23 11:41:33",
          "transaction_status": "deny",
          "transaction_id": "9aed5972-5b6a-401e-894b-a32c91ed1a3a",
          "status_message": "midtrans payment notification",
          "status_code": "200",
          "signature_key": "7796a70214d32d2054b1ff82573c409402926e4ffaba898b6b69288027a23f80460f4a11070d19290444f96f074b00aa2cc61948a59e907098b83c115c92133e",
          "settlement_time": "2021-06-23 11:42:03",
          "payment_type": "bank_transfer",
          "payment_amounts": [],
          "order_id": invoice,
          "merchant_id": "G141532850",
          "gross_amount": "150000.00",
          "fraud_status": "accept",
          "currency": "IDR"
        }

        const response = await request(app)
          .post(`/api/midtrans-notification`)
          .send(sampleRequestBody)

        expect(response.body).toEqual({})
        expect(response.status).toEqual(200)

        await payment.reload()
        const updatedBill = await BillService.getBillById(bill.id)

        expect(payment.status).toEqual('failed')
        expect(payment.paidAt).toEqual(null)
        expect(getBillStatus(updatedBill)).toEqual('unpaid')
      })
    })

    describe('cancel', () => {
      it('should update payment and bill failed and bill unpaid', async () => {
        const user = await UserFactory.createRandomUser();

        const bill = await BillFactory.createBillUser(user, 150000);

        const briPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ name: 'bni' });

        const invoice = 'INV123456'
        const payment = await PaymentFactory.createPaymentBill({ bill: bill, paymentMethod: briPaymentMethod, invoice, status: 'pending' })

        const sampleRequestBody = {
          "va_numbers": [
            {
              "va_number": "123456789123456789",
              "bank": "bri"
            }
          ],
          "transaction_time": "2021-06-23 11:41:33",
          "transaction_status": "cancel",
          "transaction_id": "9aed5972-5b6a-401e-894b-a32c91ed1a3a",
          "status_message": "midtrans payment notification",
          "status_code": "200",
          "signature_key": "7796a70214d32d2054b1ff82573c409402926e4ffaba898b6b69288027a23f80460f4a11070d19290444f96f074b00aa2cc61948a59e907098b83c115c92133e",
          "settlement_time": "2021-06-23 11:42:03",
          "payment_type": "bank_transfer",
          "payment_amounts": [],
          "order_id": invoice,
          "merchant_id": "G141532850",
          "gross_amount": "150000.00",
          "fraud_status": "accept",
          "currency": "IDR"
        }

        const response = await request(app)
          .post(`/api/midtrans-notification`)
          .send(sampleRequestBody)

        expect(response.body).toEqual({})
        expect(response.status).toEqual(200)

        await payment.reload()
        const updatedBill = await BillService.getBillById(bill.id)

        expect(payment.status).toEqual('failed')
        expect(payment.paidAt).toEqual(null)
        expect(getBillStatus(updatedBill)).toEqual('unpaid')
      })
    })

    describe('expire', () => {
      it('should update payment and bill failed and bill unpaid', async () => {
        const user = await UserFactory.createRandomUser();

        const bill = await BillFactory.createBillUser(user, 150000);

        const briPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ name: 'bni' });

        const invoice = 'INV123456'
        const payment = await PaymentFactory.createPaymentBill({ bill: bill, paymentMethod: briPaymentMethod, invoice, status: 'pending' })

        const sampleRequestBody = {
          "va_numbers": [
            {
              "va_number": "123456789123456789",
              "bank": "bri"
            }
          ],
          "transaction_time": "2021-06-23 11:41:33",
          "transaction_status": "expire",
          "transaction_id": "9aed5972-5b6a-401e-894b-a32c91ed1a3a",
          "status_message": "midtrans payment notification",
          "status_code": "200",
          "signature_key": "7796a70214d32d2054b1ff82573c409402926e4ffaba898b6b69288027a23f80460f4a11070d19290444f96f074b00aa2cc61948a59e907098b83c115c92133e",
          "settlement_time": "2021-06-23 11:42:03",
          "payment_type": "bank_transfer",
          "payment_amounts": [],
          "order_id": invoice,
          "merchant_id": "G141532850",
          "gross_amount": "150000.00",
          "fraud_status": "accept",
          "currency": "IDR"
        }

        const response = await request(app)
          .post(`/api/midtrans-notification`)
          .send(sampleRequestBody)

        expect(response.body).toEqual({})
        expect(response.status).toEqual(200)

        await payment.reload()
        const updatedBill = await BillService.getBillById(bill.id)

        expect(payment.status).toEqual('failed')
        expect(payment.paidAt).toEqual(null)
        expect(getBillStatus(updatedBill)).toEqual('unpaid')
      })
    })

    describe('pending', () => {
      it('should update payment and bill pending and bill pending', async () => {
        const user = await UserFactory.createRandomUser();

        const bill = await BillFactory.createBillUser(user, 150000);

        const briPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ name: 'bni' });

        const invoice = 'INV123456'
        const payment = await PaymentFactory.createPaymentBill({ bill: bill, paymentMethod: briPaymentMethod, invoice })

        const sampleRequestBody = {
          "va_numbers": [
            {
              "va_number": "123456789123456789",
              "bank": "bri"
            }
          ],
          "transaction_time": "2021-06-23 11:41:33",
          "transaction_status": "pending",
          "transaction_id": "9aed5972-5b6a-401e-894b-a32c91ed1a3a",
          "status_message": "midtrans payment notification",
          "status_code": "200",
          "signature_key": "7796a70214d32d2054b1ff82573c409402926e4ffaba898b6b69288027a23f80460f4a11070d19290444f96f074b00aa2cc61948a59e907098b83c115c92133e",
          "settlement_time": "2021-06-23 11:42:03",
          "payment_type": "bank_transfer",
          "payment_amounts": [],
          "order_id": invoice,
          "merchant_id": "G141532850",
          "gross_amount": "150000.00",
          "fraud_status": "accept",
          "currency": "IDR"
        }

        const response = await request(app)
          .post(`/api/midtrans-notification`)
          .send(sampleRequestBody)

        expect(response.body).toEqual({})
        expect(response.status).toEqual(200)

        await payment.reload()
        const updatedBill = await BillService.getBillById(bill.id)

        expect(payment.status).toEqual('pending')
        expect(payment.paidAt).toEqual(null)
        expect(getBillStatus(updatedBill)).toEqual('pending')
      })
    })

    describe('signatureKey is wrong', () => {
      it('should response with status code 400', async () => {
        const user = await UserFactory.createRandomUser();

        const bill = await BillFactory.createBillUser(user, 150000);

        const briPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ name: 'bni' });

        const invoice = 'INV123456'
        const payment = await PaymentFactory.createPaymentBill({ bill: bill, paymentMethod: briPaymentMethod, invoice, status: 'pending' })

        const sampleRequestBody = {
          "va_numbers": [
            {
              "va_number": "123456789123456789",
              "bank": "bri"
            }
          ],
          "transaction_time": "2021-06-23 11:41:33",
          "transaction_status": "expire",
          "transaction_id": "9aed5972-5b6a-401e-894b-a32c91ed1a3a",
          "status_message": "midtrans payment notification",
          "status_code": "200",
          "signature_key": "02ff5cf2452e9d2ec4a7748403f20971d0290c966a95dfffba172dfacd10725546b172de2e0118d3aaa00711b8a12febe2c29fb1bcc24f1fc0b7e1e7162c218e",
          "settlement_time": "2021-06-23 11:42:03",
          "payment_type": "bank_transfer",
          "payment_amounts": [],
          "order_id": invoice,
          "merchant_id": "G141532850",
          "gross_amount": "150000.00",
          "fraud_status": "accept",
          "currency": "IDR"
        }

        const response = await request(app)
          .post(`/api/midtrans-notification`)
          .send(sampleRequestBody)

        expect(response.status).toEqual(400)
      })
    })
  })
})