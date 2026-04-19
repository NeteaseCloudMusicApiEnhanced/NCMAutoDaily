# API 接口文档

这里是NCMAutoDaily的所有接口文档喵~ *(认真)*

## 签到接口

### 触发签到

执行所有签到任务的主接口喵~

**请求**

```
GET /api/sign?key=<AUTH_KEY>
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | string | 是 | 验证密钥，需要与 AUTH_KEY 匹配喵~ |

**响应示例**

```json
{
  "success": true,
  "message": "签到完成",
  "results": {
    "daily_signin": {
      "code": 200,
      "msg": "签到成功"
    },
    "vip_sign": {
      "code": 200,
      "msg": "乐签成功"
    },
    "yunbei_sign": {
      "code": 200,
      "msg": "云贝签到成功"
    },
    "scrobble": {
      "success": true,
      "count": 5
    },
    "account": {
      "account": {
        "id": 123456789,
        "userName": "用户名",
        "status": 0
      }
    }
  },
  "timestamp": "2024-04-19T12:00:00.000Z"
}
```

**错误响应**

```json
{
  "success": false,
  "message": "认证失败：密钥无效"
}
```

---

## 配置接口

### 检查配置状态

获取当前环境变量的配置状态喵~

**请求**

```
GET /api/config/status
```

**响应示例**

```json
{
  "apiBaseUrl": true,
  "neteaseCookie": true,
  "authKey": true,
  "playlistId": true
}
```

返回的布尔值表示该配置项是否已设置喵~

---

### 获取包版本

获取当前项目的版本号喵~

**请求**

```
GET /api/package-version
```

**响应示例**

```json
{
  "version": "0.1.0"
}
```

---

## 用户接口

### 获取账号信息

获取当前登录用户的账号信息喵~

**请求**

```
POST /api/user/account
```

**响应示例**

```json
{
  "account": {
    "id": 123456789,
    "userName": "用户名",
    "status": 0,
    "createTime": 1234567890000,
    "salt": "***",
    "token": "***",
    "expireTime": 1234567890000
  }
}
```

---

## 登录接口

### 获取二维码Key

获取二维码登录的第一步Key喵~

**请求**

```
GET /api/login/qr/key?timestamp=<时间戳>
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| timestamp | number | 否 | 当前时间戳，默认自动生成 |

**响应示例**

```json
{
  "code": 200,
  "data": {
    "code": 200,
    "unikey": "xxx"
  }
}
```

---

### 生成二维码

根据Key生成二维码图片喵~

**请求**

```
GET /api/login/qr/create?key=<unikey>&qrimg=true
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | string | 是 | 上一步获取的 unikey |
| qrimg | boolean | 否 | 是否返回二维码图片，默认 true |

**响应示例**

```json
{
  "code": 200,
  "data": {
    "code": 200,
    "qrimg": "data:image/png;base64,..."
  }
}
```

---

### 检查二维码状态

检查二维码扫描状态喵~

**请求**

```
GET /api/login/qr/check?key=<unikey>&noCookie=false
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | string | 是 | unikey |
| noCookie | boolean | 否 | 是否不返回cookie，默认 false |

**响应示例**

- 未���描：`{"code": 201, "message": "扫码成功"}`
- 已扫描待确认：`{"code": 200, "message": "确认登录", "cookie": "..."}`
- 已登录：`{"code": 200, "account": {...}}`

---

## Web界面

### 首页

项目的主页，显示签到界面喵~

```
GET /
```

### 登录页

二维码登录页面喵~
```
GET /login
```

---

## 错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功喵~ ✨ |
| 201 | 处理中或待确认 |
| 400 | 请求参数错误 |
| 401 | 认证失败 |
| 500 | 服务器内部错误 |

大多数接口的错误响应格式如下喵~

```json
{
  "code": -1,
  "message": "错误信息"
}
```