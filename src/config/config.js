const process = require('process');

const config = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: "mysql"
  },
  test: {
    username: process.env.AZURE_MYSQL_USER,
    password: process.env.AZURE_MYSQL_PASSWORD,
    database: 'kost-payment-app-database',
    host: process.env.AZURE_MYSQL_HOST,
    port: process.env.AZURE_MYSQL_PORT,
    dialect: "mysql",
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  production: {
    username: process.env.AZURE_MYSQL_USER,
    password: process.env.AZURE_MYSQL_PASSWORD,
    database: 'kost-payment-app-database',
    host: process.env.AZURE_MYSQL_HOST,
    port: process.env.AZURE_MYSQL_PORT,
    dialect: "mysql",
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  }
}

module.exports = config;