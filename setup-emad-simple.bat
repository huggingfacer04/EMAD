@echo off
REM Simple EMAD Setup - Alternative to Windows Service
cd /d "%~dp0"

echo 🚀 EMAD Simple Setup (Background Runner)
echo ========================================
echo Current Directory: %CD%
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

echo ✅ Python is available

REM Check required packages
python -c "import requests" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Installing requests...
    pip install requests
    if %errorlevel% neq 0 (
        echo ❌ Failed to install requests
        pause
        exit /b 1
    )
)

echo ✅ Required packages available

REM Check if required files exist
if not exist "emad-auto-sync.py" (
    echo ❌ emad-auto-sync.py not found
    pause
    exit /b 1
)

if not exist "emad_auto_sync.py" (
    echo ❌ emad_auto_sync.py not found
    pause
    exit /b 1
)

if not exist "emad-background-runner.py" (
    echo ❌ emad-background-runner.py not found
    pause
    exit /b 1
)

echo ✅ Required files found

echo.
echo 🧪 Testing EMAD functionality...

REM Test authentication and basic functionality
python emad-auto-sync.py --test
if %errorlevel% neq 0 (
    echo ❌ EMAD test failed
    echo Please check your GitHub token and configuration
    pause
    exit /b 1
)

echo ✅ EMAD test successful

echo.
echo 🚀 Starting EMAD Background Runner...

REM Start the background runner
python emad-background-runner.py start

echo.
echo 📊 Checking status...
python emad-background-runner.py status

echo.
echo 🎉 EMAD Simple Setup Complete!
echo.
echo Background Runner Commands:
echo   Start:   python emad-background-runner.py start
echo   Stop:    python emad-background-runner.py stop
echo   Status:  python emad-background-runner.py status
echo   Restart: python emad-background-runner.py restart
echo.
echo The EMAD Auto-Sync is now running in the background!
echo It will automatically monitor for file changes and sync to GitHub.
echo.
echo To stop: python emad-background-runner.py stop
echo To check status: python emad-background-runner.py status
echo.
pause
