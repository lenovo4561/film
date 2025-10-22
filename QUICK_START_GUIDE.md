# 快速启动指南 - 积分墙端口分离配置

## ✅ 配置完成

### 已完成的修改

1. **代理配置** (`film/config/index.js`)
   - ✅ 积分墙接口 `/api/offerwall/*` → 代理到 3000 端口
   - ✅ 电影项目接口 `/` → 代理到 4000 端口

2. **API配置** (`film/src/api/offerwall.js`)
   - ✅ baseURL 改为相对路径 `/api/offerwall`
   - ✅ 自动通过代理转发到 3000 端口

## 🚀 启动步骤

### 步骤1: 启动Server服务（3000端口）

```bash
cd server
npm run dev
```

**预期输出**:
```
Server is running on http://localhost:3000
数据库连接成功
```

### 步骤2: 启动Film前端（8080端口）

```bash
cd film
npm run dev
```

**预期输出**:
```
Your application is running here: http://localhost:8080
```

**⚠️ 注意**: 由于修改了配置文件，如果Film服务已经在运行，请重启！

## 📡 端口分配图

```
┌─────────────────────────────────────────────┐
│         Film前端 (8080端口)                  │
└─────────────────┬───────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    ┌────▼─────┐     ┌────▼─────┐
    │ 积分墙请求 │     │ 电影请求   │
    │/api/     │     │  /其他     │
    │offerwall │     │   路径     │
    └────┬─────┘     └────┬─────┘
         │                │
         │                │
    ┌────▼─────┐     ┌────▼─────┐
    │  Server  │     │  电影服务  │
    │  3000端口 │     │  4000端口 │
    └──────────┘     └──────────┘
```

## 🔍 测试验证

### 测试1: 访问积分墙页面
1. 打开浏览器: `http://localhost:8080/#/offerwall`
2. 打开开发者工具 (F12)
3. 查看 Network 面板
4. 应该看到请求发送到: `/api/offerwall/tasks`

### 测试2: 检查请求参数
在 Network 面板中，点击请求查看：
- **Request URL**: `http://localhost:8080/api/offerwall/tasks`
- **Query Parameters** 应该包含:
  - `channel`: CS001
  - `time`: 时间戳
  - `userId`: 用户ID
  - `sign`: MD5签名

### 测试3: 验证代理转发
在浏览器控制台 (Console) 中，应该看到：
```
请求参数（含签名）: {channel, time, userId, sign, ...}
任务列表: {code: 200, data: [...], message: "..."}
```

## 📝 请求示例

### 积分墙接口请求流程

```
1. 前端代码:
   getOfferwallTasks()

2. Axios发起请求:
   GET /api/offerwall/tasks

3. 添加签名（自动）:
   GET /api/offerwall/tasks?channel=CS001&time=xxx&userId=1&sign=xxx

4. webpack代理转发:
   → http://localhost:3000/api/offerwall/tasks?...

5. Server处理:
   → 签名验证 → 路由处理 → 返回数据

6. 前端接收数据:
   taskList = res.data
```

## ⚙️ 关键配置

### webpack代理配置
```javascript
// film/config/index.js
proxyTable: {
  '/api/offerwall': {  // 必须在前面！
    target: 'http://localhost:3000',
    changeOrigin: true
  },
  '/': {  // 默认规则在后面
    target: 'http://localhost:4000',
    changeOrigin: true
  }
}
```

### axios配置
```javascript
// film/src/api/offerwall.js
const service = axios.create({
  baseURL: '/api/offerwall',  // 相对路径，走代理
  timeout: 10000
})
```

## 🎯 优势对比

### 修改前
```
Film前端 (8080)
    ↓
所有请求 → 4000端口
    ↓
电影服务和积分墙混在一起
```

### 修改后
```
Film前端 (8080)
    ↓
分流：
├─ /api/offerwall/* → 3000端口（积分墙专用）
└─ /其他路径        → 4000端口（电影项目）
```

**好处**:
- ✅ 端口隔离，互不干扰
- ✅ 便于独立开发和调试
- ✅ 可以独立部署和扩展
- ✅ 代码结构更清晰

## ❓ 常见问题

### Q1: 修改配置后前端报404
**A**: 需要重启Film前端服务（npm run dev）

### Q2: 签名验证失败
**A**: 检查Server服务是否在3000端口运行

### Q3: 电影接口无法访问
**A**: 确认4000端口的电影服务是否正常运行

### Q4: 如何确认代理是否生效？
**A**:
1. 打开浏览器开发者工具
2. 查看Network面板的请求URL
3. 积分墙请求应该是 `/api/offerwall/tasks`
4. 不应该看到 `http://localhost:3000` 或 `http://localhost:4000`

## 📋 检查清单

启动前请确认：
- [ ] Server服务在3000端口运行
- [ ] Film前端已重启（如果之前在运行）
- [ ] 浏览器缓存已清空（Ctrl+Shift+Delete）
- [ ] 打开开发者工具准备查看请求

## 🎉 下一步

配置完成后，你可以：
1. 访问积分墙页面查看任务列表
2. 实现场景任务关联功能
3. 完善用户任务记录功能
4. 添加任务完成验证逻辑

需要帮助实现场景任务关联功能吗？

---

**配置完成时间**: 2025年10月19日
**修改文件**:
- `film/config/index.js`
- `film/src/api/offerwall.js`
