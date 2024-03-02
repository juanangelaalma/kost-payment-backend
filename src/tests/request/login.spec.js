const request = require("supertest");
const app = require("../../app");
const { User, sequelize } = require("../../models");
const truncateTables = require("../../utils/truncateTables");

describe("Login request test", () => {
    afterEach((done) => {
        truncateTables()
        done();
    });

    describe("when email and password is correct", () => {
        it("should response with 200 OK", async () => {
            const user = await User.create({
                email: "user@gmail.com",
                name: "User",
                password: "password123",
                role: "tenant",
            });

            const response = await request(app)
                .post("/api/login")
                .send({ email: "user@gmail.com", password: "password123" });

            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
                success: true,
                data: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                message: null,
            });
        });
    });

    describe("when email is incorrect", () => {
        it("should response with 401 Forbidden", async () => {
            await User.create({
                email: "user@gmail.com",
                name: "User",
                password: "password123",
                role: "tenant",
            });

            const response = await request(app)
                .post("/api/login")
                .send({
                    email: "wrong-email@gmail.com",
                    password: "password123",
                });

            expect(response.status).toEqual(401);
            expect(response.body).toEqual({
              success: false,
              data: null,
              message: "Email atau password salah!"
            })
        });
    });
});
