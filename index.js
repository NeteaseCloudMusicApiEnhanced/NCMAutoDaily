require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const apiRoutes = require('./routes/api')
const signRoutes = require('./routes/sign')
const loginRoutes = require('./routes/login')
const accountInfoRoutes = require('./routes/account-info')
const vipSignRoutes = require('./routes/vip-sign')
const yunbeiSignRoutes = require('./routes/yunbei-sign')
const scrobbleRoutes = require('./routes/scrobble')
const freeListenRoutes = require('./routes/free-listen')

const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.use('/', apiRoutes)
app.use('/api/sign', signRoutes)
app.use('/api/account-info', accountInfoRoutes)
app.use('/api/vip-sign', vipSignRoutes)
app.use('/api/yunbei-sign', yunbeiSignRoutes)
app.use('/api/scrobble', scrobbleRoutes)
app.use('/api/free-listen', freeListenRoutes)
app.use('/login', loginRoutes)

app.listen(PORT, () => {
  console.log(`Server is listening port: http://localhost:${PORT}`)
})

module.exports = app