require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

const PORT = process.env.PORT || 3000

const db = require('./models')
const routes = require('./routes')

app.use(bodyParser.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))

routes(app)

db.sequelize.sync().then(() => {
  console.log('Database connected')
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
})

module.exports = app