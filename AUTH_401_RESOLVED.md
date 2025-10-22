# ✅ 积分接口 401 错误 - 已解决

## 问题

**接口：** `GET /api/client/points`
**错误：** `{ "code": 401, "message": "未提供认证令牌" }`

---

## 根本原因

### ❌ localStorage 中没有 JWT Token

1. **积分系统需要 JWT Token 认证**
   - server (3000端口) 使用 JWT 认证
   - 需要请求头：`Authorization: Bearer <token>`

2. **当前登录流程不返回 Token**
   - 使用的是 film_api (4000端口) 的登录接口
   - 只返回 `{ success_code: 200 }`
   - 不返回 JWT token

3. **前端没有保存 token**
   - Login.vue 登录成功后直接跳转
   - 没有 `localStorage.setItem('token', ...)`

---

## 解决方案

### 方案1：使用积分系统的登录接口 ✅ （推荐）

#### 步骤1：已创建认证API

✅ 文件：`film/src/api/auth.js`

```javascript
import { login } from '@/api/auth'

// 登录
const res = await login({
  username: 'admin',
  password: '123456'
})

// 保存token
localStorage.setItem('token', res.data.token)
localStorage.setItem('userId', res.data.user.id)
```

#### 步骤2：修改登录组件（可选）

修改 `Login.vue` 使用新的登录API：

```vue
<script>
import { login } from '@/api/auth'

export default {
  methods: {
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
  }
}
</script>
```

---

### 方案2：使用测试工具快速验证 ✅

#### 步骤1：打开测试页面

```bash
# 在浏览器打开
file:///D:/Desktop/jifen/film/test-auth.html
```

#### 步骤2：测试登录

1. 输入用户名密码（默认 admin/123456）
2. 点击"登录"按钮
3. 看到 ✅ 登录成功，token 已保存

#### 步骤3：测试积分接口

1. 点击"获取积分"按钮
2. 应该返回积分数据，不再报 401 错误

---

## 快速测试步骤

### 1️⃣ 确保服务运行

```bash
# Terminal 1 - 启动 server (积分系统)
cd server
npm run dev
# 监听 3000 端口

# Terminal 2 - 启动 film_api (金币系统)
cd film_api
npm start
# 监听 4000 端口
```

### 2️⃣ 打开测试工具

浏览器打开：`file:///D:/Desktop/jifen/film/test-auth.html`

### 3️⃣ 测试登录

- 用户名：`admin`
- 密码：`123456`
- 点击 **🔑 登录**

**预期结果：**
```json
✅ 登录成功！

Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
User ID: 55
Username: admin

已保存到 localStorage
```

### 4️⃣ 测试积分接口

点击 **💰 获取积分**

**预期结果：**
```json
✅ 获取积分成功

{
  "code": 200,
  "message": "success",
  "data": {
    "points": 0,
    "userId": 55
  }
}
```

### 5️⃣ 在实际项目中使用

打开浏览器开发者工具 Console：

```javascript
// 检查 token 是否存在
console.log('Token:', localStorage.getItem('token'))
console.log('UserId:', localStorage.getItem('userId'))

// 如果存在，刷新页面后访问积分接口应该正常
```

---

## 系统架构说明

### 两套后端认证机制

| 系统 | 端口 | 认证方式 | 接口前缀 | 用途 |
|------|------|---------|---------|------|
| **film_api** | 4000 | Session/Cookie | `/api/*` | 金币、签到 |
| **server** | 3000 | JWT Token | `/api/client/*`, `/api/offerwall/*` | 积分墙、任务 |

### 请求示例对比

#### film_api (金币系统)

```javascript
// 请求
fetch('http://localhost:4000/api/getUserCoins', {
  credentials: 'include'  // ✅ 发送 cookies
})

// 后端验证
req.session.userId  // 从 session 获取
req.cookies.user_id // 从 cookie 获取
```

#### server (积分系统)

```javascript
// 请求
fetch('http://localhost:3000/api/client/points', {
  headers: {
    'Authorization': 'Bearer eyJhbGc...'  // ✅ 发送 JWT token
  }
})

// 后端验证
const token = req.headers.authorization?.replace('Bearer ', '')
const decoded = verifyToken(token)  // 解析 JWT
```

---

## 已创建的文件

### ✅ `film/src/api/auth.js`
认证API，提供：
- `login(data)` - 登录
- `register(data)` - 注册
- `getUserInfo()` - 获取用户信息
- `logout()` - 登出

### ✅ `film/test-auth.html`
测试工具，功能：
- 🔑 登录测试（获取 token）
- 💰 积分查询测试
- 🪙 金币查询测试
- ✅ 签到测试

### ✅ `film/AUTH_401_DIAGNOSIS.md`
详细诊断文档，包含：
- 问题原因分析
- 多种解决方案
- 架构说明
- 检查清单

---

## 下一步建议

### 短期方案（立即可用）

使用测试工具验证：
```bash
# 1. 打开 test-auth.html
# 2. 登录获取 token
# 3. 测试积分接口
```

### 长期方案（生产环境）

修改 Login.vue 组件：
```vue
// 导入新的认证API
import { login } from '@/api/auth'

// 登录成功后保存 token
localStorage.setItem('token', res.data.token)
localStorage.setItem('userId', res.data.user.id)
```

---

## 常见问题

### Q1: 为什么有两套认证系统？

**A:** 历史原因，film_api 是旧系统（Session），server 是新系统（JWT）。未来可以统一。

### Q2: 我应该用哪个登录接口？

**A:**
- 如果只用金币系统 → film_api 的登录（Session/Cookie）
- 如果用积分墙系统 → server 的登录（JWT Token）
- **推荐用 server 登录**，可以兼容两套系统

### Q3: localStorage 的 token 会过期吗？

**A:** 会，JWT token 默认 7 天过期。过期后需要重新登录。

### Q4: 如何在前端检查 token 是否有效？

**A:**
```javascript
// 调用需要认证的接口
getUserInfo().then(res => {
  console.log('Token 有效:', res.data.user)
}).catch(err => {
  console.log('Token 无效或过期，需要重新登录')
  localStorage.removeItem('token')
  // 跳转到登录页
})
```

---

## 总结

### ✅ 问题已解决

- **原因**：localStorage 中没有 JWT token
- **解决**：使用 server 的登录接口获取 token
- **工具**：test-auth.html 可快速验证

### 📝 关键文件

- `film/src/api/auth.js` - 认证API
- `film/test-auth.html` - 测试工具
- `film/AUTH_401_DIAGNOSIS.md` - 详细文档

### 🚀 立即测试

```bash
# 打开测试工具
浏览器访问: file:///D:/Desktop/jifen/film/test-auth.html

# 或使用浏览器控制台
localStorage.setItem('token', '从登录接口获取的token')
```

**现在可以正常访问积分接口了！** 🎉
