@echo off
REM BMAD-Augment Integration: Quick Build Script
REM This batch file provides easy access to the PowerShell automation script

echo.
echo ========================================
echo   BMAD-Augment Integration Builder
echo ========================================
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PowerShell is not available or not in PATH
    echo Please ensure PowerShell is installed and accessible
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please run this script from the BMAD-METHOD directory
    pause
    exit /b 1
)

REM Check if the PowerShell script exists
if not exist "build-and-test-integration.ps1" (
    echo ERROR: build-and-test-integration.ps1 not found
    echo Please ensure the PowerShell script is in the same directory
    pause
    exit /b 1
)

echo Choose an option:
echo.
echo 1. Full build and test (recommended)
echo 2. Clean build (removes node_modules and out directories)
echo 3. Build only (skip tests)
echo 4. Package only (create VSIX)
echo 5. Verbose build (detailed output)
echo 6. Quick build (minimal output)
echo.
set /p choice="Enter your choice (1-6): "

echo.
echo Starting build process...
echo.

REM Execute based on choice
if "%choice%"=="1" (
    echo Running full build and test...
    powershell -ExecutionPolicy Bypass -File "build-and-test-integration.ps1"
) else if "%choice%"=="2" (
    echo Running clean build...
    powershell -ExecutionPolicy Bypass -File "build-and-test-integration.ps1" -CleanBuild
) else if "%choice%"=="3" (
    echo Running build only...
    powershell -ExecutionPolicy Bypass -File "build-and-test-integration.ps1" -SkipTests
) else if "%choice%"=="4" (
    echo Creating package only...
    powershell -ExecutionPolicy Bypass -File "build-and-test-integration.ps1" -PackageOnly
) else if "%choice%"=="5" (
    echo Running verbose build...
    powershell -ExecutionPolicy Bypass -File "build-and-test-integration.ps1" -Verbose
) else if "%choice%"=="6" (
    echo Running quick build...
    powershell -ExecutionPolicy Bypass -File "build-and-test-integration.ps1" -SkipTests
) else (
    echo Invalid choice. Running default full build...
    powershell -ExecutionPolicy Bypass -File "build-and-test-integration.ps1"
)

echo.
if %errorlevel% equ 0 (
    echo ========================================
    echo   Build completed successfully!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Restart VS Code or reload window (Ctrl+R)
    echo 2. Open Command Palette (Ctrl+Shift+P)
    echo 3. Search for "BMAD" commands
    echo 4. Try "BMAD: Show Help" to verify functionality
    echo.
) else (
    echo ========================================
    echo   Build failed with errors
    echo ========================================
    echo.
    echo Please check the output above for error details
    echo.
)

echo Press any key to exit...
pause >nul
