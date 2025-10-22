@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   签到功能 - 快速测试
echo ========================================
echo.
echo 【测试步骤】
echo.
echo 1. 确保服务运行:
echo    - film_api (4000端口): cd film_api ^&^& npm start
echo    - film 前端 (8080端口): cd film ^&^& npm run dev
echo.
echo 2. 打开浏览器开发者工具 (F12)
echo.
echo 3. 在 Console 中执行:
echo    localStorage.setItem('userId', '55')
echo.
echo 4. 刷新页面，应该看到:
echo    ✅ 金币余额显示
echo    ✅ 签到按钮状态正确
echo    ✅ 没有 401 错误
echo.
echo 5. 点击签到，应该看到:
echo    ✅ "签到成功！获得 XX 金币"
echo    ✅ 金币余额增加
echo    ✅ 签到按钮变为"已签到"
echo.
echo 6. 再次刷新页面，应该看到:
echo    ✅ 金币余额保持
echo    ✅ 显示"已签到"
echo    ✅ 没有 401 错误
echo.
echo ========================================
echo   Network 请求检查
echo ========================================
echo.
echo 应该看到的请求:
echo   ✅ GET /api/getUserCoins?userId=55
echo   ✅ GET /api/checkTodayCheckin?userId=55
echo   ✅ POST /api/userCheckin (点击签到时)
echo.
echo 不应该看到的请求:
echo   ❌ GET /api/client/points (会报 401)
echo.
echo ========================================
echo.
pause
