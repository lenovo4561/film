# 🔍 getUserCoins 获取不到金币 - 诊断指南

## 问题现象

**前端调用：**
```javascript
const res = await getUserCoins()
```

**结果：** 没有获取到用户的金币数据

---

## 数据库状态 ✅

```
✅ 数据库中有金币记录
   - user_id: 55
   - coin_balance: 120
   - total_earned: 120
   - continuous_days: 1
```

**说明：** 后端数据正常，问题在于前端请求或数据传递

---

## 诊断步骤

### 1️⃣ 打开浏览器开发者工具

**按 F12 打开开发者工具**

### 2️⃣ 查看 Console 日志

刷新页面后，应该看到详细的调试日志：

```javascript
[getUserCoins] 开始获取用户金币...
[getUserCoins] localStorage userId: 55
[getUserCoins] 请求参数: { userId: "55" }
[getUserCoins] 发送请求: GET /api/getUserCoins
[getUserCoins] 响应数据: { success_code: 200, data: {...} }

[TaskCenter] 开始加载用户金币...
[TaskCenter] getUserCoins 响应: { success_code: 200, data: {...} }
[TaskCenter] success_code: 200
[TaskCenter] data: { coin_balance: 120, ... }
[TaskCenter] ✅ 金币加载成功，余额: 120
```

### 3️⃣ 根据日志诊断问题

#### 情况1：localStorage 中没有 userId

```
[getUserCoins] localStorage userId: null
[getUserCoins] localStorage 中无 userId，尝试从 cookie 读取...
[getUserCoins] document.cookie: (空或没有 user_id)
[getUserCoins] ⚠️ cookie 中也没有 user_id
```

**解决方案：**
```javascript
// 在 Console 中执行
localStorage.setItem('userId', '55')

// 然后刷新页面
location.reload()
```

#### 情况2：请求失败（401/500 错误）

```
[getUserCoins] 请求失败: Error: Request failed with status code 401
[getUserCoins] 错误响应: { error_code: 1, message: "用户未登录或登录已过期" }
```

**解决方案：**
- 重新登录
- 或手动设置 cookie：需要服务端设置，无法前端手动设置

#### 情况3：响应格式不正确

```
[TaskCenter] getUserCoins 响应: undefined
// 或
[TaskCenter] success_code: undefined
```

**可能原因：**
- `axios.get()` 返回的是 `res` 而不是 `res.data`
- 响应拦截器处理不当

**解决方案：**
检查 `offerwall.js` 的返回值是否正确

#### 情况4：data 为 null 或 undefined

```
[TaskCenter] success_code: 200
[TaskCenter] data: undefined
```

**可能原因：**
- 后端查询失败
- 数据库中没有该用户的记录

**解决方案：**
查看后端日志，确认 SQL 查询结果

---

## 快速修复方案

### 方案1：设置 localStorage

```javascript
// 浏览器 Console
localStorage.setItem('userId', '55')
location.reload()
```

### 方案2：重新登录

1. 退出当前登录
2. 重新登录（确保登录逻辑保存 userId 到 localStorage）
3. 检查 Console 日志

### 方案3：手动调用 API 测试

```javascript
// 浏览器 Console

// 1. 导入函数（如果未导入）
// 或直接在页面刷新后测试

// 2. 手动调用
getUserCoins().then(res => {
  console.log('✅ 响应数据:', res)
  if (res.data) {
    console.log('✅ 金币余额:', res.data.coin_balance)
  } else {
    console.error('❌ 没有 data 字段')
  }
}).catch(err => {
  console.error('❌ 请求失败:', err)
})

// 3. 查看详细信息
console.log('localStorage userId:', localStorage.getItem('userId'))
console.log('document.cookie:', document.cookie)
```

---

## Network 面板检查

### 1. 找到 getUserCoins 请求

打开 Network 面板 → 刷新页面 → 找到 `getUserCoins` 请求

### 2. 检查请求信息

#### Request URL
```
✅ 正确: http://localhost:4000/api/getUserCoins?userId=55
❌ 错误: http://localhost:4000/api/getUserCoins (没有 userId)
```

#### Request Headers
```
Cookie: user_id=55; connect.sid=...
```

**如果没有 Cookie：** 需要重新登录

#### Query String Parameters
```
userId: 55
```

**如果是空或错误的值：** 检查 localStorage

### 3. 检查响应信息

#### Response Headers
```
Content-Type: application/json
```

#### Response Body
```json
{
  "success_code": 200,
  "data": {
    "coin_id": 19,
    "user_id": 55,
    "coin_balance": 120,
    "total_earned": 120,
    "continuous_days": 1,
    "last_checkin_date": "2025-10-19T16:00:00.000Z",
    "created_at": "2025-10-20T15:39:06.000Z",
    "updated_at": "2025-10-20T15:55:54.000Z"
  }
}
```

**如果响应是错误：**
```json
{
  "error_code": 1,
  "message": "用户未登录或登录已过期"
}
```

**解决：** 重新登录

---

## 代码检查清单

### ✅ 前端代码

#### offerwall.js - getUserCoins()

```javascript
export function getUserCoins() {
  let userId = localStorage.getItem('userId');

  // ✅ 必须返回 res.data，不是 res
  return axios.get('/api/getUserCoins', {
    params: userId ? { userId } : {},
    withCredentials: true
  }).then(res => res.data)  // ✅ 返回 res.data
}
```

#### TaskCenter.vue - loadUserPoints()

```javascript
async loadUserPoints() {
  const res = await getUserCoins()

  // ✅ 检查格式
  if (res.success_code === 200 && res.data) {
    this.userCoins = res.data.coin_balance || 0
  }
}
```

### ✅ 后端代码

#### routes/index.js - /api/getUserCoins

```javascript
router.get('/api/getUserCoins', function(req, res) {
  let userId = getCurrentUserId(req);

  if (!userId) {
    res.json({ error_code: 1, message: '用户未登录或登录已过期' });
    return;
  }

  let sqlStr = 'SELECT * FROM t_user_coins WHERE user_id = ? LIMIT 1;';
  conn.query(sqlStr, [userId], (error, result, field) => {
    if (error) {
      res.json({ error_code: 1, message: '获取金币信息失败' });
    } else {
      result = JSON.parse(JSON.stringify(result));
      if (result[0]) {
        res.json({ success_code: 200, data: result[0] });  // ✅ 返回格式
      } else {
        // 如果没有记录，创建一条
        // ...
      }
    }
  });
});
```

---

## 常见问题

### Q1: Console 中看不到日志？

**A:**
- 确保代码已保存
- 重启前端开发服务器：`npm run dev`
- 清除浏览器缓存，强制刷新（Ctrl+Shift+R）

### Q2: Network 面板中没有 getUserCoins 请求？

**A:**
- 检查 `init()` 方法中是否启用了 `loadUserPoints()`
- 查看 Console 是否有 JavaScript 错误阻止执行

### Q3: 响应数据正确但页面不显示？

**A:**
- 检查 `this.userCoins` 是否正确赋值
- 检查模板中绑定的变量名是否正确
- 检查 Vue 的响应式更新

### Q4: 后端返回 "用户未登录" 但明明登录了？

**A:**
- Session 可能过期
- Cookie 被清除
- 跨域问题导致 Cookie 没有发送

**解决：**
```javascript
// 检查 axios 配置
axios.get('/api/getUserCoins', {
  withCredentials: true  // ✅ 必须设置
})
```

---

## 测试脚本

### 完整测试流程

```javascript
// 浏览器 Console

console.log('========== getUserCoins 完整测试 ==========')

// 1. 检查环境
console.log('\n【步骤1】检查环境')
console.log('localStorage userId:', localStorage.getItem('userId'))
console.log('document.cookie:', document.cookie)

// 2. 设置 userId（如果没有）
if (!localStorage.getItem('userId')) {
  console.log('\n设置 userId...')
  localStorage.setItem('userId', '55')
}

// 3. 调用 API
console.log('\n【步骤2】调用 getUserCoins()')
getUserCoins()
  .then(res => {
    console.log('\n【步骤3】响应结果')
    console.log('完整响应:', res)
    console.log('success_code:', res.success_code)
    console.log('data:', res.data)

    if (res.success_code === 200 && res.data) {
      console.log('\n✅ 成功获取金币')
      console.log('金币余额:', res.data.coin_balance)
      console.log('累计获得:', res.data.total_earned)
      console.log('连续天数:', res.data.continuous_days)
    } else {
      console.error('\n❌ 响应格式不正确')
    }
  })
  .catch(err => {
    console.error('\n❌ 请求失败')
    console.error('错误信息:', err.message)
    console.error('错误响应:', err.response?.data)
  })

console.log('\n========== 测试完成，查看上方输出 ==========')
```

---

## 总结

### 最可能的原因

1. **localStorage 中没有 userId** ⭐⭐⭐⭐⭐
2. Cookie 中没有 user_id ⭐⭐⭐
3. Session 已过期 ⭐⭐
4. 网络请求失败 ⭐
5. 响应数据格式错误 ⭐

### 最快的解决方案

```javascript
// 浏览器 Console 执行
localStorage.setItem('userId', '55')
location.reload()
```

---

**现在刷新页面，打开 Console 查看详细日志！** 🔍
