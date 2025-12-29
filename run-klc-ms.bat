@echo off
echo ========================================
echo   KLC Management System - Quick Launch
echo ========================================
echo.
echo Starting local server from existing build...
echo.
echo The app will open at http://localhost:8080
echo.
echo Note: If you made code changes, run build-and-run.bat instead
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d "%~dp0dist"

if not exist index.html (
    echo.
    echo ERROR: Build not found!
    echo Please run build-and-run.bat first to create the production build.
    echo.
    pause
    exit /b 1
)

http-server -p 8080 -o
