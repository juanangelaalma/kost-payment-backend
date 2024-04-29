const request = require("supertest");
const { app, server } = require("../../../app");
const UserFactory = require("../../../factories/user.factory");
const truncateTables = require("../../../utils/truncateTables");
const BillFactory = require("../../../factories/bill.factory");
const PaymentMethodFactory = require("../../../factories/payment-method.factory");
const PaymentFactory = require("../../../factories/payment.factory");
const RoomFactory = require("../../../factories/room.factory");

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

  describe('GET /api/admin/bills', () => {
    describe('when user is not admin', () => {
      it('should response with 401', async () => {
        const user = await UserFactory.createRandomUser()

        const response = await request(app)
          .get('/api/admin/bills')
          .set('email', user.email)
          .set('password', user.password)

        expect(response.status).toBe(401)
      })
    })

    describe('when user is admin', () => {
      it('should with correct data', async () => {
        const admin = await UserFactory.createRandomUser({ role: 'admin' })

        const user1 = await UserFactory.createRandomUser()
        const user2 = await UserFactory.createRandomUser()
        const user3 = await UserFactory.createRandomUser()

        await RoomFactory.createRoomUser({ user: user1, code: 'K-101' })
        await RoomFactory.createRoomUser({ user: user2, code: 'K-102' })
        await RoomFactory.createRoomUser({ user: user3, code: 'K-103' })

        const bill1 = await BillFactory.createBillUser(user1, 100000, '2022-04-01')
        const bill2 = await BillFactory.createBillUser(user2, 200000, '2022-05-01')
        const bill3 = await BillFactory.createBillUser(user3, 300000, '2022-06-01')

        const paidBill = await BillFactory.createBillUser(user3, 300000, '2022-07-01')
        const paymentMethod = await PaymentMethodFactory.createPaymentMethod()
        const paidPayment = await PaymentFactory.createPaymentBill({ bill: paidBill, paymentMethod, status: 'paid' })

        const response = await request(app)
          .get('/api/admin/bills')
          .set('email', admin.email)
          .set('password', admin.password)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.bills.length).toEqual(3)

        expect(response.body.data.bills[2].id).toEqual(bill1.id)
        expect(response.body.data.bills[2].roomCode).toEqual('K-101')
        expect(response.body.data.bills[2].month).toEqual('April')
        expect(response.body.data.bills[2].year).toEqual('2022')
        expect(response.body.data.bills[2].total).toBe('Rp 100.000,00')

        expect(response.body.data.bills[1].id).toEqual(bill2.id)
        expect(response.body.data.bills[1].roomCode).toEqual('K-102')
        expect(response.body.data.bills[1].month).toEqual('Mei')
        expect(response.body.data.bills[1].year).toEqual('2022')
        expect(response.body.data.bills[1].total).toEqual('Rp 200.000,00')

        expect(response.body.data.bills[0].id).toEqual(bill3.id)
        expect(response.body.data.bills[0].roomCode).toEqual('K-103')
        expect(response.body.data.bills[0].month).toEqual('Juni')
        expect(response.body.data.bills[0].year).toEqual('2022')
        expect(response.body.data.bills[0].total).toBe('Rp 300.000,00')
      })

      describe('with limit=2', () => {
        it('should response with 2 bills', async () => {
          const admin = await UserFactory.createRandomUser({ role: 'admin' })

          const user1 = await UserFactory.createRandomUser()
          const user2 = await UserFactory.createRandomUser()
          const user3 = await UserFactory.createRandomUser()

          await RoomFactory.createRoomUser({ user: user1, code: 'K-101' })
          await RoomFactory.createRoomUser({ user: user2, code: 'K-102' })
          await RoomFactory.createRoomUser({ user: user3, code: 'K-103' })

          const bill1 = await BillFactory.createBillUser(user1, 100000, '2022-04-01')
          const bill2 = await BillFactory.createBillUser(user2, 200000, '2022-05-01')
          const bill3 = await BillFactory.createBillUser(user3, 300000, '2022-06-01')

          const response = await request(app)
            .get('/api/admin/bills?limit=2')
            .set('email', admin.email)
            .set('password', admin.password)

          expect(response.status).toBe(200)
          expect(response.body.success).toBe(true)
          expect(response.body.data.bills.length).toEqual(2)

          expect(response.body.data.bills[1].id).toEqual(bill2.id)
          expect(response.body.data.bills[1].roomCode).toEqual('K-102')
          expect(response.body.data.bills[1].month).toEqual('Mei')
          expect(response.body.data.bills[1].year).toEqual('2022')
          expect(response.body.data.bills[1].total).toEqual('Rp 200.000,00')

          expect(response.body.data.bills[0].id).toEqual(bill3.id)
          expect(response.body.data.bills[0].roomCode).toEqual('K-103')
          expect(response.body.data.bills[0].month).toEqual('Juni')
          expect(response.body.data.bills[0].year).toEqual('2022')
          expect(response.body.data.bills[0].total).toBe('Rp 300.000,00')
        })
      })

      describe('with filter', () => {
        it('should response with correct date', async () => {
          const admin = await UserFactory.createRandomUser({ role: 'admin' })

          const user1 = await UserFactory.createRandomUser()
          const user2 = await UserFactory.createRandomUser()
          const user3 = await UserFactory.createRandomUser()

          await RoomFactory.createRoomUser({
            user: user1, code
              : 'K-101'
          })

          await RoomFactory.createRoomUser({ user: user2, code: 'K-102' })

          await RoomFactory.createRoomUser({ user: user3, code: 'K-103'})

          const bill1 = await BillFactory.createBillUser(user1, 100000, '2022-04-01')
          const bill2 = await BillFactory.createBillUser(user2, 200000, '2022-05-01')
          const bill3 = await BillFactory.createBillUser(user3, 300000, '2022-06-01')

          const paymentMethod = await PaymentMethodFactory.createPaymentMethod()
          const paidPayment = await PaymentFactory.createPaymentBill({ bill: bill3, paymentMethod, status: 'paid' })

          let response = await request(app)
            .get('/api/admin/bills?status=unpaid')
            .set('email', admin.email)
            .set('password', admin.password)

          expect(response.status).toBe(200)

          expect(response.body.success).toBe(true)
          expect(response.body.data.bills.length).toEqual(2)

          expect(response.body.data.bills[1].id).toEqual(bill1.id)
          expect(response.body.data.bills[1].roomCode).toEqual('K-101')
          expect(response.body.data.bills[1].month).toEqual('April')
          expect(response.body.data.bills[1].year).toEqual('2022')

          expect(response.body.data.bills[0].id).toEqual(bill2.id)
          expect(response.body.data.bills[0].roomCode).toEqual('K-102')
          expect(response.body.data.bills[0].month).toEqual('Mei')
          expect(response.body.data.bills[0].year).toEqual('2022')

          response = await request(app)
            .get('/api/admin/bills?status=paid')
            .set('email', admin.email)
            .set('password', admin.password)

          expect(response.status).toBe(200)
          expect(response.body.success).toBe(true)
          expect(response.body.data.bills.length).toEqual(1)

          expect(response.body.data.bills[0].id).toEqual(bill3.id)
          expect(response.body.data.bills[0].roomCode).toEqual('K-103')
          expect(response.body.data.bills[0].month).toEqual('Juni')
          expect(response.body.data.bills[0].year).toEqual('2022')
        })
      })
    })
  })
})