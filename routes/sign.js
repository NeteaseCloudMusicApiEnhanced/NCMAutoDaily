const express = require('express')
const router = express.Router()
const axios = require('axios')

const API_BASE_URL = process.env.API_BASE_URL

// 带时间戳的日志输出
function log(...args) {
  console.log(`[${new Date().toLocaleString('zh-CN', { hour12: false })}]`, ...args)
}

// 输出响应摘要（避免把 cookie 等敏感字段打印出来）
function summarize(data) {
  if (data && typeof data === 'object') {
    const parts = []
    if (data.code !== undefined) parts.push(`code=${data.code}`)
    if (data.message) parts.push(`msg=${data.message}`)
    if (data.msg) parts.push(`msg=${data.msg}`)
    return parts.length ? parts.join(' ') : `data(${Object.keys(data).length}个字段)`
  }
  return String(data)
}

/**
 * 收集所有账号配置
 * 环境变量格式: NETEASE_COOKIE_1, NETEASE_COOKIE_2... / PLAYLIST_ID_1, PLAYLIST_ID_2...
 * 兼容旧格式: NETEASE_COOKIE (单账号)
 */
function getAccounts() {
  const accounts = []

  // 优先读取编号格式 (NETEASE_COOKIE_1, NETEASE_COOKIE_2...)
  let i = 1
  while (process.env[`NETEASE_COOKIE_${i}`]) {
    accounts.push({
      index: i,
      cookie: process.env[`NETEASE_COOKIE_${i}`],
      playlistId: process.env[`PLAYLIST_ID_${i}`] || null,
      name: `账号${i}`
    })
    i++
  }

  // 兼容旧版单账号格式
  if (accounts.length === 0 && process.env.NETEASE_COOKIE) {
    accounts.push({
      index: 1,
      cookie: process.env.NETEASE_COOKIE,
      playlistId: process.env.PLAYLIST_ID || null,
      name: '主账号'
    })
  }

  // 配置扫描日志
  log(`扫描账号配置: 找到 ${accounts.length} 个账号 (编号格式: ${process.env.NETEASE_COOKIE_1 ? '是' : '否'})`)
  if (!API_BASE_URL) {
    log('⚠️ 警告: API_BASE_URL 未配置，所有签到请求将失败，请检查环境变量')
  }
  accounts.forEach(a => {
    log(`  账号${a.index} [${a.name}]: ${a.playlistId ? `已配置歌单 ${a.playlistId}` : '未配置歌单 (听歌打卡将跳过)'}`)
  })

  return accounts
}

/**
 * 执行单个账号的完整签到流程
 */
async function signOneAccount(account) {
  const { cookie, playlistId, name } = account
  const startTime = Date.now()
  const results = {
    daily_signin: null,
    vip_sign: null,
    scrobble: null,
    yunbei_sign: null,
    account: null
  }

  log(`── 开始处理 [${name}] (${startTime % 1000}) ──`)

  // 1. 获取账号信息
  try {
    const response = await axios({
      url: `${API_BASE_URL}/user/account`,
      method: 'post',
      data: { cookie }
    })
    results.account = response.data
    // 如果有昵称则更新账号名
    if (response.data.profile?.nickname) {
      account.displayName = response.data.profile.nickname
      log(`[${name}] 获取账号信息成功: ${summarize(response.data)} (昵称: ${response.data.profile.nickname})`)
    } else {
      log(`[${name}] 获取账号信息成功: ${summarize(response.data)}`)
    }
  } catch (error) {
    console.error(`[${name}] 获取账号信息失败:`, error.message)
    results.account = { error: error.message }
  }

  // // 2. 每日签到
  // try {
  //   const response = await axios({
  //     url: `${API_BASE_URL}/daily_signin`,
  //     method: 'post',
  //     data: { type: 1, cookie }
  //   })
  //   results.daily_signin = response.data
  // } catch (error) {
  //   console.error(`[${name}] 每日签到失败:`, error.message)
  //   results.daily_signin = { error: error.message }
  // }

  // 3. 黑胶乐签
  try {
    const response = await axios({
      url: `${API_BASE_URL}/vip/sign`,
      method: 'post',
      data: { cookie }
    })
    results.vip_sign = response.data
    log(`[${name}] 黑胶乐签成功: ${summarize(response.data)}`)
  } catch (error) {
    console.error(`[${name}] 黑胶乐签失败:`, error.message)
    results.vip_sign = { error: error.message }
  }

  // 4. 云贝任务
  try {
    const response = await axios({
      url: `${API_BASE_URL}/yunbei/task/finish/v1`,
      method: 'post',
      data: { yunbeiAmount: 150 ,cookie }
    })
    results.yunbei_sign = response.data
    log(`[${name}] 云贝任务完成: ${summarize(response.data)}`)
  } catch (error) {
    console.error(`[${name}] 云贝任务失败:`, error.message)
    results.yunbei_sign = { error: error.message }
  }

  // 5. 听歌打卡
  if (playlistId) {
    try {
      const response = await axios({
        url: `${API_BASE_URL}/playlist/detail`,
        method: 'get',
        params: { id: playlistId, cookie }
      })
      // 优先用 tracks（含歌曲详情），fallback 到 trackIds
      const songs = response.data.playlist.tracks || response.data.playlist.trackIds
      const scrobbleList = songs.slice(0, 30)
      let scrobbleSuccess = 0
      log(`[${name}] 获取歌单成功: 共 ${songs.length} 首，本次打卡 ${scrobbleList.length} 首`)

      for (const song of scrobbleList) {
        try {
          // /scrobble/v1 — 听歌打卡 V2 (NCBL 加密版)
          // 必填: id, time  可选: sourceid, source, name, artist, total
          const params = {
            id: song.id,
            sourceid: playlistId,
            time: 61,
            cookie
          }
          // tracks 有完整信息，附带 name 和 total 提高成功率
          if (song.name) {
            params.name = song.name
            params.total = Math.floor((song.dt || 0) / 1000) // 总时长(秒)
          }

          await axios({
            url: `${API_BASE_URL}/scrobble/v1`,
            method: 'get',
            params
          })
          scrobbleSuccess++
        } catch (error) {
          console.error(`[${name}] 听歌打卡失败 (歌曲ID: ${song.id}):`, error.message)
        }
      }
      results.scrobble = { success: true, count: scrobbleSuccess }
      log(`[${name}] 听歌打卡完成: ${scrobbleSuccess}/${scrobbleList.length} 首成功`)
    } catch (error) {
      console.error(`[${name}] 听歌打卡失败:`, error.message)
      results.scrobble = { error: error.message }
    }
  } else {
    results.scrobble = { skipped: true, reason: '未配置歌单ID' }
    log(`[${name}] 跳过听歌打卡: 未配置歌单ID`)
  }

  log(`── [${name}] 处理完成，耗时 ${((Date.now() - startTime) / 1000).toFixed(1)}s ──`)

  return { name: account.displayName || name, results }
}

router.get('/', async (req, res) => {
  try {
    const { key } = req.query
    const authKey = process.env.AUTH_KEY || 'your_default_auth_key'

    if (key !== authKey) {
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
      log(`  [${name}] 黑胶乐签=${r.vip_sign?.code ?? '失败'} 云贝签到=${r.yunbei_sign?.code ?? '失败'} 听歌打卡=${r.scrobble?.count ?? (r.scrobble?.skipped ? '跳过' : '失败')}`)
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