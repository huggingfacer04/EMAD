# BMAD Extension Installation Script
# Installs the BMAD AI Agent Orchestrator extension with Dakota agent

Write-Host "🚀 BMAD Extension Installation Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Get the current directory
$extensionPath = Get-Location

Write-Host "📁 Extension path: $extensionPath" -ForegroundColor Green

# Step 1: Compile the extension
Write-Host "🔨 Step 1: Compiling TypeScript..." -ForegroundColor Yellow
try {
    npm run compile
    Write-Host "✅ Compilation successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Compilation failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Check if VS Code is installed
Write-Host "🔍 Step 2: Checking VS Code installation..." -ForegroundColor Yellow
$vscodePath = Get-Command code -ErrorAction SilentlyContinue
if ($vscodePath) {
    Write-Host "✅ VS Code found: $($vscodePath.Source)" -ForegroundColor Green
} else {
    Write-Host "❌ VS Code 'code' command not found in PATH" -ForegroundColor Red
    Write-Host "Please install VS Code and ensure 'code' command is available" -ForegroundColor Red
    exit 1
}

# Step 3: Install the extension
Write-Host "📦 Step 3: Installing BMAD extension..." -ForegroundColor Yellow
try {
    # Method 1: Install from folder
    Write-Host "Installing extension from folder..." -ForegroundColor Cyan
    & code --install-extension $extensionPath --force
    
    Write-Host "✅ Extension installation command executed" -ForegroundColor Green
} catch {
    Write-Host "❌ Extension installation failed: $_" -ForegroundColor Red
    
    # Try alternative method
    Write-Host "🔄 Trying alternative installation method..." -ForegroundColor Yellow
    try {
        # Check if vsce is installed
        $vsceInstalled = Get-Command vsce -ErrorAction SilentlyContinue
        if (-not $vsceInstalled) {
            Write-Host "Installing vsce..." -ForegroundColor Cyan
            npm install -g vsce
        }
        
        # Package the extension
        Write-Host "Packaging extension..." -ForegroundColor Cyan
        vsce package --out bmad-extension.vsix
        
        # Install the packaged extension
        Write-Host "Installing packaged extension..." -ForegroundColor Cyan
        & code --install-extension bmad-extension.vsix --force
        
        Write-Host "✅ Alternative installation successful" -ForegroundColor Green
    } catch {
        Write-Host "❌ Alternative installation also failed: $_" -ForegroundColor Red
    }
}

# Step 4: Verify installation
Write-Host "🔍 Step 4: Verifying installation..." -ForegroundColor Yellow
Write-Host "Please follow these steps to verify:" -ForegroundColor Cyan
Write-Host "1. Restart VS Code completely" -ForegroundColor White
Write-Host "2. Open Command Palette (Ctrl+Shift+P)" -ForegroundColor White
Write-Host "3. Search for 'Dakota' - you should see Dakota commands" -ForegroundColor White
Write-Host "4. Try: 'Dakota: Dependency Audit'" -ForegroundColor White

# Step 5: Augment integration check
Write-Host ""
Write-Host "🟣 Step 5: Augment Integration Check..." -ForegroundColor Yellow
Write-Host "For purple BMAD buttons in Augment:" -ForegroundColor Cyan
Write-Host "1. Ensure Augment Code extension is installed" -ForegroundColor White
Write-Host "2. Look for BMAD workflows in Augment interface" -ForegroundColor White
Write-Host "3. Check for purple-themed Dakota options" -ForegroundColor White

# Step 6: Troubleshooting
Write-Host ""
Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
Write-Host "If commands don't appear:" -ForegroundColor Cyan
Write-Host "• Check Extensions panel for 'BMAD AI Agent Orchestrator'" -ForegroundColor White
Write-Host "• Enable the extension if disabled" -ForegroundColor White
Write-Host "• Check Developer Console (Help > Toggle Developer Tools)" -ForegroundColor White
Write-Host "• Try 'Developer: Reload Window' command" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Installation script complete!" -ForegroundColor Green
Write-Host "Dakota agent should now be available in VS Code" -ForegroundColor Green

# Optional: Open VS Code
$openVSCode = Read-Host "Would you like to open VS Code now? (y/n)"
if ($openVSCode -eq "y" -or $openVSCode -eq "Y") {
    Write-Host "🚀 Opening VS Code..." -ForegroundColor Cyan
    & code .
}
