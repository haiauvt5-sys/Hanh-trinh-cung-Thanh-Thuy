@echo off
title Khoi dong Server Website Thanh Thuy
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================================
echo   Đang khởi động Server Website Hành Trình Cùng Thanh Thủy...
echo ========================================================
timeout /t 1 >nul
start http://localhost:8080
start http://localhost:8080/quan-tri-data.html
node server.js
pause
