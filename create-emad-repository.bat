@echo off
echo 🎯 EMAD Repository Creation Script
echo ================================
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 🐍 Python detected - using Python script
    python create-emad-repository.py
    goto :end
)

REM Check if Python3 is available
python3 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 🐍 Python3 detected - using Python script
    python3 create-emad-repository.py
    goto :end
)

REM Fall back to Node.js
echo 🟢 Using Node.js script
node create-emad-repository.js

:end
echo.
echo ✅ Script execution completed
pause
