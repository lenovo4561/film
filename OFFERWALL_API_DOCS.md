# 积分墙API接口文档

## 📋 概述

本文档描述了积分墙和福利中心的客户端API接口，所有接口都需要签名验证。

### 基本信息

- **Base URL**: `/api/offerwall`
- **代理端口**: 3000 (通过Film前端8080代理访问)
- **签名算法**: MD5
- **签名密钥**: `804c73bec6c891128b7059b22da5f2a9faf4b93e056ff33db26fd527161d2512`
- **Channel**: `CS001`

---

## 🔐 签名验证

### 签名规则

所有接口请求必须包含以下参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| channel | string | 是 | 产品标识，固定为 CS001 |
| time | number | 是 | 时间戳（毫秒），用于防重放攻击 |
| userId | string | 是 | 用户ID |
| sign | string | 是 | MD5签名 |

### 签名生成步骤

1. **参数字典序排序**（排除sign字段）
   ```
   channel=CS001&time=1697700000000&userId=1
   ```

2. **拼接密钥**
   ```
   channel=CS001&time=1697700000000&userId=1804c73bec6c891128b7059b22da5f2a9faf4b93e056ff33db26fd527161d2512
   ```

3. **MD5加密**
   ```
   sign = MD5(拼接后的字符串)
   ```

### 时间戳验证

- 请求时间戳与服务器时间差不能超过 **5分钟**
- 超时请求会返回 `请求已过期` 错误

### 签名验证流程

```
客户端请求
    ↓
1. 添加 channel, time, userId
    ↓
2. 按字典序排序参数
    ↓
3. 拼接密钥生成签名
    ↓
4. 添加 sign 参数
    ↓
发送请求
    ↓
服务端签名验证
    ↓
验证通过 → 执行业务逻辑
验证失败 → 返回 403 错误
```

---

## 📡 接口列表

### 1. 获取积分墙模版数据

获取积分墙的基础配置信息，包括场景列表、任务类型等。

**接口地址**
```
GET /api/offerwall/template
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| channel | string | 是 | 产品标识 |
| time | number | 是 | 时间戳 |
| userId | string | 是 | 用户ID |
| sign | string | 是 | 签名 |

**请求示例**
```bash
GET /api/offerwall/template?channel=CS001&time=1697700000000&userId=1&sign=xxxxx
```

**响应示例**
```json
{
  "code": 200,
  "message": "获取模版数据成功",
  "data": {
    "channel": "CS001",
    "config": {
      "title": "积分墙",
      "subtitle": "完成任务赚取积分",
      "banners": []
    },
    "scenes": [
      {
        "id": 1,
        "name": "新手专区",
        "icon": "/uploads/scenes/newbie.png",
        "description": "新手专属任务",
        "sort": 1
      }
    ],
    "taskTypes": [
      {
        "id": 1,
        "name": "注册任务",
        "icon": "/uploads/task-types/register.png",
        "description": "注册账号即可获得积分"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| config | object | 积分墙配置 |
| config.title | string | 标题 |
| config.subtitle | string | 副标题 |
| config.banners | array | Banner列表 |
| scenes | array | 场景列表 |
| scenes[].id | number | 场景ID |
| scenes[].name | string | 场景名称 |
| scenes[].icon | string | 场景图标 |
| scenes[].description | string | 场景描述 |
| taskTypes | array | 任务类型列表 |

---

### 2. 获取福利中心任务列表

获取所有可用的福利任务，支持分页。

**接口地址**
```
GET /api/offerwall/welfare/tasks
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| channel | string | 是 | 产品标识 |
| time | number | 是 | 时间戳 |
| userId | string | 是 | 用户ID |
| sign | string | 是 | 签名 |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20 |

**请求示例**
```bash
GET /api/offerwall/welfare/tasks?channel=CS001&time=1697700000000&userId=1&sign=xxxxx&page=1&limit=10
```

**响应示例**
```json
{
  "code": 200,
  "message": "获取福利任务列表成功",
  "data": {
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5,
    "data": [
      {
        "id": 1,
        "title": "注册送100积分",
        "description": "完成注册即可获得100积分",
        "icon": "/uploads/tasks/register.png",
        "rewardPoints": 100,
        "targetCount": 1,
        "taskTypeId": 1,
        "priority": 100,
        "sort": 1,
        "status": 1,
        "taskType": {
          "id": 1,
          "name": "注册任务",
          "icon": "/uploads/task-types/register.png"
        },
        "isCompleted": false,
        "userProgress": 0
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| total | number | 总任务数 |
| page | number | 当前页码 |
| pageSize | number | 每页数量 |
| totalPages | number | 总页数 |
| data | array | 任务列表 |
| data[].id | number | 任务ID |
| data[].title | string | 任务标题 |
| data[].description | string | 任务描述 |
| data[].rewardPoints | number | 奖励积分 |
| data[].targetCount | number | 目标次数 |
| data[].taskType | object | 任务类型信息 |
| data[].isCompleted | boolean | 是否已完成 |
| data[].userProgress | number | 用户进度 |

---

### 3. 获取积分墙任务列表

获取积分墙任务列表，支持场景和任务类型筛选。

**接口地址**
```
GET /api/offerwall/tasks
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| channel | string | 是 | 产品标识 |
| time | number | 是 | 时间戳 |
| userId | string | 是 | 用户ID |
| sign | string | 是 | 签名 |
| sceneId | number | 否 | 场景ID，筛选特定场景的任务 |
| taskTypeId | number | 否 | 任务类型ID，筛选特定类型的任务 |

**请求示例**
```bash
# 获取所有任务
GET /api/offerwall/tasks?channel=CS001&time=1697700000000&userId=1&sign=xxxxx

# 获取特定场景的任务
GET /api/offerwall/tasks?channel=CS001&time=1697700000000&userId=1&sign=xxxxx&sceneId=1

# 获取特定类型的任务
GET /api/offerwall/tasks?channel=CS001&time=1697700000000&userId=1&sign=xxxxx&taskTypeId=1
```

**响应示例**
```json
{
  "code": 200,
  "message": "获取任务列表成功",
  "data": [
    {
      "id": 1,
      "title": "注册送100积分",
      "description": "完成注册即可获得100积分",
      "icon": "/uploads/tasks/register.png",
      "rewardPoints": 100,
      "targetCount": 1,
      "taskTypeId": 1,
      "priority": 100,
      "taskType": {
        "id": 1,
        "name": "注册任务"
      },
      "userStatus": null,
      "userProgress": 0,
      "isCompleted": false
    }
  ]
}
```

---

### 4. 获取任务详情

获取单个任务的详细信息。

**接口地址**
```
GET /api/offerwall/tasks/:id
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 任务ID（路径参数） |
| channel | string | 是 | 产品标识 |
| time | number | 是 | 时间戳 |
| userId | string | 是 | 用户ID |
| sign | string | 是 | 签名 |

**请求示例**
```bash
GET /api/offerwall/tasks/1?channel=CS001&time=1697700000000&userId=1&sign=xxxxx
```

**响应示例**
```json
{
  "code": 200,
  "message": "获取任务详情成功",
  "data": {
    "id": 1,
    "title": "注册送100积分",
    "description": "完成注册即可获得100积分",
    "icon": "/uploads/tasks/register.png",
    "rewardPoints": 100,
    "targetCount": 1,
    "taskType": {
      "id": 1,
      "name": "注册任务"
    },
    "userStatus": null,
    "userProgress": 0,
    "isCompleted": false
  }
}
```

---

### 5. 开始任务

用户开始执行任务。

**接口地址**
```
POST /api/offerwall/tasks/:id/start
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 任务ID（路径参数） |
| channel | string | 是 | 产品标识 |
| time | number | 是 | 时间戳 |
| userId | string | 是 | 用户ID |
| sign | string | 是 | 签名 |

**响应示例**
```json
{
  "code": 200,
  "message": "开始任务成功",
  "data": {
    "success": true,
    "taskId": 1,
    "message": "任务开始"
  }
}
```

---

### 6. 完成任务

用户完成任务，系统自动发放积分。

**接口地址**
```
POST /api/offerwall/tasks/:id/complete
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 任务ID（路径参数） |
| channel | string | 是 | 产品标识 |
| time | number | 是 | 时间戳 |
| userId | string | 是 | 用户ID |
| sign | string | 是 | 签名 |

**响应示例**
```json
{
  "code": 200,
  "message": "完成任务成功",
  "data": {
    "record": {
      "id": 1,
      "userId": 1,
      "taskId": 1,
      "status": 2,
      "progress": 100
    },
    "earnedPoints": 100,
    "totalPoints": 1000
  }
}
```

---

### 7. 获取用户任务记录

获取用户的任务执行记录。

**接口地址**
```
GET /api/offerwall/tasks/records
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| channel | string | 是 | 产品标识 |
| time | number | 是 | 时间戳 |
| userId | string | 是 | 用户ID |
| sign | string | 是 | 签名 |
| status | string | 否 | 状态筛选 |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20 |

**响应示例**
```json
{
  "code": 200,
  "message": "获取任务记录成功",
  "data": {
    "total": 10,
    "page": 1,
    "pageSize": 20,
    "data": [
      {
        "id": 1,
        "userId": 1,
        "taskId": 1,
        "status": 2,
        "progress": 100,
        "task": {
          "id": 1,
          "title": "注册送100积分",
          "rewardPoints": 100
        }
      }
    ]
  }
}
```

---

## 🔧 前端使用示例

### 1. 安装依赖
```bash
npm install crypto-js --save
```

### 2. 导入API方法
```javascript
import { getOfferwallTemplate, getWelfareTasks, getOfferwallTasks } from '@/api/offerwall'
```

### 3. 调用接口

#### 获取模版数据
```javascript
async function loadTemplate() {
  try {
    const res = await getOfferwallTemplate()
    if (res.code === 200) {
      console.log('模版数据:', res.data)
      // 处理数据
    }
  } catch (error) {
    console.error('获取失败:', error)
  }
}
```

#### 获取福利任务
```javascript
async function loadWelfareTasks() {
  try {
    const res = await getWelfareTasks({ page: 1, limit: 10 })
    if (res.code === 200) {
      console.log('福利任务:', res.data)
      // 处理任务列表
    }
  } catch (error) {
    console.error('获取失败:', error)
  }
}
```

#### 获取任务列表
```javascript
async function loadTasks(sceneId) {
  try {
    const params = sceneId ? { sceneId } : {}
    const res = await getOfferwallTasks(params)
    if (res.code === 200) {
      console.log('任务列表:', res.data)
      // 处理任务列表
    }
  } catch (error) {
    console.error('获取失败:', error)
  }
}
```

---

## ❌ 错误码说明

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误（缺少必需参数） |
| 403 | 签名验证失败 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

**常见错误信息**

| 错误信息 | 说明 | 解决方案 |
|---------|------|---------|
| 缺少channel参数 | 请求未包含channel | 检查签名工具配置 |
| 缺少time参数 | 请求未包含时间戳 | 检查签名工具配置 |
| 缺少userId参数 | 请求未包含用户ID | 检查localStorage中的userId |
| 缺少sign参数 | 请求未包含签名 | 检查签名生成逻辑 |
| 无效的channel | channel不存在 | 检查channel配置（应为CS001） |
| 请求已过期 | 时间戳超过5分钟 | 检查客户端时间是否正确 |
| 签名验证失败 | 签名不正确 | 检查密钥配置和签名算法 |

---

## 🧪 测试工具

### 访问测试页面
```
http://localhost:8080/#/offerwall-demo
```

测试页面提供三个测试按钮：
1. **测试获取模版数据** - 测试 `/api/offerwall/template`
2. **测试获取福利任务** - 测试 `/api/offerwall/welfare/tasks`
3. **测试获取任务列表** - 测试 `/api/offerwall/tasks`

页面会显示：
- 实时请求结果
- 签名配置信息
- 可用接口列表
- 错误信息提示

---

## 📝 开发注意事项

### 1. 签名自动添加
所有积分墙接口的签名已通过axios拦截器自动添加，无需手动处理：

```javascript
// film/src/api/offerwall.js
service.interceptors.request.use(config => {
  const userId = localStorage.getItem('userId') || '1'
  const params = config.params || {}
  params.userId = userId
  const signedParams = addSignature(params) // 自动添加签名
  config.params = signedParams
  return config
})
```

### 2. 端口配置
积分墙接口使用独立的3000端口，已在webpack配置中代理：

```javascript
// film/config/index.js
proxyTable: {
  '/api/offerwall': {
    target: 'http://localhost:3000',
    changeOrigin: true
  }
}
```

### 3. userId获取
userId从localStorage获取，如果不存在则使用默认值 `test_user_001`。
建议在用户登录后设置：

```javascript
localStorage.setItem('userId', user.id)
```

### 4. 错误处理
所有接口调用都应包含错误处理：

```javascript
try {
  const res = await getOfferwallTemplate()
  // 处理成功响应
} catch (error) {
  // 处理错误
  console.error(error)
  Toast('请求失败')
}
```

---

## 📚 相关文档

- [签名功能完整说明](./SIGNATURE_AND_OFFERWALL_STATUS.md)
- [端口配置说明](./PORT_CONFIGURATION.md)
- [快速启动指南](./QUICK_START_GUIDE.md)

---

**文档版本**: 1.0.0
**最后更新**: 2025年10月19日
**维护者**: 开发团队
