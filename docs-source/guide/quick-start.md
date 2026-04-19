# 快速开始

想让NCMAutoDaily在5分钟内跑起来吗？跟着本喵一步一步来就好啦~ *(兴奋)*

## 前置准备

在开始之前，你需要准备以下东西喵~

1. **网易云音乐账号** - 电脑端登录过的老用户应该都有Cookie了吧~
2. **Git** - 用于克隆项目代码呢~
3. **Node.js环境** - 用于运行服务喵~

---

## 步骤 1: 获取Cookie

这是最关键的一步喵！没有Cookie可不行呢~

### 方法一：从浏览器获取 (推荐)

1. 用电脑浏览器登录网易云音乐网页版 [music.163.com](https://music.163.com)
2. 按 `F12` 打开开发者工具
3. 切换到 `Application` (应用) 或 `Network` (网络) 面板
4. 刷新页面，点击任意一个网络请求
5. 在请求头中找到 `Cookie` 字段
6. 复制完整的Cookie值喵~ *(指)*

### 方法二：使用二维码登录

如果你不方便获取Cookie，项目也提供了二维码登录功能喵~

1. 启动服务后访问 `http://localhost:3000/login`
2. 用网易云音乐APP扫描二维码
3. 扫描成功后，Cookie会自动保存到 `.env` 文件哦~ ✨

::: warning 注意喵~
Cookie有效期大概为30-120天，过期了需要重新获取呢~
:::

---

## 步骤 2: 配置环境

### 创建配置文件

```bash
cp .env.example .env
```

### 编辑 .env 文件

打开 `.env` 文件，填入以下配置喵~

```env
# 必填项
NETEASE_COOKIE=你的Cookie粘贴到这里

# 选填项
AUTH_KEY=一个安全的密钥，用于验证签到请求
PORT=3000
PLAYLIST_ID=你的歌单ID（用于听歌打卡）
API_BASE_URL=https://interface.example.com
```

---

## 步骤 3: 启动服务

```bash
pnpm start
```

看到这样的输出就说明成功啦~

```
Server is listening port: http://localhost:3000
```

---

## 步骤 4: 触发签到

现在！让我们来触发一次签到吧~ ✨

```bash
curl "http://localhost:3000/api/sign?key=你的AUTH_KEY"
```

或者直接在浏览器访问：

```
http://localhost:3000/api/sign?key=你的AUTH_KEY
```

如果一切正常，你会收到类似这样的JSON响应喵~

```json
{
  "success": true,
  "message": "签到完成",
  "results": {
    "daily_signin": { "code": 200 },
    "vip_sign": { "code": 200 },
    "yunbei_sign": { "code": 200 },
    "scrobble": { "success": true, "count": 5 },
    "account": { "account": { "id": 123456789 } }
  },
  "timestamp": "2024-04-19T12:00:00.000Z"
}
```

---

## 步骤 5: 设置定时任务 (可选)

如果你想让服务每天自动签到，可以设置定时任务喵~

### Linux/Mac (使用 cron)

```bash
# 编辑定时任务
crontab -e

# 每天早上8点自动签到
0 8 * * * curl "http://localhost:3000/api/sign?key=你的AUTH_KEY"
```

### Windows (使用 Task Scheduler)

1. 打开「任务计划程序」
2. 创建基本任务
3. 设置触发时间为每天早上8点
4. 操作选择「启动程序」
5. 程序填写：`curl`
6. 参数填写：`"http://localhost:3000/api/sign?key=你的AUTH_KEY"`

### 使用 GitHub Actions (推荐)

项目支持部署到Vercle后配合GitHub Actions进行定时触发喵~

创建 `.github/workflows/daily.yml` 文件：

```yaml
name: Daily Sign

on:
  schedule:
    - cron: '0 0 * * *'  # 每天UTC 0点执行，对应北京时间早上8点
  workflow_dispatch:

jobs:
  sign:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Sign
        run: |
          curl -s "${{ secrets.SIGN_URL }}"
```

然后在Vercel的环境变量中配置 `SIGN_URL` 为你的签到URL喵~ *(指)*

---

## 搞定啦~ ✨

现在就完成了所有设置喵~ *(开心地转圈)*

你可以访问 `http://localhost:3000` 查看Web界面，确认签到是否成功喵~

如果想要了解更多配置选项，可以看看[配置说明](/guide/configuration)页面呢~ *(蹭蹭)*