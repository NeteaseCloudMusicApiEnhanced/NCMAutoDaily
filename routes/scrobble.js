const express = require('express')
const router = express.Router()
const { handleTask } = require('../lib/tasks')

// 单独执行：听歌打卡
// GET /api/scrobble?key=xxx[&index=N]
router.get('/', async (req, res) => {
  await handleTask('scrobble', req, res)
})

module.exports = router