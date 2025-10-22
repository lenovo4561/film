# ✅ 用户 ID 参数问题 - 已修复

## 问题描述

**现象：**
- 签到后请求用户金币时传入的 `userId` 参数不正确
- 默认传入 `userId=1`，而不是实际用户的 ID（如 `userId=55`）

---

## 问题原因

### 1. 登录后没有保存 userId 到 localStorage

**后端行为：**
```javascript
// film_api/routes/index.js - 登录接口
if (result[0].password === pwd) {
  req.session.userId = result[0].user_id;  // ✅ 设置 session
  res.cookie('user_id', result[0].user_id); // ✅ 设置 cookie
  res.json({ success_code: 200 })           // ❌ 没有返回 userId
}
```

**前端行为：**
```javascript
// Login.vue - 登录成功处理
if (json.success_code === 200) {
  Toast({ message: '登录成功' });
  this.$router.go(-1);
  // ❌ 没有保存 userId 到 localStorage
}
```

### 2. API 函数使用了硬编码的默认值

**getUserCoins() - 之前的代码：**
```javascript
export function getUserCoins() {
  const userId = localStorage.getItem('userId') || '1'  // ❌ 默认值是 '1'

  return axios.get('/api/getUserCoins', {
    params: { userId },
    withCredentials: true
  })
}
```

**coinService 拦截器 - 之前的代码：**
```javascript
coinService.interceptors.request.use(config => {
  const userId = localStorage.getItem('userId') || '55'  // ❌ 默认值是 '55'

  if (config.method === 'get') {
    config.params = { ...config.params, userId }
  }
  // ...
})
```

---

## 解决方案

### ✅ 1. 登录成功后从 Cookie 读取 userId 并保存

**修改文件：`film/src/components/Login/Login.vue`**

#### 添加读取 Cookie 的工具方法

```javascript
methods: {
  // 从 cookie 中读取指定名称的值
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  },
  // ...
}
```

#### 密码登录 - 保存 userId

```javascript
let json = await pwdLogin(this.userName, this.password, this.captcha);
if (json.success_code === 200) {
  Toast({ message: '登录成功' });

  // ✅ 从 cookie 中读取 user_id 并保存到 localStorage
  setTimeout(() => {
    const userId = this.getCookie('user_id');
    if (userId) {
      localStorage.setItem('userId', userId);
      console.log('已保存 userId 到 localStorage:', userId);
    }
  }, 100);

  this.$router.go(-1);
}
```

#### 手机号登录 - 保存 userId

```javascript
let json = await phoneLogin(this.phone, this.phoneCode);
if (json.success_code === 200) {
  Toast({ message: '登录成功' });

  // ✅ 从 cookie 中读取 user_id 并保存到 localStorage
  setTimeout(() => {
    const userId = this.getCookie('user_id');
    if (userId) {
      localStorage.setItem('userId', userId);
      console.log('已保存 userId 到 localStorage:', userId);
    }
  }, 100);

  this.$router.go(-1);
}
```

**为什么使用 setTimeout？**
- Cookie 的设置可能有延迟
- 使用 100ms 延迟确保 cookie 已写入

---

### ✅ 2. 移除硬编码的默认值

**修改文件：`film/src/api/offerwall.js`**

#### getUserCoins() - 修改后

```javascript
export function getUserCoins() {
  // ✅ 从 localStorage 获取实际用户 ID，如果没有则从 cookie 读取
  let userId = localStorage.getItem('userId');

  if (!userId) {
    // 尝试从 cookie 中读取
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_id='));

    if (cookieValue) {
      userId = cookieValue.split('=')[1];
      // 保存到 localStorage 以便下次使用
      localStorage.setItem('userId', userId);
    }
  }

  // ✅ 如果还是没有，使用空参数，让后端完全依赖 session/cookie
  const params = userId ? { userId } : {};

  return axios.get('/api/getUserCoins', {
    params,
    withCredentials: true
  })
}
```

**修改文件：`film/src/api/points.js`**

#### coinService 拦截器 - 修改后

```javascript
coinService.interceptors.request.use(config => {
  config.withCredentials = true

  // ✅ 从 localStorage 获取，如果没有则从 cookie 读取
  let userId = localStorage.getItem('userId');

  if (!userId) {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_id='));

    if (cookieValue) {
      userId = cookieValue.split('=')[1];
      localStorage.setItem('userId', userId);
    }
  }

  // ✅ 只有存在 userId 才添加到参数
  if (userId) {
    if (config.method === 'get') {
      config.params = { ...config.params, userId }
    } else if (config.method === 'post') {
      config.data = { ...config.data, userId }
    }
    console.log('[金币系统] 请求携带 cookies + userId:', config.url, '| userId:', userId)
  } else {
    console.log('[金币系统] 请求仅携带 cookies:', config.url)
  }

  return config
})
```

---

## 验证流程

### 数据流向

```
1. 用户登录
   ↓
2. 后端设置 Cookie
   res.cookie('user_id', 55)
   ↓
3. 前端读取 Cookie
   getCookie('user_id') → '55'
   ↓
4. 保存到 localStorage
   localStorage.setItem('userId', '55')
   ↓
5. 后续请求使用实际 userId
   GET /api/getUserCoins?userId=55
```

### 多重保障机制

```javascript
// 优先级顺序：
1. localStorage.getItem('userId')     // 最快
   ↓ 如果没有
2. document.cookie 中读取 'user_id'  // 备用
   ↓ 如果没有
3. 不传 userId，后端从 session 读取  // 兜底
```

---

## 测试步骤

### 1️⃣ 清空现有数据

```javascript
// 浏览器 Console
localStorage.clear()
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
});
```

### 2️⃣ 重新登录

1. 打开登录页面
2. 输入用户名：`admin`
3. 输入密码：`123456`
4. 点击登录

### 3️⃣ 检查 localStorage

```javascript
// 浏览器 Console
console.log('UserId:', localStorage.getItem('userId'))
// 应该输出: UserId: 55
```

### 4️⃣ 检查请求参数

打开 Network 面板，查看请求：

```
✅ GET /api/getUserCoins?userId=55
✅ GET /api/checkTodayCheckin?userId=55
✅ POST /api/userCheckin
   Request Payload: { userId: "55" }
```

### 5️⃣ 测试签到功能

1. 点击签到按钮
2. 查看 Network 请求
3. 确认 `userId` 参数正确

---

## 后端验证逻辑

后端 `getCurrentUserId()` 函数的验证顺序：

```javascript
function getCurrentUserId(req) {
  let serverUserId = null;
  let clientUserId = null;

  // 1. 从 session 获取（最高优先级）
  if (req.session.userId) {
    serverUserId = normalizeUserId(req.session.userId);
  }

  // 2. 从 cookie 获取
  else if (req.cookies.user_id) {
    serverUserId = normalizeUserId(req.cookies.user_id);
  }

  // 3. 获取前端传入的 userId
  clientUserId = normalizeUserId(req.body.userId || req.query.userId);

  // 4. 验证一致性
  if (serverUserId) {
    if (clientUserId && clientUserId !== serverUserId) {
      console.warn('⚠️ userId 不一致：前端=', clientUserId, '服务端=', serverUserId);
    }
    return serverUserId;  // 使用服务端的
  }

  // 5. 兜底使用前端的
  return clientUserId;
}
```

---

## 常见问题

### Q1: 登录后 localStorage 中仍然没有 userId？

**A:** 检查以下几点：

1. **Cookie 是否设置成功？**
   ```javascript
   // 浏览器 Console
   console.log(document.cookie)
   // 应该包含: user_id=55
   ```

2. **getCookie 方法是否正确？**
   ```javascript
   // 手动测试
   const getCookie = (name) => {
     const value = `; ${document.cookie}`;
     const parts = value.split(`; ${name}=`);
     if (parts.length === 2) {
       return parts.pop().split(';').shift();
     }
     return null;
   };
   console.log(getCookie('user_id'));
   ```

3. **setTimeout 延迟是否足够？**
   - 如果网络慢，可以增加延迟到 200ms

### Q2: 请求仍然传入 userId=1 或 userId=55？

**A:**
- 清除浏览器缓存，强制刷新（Ctrl+Shift+R）
- 检查是否修改了正确的文件
- 重启前端开发服务器

### Q3: 后端日志显示 userId 不一致？

**A:**
这是正常的警告，说明前端和服务端的 userId 都传入了，后端会优先使用服务端的值。

### Q4: 如果不登录，直接访问页面会怎样？

**A:**
```javascript
// localStorage 没有 userId
// Cookie 也没有 user_id
// 请求会变成：GET /api/getUserCoins （不带 userId 参数）
// 后端会尝试从 session 读取，如果也没有，返回 null
```

---

## 总结

### ✅ 修改内容

1. **Login.vue**
   - 添加 `getCookie()` 方法
   - 登录成功后从 cookie 读取 `user_id` 并保存到 localStorage

2. **offerwall.js**
   - `getUserCoins()` 移除硬编码默认值 `'1'`
   - 优先从 localStorage 读取，其次从 cookie 读取

3. **points.js**
   - `coinService` 拦截器移除硬编码默认值 `'55'`
   - 优先从 localStorage 读取，其次从 cookie 读取

### 🎯 效果

- ✅ 登录后自动保存实际用户 ID
- ✅ 签到请求携带正确的 userId 参数
- ✅ 刷新页面后仍然使用正确的 userId
- ✅ 多重保障机制（localStorage → Cookie → Session）

**现在签到后请求的用户金币会传入正确的 userId 参数了！** 🎉
