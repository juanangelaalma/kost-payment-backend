const request = require("supertest");
const { app, server } = require("../../../app");
const truncateTables = require("../../../utils/truncateTables");
const UserFactory = require("../../../factories/user.factory");
const UserService = require("../../../services/user.service");
const RoomFactory = require("../../../factories/room.factory");
const RoomService = require("../../../services/room.service");
const formatTimestampToDate = require("../../../utils/formatTimestampToDate");

describe('manage tenants', () => {
  afterEach(async () => {
    await truncateTables();
  });

  afterAll((done) => {
    server.close(done)
  })

  describe('POST /api/admin/tenants', () => {
    it('should return 201 Created', async () => {
      const tenantData = {
        name: 'Tenant 1',
        email: 'tenant1@gmail.com',
        password: 'password',
        roomCode: 'A1',
        startDate: '2022-01-01',
      }

      const admin = await UserFactory.createRandomUser({ role: 'admin' })

      const response = await request(app).post('/api/admin/tenants')
        .send(tenantData)
        .set('email', admin.email)
        .set('password', admin.password)

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)

      const newTenant = await UserService.getTenantByEmailIncludeRoom(tenantData.email)

      expect(newTenant).not.toBeNull()
      expect(newTenant.name).toBe(tenantData.name)
      expect(newTenant.email).toBe(tenantData.email)
      expect(newTenant.room.code).toBe(tenantData.roomCode)
      expect(newTenant.startDate).toBe(tenantData.startDate)
    })

    describe('when startDate is null', () => {
      it('should return 201 Created', async () => {
        const tenantData = {
          name: 'Tenant 1',
          email: 'tenant@gmail.com',
          password: 'password',
          roomCode: 'A1',
        }

        const admin = await UserFactory.createRandomUser({ role: 'admin' })

        const response = await request(app).post('/api/admin/tenants')
          .send(tenantData)
          .set('email', admin.email)
          .set('password', admin.password)

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)

        const newTenant = await UserService.getTenantByEmailIncludeRoom(tenantData.email)

        expect(newTenant).not.toBeNull()
        expect(newTenant.name).toBe(tenantData.name)
        expect(newTenant.email).toBe(tenantData.email)
        expect(newTenant.room.code).toBe(tenantData.roomCode)
        expect(newTenant.startDate).not.toBe(null)
      })

      describe('400', () => {
        describe('when email is not valid', () => {
          it('should return 400 Bad Request', async () => {
            const tenantData = {
              name: 'Tenant 1',
              email: 'invaalidemail',
              password: 'password',
              roomCode: 'A1',
              startDate: '2022-01-01',
            }

            const admin = await UserFactory.createRandomUser({ role: 'admin' })

            const response = await request(app).post('/api/admin/tenants')
              .send(tenantData)
              .set('email', admin.email)
              .set('password', admin.password)

            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe('Email tidak valid')
          })
        })
      })

      describe('when email is already used', () => {
        it('should return 400 Bad Request', async () => {
          const existingTenant = await UserFactory.createRandomUser({ email: 'tenant@gmail.com' })

          const tenantData = {
            name: 'Tenant 1',
            email: existingTenant.email,
            password: 'password',
            roomCode: 'A1',
            startDate: '2022-01-01',
          }

          const admin = await UserFactory.createRandomUser({ role: 'admin' })

          const response = await request(app).post('/api/admin/tenants')
            .send(tenantData)
            .set('email', admin.email)
            .set('password', admin.password)

          expect(response.status).toBe(400)
          expect(response.body.success).toBe(false)
          expect(response.body.message).toBe('Email sudah digunakan')
        })
      })

      describe('when room code is already used', () => {
        it('should return 400 Bad Request', async () => {
          const user = await UserFactory.createRandomUser({ role: 'tenant' })
          const room = await RoomFactory.createRoomUser({ user, code: 'A1' })

          const tenantData = {
            name: 'Tenant 1',
            email: 'tenant@gmail.com',
            password: 'password',
            roomCode: room.code,
            startDate: '2022-01-01',
          }

          const admin = await UserFactory.createRandomUser({ role: 'admin' })

          const response = await request(app).post('/api/admin/tenants')
            .send(tenantData)
            .set('email', admin.email)
            .set('password', admin.password)

          expect(response.status).toBe(400)
          expect(response.body.success).toBe(false)
          expect(response.body.message).toBe('Kode kamar harus unik')
        })
      })

      // uncomplete body
      describe('when body is not complete', () => {
        it('should return 400 Bad Request', async () => {
          const tenantData = {
            name: 'Tenant 1',
          }

          const admin = await UserFactory.createRandomUser({ role: 'admin' })

          const response = await request(app).post('/api/admin/tenants')
            .send(tenantData)
            .set('email', admin.email)
            .set('password', admin.password)

          expect(response.status).toBe(400)
          expect(response.body.success).toBe(false)
          expect(response.body.message).toBe('Email wajib diisi')
        })
      })
    })
  })

  describe('DELETE /api/admin/tenants/:id', () => {
    it('should return 200 OK', async () => {
      const tenant = await UserFactory.createRandomUser({ role: 'tenant' })
      const room = await RoomFactory.createRoomUser({ user: tenant, code: 'A1' })

      const admin = await UserFactory.createRandomUser({ role: 'admin' })

      const response = await request(app).delete(`/api/admin/tenants/${tenant.id}`)
        .set('email', admin.email)
        .set('password', admin.password)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)

      const deletedTenant = await UserService.getTenantByEmail(tenant.email)
      expect(deletedTenant).toBeNull()

      const oldUserRoom = await RoomService.getRoomByCode(room.code)
      expect(oldUserRoom.userId).toBeNull()
    })

    describe('when tenant does not have room', () => {
      it.only('should return 200 OK and success remove tenant', async () => {
        const tenant = await UserFactory.createRandomUser({ role: 'tenant' })

        const admin = await UserFactory.createRandomUser({ role: 'admin' })

        const response = await request(app).delete(`/api/admin/tenants/${tenant.id}`)
          .set('email', admin.email)
          .set('password', admin.password)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)

        const deletedTenant = await UserService.getTenantByEmail(tenant.email)
        expect(deletedTenant).toBeNull()
      })
    })

    describe('404', () => {
      describe('when tenant is not found', () => {
        it('should return 404 Bad Request', async () => {
          const admin = await UserFactory.createRandomUser({ role: 'admin' })

          const response = await request(app).delete(`/api/admin/tenants/1`)
            .set('email', admin.email)
            .set('password', admin.password)

          expect(response.status).toBe(404)
          expect(response.body.success).toBe(false)
          expect(response.body.message).toBe('Tenant tidak ditemukan')
        })
      })
    })
  })

  describe('GET /api/admin/tenants', () => {
    it('should return correct data', async () => {
      const admin = await UserFactory.createRandomUser({ role: 'admin' })

      const tenant1 = await UserFactory.createRandomUser({ role: 'tenant' })
      const tenant2 = await UserFactory.createRandomUser({ role: 'tenant' })

      const room1 = await RoomFactory.createRoomUser({ user: tenant1, code: 'K1' })
      const room2 = await RoomFactory.createRoomUser({ user: tenant2, code: 'K2' })

      const response = await request(app).get(`/api/admin/tenants`)
        .set('email', admin.email)
        .set('password', admin.password)

      expect(response.status).toBe(200)

      expect(response.body.data[0].id).toEqual(tenant1.id)
      expect(response.body.data[0].email).toEqual(tenant1.email)
      expect(response.body.data[0].name).toEqual(tenant1.name)
      expect(response.body.data[0].startDate).toEqual(formatTimestampToDate(tenant1.startDate))
      expect(response.body.data[0].roomCode).toEqual('K1')

      expect(response.body.data[1].id).toEqual(tenant2.id)
      expect(response.body.data[1].email).toEqual(tenant2.email)
      expect(response.body.data[1].name).toEqual(tenant2.name)
      expect(response.body.data[1].startDate).toEqual(formatTimestampToDate(tenant2.startDate))
      expect(response.body.data[1].roomCode).toEqual('K2')
    })
  })
})