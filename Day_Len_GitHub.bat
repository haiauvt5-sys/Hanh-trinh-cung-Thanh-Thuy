@echo off
title Day Len GitHub
cd /d "%~dp0"

echo ========================================================
echo   DANG DAY WEBSITE LEN GITHUB PAGES...
echo   Kho: haiauvt5-sys/Hanh-trinh-cung-Thanh-Thuy
echo ========================================================
echo [1/3] Đang lưu các thay đổi mới...
git add .
git commit -m "Cap nhat website va ket noi tu dong hoa Google Sheets" >nul 2>&1

echo [2/3] Đang đẩy lên GitHub Pages...
git push -u origin main

if %errorlevel% equ 0 (
    echo ========================================================
    echo   CHUC MUNG XEP! DA DAY LEN GITHUB THANH CONG!
    echo   Trang web public:
    echo   https://haiauvt5-sys.github.io/Hanh-trinh-cung-Thanh-Thuy/
    echo ========================================================
) else (
    echo ========================================================
    echo   [!] Chua day duoc. Neu co cua so dang nhap,
    echo   Xep hay bam "Sign in with your browser" nhe a.
    echo ========================================================
)

echo.
pause
