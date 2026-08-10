const express = require('express')
const router = express.Router()
const { handleTask } = require('../lib/tasks')

// 单独执行：黑胶乐签
// GET /api/vip-sign?key=xxx[&index=N]
router.get('/', async (req, res) => {
  await handleTask('vip-sign', req, res)
})

module.exports = router