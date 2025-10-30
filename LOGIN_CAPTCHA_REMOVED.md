# Film 前端项目 - 登录验证码移除说明

## 修改内容

### 文件：`film/src/components/Login/Login.vue`

#### 1. 隐藏验证码输入框（模板部分）

**修改前**

```vue
<section class="login-info">
  <input type="text" placeholder="验证码" v-model="captcha">
  <img
    class="captcha"
    :src="captchaSrc"
    alt="captcha"
    @click="refreshCaptcha"
  >
</section>
```

**修改后**

```vue
<!-- 注释掉验证码输入框 - 不再需要验证码 -->
<!--
<section class="login-info">
  <input type="text" placeholder="验证码" v-model="captcha">
  <img
    class="captcha"
    :src="captchaSrc"
    alt="captcha"
    @click="refreshCaptcha"
  >
</section>
-->
```

#### 2. 移除验证码校验（脚本部分）

**修改前**

```javascript
if (this.userName===''){
  MessageBox.alert('请输入用户名')
} else if(this.password===''){
  MessageBox.alert('请输入密码')
} else if (this.captcha===''){
  MessageBox.alert('请输入验证码')
} else{
  let json = await pwdLogin(this.userName,this.password,this.captcha);
```

**修改后**

```javascript
if (this.userName===''){
  MessageBox.alert('请输入用户名')
} else if(this.password===''){
  MessageBox.alert('请输入密码')
}
// 注释掉验证码校验 - 不再需要验证码
// else if (this.captcha===''){
//   MessageBox.alert('请输入验证码')
// }
else{
  // 验证码可以为空，传空字符串即可
  let json = await pwdLogin(this.userName,this.password,this.captcha || '');
```

## 功能说明

### 已修改内容

- ✅ **隐藏验证码输入框和图片**
- ✅ **移除验证码必填校验**
- ✅ **登录时传递空验证码**

### 用户体验

- 用户只需输入**用户名**和**密码**即可登录
- 不再显示验证码输入框
- 不再显示验证码图片
- 登录流程更简洁

## 配合后端修改

此前端修改需要配合后端修改一起使用：

**后端修改**（已完成）：

- `film_api/routes/index.js` 中的 `/api/pwdLogin` 接口
- 已注释掉验证码校验逻辑

## 重新构建项目

修改后需要重新构建前端项目：

```bash
cd film
npm run build
```

或在开发模式下运行：

```bash
npm run dev
```

## 登录界面变化

### 修改前

```
┌─────────────────────┐
│  用户名              │
├─────────────────────┤
│  密码          👁    │
├─────────────────────┤
│  验证码   [验证码图] │  ← 已移除
└─────────────────────┘
     [  登录  ]
```

### 修改后

```
┌─────────────────────┐
│  用户名              │
├─────────────────────┤
│  密码          👁    │
└─────────────────────┘
     [  登录  ]
```

## 测试步骤

1. **重新构建项目**

   ```bash
   cd film
   npm run build
   ```

2. **启动项目**

   ```bash
   npm run dev
   ```

3. **测试登录**
   - 打开登录页面
   - 切换到"密码登录"
   - 输入用户名和密码
   - 点击登录（无需输入验证码）

## 注意事项

1. **后端服务必须先修改**：确保 film_api 项目已经注释掉验证码校验
2. **保留数据字段**：`captcha` 字段仍保留在 data 中，但不再使用
3. **API 调用**：仍然传递 `captcha` 参数（空字符串），保持接口兼容

## 恢复验证码功能

如果将来需要恢复验证码功能：

1. 取消注释验证码输入框的 HTML
2. 取消注释验证码校验逻辑
3. 重新构建项目

---

修改日期：2025-10-29
配合项目：film_api (后端已同步修改)
