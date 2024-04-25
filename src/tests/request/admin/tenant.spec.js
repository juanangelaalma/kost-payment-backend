const request = require("supertest");
const { app, server } = require("../../../app");
const { Tenant } = require("../../../models");
const truncateTables = require("../../../utils/truncateTables");
const UserFactory = require("../../../factories/user.factory");
const UserService = require("../../../services/user.service");
const RoomFactory = require("../../../factories/room.factory");

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
      expect(newTenant.room.startDate).toBe(tenantData.startDate)
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
        expect(newTenant.room.startDate).not.toBe(null)
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

      //uncomplete body
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
})