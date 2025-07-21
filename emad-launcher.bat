@echo off
REM EMAD Auto-Sync Launcher - Can be run from anywhere
REM This script automatically finds and runs EMAD scripts from the correct directory

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

echo 🚀 EMAD Auto-Sync Launcher
echo =========================
echo Script Directory: %SCRIPT_DIR%
echo Current Directory: %CD%
echo.

REM Change to the script directory
cd /d "%SCRIPT_DIR%"

REM Check what the user wants to do
if "%1"=="" goto :show_menu
if "%1"=="install" goto :install_service
if "%1"=="start" goto :start_service
if "%1"=="stop" goto :stop_service
if "%1"=="status" goto :status_service
if "%1"=="remove" goto :remove_service
if "%1"=="debug" goto :debug_service
if "%1"=="test" goto :test_service
if "%1"=="troubleshoot" goto :troubleshoot
if "%1"=="create-repo" goto :create_repo
if "%1"=="simple" goto :simple_setup
if "%1"=="background" goto :background_runner
goto :show_menu

:show_menu
echo Available Commands:
echo.
echo   simple        - Simple setup (Background Runner - Recommended)
echo   background    - Manage background runner (start/stop/status)
echo   install       - Install EMAD Auto-Sync Windows Service
echo   start         - Start the service
echo   stop          - Stop the service
echo   status        - Check service status
echo   remove        - Remove the service
echo   debug         - Run service in debug mode (foreground)
echo   test          - Run a single test cycle
echo   troubleshoot  - Run diagnostic tests
echo   create-repo   - Create EMAD repository on GitHub
echo.
echo Usage: %~nx0 [command]
echo Example: %~nx0 install
echo.
pause
goto :end

:install_service
echo 🔧 Installing EMAD Auto-Sync Service...
call "%SCRIPT_DIR%\install-emad-service.bat"
goto :end

:start_service
echo ▶️ Starting EMAD Auto-Sync Service...
python "%SCRIPT_DIR%\emad-service-manager.py" start
goto :end

:stop_service
echo ⏹️ Stopping EMAD Auto-Sync Service...
python "%SCRIPT_DIR%\emad-service-manager.py" stop
goto :end

:status_service
echo 📊 EMAD Auto-Sync Service Status:
python "%SCRIPT_DIR%\emad-service-manager.py" status
goto :end

:remove_service
echo 🗑️ Removing EMAD Auto-Sync Service...
python "%SCRIPT_DIR%\emad-service-manager.py" remove
goto :end

:debug_service
echo 🐛 Running EMAD Auto-Sync in Debug Mode...
python "%SCRIPT_DIR%\emad-auto-sync-service.py" debug
goto :end

:test_service
echo 🧪 Running EMAD Auto-Sync Test Cycle...
python "%SCRIPT_DIR%\emad-auto-sync.py" --test
goto :end

:troubleshoot
echo 🔍 Running EMAD Diagnostics...
python "%SCRIPT_DIR%\troubleshoot-emad.py"
goto :end

:create_repo
echo 🏗️ Creating EMAD Repository...
echo.
echo Choose repository creation method:
echo   1. Node.js (Recommended)
echo   2. Python
echo   3. Cancel
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    if exist "%SCRIPT_DIR%\create-emad-repository.js" (
        node "%SCRIPT_DIR%\create-emad-repository.js"
    ) else (
        echo ❌ create-emad-repository.js not found
    )
) else if "%choice%"=="2" (
    if exist "%SCRIPT_DIR%\create-emad-repository.py" (
        python "%SCRIPT_DIR%\create-emad-repository.py"
    ) else (
        echo ❌ create-emad-repository.py not found
    )
) else (
    echo Operation cancelled
)
goto :end

:simple_setup
echo 🚀 Running Simple EMAD Setup...
call "%SCRIPT_DIR%\setup-emad-simple.bat"
goto :end

:background_runner
echo 🔧 EMAD Background Runner Management
echo.
echo Available commands:
echo   1. Start background runner
echo   2. Stop background runner
echo   3. Check status
echo   4. Restart background runner
echo   5. Back to main menu
echo.
set /p bg_choice="Enter choice (1-5): "

if "%bg_choice%"=="1" (
    python "%SCRIPT_DIR%\emad-background-runner.py" start
) else if "%bg_choice%"=="2" (
    python "%SCRIPT_DIR%\emad-background-runner.py" stop
) else if "%bg_choice%"=="3" (
    python "%SCRIPT_DIR%\emad-background-runner.py" status
) else if "%bg_choice%"=="4" (
    python "%SCRIPT_DIR%\emad-background-runner.py" restart
) else if "%bg_choice%"=="5" (
    goto :show_menu
) else (
    echo Invalid choice
)
goto :end

:end
echo.
echo 🏁 Operation completed
if "%1"=="" pause
endlocal
