require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const apiRoutes = require('./routes/api')
const signRoutes = require('./routes/sign')
const loginRoutes = require('./routes/login')

const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.use('/', apiRoutes)
app.use('/api/sign', signRoutes)
app.use('/login', loginRoutes)

app.listen(PORT, () => {
  console.log(`Server is listening port: http://localhost:${PORT}`)
})

module.exports = app