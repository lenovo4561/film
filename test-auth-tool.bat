@echo off
echo.
echo ========================================
echo   积分接口 401 错误 - 快速测试
echo ========================================
echo.
echo 正在启动测试工具...
echo.
start "" "D:\Desktop\jifen\film\test-auth.html"
echo.
echo 测试步骤:
echo 1. 点击 "登录" 按钮
echo 2. 查看是否显示 "登录成功，token 已保存"
echo 3. 点击 "获取积分" 按钮
echo 4. 应该返回积分数据，不再报 401 错误
echo.
echo 提示: 需要先启动 server (3000端口)
echo   cd server
echo   npm run dev
echo.
pause
