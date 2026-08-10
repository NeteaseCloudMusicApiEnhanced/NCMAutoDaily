const express = require('express')
const router = express.Router()
const { handleTask } = require('../lib/tasks')

// 单独执行：刷取免费听时长（每次约 30 分钟，刷到 24 小时）
// GET /api/free-listen?key=xxx[&index=N]
router.get('/', async (req, res) => {
  await handleTask('free-listen', req, res)
})

module.exports = router