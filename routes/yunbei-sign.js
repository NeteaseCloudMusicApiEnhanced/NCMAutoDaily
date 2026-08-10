const express = require('express')
const router = express.Router()
const { handleTask } = require('../lib/tasks')

// 单独执行：云贝签到
// GET /api/yunbei-sign?key=xxx[&index=N]
router.get('/', async (req, res) => {
  await handleTask('yunbei-sign', req, res)
})

module.exports = router