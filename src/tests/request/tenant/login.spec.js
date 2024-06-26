const request = require("supertest");
const {app, server} = require("../../../app");
const { User, sequelize } = require("../../../models");
const truncateTables = require("../../../utils/truncateTables");
const UserFactory = require("../../../factories/user.factory");

describe("Login request test", () => {
    afterEach((done) => {
        truncateTables();
        done();
    });

    afterAll((done) => {
        server.close(done)
    })

    describe("when email and password is correct", () => {
        it("should response with 200 OK", async () => {
            const user = await UserFactory.createRandomUser();

            const response = await request(app)
                .post("/api/login")
                .send({ email: user.email, password: user.password });

            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
                success: true,
                data: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    password: user.password,
                    role: user.role,
                },
                message: null,
            });
        });
    });

    describe("when email is incorrect", () => {
        it("should response with 401 Forbidden", async () => {
            const user = await UserFactory.createRandomUser();

            const response = await request(app)
                .post("/api/login")
                .send({
                    email: `wrong-${user.email}`,
                    password: user.password,
                });

            expect(response.status).toEqual(401);
            expect(response.body).toEqual({
                success: false,
                data: null,
                message: "Email atau password salah!",
            });
        });
    });

    describe("when body request does not contain email", () => {
        it("should response with 400 Bad Request", async () => {
            const response = await request(app).post("/api/login").send({
                password: "password123",
            });

            expect(response.status).toEqual(400);
            expect(response.body).toEqual({
                success: false,
                data: null,
                message: "Email wajib diisi",
            });
        });
    });

    describe("when body request does not contain password", () => {
        it("should response with 400 Bad Request", async () => {
            const response = await request(app).post("/api/login").send({
                email: "email@gmail.com",
            });

            expect(response.status).toEqual(400);
            expect(response.body).toEqual({
                success: false,
                data: null,
                message: "Password wajib diisi",
            });
        });
    });

    describe("when body request is null", () => {
        it("should response with 400 Bad Request", async () => {
            const response = await request(app).post("/api/login").send({});

            expect(response.status).toEqual(400);
            expect(response.body).toEqual({
                success: false,
                data: null,
                message: "Email wajib diisi",
            });
        });
    });

    describe("when body request has invalid email", () => {
        it("should response with 400 Bad Request", async () => {
            const response = await request(app).post("/api/login").send({
                email: "invalid_email",
            });

            expect(response.status).toEqual(400);
            expect(response.body).toEqual({
                success: false,
                data: null,
                message: "Email tidak valid",
            });
        });
    });
});
