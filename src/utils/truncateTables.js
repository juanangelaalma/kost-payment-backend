const { sequelize } = require("../models");

const truncateTables = () => {
    Object.values(sequelize.models).map(function (model) {
        return model.destroy({ truncate: true });
    });
};

module.exports = truncateTables