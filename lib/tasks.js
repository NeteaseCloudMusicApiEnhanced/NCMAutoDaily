/**
 * 签到任务函数集（可独立调用，也可被 /api/sign 组合调用）
 */
const axios = require('axios')
const { log, summarize, sleep, getAccounts, checkAuth } = require('./helpers')

const API_BASE_URL = process.env.API_BASE_URL

// ── 免费听刷取配置（环境变量控制，默认开启）──
const FREE_LISTEN_ENABLED = (process.env.FREE_LISTEN_ENABLED || 'true') !== 'false' // FREE_LISTEN_ENABLED=false 关闭
const FREE_LISTEN_TARGET_MINUTES = Number(process.env.FREE_LISTEN_TARGET_MINUTES || 24 * 60) // 目标总时长，默认 24 小时
const FREE_LISTEN_GAIN_MINUTES = Number(process.env.FREE_LISTEN_GAIN_MINUTES || 30) // 单次成功领取约 30 分钟
const FREE_LISTEN_INTERVAL_MS = Number(process.env.FREE_LISTEN_INTERVAL_MS || 500) // 请求间隔，防风控
const FREE_LISTEN_MAX_LOOPS = Number(
  process.env.FREE_LISTEN_MAX_LOOPS ||
    Math.ceil(FREE_LISTEN_TARGET_MINUTES / FREE_LISTEN_GAIN_MINUTES) + 10 // 默认按目标次数 +10 次余量
)

/* ─────────────────────────── 各任务实现 ─────────────────────────── */

// 1. 获取账号信息（成功时回填 account.displayName 昵称）
async function getAccountInfo(account) {
  const { cookie, name } = account
  try {
    const response = await axios({
      url: `${API_BASE_URL}/user/account`,
      method: 'post',
      data: { cookie }
    })
    // 如果有昵称则更新账号名
    if (response.data.profile?.nickname) {
      account.displayName = response.data.profile.nickname
      log(`[${name}] 获取账号信息成功: ${summarize(response.data)} (昵称: ${response.data.profile.nickname})`)
    } else {
      log(`[${name}] 获取账号信息成功: ${summarize(response.data)}`)
    }
    return response.data
  } catch (error) {
    console.error(`[${name}] 获取账号信息失败:`, error.message)
    return { error: error.message }
  }
}

// 2. 黑胶乐签
async function vipSign(account) {
  const { cookie, name } = account
  try {
    const response = await axios({
      url: `${API_BASE_URL}/vip/sign`,
      method: 'post',
      data: { cookie }
    })
    log(`[${name}] 黑胶乐签成功: ${summarize(response.data)}`)
    return response.data
  } catch (error) {
    console.error(`[${name}] 黑胶乐签失败:`, error.message)
    return { error: error.message }
  }
}

// 3. 云贝签到
async function yunbeiSign(account) {
  const { cookie, name } = account
  try {
    const response = await axios({
      url: `${API_BASE_URL}/yunbei/task/finish/v1`,
      method: 'post',
      data: { yunbeiAmount: 150, cookie }
    })
    log(`[${name}] 云贝签到成功: ${summarize(response.data)}`)
    return response.data
  } catch (error) {
    console.error(`[${name}] 云贝签到失败:`, error.message)
    return { error: error.message }
  }
}

// 4. 听歌打卡（从歌单取前 30 首逐首打卡）
async function scrobble(account) {
  const { cookie, playlistId, name } = account
  if (!playlistId) {
    log(`[${name}] 跳过听歌打卡: 未配置歌单ID`)
    return { skipped: true, reason: '未配置歌单ID' }
  }
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
    log(`[${name}] 听歌打卡完成: ${scrobbleSuccess}/${scrobbleList.length} 首成功`)
    return { success: true, count: scrobbleSuccess }
  } catch (error) {
    console.error(`[${name}] 听歌打卡失败:`, error.message)
    return { error: error.message }
  }
}

// 判定免费听领取是否成功（兼容外层 code 与内层 data.code）
function isGainSuccess(body) {
  if (!body) return false
  const inner = body.data
  if (inner && typeof inner === 'object' && inner.code !== undefined) {
    return inner.code === 200
  }
  return body.code === 200
}

// 5. 刷取免费听时长（看广告领权益，每次约 30 分钟，刷到 24 小时）
async function freeListen(account) {
  const { cookie, name } = account
  if (!FREE_LISTEN_ENABLED) {
    log(`[${name}] 免费听刷取已禁用 (FREE_LISTEN_ENABLED=false)`)
    return { skipped: true, reason: 'FREE_LISTEN_ENABLED=false' }
  }

  // 1. 查询当前免费听时长状态（失败不影响刷取）
  let remaining = null
  try {
    const res = await axios({
      url: `${API_BASE_URL}/ad/listening/rights`,
      method: 'get',
      params: { cookie, timestamp: Date.now() }
    })
    remaining = res.data
    log(`[${name}] 免费听当前状态: ${summarize(res.data)}`)
  } catch (error) {
    log(`[${name}] 查询免费听状态失败: ${error.message}（不影响刷取）`)
  }

  let gainedMinutes = 0
  let successCount = 0
  let failCount = 0
  let consecutiveFails = 0
  const maxLoops = FREE_LISTEN_MAX_LOOPS

  log(`[${name}] 开始刷取免费听时长: 目标 ${FREE_LISTEN_TARGET_MINUTES} 分钟，单次约 ${FREE_LISTEN_GAIN_MINUTES} 分钟，最多 ${maxLoops} 次`)

  for (let round = 1; round <= maxLoops; round++) {
    // 达到目标则提前退出
    if (gainedMinutes >= FREE_LISTEN_TARGET_MINUTES) {
      log(`[${name}] 已达成目标 ${FREE_LISTEN_TARGET_MINUTES} 分钟`)
      break
    }

    try {
      const res = await axios({
        url: `${API_BASE_URL}/ad/listening/rights/gain`,
        method: 'post',
        params: { timestamp: Date.now() }, // POST 必须加时间戳防缓存
        data: { cookie }
      })
      const body = res.data || {}

      if (isGainSuccess(body)) {
        successCount++
        gainedMinutes += FREE_LISTEN_GAIN_MINUTES
        consecutiveFails = 0
        const innerKeys = body.data && typeof body.data === 'object' ? Object.keys(body.data).slice(0, 6).join(',') : ''
        log(`[${name}] 免费听领取成功 #${successCount}: +${FREE_LISTEN_GAIN_MINUTES} 分钟 (累计 ${gainedMinutes}/${FREE_LISTEN_TARGET_MINUTES} 分钟)${innerKeys ? ` | 字段: ${innerKeys}` : ''}`)
      } else {
        failCount++
        consecutiveFails++
        console.error(`[${name}] 免费听领取未成功 (第${round}次): ${summarize(body)}`)
        if (consecutiveFails >= 3) {
          log(`[${name}] 连续 ${consecutiveFails} 次领取失败，可能已达上限/广告配额耗尽，停止刷取`)
          break
        }
      }
    } catch (error) {
      failCount++
      consecutiveFails++
      console.error(`[${name}] 免费听领取失败 (第${round}次):`, error.message)
      if (consecutiveFails >= 3) {
        log(`[${name}] 连续 ${consecutiveFails} 次领取失败，停止刷取`)
        break
      }
    }

    if (round < maxLoops) await sleep(FREE_LISTEN_INTERVAL_MS)
  }

  const reached = gainedMinutes >= FREE_LISTEN_TARGET_MINUTES
  log(`[${name}] 免费听刷取结束: 成功 ${successCount} 次，累计 +${gainedMinutes} 分钟，${reached ? '已达到目标' : '未达到目标'} (失败 ${failCount} 次)`)
  return {
    targetMinutes: FREE_LISTEN_TARGET_MINUTES,
    gainedMinutes,
    successCount,
    failCount,
    reached,
    remaining
  }
}

/* ─────────────────────── 任务编排 ─────────────────────── */

// 任务配置表（供独立路由 API 文档与分发使用）
const TASKS = {
  'account-info': { label: '获取账号信息', fn: getAccountInfo },
  'vip-sign': { label: '黑胶乐签', fn: vipSign },
  'yunbei-sign': { label: '云贝签到', fn: yunbeiSign },
  'scrobble': { label: '听歌打卡', fn: scrobble },
  'free-listen': { label: '免费听刷取', fn: freeListen }
}

// 判定单任务结果是否算"成功"（用于汇总计数）
function isTaskOk(result) {
  if (!result) return false
  if (result.error) return false
  if (result.skipped) return false
  if (result.success === true) return true
  if (result.reached !== undefined) return result.successCount > 0 || result.reached
  if (result.code !== undefined) return result.code === 200
  return true
}

/**
 * 统一处理独立任务请求
 * GET /api/<task>?key=xxx[&index=N]
 *   key   必填 认证密钥
 *   index 可选 只对指定账号执行（从 1 开始）
 */
async function handleTask(taskKey, req, res) {
  try {
    if (!checkAuth(req)) {
      console.error(`[${new Date().toLocaleString('zh-CN', { hour12: false })}] 认证失败: 密钥无效`)
      return res.status(401).json({ success: false, message: '认证失败：密钥无效' })
    }

    const task = TASKS[taskKey]
    if (!task) {
      return res.status(404).json({ success: false, message: `未知任务: ${taskKey}` })
    }

    let accounts = getAccounts()
    // 指定账号
    const { index } = req.query
    if (index !== undefined) {
      const target = accounts.find(a => a.index === Number(index))
      if (!target) {
        return res.status(400).json({ success: false, message: `错误：账号${index}不存在` })
      }
      accounts = [target]
    }
    if (accounts.length === 0) {
      console.error(`[${new Date().toLocaleString('zh-CN', { hour12: false })}] 未配置任何账号，中止任务`)
      return res.status(400).json({ success: false, message: '错误：未配置任何账号' })
    }

    log(`开始${task.label}，共 ${accounts.length} 个账号`)

    // 并行执行
    const settled = await Promise.allSettled(accounts.map(acc => task.fn(acc)))

    // 整理结果
    const results = {}
    let successCount = 0
    let failCount = 0
    settled.forEach((result, i) => {
      const acc = accounts[i]
      const accountName = acc.displayName || acc.name
      if (result.status === 'fulfilled') {
        results[accountName] = result.value
        isTaskOk(result.value) ? successCount++ : failCount++
      } else {
        results[accountName] = { error: result.reason?.message || '未知错误' }
        failCount++
      }
    })

    log(`${task.label}流程结束: ${successCount} 成功 / ${failCount} 失败`)
    res.json({
      success: true,
      message: `${task.label}完成 (${successCount}成功/${failCount}失败)`,
      totalAccounts: accounts.length,
      task: taskKey,
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('任务执行过程发生错误:', error)
    res.status(500).json({
      success: false,
      message: '任务执行失败',
      error: error.message
    })
  }
}

module.exports = {
  API_BASE_URL,
  TASKS,
  getAccounts,
  checkAuth,
  handleTask,
  isTaskOk,
  getAccountInfo,
  vipSign,
  yunbeiSign,
  scrobble,
  freeListen,
  FREE_LISTEN_TARGET_MINUTES,
  FREE_LISTEN_GAIN_MINUTES,
  FREE_LISTEN_INTERVAL_MS,
  FREE_LISTEN_MAX_LOOPS
}