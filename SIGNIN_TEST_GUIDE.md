# 签到功能测试指南

## 快速测试步骤

### 1. 启动服务（按顺序）

```bash
# 终端 1: 启动 film_api (金币系统 - 4000端口)
cd film_api
npm start

# 终端 2: 启动前端开发服务器 (8080端口)
cd film
npm run dev
```

### 2. 浏览器测试

1. 访问 http://localhost:8080
2. 进入"任务中心"页面
3. 查看签到区域

### 3. 测试检查点

#### ✅ 页面加载时
- [ ] 打开控制台，查看是否有 "签到状态响应:" 日志
- [ ] 签到按钮应该根据今天是否已签到显示不同状态
- [ ] 如果未签到，按钮应该可点击

#### ✅ 点击签到按钮
- [ ] 应该显示 "签到成功！获得 XX 金币" 提示
- [ ] 控制台应该输出 "签到响应:" 日志
- [ ] 按钮状态应该变为已签到（不可点击）

#### ✅ 再次点击签到按钮
- [ ] 应该显示 "今日已签到" 提示
- [ ] 不应该触发接口请求

### 4. 网络检查（开发者工具 Network 面板）

#### 加载签到状态
```
Request URL: http://localhost:8080/api/checkTodayCheckin?userId=1
Request Method: GET
Status Code: 200

Response:
{
  "success_code": 200,
  "checked": false
}
```

#### 执行签到
```
Request URL: http://localhost:8080/api/userCheckin
Request Method: POST
Status Code: 200

Request Payload:
{
  "userId": "1"
}

Response:
{
  "success_code": 200,
  "data": {
    "coin_balance": 120,
    "reward_coins": 20,
    "continuous_days": 1,
    "message": "签到成功！获得20金币"
  }
}
```

### 5. 数据库验证

```sql
-- 查看用户金币信息
SELECT * FROM t_user_coins WHERE user_id = '1';

-- 预期结果：
-- coin_balance: 增加了 reward_coins
-- continuous_days: 连续签到天数
-- last_checkin_date: 今天的日期

-- 查看签到记录
SELECT * FROM t_coin_records
WHERE user_id = '1'
AND change_type = 'checkin'
ORDER BY created_at DESC
LIMIT 1;

-- 预期结果：
-- coin_change: 20 (或更多，根据连续签到天数)
-- change_reason: 第X天签到奖励
-- balance_after: 签到后的金币余额
```

### 6. 常见问题排查

#### 问题1: 点击签到无反应
**检查：**
- [ ] film_api 服务是否运行在 4000 端口
- [ ] 浏览器控制台是否有错误信息
- [ ] Network 面板中请求是否发送成功

**解决：**
```bash
# 检查 film_api 是否运行
netstat -ano | findstr :4000

# 重启 film_api
cd film_api
npm start
```

#### 问题2: 显示 "今天已签到" 但实际未签到
**检查：**
- [ ] 数据库中 last_checkin_date 字段
- [ ] 服务器时区是否正确

**解决：**
```sql
-- 手动重置签到状态（测试用）
UPDATE t_user_coins
SET last_checkin_date = NULL
WHERE user_id = '1';
```

#### 问题3: 签到成功但金币未增加
**检查：**
- [ ] 查看 t_coin_records 表是否有记录
- [ ] 查看 t_user_coins 表的 coin_balance 字段

**解决：**
```sql
-- 检查金币记录
SELECT * FROM t_coin_records
WHERE user_id = '1'
ORDER BY created_at DESC
LIMIT 5;

-- 检查用户金币
SELECT * FROM t_user_coins
WHERE user_id = '1';
```

#### 问题4: 请求转发到错误的端口
**检查：**
- [ ] 查看 Network 面板中实际请求的 URL
- [ ] 检查 `film/config/index.js` 的代理配置

**解决：**
```javascript
// 确保代理配置正确
proxyTable: {
  '/api': {
    target: 'http://localhost:4000',
    changeOrigin: true
  }
}
```

### 7. 测试不同场景

#### 场景1: 首次签到
```
预期：
- 显示"签到成功！获得 20 金币"
- continuous_days = 1
- coin_balance 增加 20
```

#### 场景2: 连续签到（第2-6天）
```
预期：
- 显示"签到成功！获得 20 金币"
- continuous_days 递增
- coin_balance 增加 20
```

#### 场景3: 连续签到第7天
```
预期：
- 显示"签到成功！获得 30 金币"
- continuous_days = 7
- coin_balance 增加 30 (20基础 + 10奖励)
```

#### 场景4: 断签后再签到
```
预期：
- 显示"签到成功！获得 20 金币"
- continuous_days = 1 (重新计算)
- coin_balance 增加 20
```

#### 场景5: 今天已签到
```
预期：
- 显示"今日已签到"
- 不触发签到接口
- coin_balance 不变
```

### 8. 性能测试

```javascript
// 在浏览器控制台执行
console.time('签到状态检查');
// 刷新页面
// 等待加载完成
console.timeEnd('签到状态检查');
// 应该在 100-300ms 内完成
```

### 9. 成功标志

✅ **所有测试通过的标志：**
1. 页面加载时自动检查签到状态
2. 未签到时可以点击签到按钮
3. 签到成功后显示正确的金币奖励
4. 已签到时点击按钮提示"今日已签到"
5. 数据库中正确记录签到信息
6. Network 面板显示请求转发到 4000 端口
7. 控制台无错误信息

### 10. 回归测试

在修改后，请确保以下功能仍然正常：
- [ ] 任务中心页面正常加载
- [ ] 积分墙模版数据正常显示
- [ ] 福利中心任务正常显示
- [ ] 其他功能不受影响

## 测试完成清单

- [ ] 首次签到测试
- [ ] 重复签到测试
- [ ] 连续签到测试
- [ ] 断签测试
- [ ] 网络错误处理测试
- [ ] 数据库记录验证
- [ ] 接口转发验证
- [ ] 回归测试

## 测试报告模板

```
测试日期：2025-10-20
测试人员：[姓名]
测试环境：
- film_api: localhost:4000 ✅
- 前端: localhost:8080 ✅

测试结果：
1. 签到状态检查：✅ 通过
2. 首次签到：✅ 通过
3. 重复签到拦截：✅ 通过
4. 金币奖励计算：✅ 通过
5. 数据库记录：✅ 通过
6. 接口转发：✅ 通过

发现问题：
- 无

备注：
- 所有功能正常
```
