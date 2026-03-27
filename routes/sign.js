const express = require('express')
const router = express.Router()
const { daily_signin, vip_sign, scrobble, yunbei_sign, playlist_detail, user_account } = require('@neteasecloudmusicapienhanced/api')

router.get('/', async (req, res) => {
  try {
    const { key } = req.query

    if (key !== process.env.AUTH_KEY) {
      return res.status(401).json({ success: false, message: '认证失败：密钥无效' })
    }

    const cookie = process.env.NETEASE_COOKIE
    const playlistId = process.env.PLAYLIST_ID

    if (!cookie) {
      return res.status(400).json({ success: false, message: '错误：未配置 NETEASE_COOKIE' })
    }

    const results = {
      daily_signin: null,
      vip_sign: null,
      scrobble: null,
      yunbei_sign: null,
      account: null
    }

    try {
      results.account = await user_account({ cookie })
    } catch (error) {
      console.error('获取账号信息失败:', error.message)
      results.account = { error: error.message }
    }

    try {
      results.daily_signin = await daily_signin({ type: 0, cookie })
    } catch (error) {
      console.error('每日签到失败:', error.message)
      results.daily_signin = { error: error.message }
    }

    try {
      results.vip_sign = await vip_sign({ cookie })
    } catch (error) {
      console.error('黑胶乐签失败:', error.message)
      results.vip_sign = { error: error.message }
    }

    try {
      results.yunbei_sign = await yunbei_sign({ cookie })
    } catch (error) {
      console.error('云贝签到失败:', error.message)
      results.yunbei_sign = { error: error.message }
    }

    if (playlistId) {
      try {
        const playlistRes = await playlist_detail({ id: playlistId, cookie })
        const trackIds = playlistRes.body.playlist.trackIds.slice(0, 5).map(t => t.id)
        
        for (const trackId of trackIds) {
          try {
            await scrobble({
              id: trackId,
              sourceid: playlistId,
              time: 30,
              cookie
            })
          } catch (error) {
            console.error(`听歌打卡失败 (歌曲ID: ${trackId}):`, error.message)
          }
        }
        results.scrobble = { success: true, count: trackIds.length }
      } catch (error) {
        console.error('听歌打卡失败:', error.message)
        results.scrobble = { error: error.message }
      }
    }

    res.json({
      success: true,
      message: '签到完成',
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