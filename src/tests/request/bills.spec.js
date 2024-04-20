const request = require("supertest");
const { app, server } = require("../../app");
const UserFactory = require("../../factories/user.factory");
const truncateTables = require("../../utils/truncateTables");
const BillFactory = require("../../factories/bill.factory");
const PaymentMethodFactory = require("../../factories/payment-method.factory");
const PaymentFactory = require("../../factories/payment.factory");

describe("Bills request test", () => {
  afterEach(async () => {
    await truncateTables();
  });

  afterAll((done) => {
    server.close(done)
  })

  describe('/api/total-bills', () => {
    describe("when user doesn't have bills", () => {
      it("should response with 0 bills", async () => {
        const user = await UserFactory.createRandomUser()

        const response = await request(app)
          .get('/api/total-bills')
          .set('email', user.email)
          .set('password', user.password)

        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          success: true,
          data: {
            total: "Rp 0,00"
          },
          message: null,
        })
      })
    })

    describe("when user has total 500.000 bills", () => {
      it("should response with Rp 500.000,00", async () => {
        const user = await UserFactory.createRandomUser()

        const bill1 = await BillFactory.createBillUser(user, 200000)
        const bill2 = await BillFactory.createBillUser(user, 300000)

        const response = await request(app)
          .get('/api/total-bills')
          .set('email', user.email)
          .set('password', user.password)

        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          success: true,
          data: {
            total: "Rp 500.000,00"
          },
          message: null,
        })
      })
    })

    describe("when user already paid some biils", () => {
      it("should response with correct value", async () => {
        const user = await UserFactory.createRandomUser()

        const bill1 = await BillFactory.createBillUser(user, 200000)
        const bill2 = await BillFactory.createBillUser(user, 300000)

        const paymentMethod = await PaymentMethodFactory.createPaymentMethod()
        const payment = await PaymentFactory.createPaymentBill({ bill: bill1, paymentMethod, status: 'paid', paidAt: new Date() })

        const response = await request(app)
          .get('/api/total-bills')
          .set('email', user.email)
          .set('password', user.password)

        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          success: true,
          data: {
            total: "Rp 300.000,00"
          },
          message: null,
        })
      })
    })

    describe("when user already has paid, pending, and failed in payments", () => {
      it("should response with correct value", async () => {
        const user = await UserFactory.createRandomUser()

        const bill1 = await BillFactory.createBillUser(user, 200000)
        const bill2 = await BillFactory.createBillUser(user, 300000)
        const bill3 = await BillFactory.createBillUser(user, 100000)
        const bill4 = await BillFactory.createBillUser(user, 400000)

        const paymentMethod = await PaymentMethodFactory.createPaymentMethod()
        const payment1 = await PaymentFactory.createPaymentBill({ bill: bill1, paymentMethod, status: 'paid', paidAt: new Date() })
        const payment2 = await PaymentFactory.createPaymentBill({ bill: bill2, paymentMethod, status: 'pending' })
        const payment3 = await PaymentFactory.createPaymentBill({ bill: bill3, paymentMethod, status: 'failed' })

        const response = await request(app)
          .get('/api/total-bills')
          .set('email', user.email)
          .set('password', user.password)

        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          success: true,
          data: {
            total: "Rp 800.000,00"
          },
          message: null,
        })
      })
    })
  })

  describe('/api/bills', () => {
    describe('when user doesn\'t have bills', () => {
      it('should response with empty array', async () => {
        const user = await UserFactory.createRandomUser()

        const response = await request(app)
          .get('/api/bills')
          .set('email', user.email)
          .set('password', user.password)

        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          success: true,
          data: [],
          message: null,
        })
      })
    })

    describe('when user has bills', () => {
      it('should response with bills', async () => {
        const user = await UserFactory.createRandomUser()

        const bill1 = await BillFactory.createBillUser(user, 200000)
        const bill2 = await BillFactory.createBillUser(user, 300000)

        const response = await request(app)
          .get('/api/bills')
          .set('email', user.email)
          .set('password', user.password)

        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          success: true,
          data: [
            {
              id: bill1.id,
              month: bill1.month,
              year: bill1.year,
              amount: "Rp 200.000,00",
              status: "unpaid",
              _links: {
                pay: `/api/bills/${bill1.id}/pay`,
                details: `/api/bills/${bill1.id}/details`
              }
            },
            {
              id: bill2.id,
              month: bill1.month,
              year: bill1.year,
              amount: "Rp 300.000,00",
              status: "unpaid",
              _links: {
                pay: `/api/bills/${bill2.id}/pay`,
                details: `/api/bills/${bill2.id}/details`
              }
            }
          ],
          message: null,
        })
      })
    })

    describe('when user has bills with different payment status on every bill', () => {
      it('should response with bills', async () => {
        const user = await UserFactory.createRandomUser()

        const bill1 = await BillFactory.createBillUser(user, 100000)
        const bill2 = await BillFactory.createBillUser(user, 200000)
        const bill3 = await BillFactory.createBillUser(user, 300000)
        const bill4 = await BillFactory.createBillUser(user, 400000)

        const paymentMethod = await PaymentMethodFactory.createPaymentMethod()
        const payment1 = await PaymentFactory.createPaymentBill({ bill: bill1, paymentMethod, status: 'paid', paidAt: new Date() })
        const payment2 = await PaymentFactory.createPaymentBill({ bill: bill2, paymentMethod, status: 'pending' })
        const payment3 = await PaymentFactory.createPaymentBill({ bill: bill3, paymentMethod, status: 'pending' })
        const payment3_1 = await PaymentFactory.createPaymentBill({ bill: bill3, paymentMethod, status: 'paid' })

        const response = await request(app)
          .get('/api/bills')
          .set('email', user.email)
          .set('password', user.password)

        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          success: true,
          data: [
            {
              id: bill1.id,
              month: bill1.month,
              year: bill1.year,
              amount: "Rp 100.000,00",
              status: "paid",
              _links: {
                pay: `/api/bills/${bill1.id}/pay`,
                details: `/api/bills/${bill1.id}/details`
              }
            },
            {
              id: bill2.id,
              month: bill2.month,
              year: bill2.year,
              amount: "Rp 200.000,00",
              status: "pending",
              _links: {
                pay: `/api/bills/${bill2.id}/pay`,
                details: `/api/bills/${bill2.id}/details`
              }
            },
            {
              id: bill3.id,
              month: bill3.month,
              year: bill3.year,
              amount: "Rp 300.000,00",
              status: "paid",
              _links: {
                pay: `/api/bills/${bill3.id}/pay`,
                details: `/api/bills/${bill3.id}/details`
              }
            },
            {
              id: bill4.id,
              month: bill4.month,
              year: bill4.year,
              amount: "Rp 400.000,00",
              status: "unpaid",
              _links: {
                pay: `/api/bills/${bill4.id}/pay`,
                details: `/api/bills/${bill4.id}/details`
              }
            },
          ],
          message: null,
        })
      })
    })
  })
})