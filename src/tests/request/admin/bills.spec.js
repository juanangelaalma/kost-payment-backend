const request = require("supertest");
const { app, server } = require("../../../app");
const UserFactory = require("../../../factories/user.factory");
const truncateTables = require("../../../utils/truncateTables");
const BillFactory = require("../../../factories/bill.factory");
const PaymentMethodFactory = require("../../../factories/payment-method.factory");
const PaymentFactory = require("../../../factories/payment.factory");

describe("Admin bills request test", () => {
  afterEach(async () => {
    await truncateTables();
  });

  afterAll((done) => {
    server.close(done)
  })

  describe('GET /api/admin/count-bills', () => {
    describe('when user is not admin', () => {
      it('should response with 401', async () => {
        const user = await UserFactory.createRandomUser({ role: 'tenant' })

        const response = await request(app)
          .get('/api/admin/count-bills')
          .set('email', user.email)
          .set('password', user.password)

        expect(response.status).toBe(401)
      })
    })

    describe('when user is admin', () => {
      describe('when there is no bill', () => {
        it('should response with 0 total bills', async () => {
          const admin = await UserFactory.createRandomUser({ role: 'admin' })

          const response = await request(app)
            .get('/api/admin/count-bills')
            .set('email', admin.email)
            .set('password', admin.password)

          expect(response.status).toBe(200)
          expect(response.body.success).toBe(true)
          expect(response.body.data.total).toEqual(0)
        })
      })

      describe('when there is 3 unpaid bill', () => {
        it('should response with 3 total bills', async () => {
          const admin = await UserFactory.createRandomUser({ role: 'admin' })

          const user = await UserFactory.createRandomUser()
          const bill = await BillFactory.createBillUser(user, 100000)
          const bill2 = await BillFactory.createBillUser(user, 100000)
          const bill3 = await BillFactory.createBillUser(user, 100000)

          const response = await request(app)
            .get('/api/admin/count-bills')
            .set('email', admin.email)
            .set('password', admin.password)

          expect(response.status).toBe(200)
          expect(response.body.success).toBe(true)
          expect(response.body.data.total).toEqual(3)
        })
      })

      describe('when there is 1 unpaid bill and 2 paid bills', () => {
        it('should response with 1 total bills', async () => {
          const admin = await UserFactory.createRandomUser({ role: 'admin' })

          const user = await UserFactory.createRandomUser()
          const bill = await BillFactory.createBillUser(user, 100000)
          const bill2 = await BillFactory.createBillUser(user, 100000)
          const bill3 = await BillFactory.createBillUser(user, 100000)

          const paymentMethod = await PaymentMethodFactory.createPaymentMethod()
          const payment2 = await PaymentFactory.createPaymentBill({ bill: bill2, paymentMethod, status: 'paid' })
          const payment3 = await PaymentFactory.createPaymentBill({ bill: bill3, paymentMethod, status: 'paid' })

          const response = await request(app)
            .get('/api/admin/count-bills')
            .set('email', admin.email)
            .set('password', admin.password)

          expect(response.status).toBe(200)
          expect(response.body.success).toBe(true)
          expect(response.body.data.total).toEqual(1)
        })
      })

      describe('when there is 1 bill with failed payment, 1 bill with pending payment, 1 paid bills', () => {
        it('should response with 2 total bills', async () => {
          const admin = await UserFactory.createRandomUser({ role: 'admin' })

          const user = await UserFactory.createRandomUser()
          const bill = await BillFactory.createBillUser(user, 100000)
          const bill2 = await BillFactory.createBillUser(user, 100000)
          const bill3 = await BillFactory.createBillUser(user, 100000)

          const paymentMethod = await PaymentMethodFactory.createPaymentMethod()
          const payment1 = await PaymentFactory.createPaymentBill({ bill: bill, paymentMethod, status: 'failed' })
          const payment2 = await PaymentFactory.createPaymentBill({ bill: bill2, paymentMethod, status: 'pending' })
          const payment3 = await PaymentFactory.createPaymentBill({ bill: bill3, paymentMethod, status: 'paid' })

          const response = await request(app)
            .get('/api/admin/count-bills')
            .set('email', admin.email)
            .set('password', admin.password)

          expect(response.status).toBe(200)
          expect(response.body.success).toBe(true)
          expect(response.body.data.total).toEqual(2)
        })
      })
    })
  })
})