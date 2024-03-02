const truncateTables = require("../../utils/truncateTables");
const { User } = require('../../models')

describe("truncateTables.js", () => {
    it("should truncate all tables", async () => {
        await User.create({
            email: "user@gmail.com",
            name: "User",
            password: "password123",
            role: "tenant",
        });

        truncateTables()

        const userCount = await User.count()

        expect(userCount).toEqual(0)
    });
});
