# Film项目端口配置说明

## 端口分配

### 前端服务
- **Film前端**: 8080 端口
  - 访问地址: http://localhost:8080

### 后端服务代理

#### 1. 积分墙接口 → 3000端口
- **代理路径**: `/api/offerwall/*`
- **目标服务**: http://localhost:3000
- **说明**: 所有以 `/api/offerwall` 开头的请求会被代理到3000端口的server服务

**示例**:
```
前端请求: http://localhost:8080/api/offerwall/tasks
实际转发: http://localhost:3000/api/offerwall/tasks
```

#### 2. 电影项目接口 → 4000端口
- **代理路径**: `/` (其他所有请求)
- **目标服务**: http://localhost:4000
- **说明**: 除了积分墙接口外的所有请求会被代理到4000端口

**示例**:
```
前端请求: http://localhost:8080/api/movie/list
实际转发: http://localhost:4000/api/movie/list

前端请求: http://localhost:8080/api/user/login
实际转发: http://localhost:4000/api/user/login
```

## 配置文件

### 代理配置
**文件**: `film/config/index.js`

```javascript
proxyTable: {
  '/api/offerwall': {  // 积分墙接口单独代理到3000端口
    target: 'http://localhost:3000',
    changeOrigin: true,
    pathRewrite: {
      '^/api/offerwall': '/api/offerwall'
    }
  },
  '/': {  // 电影项目接口代理到4000端口
    target: 'http://localhost:4000',
    changeOrigin: true,
    pathRewrite: {
      '^/': ''
    }
  }
}
```

### API配置

#### 积分墙API
**文件**: `film/src/api/offerwall.js`
```javascript
const service = axios.create({
  baseURL: '/api/offerwall', // 使用相对路径，通过代理转发
  timeout: 10000
})
```

#### 其他API
**文件**: `film/src/api/points.js` 等
```javascript
const server = 'http://localhost:4000' // 直接配置4000端口
```

## 启动顺序

### 1. 启动Server服务（3000端口）
```bash
cd server
npm run dev
```
预期输出: `Server is running on http://localhost:3000`

### 2. 启动Film前端（8080端口）
```bash
cd film
npm run dev
```
预期输出: `Your application is running here: http://localhost:8080`

## API请求流程

### 积分墙接口请求流程
```
1. 前端发起请求
   GET /api/offerwall/tasks

2. webpack-dev-server代理拦截
   匹配规则: /api/offerwall/*

3. 转发到3000端口
   http://localhost:3000/api/offerwall/tasks

4. Server服务处理
   - 签名验证中间件
   - 路由处理
   - 返回数据

5. 前端接收响应
```

### 电影接口请求流程
```
1. 前端发起请求
   GET /api/movie/list

2. webpack-dev-server代理拦截
   匹配规则: / (默认规则)

3. 转发到4000端口
   http://localhost:4000/api/movie/list

4. 电影服务处理
   - 返回数据

5. 前端接收响应
```

## 优势

### 1. 端口隔离
- 积分墙功能使用独立的3000端口
- 电影项目使用4000端口
- 互不干扰，便于独立开发和调试

### 2. 灵活部署
- 可以独立部署积分墙服务
- 可以独立扩展积分墙服务
- 便于负载均衡

### 3. 代码清晰
- 通过URL路径就能识别是哪个服务
- 便于维护和理解

## 测试验证

### 1. 测试积分墙接口
```bash
# 直接访问server服务（需要签名）
curl http://localhost:3000/api/offerwall/tasks

# 通过前端代理访问（自动添加签名）
# 在浏览器中访问 http://localhost:8080/#/offerwall
# 查看Network面板，应该看到请求发送到 /api/offerwall/tasks
```

### 2. 测试电影接口
```bash
# 直接访问
curl http://localhost:4000/api/movie/list

# 通过前端代理访问
# 在浏览器中访问 http://localhost:8080/#/movie
# 查看Network面板，应该看到请求发送到 /api/movie/list
```

## 注意事项

### 1. 代理顺序很重要
- 必须把 `/api/offerwall` 放在 `/` 之前
- webpack会按顺序匹配代理规则
- 如果 `/` 在前面，所有请求都会被它拦截

### 2. 重启服务
- 修改 `config/index.js` 后需要重启Film前端服务
- Server服务不需要重启

### 3. 签名验证
- 积分墙接口需要签名验证
- 前端已自动添加签名（通过axios拦截器）
- 直接访问3000端口需要手动添加签名参数

## 故障排查

### 问题1: 积分墙接口404
**原因**: 代理配置可能有问题
**解决**:
- 检查 `config/index.js` 的proxyTable配置
- 重启Film前端服务
- 确认Server服务在3000端口运行

### 问题2: 签名验证失败
**原因**: 签名参数不正确
**解决**:
- 检查 `film/src/utils/signature.js` 配置
- 检查 `server/src/middleware/signature.middleware.ts` 配置
- 确认channel和key一致

### 问题3: 电影接口无法访问
**原因**: 4000端口服务未启动
**解决**:
- 确认电影项目服务在4000端口运行
- 检查代理配置是否正确

## 相关文件

### 配置文件
- `film/config/index.js` - webpack代理配置
- `film/src/api/offerwall.js` - 积分墙API配置
- `film/src/utils/signature.js` - 签名工具配置

### 后端文件
- `server/src/routes/offerwall.routes.ts` - 积分墙路由
- `server/src/middleware/signature.middleware.ts` - 签名验证中间件
- `server/src/controllers/clientTask.controller.ts` - 积分墙控制器

## 更新日期
2025年10月19日
