@echo off
REM Change to the directory where this batch file is located
cd /d "%~dp0"

echo 🔧 EMAD Auto-Sync Service Installation
echo ====================================
echo Current Directory: %CD%
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ This script must be run as Administrator
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo ✅ Running as Administrator

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

echo ✅ Python is available

REM Check if pywin32 is installed
python -c "import win32serviceutil" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  pywin32 is not installed
    echo Installing pywin32...
    pip install pywin32
    if %errorlevel% neq 0 (
        echo ❌ Failed to install pywin32
        pause
        exit /b 1
    )
    echo ✅ pywin32 installed successfully
) else (
    echo ✅ pywin32 is available
)

REM Check if requests is installed
python -c "import requests" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  requests is not installed
    echo Installing requests...
    pip install requests
    if %errorlevel% neq 0 (
        echo ❌ Failed to install requests
        pause
        exit /b 1
    )
    echo ✅ requests installed successfully
) else (
    echo ✅ requests is available
)

REM Check if required files exist
if not exist "emad-auto-sync-service.py" (
    echo ❌ emad-auto-sync-service.py not found in current directory
    echo Please run this script from the BMAD-METHOD directory
    pause
    exit /b 1
)

if not exist "emad-auto-sync.py" (
    echo ❌ emad-auto-sync.py not found in current directory
    echo Please run this script from the BMAD-METHOD directory
    pause
    exit /b 1
)

echo ✅ Required files found

echo.
echo 🚀 Installing EMAD Auto-Sync Service...

REM Install the service using service manager
python "%CD%\emad-service-manager.py" install
if %errorlevel% neq 0 (
    echo ❌ Service installation failed
    pause
    exit /b 1
)

echo ✅ Service installed successfully

echo.
echo 🎯 Starting EMAD Auto-Sync Service...

REM Start the service using service manager
python "%CD%\emad-service-manager.py" start
if %errorlevel% neq 0 (
    echo ❌ Service start failed
    echo You can start it manually later with:
    echo python "%CD%\emad-service-manager.py" start
) else (
    echo ✅ Service started successfully
)

echo.
echo 📊 Service Status:
python "%CD%\emad-service-manager.py" status

echo.
echo 🎉 EMAD Auto-Sync Service Installation Complete!
echo.
echo Service Management Commands:
echo   Start:   python "%CD%\emad-auto-sync-service.py" start
echo   Stop:    python "%CD%\emad-auto-sync-service.py" stop
echo   Status:  python "%CD%\emad-auto-sync-service.py" status
echo   Remove:  python "%CD%\emad-auto-sync-service.py" remove
echo   Debug:   python "%CD%\emad-auto-sync-service.py" debug
echo.
echo Logs will be available in the 'logs' directory.
echo.
pause
