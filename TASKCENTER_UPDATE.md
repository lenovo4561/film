# TaskCenter.vue 更新说明

## 📋 更新概述

TaskCenter.vue 现在会向 Server 服务发起两个签名请求：
1. **积分墙模版数据** - 获取场景和任务类型配置
2. **福利中心任务列表** - 获取所有福利任务

---

## 🔄 新增功能

### 1. 积分墙模版数据加载

**接口**: `GET /api/offerwall/template`

**方法**: `loadOfferwallTemplate()`

**功能**:
- 获取积分墙配置（标题、副标题）
- 获取场景列表
- 获取任务类型列表

**数据存储**:
```javascript
data() {
  return {
    offerwallTemplate: null // 存储模版数据
  }
}
```

**响应数据结构**:
```javascript
{
  channel: 'CS001',
  config: {
    title: '积分墙',
    subtitle: '完成任务赚取积分',
    banners: []
  },
  scenes: [
    {
      id: 1,
      name: '新手专区',
      icon: '🎯',
      description: '新手专属任务',
      sort: 1
    }
  ],
  taskTypes: [
    {
      id: 1,
      name: '注册任务',
      icon: '📝',
      description: '注册账号即可获得积分'
    }
  ]
}
```

---

### 2. 福利中心任务列表加载

**接口**: `GET /api/offerwall/welfare/tasks`

**方法**: `loadWelfareTasks()`

**参数**:
- `page`: 1 (默认第一页)
- `limit`: 20 (每页20条)

**功能**:
- 获取所有福利任务
- 支持分页加载
- 自动合并到任务列表

**数据存储**:
```javascript
data() {
  return {
    welfareTasks: [] // 存储福利任务列表
  }
}
```

**响应数据结构**:
```javascript
{
  total: 50,
  page: 1,
  pageSize: 20,
  totalPages: 5,
  data: [
    {
      id: 1,
      title: '注册送100积分',
      description: '完成注册即可获得100积分',
      icon: '🎁',
      rewardPoints: 100,
      targetCount: 1,
      taskTypeId: 1,
      isCompleted: false,
      userProgress: 0
    }
  ]
}
```

---

## 🎨 新增UI组件

### 1. 积分墙场景区域

**显示条件**: `v-if="offerwallTemplate && offerwallTemplate.scenes"`

**功能**:
- 显示所有可用场景
- 点击场景可以跳转到场景任务列表
- 显示场景图标、名称、描述

**HTML结构**:
```vue
<div class="offerwall-section">
  <div class="section-header">
    <div class="section-title">积分墙</div>
    <div class="section-subtitle">完成任务赚取积分</div>
  </div>

  <div class="scene-list">
    <div class="scene-item" @click="handleScene(scene)">
      <div class="scene-icon">🎯</div>
      <div class="scene-info">
        <div class="scene-name">新手专区</div>
        <div class="scene-desc">新手专属任务</div>
      </div>
      <div class="scene-arrow">→</div>
    </div>
  </div>
</div>
```

---

### 2. 福利中心任务区域

**显示条件**: `v-if="welfareTasks && welfareTasks.length > 0"`

**功能**:
- 显示所有福利任务
- 点击任务可以开始执行
- 显示任务奖励和完成状态
- 特殊样式区分（渐变背景）

**HTML结构**:
```vue
<div class="welfare-section">
  <div class="section-header">
    <div class="section-title">🎁 福利中心</div>
    <div class="section-subtitle">完成任务领取丰厚奖励</div>
  </div>

  <div class="task-list">
    <div class="task-item welfare-task">
      <div class="task-icon">🎁</div>
      <div class="task-info">
        <div class="task-title">注册送100积分</div>
        <div class="task-desc">完成注册即可获得</div>
        <div class="task-reward">+100 🪙</div>
      </div>
      <div class="task-action">
        <button class="action-btn">去完成</button>
      </div>
    </div>
  </div>
</div>
```

---

## 🔐 签名验证

所有请求都会自动通过签名验证：

### 请求流程

```
1. 页面加载
   ↓
2. 调用 loadOfferwallTemplate()
   ↓
3. 调用 getOfferwallTemplate() API
   ↓
4. axios拦截器自动添加签名
   - channel: CS001
   - time: 当前时间戳
   - userId: 用户ID
   - sign: MD5签名
   ↓
5. 请求发送到 /api/offerwall/template
   ↓
6. webpack代理转发到 http://localhost:3000
   ↓
7. Server签名验证中间件验证
   ↓
8. 验证通过，返回数据
   ↓
9. 页面显示模版数据
```

同样的流程适用于福利任务列表请求。

---

## 📊 数据流向

```
TaskCenter.vue
    ↓
init()
    ↓
Promise.all([
  loadOfferwallTemplate(),  // 新增
  loadWelfareTasks(),       // 新增
  loadUserPoints(),
  loadSigninStatus(),
  loadTasks(),
  loadAds()
])
    ↓
数据加载完成
    ↓
页面渲染
```

---

## 🎯 事件处理

### 1. 场景点击事件

```javascript
handleScene(scene) {
  console.log('点击场景:', scene)
  Toast({
    message: `进入场景：${scene.name}`,
    position: 'middle',
    duration: 1500
  })
  // 可以跳转到场景任务列表页
  // this.$router.push({ path: '/offerwall/scene', query: { sceneId: scene.id } })
}
```

### 2. 福利任务点击事件

```javascript
handleWelfareTask(task) {
  console.log('点击福利任务:', task)

  if (task.isCompleted) {
    Toast({ message: '该任务已完成' })
    return
  }

  Toast({ message: `开始任务：${task.title}` })
  // 可以调用开始任务接口
  // await startOfferwallTask(task.id)
}
```

---

## 🎨 样式特性

### 积分墙场景样式

```stylus
.offerwall-section
  .scene-list
    .scene-item
      background-color #16213e
      border-radius .3rem
      padding .3rem
      display flex
      align-items center
      cursor pointer
      transition all 0.3s
      &:active
        transform scale(0.98)
        background-color #1a2642
```

### 福利任务特殊样式

```stylus
.welfare-section
  .task-item.welfare-task
    background linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)
    border .02rem solid rgba(102, 126, 234, 0.3)
```

福利任务使用渐变背景和边框，与普通任务区分开。

---

## 📝 控制台日志

页面加载时会在控制台输出详细信息：

```javascript
=== 开始加载积分墙模版数据 ===
积分墙模版数据响应: {...}
积分墙模版数据加载成功:
- 场景列表: [...]
- 任务类型: [...]
- 配置信息: {...}

=== 开始加载福利中心任务列表 ===
福利中心任务列表响应: {...}
福利中心任务列表加载成功:
- 总任务数: 50
- 当前页: 1
- 任务列表: [...]
```

---

## 🧪 测试步骤

### 1. 启动服务

```bash
# 启动后端服务（3000端口）
cd server
npm run dev

# 启动前端服务（8080端口）
cd film
npm run dev
```

### 2. 访问任务中心

```
http://localhost:8080/#/my/task-center
```

### 3. 检查功能

- ✅ 页面加载时自动发起两个请求
- ✅ 控制台显示请求日志
- ✅ 签名参数自动添加
- ✅ 积分墙场景区域显示
- ✅ 福利中心任务区域显示
- ✅ Toast提示加载成功

### 4. 查看Network面板

应该看到两个请求：

**请求1**: 积分墙模版
```
Request URL: /api/offerwall/template
Query String:
  channel: CS001
  time: 1697700000000
  userId: 1
  sign: xxxxxxxxxxxxx
```

**请求2**: 福利任务列表
```
Request URL: /api/offerwall/welfare/tasks
Query String:
  channel: CS001
  time: 1697700000001
  userId: 1
  page: 1
  limit: 20
  sign: xxxxxxxxxxxxx
```

---

## 🔍 故障排查

### 问题1: 请求失败

**症状**: 控制台报错，Toast显示加载失败

**检查**:
1. Server服务是否在3000端口运行
2. 数据库中是否有数据（scenes表、tasks表）
3. 签名是否正确（查看控制台日志）

**解决**:
```bash
# 重启Server服务
cd server
npm run dev

# 检查数据库
mysql -u root -p
use jifen;
SELECT * FROM scenes WHERE status = 1;
SELECT * FROM tasks WHERE status = 1;
```

### 问题2: 数据为空

**症状**: 请求成功但区域不显示

**检查**:
1. 响应数据结构是否正确
2. `offerwallTemplate.scenes` 是否有数据
3. `welfareTasks` 数组是否有数据

**解决**:
查看控制台日志，检查响应数据：
```javascript
console.log('积分墙模版数据响应:', res)
console.log('福利中心任务列表响应:', res)
```

### 问题3: 签名验证失败

**症状**: 返回403错误，提示签名验证失败

**检查**:
1. 前端密钥是否正确
2. 后端密钥是否匹配
3. 时间戳是否在5分钟内

**解决**:
检查密钥配置：
```javascript
// 前端 film/src/utils/signature.js
key: '804c73bec6c891128b7059b22da5f2a9faf4b93e056ff33db26fd527161d2512'

// 后端 server/src/middleware/signature.middleware.ts
PRODUCTS = {
  'CS001': {
    key: '804c73bec6c891128b7059b22da5f2a9faf4b93e056ff33db26fd527161d2512'
  }
}
```

---

## 📚 相关文档

- **API文档**: `film/OFFERWALL_API_DOCS.md`
- **功能总结**: `OFFERWALL_FEATURE_SUMMARY.md`
- **快速参考**: `QUICK_REFERENCE.md`

---

## 🎉 功能优势

1. **✅ 数据自动加载**
   - 页面初始化时自动请求
   - 并行加载，提高效率
   - 错误处理友好

2. **✅ 签名自动验证**
   - 无需手动处理签名
   - 安全可靠
   - 防止恶意请求

3. **✅ UI友好展示**
   - 场景卡片式展示
   - 福利任务特殊样式
   - 响应式设计

4. **✅ 扩展性强**
   - 可以轻松添加更多功能
   - 支持场景跳转
   - 支持任务详情查看

---

**更新时间**: 2025年10月19日
**版本**: 2.0.0
**状态**: ✅ 已完成并可用
