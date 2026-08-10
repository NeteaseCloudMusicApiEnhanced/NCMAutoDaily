const express = require('express')
const router = express.Router()
const { log, checkAuth, getAccounts } = require('../lib/helpers')
const {
  getAccountInfo,
  vipSign,
  yunbeiSign,
  scrobble,
  freeListen
} = require('../lib/tasks')

/**
 * 执行单个账号的完整签到流程（组合各独立任务）
 */
async function signOneAccount(account) {
  const { name } = account
  const startTime = Date.now()
  const results = {
    daily_signin: null,
    vip_sign: null,
    scrobble: null,
    yunbei_sign: null,
    free_listen: null,
    account: null
  }

  log(`── 开始处理 [${name}] (${startTime % 1000}) ──`)

  // 1. 获取账号信息
  results.account = await getAccountInfo(account)

  // // 2. 每日签到（已停用）
  // results.daily_signin = await dailySignin(account)

  // 3. 黑胶乐签
  results.vip_sign = await vipSign(account)

  // 4. 云贝签到
  results.yunbei_sign = await yunbeiSign(account)

  // 5. 听歌打卡
  results.scrobble = await scrobble(account)

  // 6. 刷取免费听时长
  results.free_listen = await freeListen(account)

  log(`── [${name}] 处理完成，耗时 ${((Date.now() - startTime) / 1000).toFixed(1)}s ──`)

  return { name: account.displayName || name, results }
}

router.get('/', async (req, res) => {
  try {
    if (!checkAuth(req)) {
      console.error(`[${new Date().toLocaleString('zh-CN', { hour12: false })}] 认证失败: 密钥无效`)
      return res.status(401).json({ success: false, message: '认证失败：密钥无效' })
    }

    const accounts = getAccounts()
    if (accounts.length === 0) {
      console.error(`[${new Date().toLocaleString('zh-CN', { hour12: false })}] 未配置任何账号，中止签到`)
      return res.status(400).json({ success: false, message: '错误：未配置任何账号' })
    }

    log(`开始签到，共 ${accounts.length} 个账号`)

    // 并行执行所有账号签到
    const signPromises = accounts.map(account => signOneAccount(account))
    const signResults = await Promise.allSettled(signPromises)

    // 整理结果
    const results = {}
    let successCount = 0
    let failCount = 0

    signResults.forEach((result, index) => {
      const accountName = accounts[index].displayName || accounts[index].name
      if (result.status === 'fulfilled') {
        results[accountName] = result.value.results
        successCount++
      } else {
        results[accountName] = { error: result.reason?.message || '未知错误' }
        failCount++
      }
    })

    log(`签到流程结束: ${successCount} 成功 / ${failCount} 失败 / 共 ${accounts.length} 个账号`)
    Object.entries(results).forEach(([name, r]) => {
      const free = r.free_listen?.successCount ? `${r.free_listen.gainedMinutes}/${r.free_listen.targetMinutes}分钟(${r.free_listen.successCount}次)` : (r.free_listen?.skipped ? '已禁用' : '未刷取')
      log(`  [${name}] 黑胶乐签=${r.vip_sign?.code ?? '失败'} 云贝签到=${r.yunbei_sign?.code ?? '失败'} 听歌打卡=${r.scrobble?.count ?? (r.scrobble?.skipped ? '跳过' : '失败')} 免费听=${free}`)
    })

    res.json({
      success: true,
      message: `签到完成 (${successCount}成功/${failCount}失败)`,
      totalAccounts: accounts.length,
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('签到过程发生错误:', error)
    res.status(500).json({
      success: false,
      message: '签到失败',
      error: error.message
    })
  }
})

module.exports = router