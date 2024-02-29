require('dotenv').config()
const express = require('express')
const app = express()

const PORT = process.env.PORT || 3000

const db = require('./models')

app.get('/', (req, res) => {
  return res.send('Hello world')
})

db.sequelize.sync().then(() => {
  console.log('Database connected')
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
})