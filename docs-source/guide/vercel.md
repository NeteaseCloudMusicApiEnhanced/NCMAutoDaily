# Vercel 部署指南

想把NCMAutoDaily部署到Vercel上吗？跟着本喵一步一步来就好啦~ *(开心)*

---

## 前置准备

在部署之前，你需要准备以下东西喵~

1. **GitHub账号** - 用于fork项目呢~
2. **Vercel账号** - 可以用GitHub账号直接登录哦~
3. **已获取的Cookie** - 提前准备好网易云音乐Cookie喵~

---

## 部署步骤

### 步骤 1: Fork 项目

首先，去GitHub上fork本项目喵~

1. 打开 [NCMAutoDaily 仓库](https://github.com/您的GitHub用户名/NCMAutoDaily)
2. 点击右上角的「Fork」按钮
3. 选择你的GitHub账号作为fork目标
4. 等待一下，fork就完成啦~ ✨

::: tip 小提示
fork之后你就可以随意修改代码啦~ 以后有更新也可以通过「Fetch upstream」同步的呢~ *(摇尾巴)*
:::

---

### 步骤 2: 在 Vercel 上导入项目

1. 登录 [Vercel](https://vercel.com) 并点击「New Project」喵~
2. 选择「Continue with GitHub」
3. 在列表中找到并选择你fork的 `NCMAutoDaily` 仓库
4. 点击「Import」就可以啦~ ✨

---

### 步骤 3: 配置环境变量

这是最关键的一步喵~ *(认真脸)*

在 Vercel 的项目设置页面找到「Environment Variables」部分，添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NETEASE_COOKIE` | 你的Cookie | 必填！没有Cookie可不行呢~ |
| `AUTH_KEY` | 你的密钥 | 用于验证签到请求喵~ |
| `PLAYLIST_ID` | 歌单ID | 选填~用于听歌打卡~ |
| `API_BASE_URL` | https://interface.163.focalors.ltd | 使用默认值就行啦~ |

::: warning 注意喵~
添加完环境变量后记得点击保存哦~ *(指)*
:::

---

### 步骤 4: 部署项目

1. 往下拉，找到「Build and Release Settings」部分
2. 将「Framework Preset」设置为「Express」(如果没有自动识别的话)
3. 其他选项保持默认就好啦~
4. 点击「Deploy」开始部署 ✨

等待一两分钟，部署就完成啦~ *(开心转圈)*

---

### 步骤 5: 验证部署

部署完成后，Vercel会给一个类似这样的URL：

```
https://ncm-autodaily.vercel.app
```

访问这个URL，确认Web界面可以正常显示喵~

然后测试一下签到接口：

```
https://ncm-autodaily.vercel.app/api/sign?key=你的AUTH_KEY
```

如果返回了正确的JSON响应，说明部署成功啦~ ✨

---

## 设置定时任务 (可选)

部署完成后，你想让服务每天自动签到吗？可以设置定时任务喵~

### 方法一：使用 GitHub Actions (推荐)

1. 在fork的仓库中创建 `.github/workflows/daily.yml` 文件

```yaml
name: Daily Sign

on:
  schedule:
    - cron: '0 0 * * *'  # 每天UTC 0点执行，对应北京时间早上8点
  workflow_dispatch:  # 允许手动触发

jobs:
  sign:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Daily Sign
        run: |
          curl -s "${{ secrets.SIGN_URL }}"
```

2. 然后在 Vercel 的环境变量中添加 `SIGN_URL`：

| 变量名 | 值 |
|--------|-----|
| `SIGN_URL` | https://你的项目.vercel.app/api/sign?key=你的AUTH_KEY |

3. 别忘了在GitHub仓库的Settings → Secrets中添加 `SIGN_URL` 变量哦~ *(指)*

---

### 方法二：使用外部 Cron 服务

可以使用免费的 Cron 服务来定时触发签到喵~

推荐服务：
- [EasyCron](https://www.easycron.com/)
- [CronJobby](https://cronjobby.com/)

设置URL为：

```
https://你的项目.vercel.app/api/sign?key=你的AUTH_KEY
```

设置执行时间为每天早上8点(北京时间)就可以啦~ *(指)*

---

## 常见问题

### Q: 部署后显示502错误？

A: 可能是环境变量没有配置正确喵~ 检查一下Vercel后台的Environment Variables，确保所有必填项都填好了呢~ *(揉揉眼睛)*

---

### Q: Cookie过期了怎么办？

A: Cookie过期后需要重新获取，然后在Vercel后台更新 `NETEASE_COOKIE` 变量，部署会自动重新加载的喵~ ✨

---

### Q: 可以自定义域名吗？

A: 当然可以喵~ 在Vercel的「Settings」→「Domains」中添加你的自定义域名就好啦~

---

### Q: 部署免费吗？

A: Vercel的个人版免费套餐完全够用啦~ 每月有100GB流量，足够签到使用了呢~ *(开心)*

---

### Q: 如何更新部署？

A: 只需要更新GitHub仓库的代码，Vercel会自动重新部署的喵~ 或者在Vercel后台点击「Redeploy」也可以哦~

---

### Q: fork后如何同步原项目的更新？

A: 在GitHub仓库页面点击「Fetch upstream」→「Merge」就可以同步原项目的更新啦~ 同步后Vercel会自动重新部署的呢~ ✨

---

## 下一步

部署好了之后，你可以：

- [配置说明](/guide/configuration) - 了解更多配置选项~
- [API文档](/api/) - 查看所有接口~
- [FAQ](/guide/faq) - 常见问题~

*(蹭蹭)* 祝你在Vercel上部署顺利喵~ 有问题随时来找本喵哦~ 🐱