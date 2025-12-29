@echo off
echo ========================================
echo   KLC Management System - PWA Launcher
echo ========================================
echo.
echo Building production version...
cd /d "%~dp0"
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Build failed! Please check for errors above.
    pause
    exit /b 1
)

echo.
echo Build successful! Starting local server...
echo.
echo The app will open in your browser at http://localhost:8080
echo.
echo To install as a desktop app:
echo 1. Click the install icon in the browser address bar
echo 2. Click "Install"
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd dist
http-server -p 8080 -o
