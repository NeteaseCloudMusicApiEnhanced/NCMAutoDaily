# 配置说明

这里详细说明了NCMAutoDaily的所有配置选项喵~ *(认真脸)*

## 环境变量

项目使用 `.env` 文件来管理配置，下面是所有可用的配置项喵~

---

## 必填配置

### NETEASE_COOKIE

你的网易云音乐Cookie喵~ 这是最重要的配置呢~ 没有Cookie可不行哦~

```env
NETEASE_COOKIE=MUSIC_U=你的Cookie值
```

**获取方法：**
1. 登录电脑端网易云音乐
2. 按 `F12` 打开开发者工具
3. Application -> Cookies -> 选择音乐域名
4. 复制 `MUSIC_U` 的值喵~ *(指)*

::: warning 注意喵~
Cookie有效期约30-120天，出现签到失败时请检查Cookie是否过期
:::

---

### AUTH_KEY

签到请求的验证密钥喵~ 用来保护你的签到接口不被别人随便访问~

```env
AUTH_KEY=一个安全的密钥字符串
```

建议使用随机生成的字符串，比如：

```bash
openssl rand -hex 16
```

---

## 选填配置

### PLAYLIST_ID

用于听歌打卡的爱歌曲ID喵~ 如果不配置这个选项，听歌打卡功能就不会运行呢~

```env
PLAYLIST_ID=123456789
```

**如何获取歌单ID：**
1. 在网易云音乐网页版打开你的歌单
2. 查看URL，例如：`https://music.163.com/#/playlist?id=123456789`
3. 复制URL中的 `id` 参数值喵~

---

### PORT

服务运行的端口喵~ 默认是3000呢~

```env
PORT=3000
```

---

### API_BASE_URL

网易云音乐API的基础URL喵~ 一般不需要修改呢~

```env
API_BASE_URL=your-api-base-url
```

API项目需要部署 [NeteaseCloudMusicApi](https://github.com/neteasecloudmusicapienhanced/api-enhanced) 获取
---

## 配置示例

完整的 `.env` 文件大概是这样子的喵~

```env
# 必填项
NETEASE_COOKIE=MUSIC_U=abcdef1234567890;
AUTH_KEY=my-secret-key-2024

# 选填项
PLAYLIST_ID=123456789
PORT=3000
API_BASE_URL=https://interface.163.example.com
```

---

## 配置检查

项目提供了API来检查配置状态喵~

```bash
curl http://localhost:3000/api/config/status
```

返回示例：

```json
{
  "apiBaseUrl": true,
  "neteaseCookie": true,
  "authKey": true,
  "playlistId": true
}
```

所有值都是 `true` 就说明配置正确啦~ *(开心)*

---

## 常见问题

### Q: 配置改了需要重启服务吗？

A: 是的呢~ 修改 `.env` 文件后需要重启服务才能生效喵~

```bash
# 按 Ctrl+C 停止服务
# 然后重新启动
pnpm start
```

### Q: 可以不配置 PLAYLIST_ID 吗？

A: 可以的喵~ 不配置的话就不会执行听歌打卡功能，但其他签到功能不受影响呢~

### Q: Cookie 怎么获取？

A: 详见[快速开始](/guide/quick-start)页面的「获取Cookie」部分哦~ *(蹭蹭)*