# 🔍 积分接口 401 错误诊断

## 问题描述

**接口：** `GET /api/client/points`

**错误响应：**
```json
{
  "code": 401,
  "message": "未提供认证令牌",
  "data": null
}
```

---

## 问题原因

### ❌ 根本原因：localStorage 中没有 token

1. **积分系统（server 3000端口）需要 JWT Token 认证**
   - 路由配置：`router.get('/', authenticate, ...)`
   - `authenticate` 中间件检查 `Authorization: Bearer <token>`

2. **当前登录流程使用的是旧接口，不返回 JWT Token**
   - 旧接口：`/api/pwdLogin`、`/api/phoneLogin`（film_api 4000端口）
   - 返回格式：`{ success_code: 200 }`（只设置 session/cookie）
   - **没有 JWT token！**

3. **前端登录成功后没有保存 token**
   ```javascript
   // Login.vue - 登录成功处理
   if (json.success_code === 200) {
     Toast({ message: '登录成功' });
     this.$router.go(-1);
     // ❌ 没有 localStorage.setItem('token', ...)
   }
   ```

---

## 系统架构说明

### 两套后端系统

| 系统 | 端口 | 认证方式 | 接口前缀 |
|------|------|---------|---------|
| **film_api** | 4000 | Session/Cookie | `/api/*` |
| **server (积分墙)** | 3000 | JWT Token | `/api/client/*`, `/api/offerwall/*` |

### 认证机制差异

#### film_api (4000端口)
- 使用 Express Session
- 登录后设置 `req.session.userId` 和 `res.cookie('user_id')`
- 后续请求通过 `withCredentials: true` 携带 cookies

#### server (3000端口)
- 使用 JWT Token
- 登录后返回 `{ token: 'eyJhbGc...' }`
- 后续请求需要 `Authorization: Bearer <token>` 头

---

## 解决方案

### 方案1：使用积分墙系统的登录接口（推荐）✅

#### 1. 前端调用新的登录接口

修改 `Login.vue`，使用 `server` 的登录接口：

```javascript
// 导入新的登录API
import { login } from '@/api/auth'  // 需要创建这个文件

// 登录处理
async handleLogin() {
  try {
    const res = await login({
      username: this.userName,
      password: this.password
    })

    if (res.code === 200) {
      // ✅ 保存 token
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userId', res.data.user.id)

      Toast({ message: '登录成功' })
      this.$router.go(-1)
    }
  } catch (error) {
    MessageBox.alert(error.message)
  }
}
```

#### 2. 创建认证API文件

创建 `film/src/api/auth.js`：

```javascript
import axios from 'axios'

const authService = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000
})

/**
 * 登录
 */
export function login(data) {
  return authService({
    url: '/auth/login',
    method: 'post',
    data
  }).then(res => res.data)
}

/**
 * 注册
 */
export function register(data) {
  return authService({
    url: '/auth/register',
    method: 'post',
    data
  }).then(res => res.data)
}

export default authService
```

#### 3. 确保 server 有登录接口

检查 `server/src/routes/auth.routes.ts` 是否存在：

```typescript
// POST /api/auth/login
// POST /api/auth/register
```

---

### 方案2：修改旧登录接口，返回 JWT Token（需后端改动）

修改 `film_api/routes/index.js` 的登录接口：

```javascript
// 引入 JWT 工具（需要安装 jsonwebtoken）
const jwt = require('jsonwebtoken');

router.post('/api/pwdLogin', function(req, res) {
  // ... 原有验证逻辑 ...

  if (result[0].password === pwd) {
    req.session.userId = result[0].user_id;
    res.cookie('user_id', result[0].user_id);

    // ✅ 新增：生成 JWT Token
    const token = jwt.sign(
      { id: result[0].user_id, username: result[0].user_name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success_code: 200,
      token: token,  // ✅ 返回 token
      user: {
        id: result[0].user_id,
        username: result[0].user_name
      }
    });
  }
});
```

然后前端修改 `Login.vue`：

```javascript
let json = await pwdLogin(this.userName, this.password, this.captcha);
if (json.success_code === 200) {
  // ✅ 保存 token
  if (json.token) {
    localStorage.setItem('token', json.token);
    localStorage.setItem('userId', json.user.id);
  }

  Toast({ message: '登录成功' });
  this.$router.go(-1);
}
```

---

### 方案3：临时测试方案（仅开发环境）⚠️

手动设置 token 进行测试：

```javascript
// 1. 在浏览器控制台执行
// 需要先通过 server 的登录接口获取真实 token
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
localStorage.setItem('userId', '55')

// 2. 刷新页面，再次请求积分接口
```

---

## 检查清单

### ✅ 前端检查

```javascript
// 在浏览器控制台执行
console.log('Token:', localStorage.getItem('token'))
console.log('UserId:', localStorage.getItem('userId'))

// 如果 token 为 null，说明登录时没有保存
```

### ✅ 请求检查

打开浏览器 Network 面板：

```
Request URL: http://localhost:3000/api/client/points
Request Headers:
  Authorization: Bearer eyJhbGc...  ← 应该有这个
```

如果没有 `Authorization` 头，说明：
- localStorage 中没有 token
- 或 service 拦截器没有正确添加

### ✅ 后端检查

查看 `server` 的日志：

```bash
cd server
npm run dev

# 应该看到：
❌ 认证异常: { type: 'JsonWebTokenError', message: 'jwt must be provided' }
```

---

## 推荐实施步骤

### 第一步：确认 server 登录接口存在

```bash
cd server
npm run dev

# 测试登录接口
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

**预期响应：**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 55,
      "username": "admin"
    }
  }
}
```

### 第二步：创建前端认证 API

```bash
# 在 film 项目
touch src/api/auth.js
```

### 第三步：修改登录组件

修改 `Login.vue` 使用新的登录接口

### 第四步：测试

1. 清空 localStorage
2. 重新登录
3. 检查是否保存了 token
4. 访问积分接口

---

## 快速验证脚本

创建 `film/test-auth.html` 测试登录和积分接口：

```html
<!DOCTYPE html>
<html>
<head>
  <title>认证测试</title>
</head>
<body>
  <h1>积分系统认证测试</h1>

  <div>
    <h2>1. 登录</h2>
    <button onclick="testLogin()">测试登录</button>
    <div id="loginResult"></div>
  </div>

  <div>
    <h2>2. 获取积分</h2>
    <button onclick="testGetPoints()">测试获取积分</button>
    <div id="pointsResult"></div>
  </div>

  <script>
    async function testLogin() {
      try {
        const res = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'admin',
            password: '123456'
          })
        });

        const data = await res.json();
        document.getElementById('loginResult').innerHTML =
          `<pre>${JSON.stringify(data, null, 2)}</pre>`;

        if (data.code === 200) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('userId', data.data.user.id);
          alert('✅ Token已保存到localStorage');
        }
      } catch (error) {
        document.getElementById('loginResult').innerHTML =
          `<pre style="color:red">${error}</pre>`;
      }
    }

    async function testGetPoints() {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('❌ 请先登录获取token');
        return;
      }

      try {
        const res = await fetch('http://localhost:3000/api/client/points', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        document.getElementById('pointsResult').innerHTML =
          `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      } catch (error) {
        document.getElementById('pointsResult').innerHTML =
          `<pre style="color:red">${error}</pre>`;
      }
    }
  </script>
</body>
</html>
```

---

## 总结

### 问题
- `/api/client/points` 需要 JWT Token
- 当前登录流程不返回 JWT Token
- localStorage 中没有 token

### 解决
1. **短期**：使用 server 的登录接口（`/api/auth/login`）
2. **长期**：统一两套系统的认证机制，或在旧接口返回 token

### 注意
- film_api (4000端口) 用 Session/Cookie
- server (3000端口) 用 JWT Token
- 需要根据接口选择正确的认证方式
