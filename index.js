require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const axios = require('axios')
const signRoutes = require('./routes/sign')
const loginRoutes = require('./routes/login')

const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.post('/user/account', async (req, res) => {
  try {
    const cookie = process.env.NETEASE_COOKIE
    if (!cookie) {
      return res.status(400).json({ code: -1, message: '未配置 NETEASE_COOKIE' })
    }
    const response = await axios({
      url: 'https://music.163.com/api/n/user/account',
      method: 'post',
      headers: {
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    res.json(response.data)
  } catch (error) {
    console.error('获取用户信息失败:', error.message)
    res.status(500).json({ code: -1, message: error.message })
  }
})

app.get('/package-version', (req, res) => {
  const packageJson = require('./package.json')
  res.json({ version: packageJson.version })
})

app.use('/api/sign', signRoutes)
app.use('/login', loginRoutes)

app.listen(PORT, () => {
  console.log(`Server is listening port: http://localhost:${PORT}`)
})

module.exports = app