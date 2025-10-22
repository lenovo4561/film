# 用户金币显示功能对接完成

## 更新时间
2025-10-20

## 功能说明
在任务中心页面（OfferwallTasks）显示用户的金币余额，从 film_api 服务端的 `/api/getUserCoins` 接口获取数据。

## 修改的文件

### 1. `film/src/api/offerwall.js`
**新增内容：**
- 添加 `getUserCoins()` API 方法
- 自动从 localStorage 获取 userId
- 通过代理转发到 film_api (4000端口) 的 `/api/getUserCoins` 接口

```javascript
export function getUserCoins() {
  const userId = localStorage.getItem('userId') || '1'
  return axios.get('/api/getUserCoins', {
    params: { userId }
  })
}
```

### 2. `film/src/pages/Offerwall/OfferwallTasks.vue`
**模板更新：**
- 在页面头部添加金币显示卡片
- 使用半透明毛玻璃效果的卡片样式
- 显示金币图标 💰 和金币数量

**脚本更新：**
- 导入 `getUserCoins` API
- 添加 `userCoins` 数据属性（默认值为 0）
- 添加 `loadUserCoins()` 方法在页面创建时调用
- 兼容处理 `success_code` 和 `code` 两种返回格式
- 兼容处理 `coin_balance` 和 `balance` 两种字段名

**样式更新：**
- 添加金币显示区域样式（`.coin-display`）
- 使用渐变背景和毛玻璃效果
- 响应式设计，支持移动端显示

## 数据流程

```
用户访问任务中心页面
    ↓
OfferwallTasks.vue 组件创建
    ↓
调用 loadUserCoins()
    ↓
getUserCoins() API 调用
    ↓
从 localStorage 获取 userId
    ↓
GET /api/getUserCoins?userId=xxx
    ↓
代理转发到 http://localhost:4000
    ↓
film_api 处理请求并返回数据
    ↓
{
  success_code: 200,
  data: {
    user_id: "xxx",
    coin_balance: 0,
    total_earned: 0,
    ...
  }
}
    ↓
前端解析并显示金币数量
```

## 接口说明

### 请求
- **URL**: `/api/getUserCoins`
- **方法**: GET
- **参数**:
  - `userId` (string): 用户ID，从 localStorage 自动获取

### 响应
```json
{
  "success_code": 200,
  "data": {
    "coin_id": 1,
    "user_id": "1",
    "coin_balance": 0,
    "total_earned": 0,
    "continuous_days": 0,
    "last_signin_date": null,
    "created_at": "2025-10-20T00:00:00.000Z",
    "updated_at": "2025-10-20T00:00:00.000Z"
  }
}
```

## 样式效果

### 金币显示卡片
- **背景**: 半透明白色 + 毛玻璃效果
- **位置**: 页面头部，标题和副标题下方
- **布局**: 横向弹性布局，图标在左，信息在右
- **图标**: 💰 (48px 大小)
- **金币数量**: 32px 粗体，白色文字
- **响应式**: 最大宽度 300px，自动居中

## 测试建议

1. **确保服务启动**
   - film_api 服务运行在 4000 端口
   - film 前端运行在 8080 端口

2. **测试步骤**
   ```bash
   # 启动 film_api
   cd film_api
   npm start

   # 启动 film 前端
   cd film
   npm run dev
   ```

3. **访问页面**
   - 打开浏览器访问 http://localhost:8080
   - 导航到任务中心页面
   - 查看页面头部是否显示金币信息

4. **检查控制台**
   - 打开浏览器开发者工具
   - 查看 Network 面板，确认 `/api/getUserCoins` 请求成功
   - 查看 Console 面板，应该有日志输出 "用户金币: {...}"

5. **测试不同场景**
   - 新用户（没有金币记录）：应该显示 0
   - 有金币记录的用户：应该显示实际金币数量
   - 网络错误：应该静默失败，不影响页面其他功能

## 注意事项

1. **用户ID获取**
   - 当前从 localStorage 的 'userId' 字段获取
   - 如果没有，默认使用 '1'
   - 建议在登录时正确设置 userId

2. **错误处理**
   - 金币加载失败不会显示错误提示
   - 避免影响用户体验
   - 错误会在控制台输出，方便调试

3. **代理配置**
   - `/api/getUserCoins` 通过代理转发到 film_api (4000端口)
   - 配置文件: `film/config/index.js`

4. **数据库要求**
   - 需要 `t_user_coins` 表存在
   - 如果用户没有记录，服务端会自动创建

## 下一步优化建议

1. **添加刷新功能**
   - 完成任务后自动刷新金币显示
   - 添加下拉刷新功能

2. **添加动画效果**
   - 金币数量变化时的过渡动画
   - 加载时的骨架屏效果

3. **添加金币历史**
   - 点击金币卡片查看金币明细
   - 显示收入和支出记录

4. **缓存优化**
   - 使用 Vuex 管理金币状态
   - 避免重复请求
