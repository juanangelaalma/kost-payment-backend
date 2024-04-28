const validateRequest = require("./middlewares/validateRequest")
const UserController = require("./controllers/user.controller")
const LoginSchema = require("./schemas/login.schema")
const BillSchema = require("./schemas/bill.schema")
const requireUser = require("./middlewares/requireUser")
const BillController = require("./controllers/bill.controller")
const PaymentController = require("./controllers/payment.controller")
const MidtransController = require("./controllers/midtrans.controller")
const requireAdmin = require("./middlewares/requireAdmin")
const TenantSchema = require("./schemas/tenant.schema")
const TenantController = require("./controllers/tenant.controller")
const RoomController = require("./controllers/room.controller")
const RoomSchema = require("./schemas/room.schema")

const routes = (app) => {
  app.get('/health-check', (req, res) => res.send('OK'))
  
  app.post('/api/login', validateRequest(LoginSchema.createLoginSchema), UserController.loginHandler)

  app.get('/api/total-bills', requireUser, BillController.getTotalBillsHandler)
  app.get('/api/bills', requireUser, BillController.getBillsUserHandler)

  app.post('/api/bills/:id/pay', requireUser, validateRequest(BillSchema.paySchema), BillController.payBillHandler)

  app.get('/api/payments/:invoice', requireUser, PaymentController.getPaymentHandler)

  app.post('/api/midtrans-notification', MidtransController.notificationHandler)

  app.get('/api/admin/count-bills', requireUser, requireAdmin, BillController.countBillsHandler)

  app.get('/api/admin/bills', requireUser, requireAdmin, BillController.getBillsAdminHandler)

  app.post('/api/admin/tenants', requireUser, requireAdmin, validateRequest(TenantSchema.createTenantSchema), TenantController.createTenantHandler)
  app.delete('/api/admin/tenants/:id', requireUser, requireAdmin, TenantController.deleteTenantHandler)

  app.get('/api/admin/rooms', requireUser, requireAdmin, RoomController.getRoomsHandler)
  app.post('/api/admin/rooms', requireUser, requireAdmin, validateRequest(RoomSchema.createRoomSchema), RoomController.createRoomHandler)
}

module.exports = routes