# PowerShell script to launch BMAD VS Code Extension in development mode
Write-Host "🚀 Launching BMAD VS Code Extension..." -ForegroundColor Cyan

# Common VS Code installation paths
$vscodePathsToTry = @(
    "$env:LOCALAPPDATA\Programs\Microsoft VS Code\Code.exe",
    "$env:PROGRAMFILES\Microsoft VS Code\Code.exe",
    "$env:PROGRAMFILES(X86)\Microsoft VS Code\Code.exe",
    "$env:USERPROFILE\AppData\Local\Programs\Microsoft VS Code\Code.exe"
)

$vscodePath = $null

# Find VS Code installation
foreach ($path in $vscodePathsToTry) {
    if (Test-Path $path) {
        $vscodePath = $path
        Write-Host "✅ Found VS Code at: $path" -ForegroundColor Green
        break
    }
}

if ($vscodePath) {
    # Ensure extension is compiled
    Write-Host "📦 Ensuring extension is compiled..." -ForegroundColor Yellow
    npm run compile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Extension compiled successfully" -ForegroundColor Green
        
        # Launch VS Code with extension development path
        Write-Host "🚀 Launching Extension Development Host..." -ForegroundColor Cyan
        & $vscodePath --extensionDevelopmentPath="$PWD"
        
        Write-Host "✅ Extension Development Host launched!" -ForegroundColor Green
        Write-Host "📋 In the new VS Code window:" -ForegroundColor Yellow
        Write-Host "   • Press Ctrl+Shift+P and type 'BMAD' to see commands" -ForegroundColor Gray
        Write-Host "   • Check status bar for BMAD indicators" -ForegroundColor Gray
        Write-Host "   • Open a project folder to test workspace analysis" -ForegroundColor Gray
    } else {
        Write-Host "❌ Extension compilation failed" -ForegroundColor Red
        Write-Host "💡 Try running: npm run compile" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ VS Code not found in common locations" -ForegroundColor Red
    Write-Host "💡 Try one of these alternatives:" -ForegroundColor Yellow
    Write-Host "   1. Press F5 in VS Code (if you have the project open)" -ForegroundColor Gray
    Write-Host "   2. Use Run and Debug panel in VS Code" -ForegroundColor Gray
    Write-Host "   3. Install VS Code from: https://code.visualstudio.com/" -ForegroundColor Gray
}
