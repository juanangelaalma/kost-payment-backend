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