# 常见问题

这里是一些大家经常问的问题喵~ 希望可以帮到你呢~ *(蹭蹭)*

---

## 基础问题

### NCMAutoDaily是什么？

NCMAutoDaily是一个网易云音乐自动打卡工具喵~ 它可以帮你自动完成以下任务呢~

- 每日签到
- 黑胶VIP乐签到
- 云贝签到
- 听歌打卡

有了它，你就可以每天轻轻松松拿到签到奖励啦~ 是不是很方便喵~ *(摇尾巴)*

---

### 这个项目安全吗？

本项目是开源的，所有代码都可以在GitHub上看到喵~ 不会偷取你的个人信息呢~

不过要提醒你的是：

1. **Cookie安全** - 你的Cookie只会被用于向网易云API发送请求，不会泄露给其他人哦~
2. **个人隐私** - 项目不会收集或存储任何个人隐私数据呢~
3. **HTTPS** - 建议在生产环境使用HTTPS，保护数据传输安全喵~

::: tip 小提示
如果你不放心，可以自己搭建服务，只在本地运行就好啦~ *(指)*

---

### 需要付费吗？

完全免费哒喵~ ✨ 项目采用AGPL-3.0开源许可证，你可以免费使用、修改和分发呢~

不过如果你使用了本项目，建议给本喵点个Star嘛~ (๑•̀ㅂ•́)و

---

## 使用问题

### Cookie怎么获取？

获取Cookie的方法有三种喵~

**方法一：从浏览器获取**

1. 登录网页版网易云音乐
2. 按 `F12` 打开开发者工具
3. 切换到 `Application` 或 `Network` 面板
4. 找到Cookie，复制 `MUSIC_U` 的值喵~

**方法二：使用二维码登录**

1. 启动服务后访问 `/login` 页面
2. 用APP扫描二维码
3. 扫描成功后自动保存Cookie呢~

**方法三：使用浏览器插件**

一些Cookie管理插件也可以帮你导出Cookie喵~ *(眨眨眼)*

---

### Cookie过期了怎么办？

Cookie有效期大约30-120天，过期了需要重新获取呢~ *(委屈)*

你可以：

1. 重新按上面的方法获取Cookie
2. 更新 `.env` 文件中的 `NETEASE_COOKIE` 值
3. 重启服务喵~

建议设置一个提醒，每40天左右更新一次Cookie哦~

---

### 签到失败了怎么办？

别急别急~ 先看看错误信息是什么呢喵~

**常见错误和解决方法：**

| 错误信息 | 可能原因 | 解决方法 |
|----------|----------|----------|
| 认证失败 | AUTH_KEY 不匹配 | 检查URL中的key参数是否正确 |
| 未配置NETEASE_COOKIE | Cookie未设置 | 检查.env文件中的Cookie |
| 签到失败 | API调用失败 | 稍后重试，可能是网络问题 |

如果还是不行，可以在 issues 里提问哦~ *(靠过来)*

---

### 听歌打卡没有生效？

检查一下你的 `PLAYLIST_ID` 配置对不对喵~

```bash
curl http://localhost:3000/api/config/status
```

返回的 `playlistId` 应该是 `true` 才对呢~

另外，听歌打卡只会播放你歌单里的前100首歌，每首播放3分钟喵~

---

## 部署问题

### 如何部署到Vercel？

Vercel部署很简单喵~ *(开心)*

1. 将代码推送到GitHub
2. 在Vercel上导入项目
3. 配置环境变量
4. 点击部署就好啦~

部署后可以通过以下方式触发签到：

```bash
curl "https://你的项目.vercel.app/api/sign?key=你的AUTH_KEY"
```

---

### 如何设置每天自动签到？

可以用以下方法实现定时任务喵~

**方法一：GitHub Actions**

在项目中添加 `.github/workflows/daily.yml` 文件：

```yaml
name: Daily Sign
on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:
jobs:
  sign:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Sign
        run: curl -s "${{ secrets.SIGN_URL }}"
```

**方法二：使用Cron Job服务**

可以使用免费的Cron Job服务，比如：

- EasyCron
- CronBot
- GitHub Actions

设置为每天执行一次签到请求就好啦~ *(指)*

---

### 服务启动报端口占用？

端口3000被其他程序占用啦喵~ *(歪头)*

解决方法：

1. **查找占用进程**

   ```bash
   # Windows
   netstat -ano | findstr :3000

   # Linux/Mac
   lsof -i :3000
   ```

2. **修改端口**

   在 `.env` 文件中修改端口：

   ```
   PORT=3001
   ```

3. **重启服务**

   ```bash
   pnpm start
   ```

---

## 更多问题

### 可以添加XX功能吗？

当然可以喵~ ✨ 你可以在GitHub上提交Issue，或者自己动手修改代码呢~

本项目的结构很简单：

- `routes/sign.js` - 签到逻辑
- `routes/api.js` - API接口
- `routes/login.js` - 登录页面
- `public/` - 静态文件

欢迎提交PR哦~ *(摇尾巴)*

---

### 如何联系作者？

有问题或者建议，可以通过以下方式联系本喵喵~：

- GitHub Issues
- GitHub Discussions
- 发送邮件

期待你的反馈呢~ *(开心)*

---

> 找不到答案？在GitHub上提问吧喵~ *(蹭蹭)*