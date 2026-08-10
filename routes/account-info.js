const express = require('express')
const router = express.Router()
const { handleTask } = require('../lib/tasks')

// 单独执行：获取账号信息
// GET /api/account-info?key=xxx[&index=N]
router.get('/', async (req, res) => {
  await handleTask('account-info', req, res)
})

module.exports = router