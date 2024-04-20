const { sequelize } = require("../models");

const truncateTables = async () => {
    await Promise.all(
        Object.values(sequelize.models).map(async function (model) {
            await model.destroy({ truncate: { cascade: true } });
        })
    );
};

module.exports = truncateTables