# EMAD Auto-Sync Service Installation (PowerShell)

param(
    [switch]$Force,
    [switch]$Debug
)

# Change to the directory where this script is located
Set-Location -Path $PSScriptRoot

Write-Host "🔧 EMAD Auto-Sync Service Installation" -ForegroundColor Blue
Write-Host "====================================" -ForegroundColor Blue
Write-Host "Current Directory: $(Get-Location)" -ForegroundColor Blue
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "❌ This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python is available: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://python.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Function to check if Python package is installed
function Test-PythonPackage {
    param([string]$PackageName)
    
    try {
        python -c "import $PackageName" 2>$null
        return $true
    } catch {
        return $false
    }
}

# Function to install Python package
function Install-PythonPackage {
    param([string]$PackageName)
    
    Write-Host "⚠️  $PackageName is not installed" -ForegroundColor Yellow
    Write-Host "Installing $PackageName..." -ForegroundColor Blue
    
    try {
        pip install $PackageName
        Write-Host "✅ $PackageName installed successfully" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Failed to install $PackageName" -ForegroundColor Red
        return $false
    }
}

# Check and install required packages
$requiredPackages = @("win32serviceutil", "requests")

# Check if required files exist
$requiredFiles = @("emad-auto-sync-service.py", "emad-auto-sync.py", "emad_auto_sync.py")

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ $file not found in current directory" -ForegroundColor Red
        Write-Host "Please run this script from the BMAD-METHOD directory" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "✅ Required files found" -ForegroundColor Green

foreach ($package in $requiredPackages) {
    if (-not (Test-PythonPackage $package)) {
        if ($package -eq "win32serviceutil") {
            $packageName = "pywin32"
        } else {
            $packageName = $package
        }

        if (-not (Install-PythonPackage $packageName)) {
            Read-Host "Press Enter to exit"
            exit 1
        }
    } else {
        Write-Host "✅ $package is available" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🚀 Installing EMAD Auto-Sync Service..." -ForegroundColor Blue

# Install the service using full path
$servicePath = Join-Path (Get-Location) "emad-auto-sync-service.py"
try {
    python $servicePath install
    Write-Host "✅ Service installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Service installation failed: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🎯 Starting EMAD Auto-Sync Service..." -ForegroundColor Blue

# Start the service
try {
    python $servicePath start
    Write-Host "✅ Service started successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Service start failed: $_" -ForegroundColor Red
    Write-Host "You can start it manually later with:" -ForegroundColor Yellow
    Write-Host "python `"$servicePath`" start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Blue
try {
    python $servicePath status
} catch {
    Write-Host "Could not retrieve service status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 EMAD Auto-Sync Service Installation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Service Management Commands:" -ForegroundColor Blue
Write-Host "  Start:   python emad-auto-sync-service.py start" -ForegroundColor White
Write-Host "  Stop:    python emad-auto-sync-service.py stop" -ForegroundColor White
Write-Host "  Status:  python emad-auto-sync-service.py status" -ForegroundColor White
Write-Host "  Remove:  python emad-auto-sync-service.py remove" -ForegroundColor White
Write-Host "  Debug:   python emad-auto-sync-service.py debug" -ForegroundColor White
Write-Host ""
Write-Host "Logs will be available in the 'logs' directory." -ForegroundColor Blue
Write-Host ""

if ($Debug) {
    Write-Host "🐛 Debug mode requested - running service in debug mode..." -ForegroundColor Yellow
    python emad-auto-sync-service.py debug
} else {
    Read-Host "Press Enter to exit"
}
