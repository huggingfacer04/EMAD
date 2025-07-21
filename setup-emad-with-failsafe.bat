@echo off
REM EMAD Setup with Integrated Failsafe System
cd /d "%~dp0"

echo 🚀 EMAD Setup with Failsafe System
echo ==================================
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

REM Check and install required packages
echo 📦 Checking required packages...

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

python -c "import psutil" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Installing psutil (required for failsafe system)...
    pip install psutil
    if %errorlevel% neq 0 (
        echo ❌ Failed to install psutil
        pause
        exit /b 1
    )
)

echo ✅ Required packages available

REM Check if required files exist
echo 📁 Checking required files...

set "required_files=emad-auto-sync.py emad_auto_sync.py emad-background-runner.py emad-failsafe-system.py emad-failsafe-cli.py"

for %%f in (%required_files%) do (
    if not exist "%%f" (
        echo ❌ %%f not found
        pause
        exit /b 1
    )
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
echo 🔧 Testing Failsafe System...

REM Test failsafe system
python emad-failsafe-cli.py test
if %errorlevel% neq 0 (
    echo ⚠️ Failsafe test had issues, but continuing...
) else (
    echo ✅ Failsafe system test successful
)

echo.
echo 🚀 Starting EMAD with Failsafe System...

REM Start the background runner (now includes failsafe)
python emad-background-runner.py start

echo.
echo 📊 Checking status...
python emad-background-runner.py status

echo.
echo 🛡️ Failsafe System Status...
python emad-failsafe-cli.py status

echo.
echo 🎉 EMAD Setup with Failsafe System Complete!
echo.
echo ============================================
echo 📋 Available Commands:
echo ============================================
echo.
echo EMAD Background Runner:
echo   python emad-background-runner.py start     - Start monitoring
echo   python emad-background-runner.py stop      - Stop monitoring
echo   python emad-background-runner.py status    - Check status
echo   python emad-background-runner.py restart   - Restart monitoring
echo.
echo Failsafe System:
echo   python emad-failsafe-cli.py status         - Show failsafe status
echo   python emad-failsafe-cli.py test           - Run failsafe tests
echo   python emad-failsafe-cli.py config         - Show configuration
echo.
echo Failsafe Controls:
echo   python emad-failsafe-cli.py /disable-emad-init-check
echo   python emad-failsafe-cli.py /enable-emad-init-check
echo   python emad-failsafe-cli.py /disable-completion-check
echo   python emad-failsafe-cli.py /enable-completion-check
echo.
echo ============================================
echo 🛡️ Failsafe Features Enabled:
echo ============================================
echo.
echo ✅ Failsafe 1: Uninitialized EMAD Detection
echo    - Detects development without active EMAD
echo    - Prompts for EMAD initialization
echo    - Auto-detects new projects and Git repos
echo.
echo ✅ Failsafe 2: Post-Completion Development Detection
echo    - Detects development after project completion
echo    - Prompts for status clarification
echo    - Suggests feature branches or project reopening
echo.
echo ============================================
echo 📊 System Status:
echo ============================================
echo.
echo The EMAD Auto-Sync system is now running with integrated failsafe protection!
echo.
echo Key Benefits:
echo • Automatic detection of workflow issues
echo • Proactive warnings and guidance
echo • Prevention of development disruptions
echo • Intelligent project status management
echo.
echo The system will:
echo • Monitor file changes continuously
echo • Detect when EMAD isn't running during development
echo • Alert about post-completion development activity
echo • Provide actionable options for resolution
echo.
echo To stop: python emad-background-runner.py stop
echo To check status: python emad-background-runner.py status
echo To manage failsafes: python emad-failsafe-cli.py status
echo.
pause
