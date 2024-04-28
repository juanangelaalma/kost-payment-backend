const request = require("supertest");
const { app, server } = require("../../../app");
const UserFactory = require("../../../factories/user.factory");
const truncateTables = require("../../../utils/truncateTables");
const RoomFactory = require("../../../factories/room.factory");
const RoomService = require("../../../services/room.service");

describe("Admin rooms request test", () => {
  afterEach(async () => {
    await truncateTables();
  });

  afterAll((done) => {
    server.close(done)
  })

  describe('GET /api/admin/rooms', () => {
    describe('when user is not admin', () => {
      it('should response with 401', async () => {
        const user = await UserFactory.createRandomUser({ role: 'tenant' })

        const response = await request(app)
          .get('/api/admin/rooms')
          .set('email', user.email)
          .set('password', user.password)

        expect(response.status).toBe(401)
      })
    })

    describe('when user is admin', () => {
      describe('when there is no room', () => {
        it('should response with 0 total rooms', async () => {
          const admin = await UserFactory.createRandomUser({ role: 'admin' })

          const response = await request(app)
            .get('/api/admin/rooms')
            .set('email', admin.email)
            .set('password', admin.password)

          expect(response.status).toBe(200)
          expect(response.body.success).toBe(true)
          expect(response.body.data.length).toEqual(0)
        })
      })

      describe('when there is 3 rooms', () => {
        it('should response with 3 total rooms', async () => {
          const admin = await UserFactory.createRandomUser({ role: 'admin' })

          const tenant = await UserFactory.createRandomUser({ role: 'tenant' })

          const room = await RoomFactory.createRoomUser({ user: tenant })
          const room2 = await RoomFactory.createRoom()
          const room3 = await RoomFactory.createRoom()

          const response = await request(app)
            .get('/api/admin/rooms')
            .set('email', admin.email)
            .set('password', admin.password)

          expect(response.status).toBe(200)
          expect(response.body.success).toBe(true)
          expect(response.body.data.length).toEqual(3)

          expect(response.body.data[0].code).toEqual(room.code)
          expect(response.body.data[0].available).toEqual(false)

          expect(response.body.data[1].code).toEqual(room2.code)
          expect(response.body.data[1].available).toEqual(true)

          expect(response.body.data[2].code).toEqual(room3.code)
          expect(response.body.data[2].available).toEqual(true)
        })
      })
    })
  });

  describe('POST /api/admin/rooms', () => {
    describe('when user is not admin', () => {
      it('should response with 401', async () => {
        const user = await UserFactory.createRandomUser({ role: 'tenant' })

        const response = await request(app)
          .post('/api/admin/rooms')
          .set('email', user.email)
          .set('password', user.password)

        expect(response.status).toBe(401)

        const rooms = await RoomService.getAllRooms()
        expect(rooms.length).toEqual(0)
      })
    })

    describe('when user is admin', () => {
      it('should response with 201 and create a room', async () => {
        const admin = await UserFactory.createRandomUser({ role: 'admin' })

        const response = await request(app)
          .post('/api/admin/rooms')
          .set('email', admin.email)
          .set('password', admin.password)
          .send({ code: 'ROOM1' })

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
        expect(response.body.data.code).toEqual('ROOM1')

        const rooms = await RoomService.getAllRooms()
        expect(rooms.length).toEqual(1)
        expect(rooms[0].code).toEqual('ROOM1')
      })

      describe('when room code is empty', () => {
        it('should response with 400', async () => {
          const admin = await UserFactory.createRandomUser({ role: 'admin' })

          const response = await request(app)
            .post('/api/admin/rooms')
            .set('email', admin.email)
            .set('password', admin.password)
            .send({ code: '' })

          expect(response.status).toBe(400)
          expect(response.body.success).toBe(false)
          expect(response.body.message).toEqual('Code wajib diisi')

          const rooms = await RoomService.getAllRooms()
          expect(rooms.length).toEqual(0)
        })
      })
    })
  })
});