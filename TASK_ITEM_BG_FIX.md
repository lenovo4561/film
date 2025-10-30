# 任务条目背景色显示问题修复

## 问题描述

用户反馈：film 项目中，`/api/offerwall/config` 接口返回的数据中，**任务条目背景色（task_item_bg）字段没有生效**。

具体表现：

- 在 vue-ele-temp 管理后台设置了"任务条目"颜色（对应数据库 `task_item_bg` 字段）
- 但在 film 的任务中心页面，任务列表的背景色没有响应这个设置
- 始终显示的是"底部背景色"（`background_color`）而不是"任务条目背景色"（`task_item_bg`）

## 问题根因

### 1. 数据流向梳理

```
数据库 (offerwall_configs 表)
  ↓
server (task.service.ts - getOfferwallConfig 方法)
  ↓ 格式转换
  {
    adSection: {
      taskCard: {
        backgroundColor: data.task_item_bg  // ✅ 正确映射
      }
    },
    global: {
      bottomBackground: data.background_color  // ✅ 正确映射
    }
  }
  ↓
film (TaskCenter.vue)
  ↓ 计算属性 taskItemStyle
  ❌ 优先使用 global.bottomBackground（错误！）
  ✅ 应该优先使用 adSection.taskCard.backgroundColor
```

### 2. 字段映射关系

| 数据库字段         | 含义           | 后端转换后的路径                     | 应用位置         |
| ------------------ | -------------- | ------------------------------------ | ---------------- |
| `task_item_bg`     | 任务条目背景色 | `adSection.taskCard.backgroundColor` | 任务列表项的背景 |
| `background_color` | 底部背景色     | `global.bottomBackground`            | 页面整体底部背景 |

**问题：**前端的 `taskItemStyle` 计算属性优先级设置错误，导致用的是 `bottomBackground` 而不是 `taskCard.backgroundColor`。

### 3. 代码问题定位

**问题代码（TaskCenter.vue 第 287-316 行）：**

```javascript
taskItemStyle() {
  // ❌ 优先使用 global.bottomBackground（错误！）
  if (
    this.offerwallConfig &&
    this.offerwallConfig.global &&
    this.offerwallConfig.global.bottomBackground
  ) {
    return {
      backgroundColor: this.offerwallConfig.global.bottomBackground
    };
  }

  // 降级方案：使用 taskCard.backgroundColor
  if (
    this.offerwallConfig &&
    this.offerwallConfig.adSection &&
    this.offerwallConfig.adSection.taskCard
  ) {
    const taskCard = this.offerwallConfig.adSection.taskCard;
    return {
      backgroundColor: taskCard.backgroundColor
    };
  }

  return { backgroundColor: "#16213e" };
}
```

**问题原因：**

- `global.bottomBackground` 是页面底部背景色，不应该用于任务条目
- `taskCard.backgroundColor` 才是专门为任务条目设计的背景色
- 优先级设置反了！

## 解决方案

### 修改 TaskCenter.vue 的 taskItemStyle 计算属性

**修改后的代码：**

```javascript
taskItemStyle() {
  // ✅ 优先使用 taskCard.backgroundColor（对应数据库的 task_item_bg 字段）
  if (
    this.offerwallConfig &&
    this.offerwallConfig.adSection &&
    this.offerwallConfig.adSection.taskCard &&
    this.offerwallConfig.adSection.taskCard.backgroundColor
  ) {
    return {
      backgroundColor: this.offerwallConfig.adSection.taskCard.backgroundColor
    };
  }

  // 降级方案：使用 global.bottomBackground
  if (
    this.offerwallConfig &&
    this.offerwallConfig.global &&
    this.offerwallConfig.global.bottomBackground
  ) {
    return {
      backgroundColor: this.offerwallConfig.global.bottomBackground
    };
  }

  // 默认背景色
  return {
    backgroundColor: "#16213e"
  };
}
```

**修改说明：**

1. **调整优先级**：先检查 `taskCard.backgroundColor`，再检查 `bottomBackground`
2. **语义正确**：任务条目应该用"任务条目背景色"，而不是"底部背景色"
3. **降级合理**：如果没有设置任务条目背景色，才使用底部背景色作为兜底

## 验证步骤

### 1. 重启 film 项目

```bash
cd film
npm run dev
```

### 2. 测试场景

#### 场景 1：设置了任务条目背景色

- 在 vue-ele-temp 管理后台设置"任务条目"颜色为 `#1a2b3c`
- 保存并锁定配置
- 在 film 任务中心查看任务列表
- **预期结果**：任务条目背景色为 `#1a2b3c`

#### 场景 2：未设置任务条目背景色

- 在数据库中将 `task_item_bg` 设置为 NULL
- 但设置 `background_color` 为 `#aabbcc`
- **预期结果**：任务条目背景色降级为 `#aabbcc`

#### 场景 3：都没设置

- 两个字段都为 NULL
- **预期结果**：任务条目背景色使用默认值 `#16213e`

### 3. 验证 API 返回数据

打开浏览器控制台，查看 `/api/offerwall/config` 的响应：

```json
{
  "code": 200,
  "data": {
    "adSection": {
      "taskCard": {
        "backgroundColor": "#1a2b3c" // ✅ 应该包含这个字段
      }
    },
    "global": {
      "bottomBackground": "#d2d2d2"
    }
  }
}
```

### 4. 验证样式应用

在浏览器开发者工具中检查任务列表项：

```html
<div class="task-item" style="background-color: rgb(26, 43, 60);">
  <!-- 任务内容 -->
</div>
```

## 技术细节

### 字段用途说明

| 字段名       | 英文名            | 用途                         | 应用位置          |
| ------------ | ----------------- | ---------------------------- | ----------------- |
| 任务条目背景 | task_item_bg      | 任务列表中每个任务项的背景色 | `.task-item` 元素 |
| 广告背景     | ad_inner_bg_color | 广告内容区域的整体背景       | 广告容器背景      |
| 底部背景     | background_color  | 页面底部的背景色             | 页面底部装饰      |

### 数据转换逻辑（server/src/services/task.service.ts）

```typescript
// ✅ 后端已正确实现字段映射
taskCard: {
  backgroundColor: data.task_item_bg || "#16213e", // 使用 task_item_bg 字段
  borderRadius: "0.3rem",
  padding: "0.3rem",
},
```

### 前端应用逻辑（film/src/pages/My/children/TaskCenter.vue）

```vue
<template>
  <div
    v-for="task in adTasks"
    :key="'ad-' + task.id"
    class="task-item"
    :style="taskItemStyle"
    <!--
    ✅
    动态应用样式
    --
  >
    >
    <!-- 任务内容 -->
  </div>
</template>

<script>
export default {
  computed: {
    taskItemStyle() {
      // ✅ 优先使用 taskCard.backgroundColor（修复后）
      return {
        backgroundColor:
          this.offerwallConfig?.adSection?.taskCard?.backgroundColor ||
          "#16213e"
      };
    }
  }
};
</script>
```

## 修复影响范围

### 受影响的文件

1. **film/src/pages/My/children/TaskCenter.vue**
   - 修改 `taskItemStyle` 计算属性的优先级逻辑
   - 影响：任务列表项的背景色显示

### 不受影响的部分

1. **server/src/services/task.service.ts**

   - 后端数据转换逻辑本身是正确的，无需修改

2. **vue-ele-temp 管理后台**

   - 颜色选择器和保存逻辑无需修改

3. **数据库表结构**
   - `offerwall_configs` 表的 `task_item_bg` 字段已存在，无需修改

## 总结

**问题本质：**

- 前端计算属性的优先级设置错误
- 用了"底部背景色"而不是"任务条目背景色"

**修复方法：**

- 调整 `taskItemStyle` 的判断顺序
- 优先使用 `adSection.taskCard.backgroundColor`

**修复后效果：**

- ✅ 管理后台设置的"任务条目"颜色正确显示在 film 的任务列表中
- ✅ 数据库的 `task_item_bg` 字段生效
- ✅ 降级逻辑合理，兼容未设置的情况

---

**修复时间：** 2025 年 10 月 29 日  
**修复人员：** GitHub Copilot  
**相关文件：** film/src/pages/My/children/TaskCenter.vue
