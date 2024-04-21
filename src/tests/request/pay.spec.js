const request = require("supertest");
const { app, server } = require("../../app");
const UserFactory = require("../../factories/user.factory");
const truncateTables = require("../../utils/truncateTables");
const BillFactory = require("../../factories/bill.factory");
const PaymentMethodFactory = require("../../factories/payment-method.factory");
const PaymentFactory = require("../../factories/payment.factory");

describe("Pay request test", () => {
  afterEach(async () => {
    await truncateTables();
  });

  afterAll((done) => {
    server.close(done)
  })

  describe('/api/total-bills', () => {
    describe('does not containt paymentMethod', () => {
      it('should response with 400 Bad Request', async () => {
        const user = await UserFactory.createRandomUser();

        const bill = await BillFactory.createBillUser(user, 400000);

        const response = await request(app)
          .post(`/api/bills/${bill.id}/pay`)
          .set('email', user.email)
          .set('password', user.password)

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ success: false, data: null, message: 'Payment method wajib diisi' })
      })
    })

    describe('paymentMethod is not found', () => {
      it('should response with 404 Not Found', async () => {
        const user = await UserFactory.createRandomUser();

        const bill = await BillFactory.createBillUser(user, 400000);

        const bniPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ name: 'bni' });

        const response = await request(app)
          .post(`/api/bills/${bill.id}/pay`)
          .set('email', user.email)
          .set('password', user.password)
          .send({ paymentMethod: 'bri' })

        expect(response.status).toEqual(404);
        expect(response.body).toEqual({ success: false, data: null, message: 'Payment method not found' })
      })
    })

    describe('bill is not found', () => {
      it('should response with 404 Not Found', async () => {
        const user = await UserFactory.createRandomUser();

        const bniPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ name: 'bni' });

        const response = await request(app)
          .post(`/api/bills/1/pay`)
          .set('email', user.email)
          .set('password', user.password)
          .send({ paymentMethod: 'bni' })

        expect(response.status).toEqual(404);
        expect(response.body).toEqual({ success: false, data: null, message: 'Bill not found' })
      })
    })

    describe('bill is already paid', () => {
      it('should response with 400 Bad Request', async () => {
        const user = await UserFactory.createRandomUser();

        const bill = await BillFactory.createBillUser(user, 400000);

        const bniPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ name: 'bni' });

        const payment = await PaymentFactory.createPaymentBill({ bill: bill, paymentMethod: bniPaymentMethod, status: 'paid', paidAt: new Date() })

        const response = await request(app)
          .post(`/api/bills/${bill.id}/pay`)
          .set('email', user.email)
          .set('password', user.password)
          .send({ paymentMethod: 'bni' })

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ success: false, data: null, message: 'Bill sudah dibayar' })
      })
    })

    describe('bill is pending', () => {
      it('should response with 400 Bad Request', async () => {
        const user = await UserFactory.createRandomUser();

        const bill = await BillFactory.createBillUser(user, 400000);

        const bniPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ name: 'bni' });

        const payment = await PaymentFactory.createPaymentBill({ bill: bill, paymentMethod: bniPaymentMethod, status: 'pending' })

        const response = await request(app)
          .post(`/api/bills/${bill.id}/pay`)
          .set('email', user.email)
          .set('password', user.password)
          .send({ paymentMethod: 'bni' })

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({ success: false, data: null, message: 'Bill sedang menunggu pembayaran' })
      })
    })

    describe('bill is unpaid', () => {
      it('should response with 201 OK', async () => {
        const user = await UserFactory.createRandomUser();

        const bill = await BillFactory.createBillUser(user, 400000);

        const bniPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ name: 'bni' });

        const response = await request(app)
          .post(`/api/bills/${bill.id}/pay`)
          .set('email', user.email)
          .set('password', user.password)
          .send({ paymentMethod: 'bni' })

        console.log(response.body)

        expect(response.status).toEqual(201);
        expect(response.body.success).toEqual(true);
        expect(response.body.data.invoice).toBeDefined();
        expect(response.body.data.status).toEqual('pending');
        expect(response.body.data._links).toEqual({
          "instruction": `/api/payments/${response.body.data.invoice}`,
        });
      })
    })
  })
})