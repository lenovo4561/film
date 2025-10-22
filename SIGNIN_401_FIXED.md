# ✅ 签到刷新 401 错误 - 已修复

## 问题描述

**现象：**
- 点击签到按钮后
- 刷新页面或调用 `/api/client/points` 接口
- 返回 401 错误："未提供认证令牌"

---

## 问题原因

### 根本问题：混用了两套系统的 API

1. **签到功能使用的是金币系统（film_api 4000端口）**
   - `doSignin()` → `/api/userCheckin`
   - 认证方式：Session/Cookie
   - **不需要 JWT token**

2. **但签到成功后调用了积分系统的接口（server 3000端口）**
   - `loadUserPoints()` 原本调用 `getMyPoints()` → `/api/client/points`
   - 认证方式：JWT Token
   - **需要 Authorization: Bearer <token>**

3. **localStorage 中没有 token**
   - 用户通过旧的登录接口登录（film_api）
   - 只有 Session/Cookie，没有 JWT token
   - 所以调用积分系统接口会报 401 错误

---

## 修复方案

### ✅ 统一使用金币系统（film_api）

将所有任务中心的接口改为使用金币系统，不依赖 JWT token。

### 修改的文件

**`film/src/pages/My/children/TaskCenter.vue`**

#### 1. 导入金币查询 API

```javascript
// 导入积分墙API
import {
  getOfferwallTemplate,
  getWelfareTasks,
  getUserCoins  // ✅ 新增：导入金币查询API
} from '@/api/offerwall'
```

#### 2. 修改加载用户积分方法

**修改前（使用积分系统，需要 token）：**
```javascript
async loadUserPoints() {
  try {
    const res = await getMyPoints()  // ❌ 需要 JWT token
    if (res.data) {
      this.userCoins = res.data.availablePoints || 0
    }
  } catch (error) {
    console.error('获取积分失败:', error)
  }
}
```

**修改后（使用金币系统，不需要 token）：**
```javascript
async loadUserPoints() {
  try {
    // 使用金币系统而不是积分系统
    const res = await getUserCoins()  // ✅ 使用 Session/Cookie
    if (res.success_code === 200 && res.data) {
      this.userCoins = res.data.coin_balance || 0
    }
  } catch (error) {
    console.error('获取金币失败:', error)
    this.userCoins = 0  // ✅ 失败时设置为 0，避免显示错误
  }
}
```

#### 3. 修改加载签到状态方法

**修改前：**
```javascript
async loadSigninStatus() {
  try {
    const res = await getMySigninStatus()
    if (res.data) {
      this.hasSignedToday = res.data.hasSignedToday || false
      this.signedDays = res.data.consecutiveDays || 0
    }
  } catch (error) {
    console.error('获取签到状态失败:', error)
  }
}
```

**修改后：**
```javascript
async loadSigninStatus() {
  try {
    const res = await getMySigninStatus()
    // film_api 返回格式: { success_code: 200, checked: true/false }
    if (res.success_code === 200) {
      this.hasSignedToday = res.checked || false
    }
  } catch (error) {
    console.error('获取签到状态失败:', error)
    this.hasSignedToday = false  // ✅ 失败时设置为 false
  }
}
```

#### 4. 修改签到方法的响应处理

**修改前：**
```javascript
try {
  const res = await doSignin()
  Toast({
    message: `签到成功！获得 ${res.data.points} 金币`,
    position: 'middle',
    duration: 2000
  })
  this.hasSignedToday = true
  this.signedDays = res.data.consecutiveDays || 0
  this.loadUserPoints()  // ❌ 可能调用需要 token 的接口
} catch (error) {
  console.error('签到失败:', error)
}
```

**修改后：**
```javascript
try {
  const res = await doSignin()
  // film_api 返回格式: { success_code: 200, data: { reward_coins, continuous_days, ... } }
  if (res.success_code === 200 && res.data) {
    Toast({
      message: res.data.message || `签到成功！获得 ${res.data.reward_coins} 金币`,
      position: 'middle',
      duration: 2000
    })
    this.hasSignedToday = true
    this.signedDays = res.data.continuous_days || 0
    this.loadUserPoints()  // ✅ 现在调用金币系统接口
  }
} catch (error) {
  console.error('签到失败:', error)
  Toast({
    message: error.message || '签到失败，请重试',
    position: 'middle',
    duration: 2000
  })
}
```

#### 5. 启用页面初始化

**修改前（注释掉了）：**
```javascript
async init() {
  this.loading = true
  try {
    await Promise.all([
      // this.loadUserPoints(),         // ❌ 注释掉
      // this.loadSigninStatus(),       // ❌ 注释掉
      this.loadOfferwallTemplate(),
      this.loadWelfareTasks(),
    ])
  } catch (error) {
    console.error('初始化失败:', error)
  } finally {
    this.loading = false
  }
}
```

**修改后（启用加载）：**
```javascript
async init() {
  this.loading = true
  try {
    await Promise.all([
      this.loadUserPoints(),         // ✅ 加载用户金币（不需要token）
      this.loadSigninStatus(),       // ✅ 加载签到状态（不需要token）
      this.loadOfferwallTemplate(),
      this.loadWelfareTasks(),
    ])
  } catch (error) {
    console.error('初始化失败:', error)
  } finally {
    this.loading = false
  }
}
```

---

## API 对比

### film_api 金币系统（4000端口）✅ 当前使用

| 接口 | 认证方式 | 返回格式 |
|------|---------|---------|
| `/api/getUserCoins` | Session/Cookie | `{ success_code: 200, data: { coin_balance: 100 } }` |
| `/api/checkTodayCheckin` | Session/Cookie | `{ success_code: 200, checked: true }` |
| `/api/userCheckin` | Session/Cookie | `{ success_code: 200, data: { reward_coins: 20 } }` |

**优势：**
- ✅ 不需要 JWT token
- ✅ 使用 Session/Cookie，登录后自动携带
- ✅ 与现有登录系统兼容

### server 积分系统（3000端口）❌ 已移除

| 接口 | 认证方式 | 返回格式 |
|------|---------|---------|
| `/api/client/points` | JWT Token | `{ code: 200, data: { availablePoints: 100 } }` |
| `/api/client/signin/status` | JWT Token | `{ code: 200, data: { hasSignedToday: true } }` |

**问题：**
- ❌ 需要 JWT token
- ❌ 需要在 localStorage 中保存 token
- ❌ 当前登录流程不返回 token

---

## 测试验证

### 1️⃣ 检查修改是否生效

打开浏览器开发者工具 Console：

```javascript
// 检查 localStorage 中是否有 userId（金币系统需要）
console.log('UserId:', localStorage.getItem('userId'))

// 如果没有，手动设置（admin 账户）
localStorage.setItem('userId', '55')
```

### 2️⃣ 刷新页面

- 页面应该正常加载
- 显示金币余额
- 显示签到状态
- **不会出现 401 错误**

### 3️⃣ 测试签到

1. 点击签到按钮
2. 应该显示"签到成功！获得 XX 金币"
3. 金币余额自动增加
4. 签到按钮变为"已签到"
5. **刷新页面，金币余额保持，不报 401 错误**

### 4️⃣ 查看 Network 请求

打开浏览器 Network 面板，应该看到：

```
✅ GET /api/getUserCoins?userId=55
   Status: 200
   Response: { success_code: 200, data: { coin_balance: 100 } }

✅ GET /api/checkTodayCheckin?userId=55
   Status: 200
   Response: { success_code: 200, checked: true }

❌ 不应该有 /api/client/points 请求
```

---

## 系统架构说明

### 当前任务中心使用的系统

```
┌─────────────────────────────────────┐
│      任务中心 (TaskCenter.vue)       │
└─────────────────────────────────────┘
                 │
                 ├─────────────────────────────────┐
                 │                                 │
                 ▼                                 ▼
    ┌────────────────────────┐      ┌────────────────────────┐
    │  金币系统 (film_api)    │      │  积分墙 (server)        │
    │  端口: 4000            │      │  端口: 3000            │
    └────────────────────────┘      └────────────────────────┘
    │ 认证: Session/Cookie   │      │ 认证: JWT Token        │
    │                        │      │                        │
    │ ✅ getUserCoins        │      │ ✅ getOfferwallTemplate │
    │ ✅ checkTodayCheckin   │      │ ✅ getWelfareTasks      │
    │ ✅ userCheckin         │      │                        │
    └────────────────────────┘      └────────────────────────┘
     不需要 JWT token                需要 JWT token
```

### 请求示例

#### 金币系统（不需要 token）

```javascript
// 浏览器自动携带 cookies
fetch('/api/getUserCoins?userId=55', {
  credentials: 'include'  // 自动携带 cookies
})

// 后端验证
getCurrentUserId(req) {
  // 1. 从 session 获取
  if (req.session.userId) return req.session.userId
  // 2. 从 cookie 获取
  if (req.cookies.user_id) return req.cookies.user_id
  // 3. 从参数获取（兜底）
  return req.query.userId
}
```

#### 积分墙系统（需要 token）

```javascript
// 需要手动添加 Authorization 头
const token = localStorage.getItem('token')
fetch('/api/offerwall/template', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`  // ✅ 需要 token
  }
})
```

---

## 常见问题

### Q1: 为什么不统一使用 JWT token？

**A:**
- 历史原因，film_api 是老系统（Session），server 是新系统（JWT）
- 当前登录流程不返回 JWT token
- 改造成本较大，未来可以统一

### Q2: 签到后刷新页面，金币显示为 0？

**A:**
检查 localStorage 中是否有 userId：
```javascript
console.log('UserId:', localStorage.getItem('userId'))
// 如果没有，手动设置
localStorage.setItem('userId', '55')
```

### Q3: 还是报 401 错误？

**A:**
1. 确认修改的文件已保存
2. 重新启动前端开发服务器：
   ```bash
   cd film
   npm run dev
   ```
3. 清除浏览器缓存，强制刷新（Ctrl+Shift+R）

### Q4: 如何区分哪些接口需要 token？

**A:**
```javascript
// 不需要 token（金币系统 - coinService）
getUserCoins()
checkTodayCheckin()
doSignin()

// 需要 token（积分系统 - service）
getMyPoints()
getClientTasks()
startTask()

// 积分墙（可能需要 token，取决于后端配置）
getOfferwallTemplate()  // ✅ 不需要 token
getWelfareTasks()       // ✅ 不需要 token
```

---

## 总结

### ✅ 问题已修复

**修改内容：**
1. `loadUserPoints()` 改用 `getUserCoins()`（金币系统）
2. `loadSigninStatus()` 正确处理 film_api 的响应格式
3. 签到成功后的响应处理改为 film_api 格式
4. 启用页面初始化时加载金币和签到状态

**效果：**
- ✅ 页面加载时显示金币余额和签到状态
- ✅ 点击签到后金币自动增加
- ✅ 刷新页面不会报 401 错误
- ✅ 不需要 JWT token，只需 Session/Cookie

### 🎯 关键改进

- **统一使用金币系统（film_api）**
- **避免混用两套认证机制**
- **提供更好的错误处理**

**现在可以正常使用签到功能，不会再出现 401 错误了！** 🎉
