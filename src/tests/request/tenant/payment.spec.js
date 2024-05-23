const request = require("supertest");
const { app, server } = require("../../../app");
const UserFactory = require("../../../factories/user.factory");
const truncateTables = require("../../../utils/truncateTables");
const BillFactory = require("../../../factories/bill.factory");
const PaymentMethodFactory = require("../../../factories/payment-method.factory");
const PaymentFactory = require("../../../factories/payment.factory");
const formatCurrency = require("../../../utils/formatCurrency");

describe("Pay request test", () => {
  afterAll((done) => {
    server.close(done)
  })

  describe('/api/bills/:id/pay', () => {
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

        expect(response.status).toEqual(201);
        expect(response.body.success).toEqual(true);
        expect(response.body.data.invoice).toBeDefined();
        expect(response.body.data.status).toEqual('pending');
        expect(response.body.data._links).not.toBeDefined()
      })
    })
  })

  describe('/api/payments/:invoice', () => {
    describe('payment is not found', () => {
      it('should response with 404 Not Found', async () => {
        const user = await UserFactory.createRandomUser();

        const response = await request(app)
          .get(`/api/payments/INV202203011`)
          .set('email', user.email)
          .set('password', user.password)

        expect(response.status).toEqual(404);
        expect(response.body).toEqual({ success: false, data: null, message: 'Payment not found' })
      })
    })

    describe('payment is found', () => {
      it('should response with 200 OK', async () => {
        const user = await UserFactory.createRandomUser();

        const bill = await BillFactory.createBillUser(user, 400000);

        const bniPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ name: 'bni' });

        // Indonesia Time 21-04-3000 14:00 WIB
        const deadline = new Date('2030-04-21T14:00:00Z');

        // mengatur ke default UTC
        const defaultTime = deadline.getUTCHours() - 7;
        deadline.setUTCHours(defaultTime);

        const payment = await PaymentFactory.createPaymentBill({ bill: bill, paymentMethod: bniPaymentMethod, status: 'pending', deadline })

        const response = await request(app)
          .get(`/api/payments/${payment.invoice}`)
          .set('email', user.email)
          .set('password', user.password)

        expect(response.status).toEqual(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.data).toEqual({
          id: payment.id,
          invoice: payment.invoice,
          amount: formatCurrency(payment.amount),
          formattedDeadline: 'Minggu, 21 April 2030 14:00 WIB',
          deadline: '2030-04-21T07:00:00.000Z',
          status: 'pending',
          payment: {
            title: bniPaymentMethod.title,
            logo: bniPaymentMethod.logo,
            name: bniPaymentMethod.name,
            vaNumber: payment.vaNumber,
          }
        })
        expect(response.body.message).toBeNull();
      })

      describe('when payment is expired', () => {
        it('response with 200 OK but status is failed', async () => {
          const user = await UserFactory.createRandomUser();

          const bill = await BillFactory.createBillUser(user, 400000);

          const bniPaymentMethod = await PaymentMethodFactory.createPaymentMethod({ name: 'bni' });

          // Indonesia Time 21-04-1999 14:00 WIB
          const deadline = new Date('1999-04-21T14:00:00Z');

          // mengatur ke default UTC
          const defaultTime = deadline.getUTCHours() - 7;
          deadline.setUTCHours(defaultTime);

          const payment = await PaymentFactory.createPaymentBill({ bill: bill, paymentMethod: bniPaymentMethod, status: 'pending', deadline })

          const response = await request(app)
            .get(`/api/payments/${payment.invoice}`)
            .set('email', user.email)
            .set('password', user.password)

          expect(response.status).toEqual(200);
          expect(response.body.success).toEqual(true);
          expect(response.body.data).toEqual({
            id: payment.id,
            invoice: payment.invoice,
            amount: formatCurrency(payment.amount),
            deadline: '1999-04-21T07:00:00.000Z',
            formattedDeadline: 'Rabu, 21 April 1999 14:00 WIB',
            status: 'failed',
            payment: {
              title: bniPaymentMethod.title,
              logo: bniPaymentMethod.logo,
              name: bniPaymentMethod.name,
              vaNumber: payment.vaNumber,
            }
          })
          expect(response.body.message).toBeNull();
        })
      })
    })
  })
})