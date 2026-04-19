# 安装指南

欢迎来到NCMAutoDaily的安装指南喵~ *(摇尾巴)* 这里会详细告诉你怎么把这个自动打卡工具跑起来呢~

## 环境要求

在开始之前，你需要确保自己的电脑上安装了以下东东喵~

| 环境 | 要求版本 | 说明 |
|------|----------|------|
| Node.js | >= 18.0.0 | 运行服务需要的环境呢~ |
| pnpm | >= 7.0.0 | 包管理工具，推荐使用pnpm喵~ |

::: tip 小提示
你可以用 `node -v` 和 `pnpm -v` 命令来检查自己有没有安装好喵~ (๑•̀ㅂ•́)و
:::

## 安装步骤

### 1. 克隆项目

首先，把项目代码克隆到你的电脑上喵~

```bash
git clone https://github.com/NeteaseCloudMusicApiEhanced/NCMAutoDaily.git
cd NCMAutoDaily
```

### 2. 安装依赖

然后安装项目需要的依赖包喵~

```bash
pnpm install
```

如果没有安装pnpm，可以先安装一下：

```bash
npm install -g pnpm
```

### 3. 配置环境变量

项目依赖一些环境变量来运行，我们需要创建 `.env` 文件喵~

```bash
cp .env.example .env
```

然后用文本编辑器打开 `.env` 文件，填入你的配置信息吧~ *(指向)* 具体的配置说明请看[配置说明](/guide/configuration)页面喵~

### 4. 启动服务

一切就绪！现在可以启动服务啦~ ✨

```bash
pnpm start
```

如果一切正常，你会看到类似这样的输出：

```
Server is listening port: http://localhost:3000
```

### 5. 验证安装

服务启动后，打开浏览器访问 `http://localhost:3000` 应该就能看到项目的Web界面啦~(开心)

你也可以用curl命令检查一下服务是否正常：

```bash
curl http://localhost:3000/api/package-version
```

正常的话会返回类似这样的JSON：

```json
{"version": "0.1.0"}
```

---

## 常见问题

### 安装失败怎么办？

如果安装过程中遇到问题，可以尝试以下方法喵~

1. **清除缓存再试一次**
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

2. **检查Node.js版本** - 确保Node.js版本 >= 18.0.0喵~

3. **查看错误信息** - 仔细看一下终端里的错误提示，通常会告诉你是哪里出了问题呢~

### 端口被占用？

如果3000端口被其他程序占用了，可以修改 `.env` 文件里的 `PORT` 值喵~

```
PORT=3001
```

然后重新启动服务就好啦~ *(蹭蹭)*

---

## 下一步

安装好了之后，推荐你看看：

- [快速开始](/guide/quick-start) - 5分钟快速上手教程喵~
- [配置说明](/guide/configuration) - 完整的配置选项~