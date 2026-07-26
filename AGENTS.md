# AGENTS.md — NCMAutoDaily

## Project summary
网易云音乐自动打卡 — Express.js 服务，通过代理外部 API 完成每日签到、黑胶乐签、云贝签到和听歌打卡。**支持多账号**，部署在 Vercel，也可本地运行。

## Developer commands
| 任务 | 命令 |
|---|---|
| 安装依赖 | `pnpm install` |
| 本地开发（热重载） | `pnpm dev`（nodemon） |
| 本地启动 | `pnpm start`（node index.js） |

- 包管理器：**pnpm**（`packageManager: "pnpm@10.28.1"`）。
- 无测试框架、无 linter、无 typecheck — 纯手动验证。
- `package.json` 中含 VitePress 脚本（`docs:dev`, `docs:build`），但 `docs-source/` 目录不存在于仓库中。在 CI/CD 之外无法直接使用。

## Required environment variables

`API_BASE_URL` 是**必填**的。需要自部署 [NeteaseCloudMusicApiEnhanced](https://github.com/neteasecloudmusicapienhanced/api-enhanced)。

**重要：** `routes/sign.js` 中 `API_BASE_URL` 无 fallback — 若未设置环境变量，签到流程会静默失败。  
`routes/api.js` 有 fallback `'https://interface.163.focalors.ltd'`（第三方公共地址），但 README 仍要求显式配置。

### 多账号格式（推荐）
```
NETEASE_COOKIE_1=MUSIC_U=xxx;     PLAYLIST_ID_1=123
NETEASE_COOKIE_2=MUSIC_U=yyy;     PLAYLIST_ID_2=456
# 按需递增: _3, _4, _5...
AUTH_KEY=your-auth-key
API_BASE_URL=https://api.example.com
PORT=3000  # optional
```

### 单账号格式（兼容旧版）
```
NETEASE_COOKIE=MUSIC_U=xxx;
PLAYLIST_ID=123
```

扫描逻辑：`getAccounts()` 先枚举 `NETEASE_COOKIE_N`（从 1 递增，遇到空缺停止）。若无编号格式，再 fallback 到 `NETEASE_COOKIE`。两种格式不可混用。

## Architecture

```
index.js          ← Express 入口，挂载 routes 和 static public/
├── routes/api.js    — API 代理 + 多账号状态查询（GET /config/status, POST /user/account）
├── routes/sign.js   — 核心签到（GET /api/sign?key=AUTH_KEY），多账号并行
├── routes/login.js  — 二维码登录页面路由（GET /login）
public/
  ├── index.html     — 状态面板：多账号卡片 + 一键签到
  └── login.html     — 二维码登录：选账号 → 扫码 → 显示对应环境变量名
```

Key wiring details:
- `module.exports = app` 在 `index.js` 末尾 — Vercel serverless 入口。
- `vercel.json` 将所有路由 `/(.*)` 转发到 `index.js`，使用 `@vercel/node` 构建。
- 前端页面通过 CDN 加载 axios（`fastly.jsdelivr.net`），无构建步骤。
- `getAccounts()` 在 `sign.js` 和 `api.js` 中重复定义（扫描 `NETEASE_COOKIE_N` 环境变量），逻辑基本一致。注意 `sign.js` 版会添加 `name` 字段用于展示；`api.js` 版没有。

## Sign-in flow (`/api/sign`)

`AUTH_KEY` 保护，**对所有已配置账号并行执行**签到：
1. 获取用户账号信息（`/user/account`）— 失败不影响后续。
2. 每日签到（`/daily_signin`, `type: 1`）。
3. 黑胶乐签（`/vip/sign`）。
4. 云贝签到（`/yunbei/sign`）。
5. 听歌打卡：从 `PLAYLIST_ID` 歌单取前 100 首，逐首调用 `/scrobble`（`time: 61`）。未配置歌单 ID 则跳过。

每步独立 try-catch，单步失败不阻断后续。多账号使用 `Promise.allSettled` 并行，结果合并后返回。

## Vercel deployment
- 导入 GitHub 仓库到 Vercel，自动识别 `vercel.json`。
- 环境变量在 Vercel 项目设置中配置（不要用 `.env` — 不在 Vercel 构建中使用）。
- 通过 cron-job.org 等外部定时服务，每日访问 `GET /api/sign?key=...` 触发打卡。

## Quirks & conventions
- 无 CI、无 pre-commit、无代码格式化配置。
- `.env` 在 `.gitignore` 中，不提交。
- 二维码登录流程（由前端 `login.html` 和 `routes/api.js` 代理实现）：`/login/qr/key` → `/login/qr/create` → 每 3s 轮询 `/login/qr/check`。状态码：800=过期，801=已扫描，802=已确认，803=登录成功。
