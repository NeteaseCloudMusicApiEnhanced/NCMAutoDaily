---
layout: home

hero:
  name: NCMAutoDaily
  text: 网易云音乐自动打卡
  tagline: 自动完成每日签到、黑胶乐签、云贝签到和听歌打卡
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 查看文档
      link: /guide/install

features:
  - title: 每日自动签到
    details: 自动完成网易云音乐每日签到任务，无需手动操作so easy~
  - title: 黑胶乐签到
    details: 自动完成黑胶VIP会员专属乐签到，轻轻松松拿奖励喵~
  - title: 云贝签到
    details: 每日自动签到获取云贝，积少成多换取好礼呢~
  - title: 听歌打卡
    details: 自动播放并打卡收藏夹歌曲，每日听歌时长get~
  - title: 简单配置
    details: 只需配置Cookie即可启动，全程无需复杂设置哦~
  - title: 定时任务
    details: 可配合CronJob实现每日自动执行，懒人必备喵~
---

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('%c🐱 NCMAutoDaily %c 欢迎使用喵~', 'font-size: 20px; color: #e74c3c;', 'font-size: 14px; color: #666;')
})
</script>

## 开始使用

只需要几分钟，你就可以设置好自动打卡服务喵~ *(激动地搓手手)*

### 1. 克隆项目

```bash
git clone https://github.com/NeteaseCloudMusicApiEnhanced/NCMAutoDaily.git
cd NCMAutoDaily
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

然后编辑 `.env` 文件，填入你的网易云Cookie喵~

### 4. 启动服务

```bash
pnpm start
```

服务启动后，访问 `http://localhost:3000` 就可以看到管理界面啦~ *(开心)*

### 5. 触发签到

```bash
curl http://localhost:3000/api/sign?key=你的AUTH_KEY
```

这样就完成一次自动签到啦~ 是不是很简单喵~ ✨

---

> 想要了解更多细节？点击上面的「快速开始」或者「安装指南」查看完整文档吧喵~ *(歪头)*