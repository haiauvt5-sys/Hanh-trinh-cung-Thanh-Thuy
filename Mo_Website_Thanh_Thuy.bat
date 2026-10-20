@echo off
title May Chu Website Thanh Thuy
chcp 65001 >nul
cd /d "E:\NOMI-S~1\HANH-T~1"
start http://localhost:8080
start http://localhost:8080/quan-tri-data.html
node server.js
pause
