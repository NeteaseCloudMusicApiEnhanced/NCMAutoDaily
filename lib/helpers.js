/**
 * 公共工具函数
 */

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

// 简单延时
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
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

  return accounts
}

/**
 * 统一认证校验
 * @returns {boolean} 是否通过
 */
function checkAuth(req) {
  const authKey = process.env.AUTH_KEY || 'your_default_auth_key'
  return req.query.key === authKey
}

module.exports = { log, summarize, sleep, getAccounts, checkAuth }