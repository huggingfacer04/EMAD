# EMAD Auto-Sync Launcher (PowerShell) - Can be run from anywhere

param(
    [Parameter(Position=0)]
    [ValidateSet("install", "start", "stop", "status", "remove", "debug", "test", "troubleshoot", "create-repo", "")]
    [string]$Command = ""
)

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "🚀 EMAD Auto-Sync Launcher" -ForegroundColor Blue
Write-Host "=========================" -ForegroundColor Blue
Write-Host "Script Directory: $ScriptDir" -ForegroundColor Blue
Write-Host "Current Directory: $(Get-Location)" -ForegroundColor Blue
Write-Host ""

# Change to the script directory
Set-Location -Path $ScriptDir

function Show-Menu {
    Write-Host "Available Commands:" -ForegroundColor Green
    Write-Host ""
    Write-Host "  install       - Install EMAD Auto-Sync Windows Service" -ForegroundColor White
    Write-Host "  start         - Start the service" -ForegroundColor White
    Write-Host "  stop          - Stop the service" -ForegroundColor White
    Write-Host "  status        - Check service status" -ForegroundColor White
    Write-Host "  remove        - Remove the service" -ForegroundColor White
    Write-Host "  debug         - Run service in debug mode (foreground)" -ForegroundColor White
    Write-Host "  test          - Run a single test cycle" -ForegroundColor White
    Write-Host "  troubleshoot  - Run diagnostic tests" -ForegroundColor White
    Write-Host "  create-repo   - Create EMAD repository on GitHub" -ForegroundColor White
    Write-Host ""
    Write-Host "Usage: .\emad-launcher.ps1 [command]" -ForegroundColor Yellow
    Write-Host "Example: .\emad-launcher.ps1 install" -ForegroundColor Yellow
    Write-Host ""
}

function Install-Service {
    Write-Host "🔧 Installing EMAD Auto-Sync Service..." -ForegroundColor Blue
    & "$ScriptDir\install-emad-service.ps1"
}

function Start-Service {
    Write-Host "▶️ Starting EMAD Auto-Sync Service..." -ForegroundColor Green
    python "$ScriptDir\emad-auto-sync-service.py" start
}

function Stop-Service {
    Write-Host "⏹️ Stopping EMAD Auto-Sync Service..." -ForegroundColor Yellow
    python "$ScriptDir\emad-auto-sync-service.py" stop
}

function Get-ServiceStatus {
    Write-Host "📊 EMAD Auto-Sync Service Status:" -ForegroundColor Blue
    python "$ScriptDir\emad-auto-sync-service.py" status
}

function Remove-Service {
    Write-Host "🗑️ Removing EMAD Auto-Sync Service..." -ForegroundColor Red
    python "$ScriptDir\emad-auto-sync-service.py" remove
}

function Debug-Service {
    Write-Host "🐛 Running EMAD Auto-Sync in Debug Mode..." -ForegroundColor Magenta
    python "$ScriptDir\emad-auto-sync-service.py" debug
}

function Test-Service {
    Write-Host "🧪 Running EMAD Auto-Sync Test Cycle..." -ForegroundColor Cyan
    python "$ScriptDir\emad-auto-sync.py" --test
}

function Start-Troubleshoot {
    Write-Host "🔍 Running EMAD Diagnostics..." -ForegroundColor Yellow
    python "$ScriptDir\troubleshoot-emad.py"
}

function Create-Repository {
    Write-Host "🏗️ Creating EMAD Repository..." -ForegroundColor Blue
    Write-Host ""
    Write-Host "Choose repository creation method:" -ForegroundColor Yellow
    Write-Host "  1. Node.js (Recommended)" -ForegroundColor White
    Write-Host "  2. Python" -ForegroundColor White
    Write-Host "  3. Cancel" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter choice (1-3)"
    
    switch ($choice) {
        "1" {
            $jsScript = Join-Path $ScriptDir "create-emad-repository.js"
            if (Test-Path $jsScript) {
                node $jsScript
            } else {
                Write-Host "❌ create-emad-repository.js not found" -ForegroundColor Red
            }
        }
        "2" {
            $pyScript = Join-Path $ScriptDir "create-emad-repository.py"
            if (Test-Path $pyScript) {
                python $pyScript
            } else {
                Write-Host "❌ create-emad-repository.py not found" -ForegroundColor Red
            }
        }
        "3" {
            Write-Host "Operation cancelled" -ForegroundColor Yellow
        }
        default {
            Write-Host "Invalid choice" -ForegroundColor Red
        }
    }
}

# Main execution
switch ($Command) {
    "install" { Install-Service }
    "start" { Start-Service }
    "stop" { Stop-Service }
    "status" { Get-ServiceStatus }
    "remove" { Remove-Service }
    "debug" { Debug-Service }
    "test" { Test-Service }
    "troubleshoot" { Start-Troubleshoot }
    "create-repo" { Create-Repository }
    default { Show-Menu }
}

Write-Host ""
Write-Host "🏁 Operation completed" -ForegroundColor Green

if ($Command -eq "") {
    Read-Host "Press Enter to exit"
}
