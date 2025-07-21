# PowerShell script to find VS Code installation
Write-Host "Searching for VS Code installation..." -ForegroundColor Cyan

# Expand the username properly
$username = $env:USERNAME
Write-Host "Username: $username" -ForegroundColor Gray

# Common VS Code installation paths
$vscodePathsToTry = @(
    "C:\Users\$username\AppData\Local\Programs\Microsoft VS Code\Code.exe",
    "C:\Program Files\Microsoft VS Code\Code.exe",
    "C:\Program Files (x86)\Microsoft VS Code\Code.exe",
    "C:\Users\$username\AppData\Local\Programs\Microsoft VS Code Insiders\Code - Insiders.exe"
)

Write-Host "Checking common installation paths:" -ForegroundColor Yellow

$foundPaths = @()

foreach ($path in $vscodePathsToTry) {
    Write-Host "   Checking: $path" -ForegroundColor Gray
    if (Test-Path $path) {
        Write-Host "   FOUND!" -ForegroundColor Green
        $foundPaths += $path
    } else {
        Write-Host "   Not found" -ForegroundColor Red
    }
}

if ($foundPaths.Count -gt 0) {
    Write-Host "VS Code found at:" -ForegroundColor Green
    foreach ($path in $foundPaths) {
        Write-Host "   $path" -ForegroundColor Green
    }
    
    $vscodePath = $foundPaths[0]
    Write-Host "Using: $vscodePath" -ForegroundColor Cyan
    
    # Test if we can launch it
    Write-Host "Compiling extension first..." -ForegroundColor Yellow
    npm run compile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Compilation successful!" -ForegroundColor Green
        Write-Host "Launching Extension Development Host..." -ForegroundColor Cyan
        
        # Launch VS Code with extension development path
        $currentPath = Get-Location
        Start-Process -FilePath $vscodePath -ArgumentList "--extensionDevelopmentPath=`"$currentPath`""
        
        Write-Host "Extension Development Host should be launching!" -ForegroundColor Green
    } else {
        Write-Host "Compilation failed" -ForegroundColor Red
    }
} else {
    Write-Host "VS Code not found in common locations" -ForegroundColor Red
    Write-Host "Alternative methods:" -ForegroundColor Yellow
    Write-Host "   1. Open VS Code manually and press F5" -ForegroundColor Gray
    Write-Host "   2. Use VS Code's Run and Debug panel" -ForegroundColor Gray
    Write-Host "   3. Search for Code.exe in your system" -ForegroundColor Gray
    
    # Try to find VS Code using Get-Command
    Write-Host "Searching system PATH..." -ForegroundColor Yellow
    try {
        $codeCommand = Get-Command code -ErrorAction Stop
        Write-Host "Found 'code' command at: $($codeCommand.Source)" -ForegroundColor Green
        
        Write-Host "Trying to launch with system PATH..." -ForegroundColor Cyan
        $currentPath = Get-Location
        & code --extensionDevelopmentPath="$currentPath"
    } catch {
        Write-Host "'code' command not found in PATH" -ForegroundColor Red
    }
}
