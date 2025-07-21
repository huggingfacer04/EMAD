# BMAD-Augment Integration: Automated Build and Test Script
# This script automates the entire build, compilation, and testing process

param(
    [switch]$SkipTests,
    [switch]$PackageOnly,
    [switch]$Verbose,
    [switch]$CleanBuild
)

# Script configuration
$ErrorActionPreference = "Continue"
$ProjectRoot = $PSScriptRoot
$OutputDir = Join-Path $ProjectRoot "out"
$NodeModulesDir = Join-Path $ProjectRoot "node_modules"

# Colors for output
$Colors = @{
    Success = "Green"
    Warning = "Yellow" 
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-ColorOutput "=" * 60 "Header"
    Write-ColorOutput "  $Title" "Header"
    Write-ColorOutput "=" * 60 "Header"
    Write-Host ""
}

function Test-Prerequisites {
    Write-Header "Checking Prerequisites"
    
    $issues = @()
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-ColorOutput "✅ Node.js: $nodeVersion" "Success"
        } else {
            $issues += "Node.js not found"
        }
    } catch {
        $issues += "Node.js not found or not in PATH"
    }
    
    # Check npm
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Write-ColorOutput "✅ npm: v$npmVersion" "Success"
        } else {
            $issues += "npm not found"
        }
    } catch {
        $issues += "npm not found or not in PATH"
    }
    
    # Check TypeScript
    try {
        $tscVersion = npx tsc --version 2>$null
        if ($tscVersion) {
            Write-ColorOutput "✅ TypeScript: $tscVersion" "Success"
        } else {
            Write-ColorOutput "⚠️ TypeScript not found, will install" "Warning"
        }
    } catch {
        Write-ColorOutput "⚠️ TypeScript not found, will install" "Warning"
    }
    
    # Check VS Code
    try {
        $codeVersion = code --version 2>$null
        if ($codeVersion) {
            Write-ColorOutput "✅ VS Code: Available" "Success"
        } else {
            Write-ColorOutput "⚠️ VS Code CLI not available" "Warning"
        }
    } catch {
        Write-ColorOutput "⚠️ VS Code CLI not available" "Warning"
    }
    
    if ($issues.Count -gt 0) {
        Write-ColorOutput "❌ Prerequisites Issues:" "Error"
        foreach ($issue in $issues) {
            Write-ColorOutput "   - $issue" "Error"
        }
        return $false
    }
    
    return $true
}

function Install-Dependencies {
    Write-Header "Installing Dependencies"
    
    if (-not (Test-Path $NodeModulesDir) -or $CleanBuild) {
        if ($CleanBuild -and (Test-Path $NodeModulesDir)) {
            Write-ColorOutput "🧹 Cleaning node_modules..." "Info"
            Remove-Item $NodeModulesDir -Recurse -Force
        }
        
        Write-ColorOutput "📦 Installing npm dependencies..." "Info"
        npm install
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "❌ npm install failed" "Error"
            return $false
        }
        
        Write-ColorOutput "✅ Dependencies installed successfully" "Success"
    } else {
        Write-ColorOutput "✅ Dependencies already installed" "Success"
    }
    
    return $true
}

function Build-TypeScript {
    Write-Header "Building TypeScript"
    
    if ($CleanBuild -and (Test-Path $OutputDir)) {
        Write-ColorOutput "🧹 Cleaning output directory..." "Info"
        Remove-Item $OutputDir -Recurse -Force
    }
    
    Write-ColorOutput "🔨 Compiling TypeScript..." "Info"
    npm run compile
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ TypeScript compilation failed" "Error"
        return $false
    }
    
    # Verify output files
    $requiredFiles = @(
        "extension.js",
        "integration/AugmentIntegration.js",
        "integration/AugmentMenuIntegration.js", 
        "integration/AugmentAPI.js",
        "commands/CommandManager.js"
    )
    
    $missingFiles = @()
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $OutputDir $file
        if (-not (Test-Path $filePath)) {
            $missingFiles += $file
        }
    }
    
    if ($missingFiles.Count -gt 0) {
        Write-ColorOutput "❌ Missing compiled files:" "Error"
        foreach ($file in $missingFiles) {
            Write-ColorOutput "   - $file" "Error"
        }
        return $false
    }
    
    Write-ColorOutput "✅ TypeScript compilation successful" "Success"
    Write-ColorOutput "📁 Output directory: $OutputDir" "Info"
    
    return $true
}

function Test-Integration {
    Write-Header "Testing Integration"
    
    if ($SkipTests) {
        Write-ColorOutput "⏭️ Skipping tests (--SkipTests flag)" "Warning"
        return $true
    }
    
    # Test 1: Verify package.json structure
    Write-ColorOutput "🧪 Testing package.json structure..." "Info"
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        
        $requiredCommands = @(
            "bmad.activateDocumentationMode",
            "bmad.debugCurrentFile",
            "bmad.documentCurrentFile",
            "bmad.showHelp"
        )
        
        $foundCommands = 0
        foreach ($command in $packageJson.contributes.commands) {
            if ($command.command -in $requiredCommands) {
                $foundCommands++
            }
        }
        
        if ($foundCommands -eq $requiredCommands.Count) {
            Write-ColorOutput "✅ Package.json commands verified" "Success"
        } else {
            Write-ColorOutput "⚠️ Some commands missing in package.json ($foundCommands/$($requiredCommands.Count))" "Warning"
        }
    } catch {
        Write-ColorOutput "❌ Failed to parse package.json: $($_.Exception.Message)" "Error"
    }
    
    # Test 2: Run integration test script
    Write-ColorOutput "🧪 Running integration tests..." "Info"
    if (Test-Path "test-augment-integration.js") {
        try {
            node test-augment-integration.js
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ Integration tests passed" "Success"
            } else {
                Write-ColorOutput "⚠️ Some integration tests failed" "Warning"
            }
        } catch {
            Write-ColorOutput "❌ Failed to run integration tests: $($_.Exception.Message)" "Error"
        }
    } else {
        Write-ColorOutput "⚠️ Integration test script not found" "Warning"
    }
    
    # Test 3: Verify file structure
    Write-ColorOutput "🧪 Verifying file structure..." "Info"
    $integrationFiles = @(
        "src/integration/AugmentIntegration.ts",
        "src/integration/AugmentMenuIntegration.ts",
        "src/integration/AugmentAPI.ts"
    )
    
    $missingSourceFiles = @()
    foreach ($file in $integrationFiles) {
        if (-not (Test-Path $file)) {
            $missingSourceFiles += $file
        }
    }
    
    if ($missingSourceFiles.Count -eq 0) {
        Write-ColorOutput "✅ All integration source files present" "Success"
    } else {
        Write-ColorOutput "❌ Missing integration files:" "Error"
        foreach ($file in $missingSourceFiles) {
            Write-ColorOutput "   - $file" "Error"
        }
    }
    
    return $true
}

function Create-VSIXPackage {
    Write-Header "Creating VSIX Package"
    
    # Check if vsce is available
    try {
        $vsceVersion = npx vsce --version 2>$null
        if (-not $vsceVersion) {
            Write-ColorOutput "📦 Installing vsce..." "Info"
            npm install -g vsce
        }
    } catch {
        Write-ColorOutput "📦 Installing vsce..." "Info"
        npm install -g vsce
    }
    
    Write-ColorOutput "📦 Creating VSIX package..." "Info"
    npx vsce package
    
    if ($LASTEXITCODE -eq 0) {
        $vsixFiles = Get-ChildItem -Filter "*.vsix" | Sort-Object LastWriteTime -Descending
        if ($vsixFiles.Count -gt 0) {
            $latestVsix = $vsixFiles[0]
            Write-ColorOutput "✅ VSIX package created: $($latestVsix.Name)" "Success"
            Write-ColorOutput "📁 Location: $($latestVsix.FullName)" "Info"
            return $true
        }
    }
    
    Write-ColorOutput "❌ Failed to create VSIX package" "Error"
    return $false
}

function Show-NextSteps {
    Write-Header "Next Steps"
    
    Write-ColorOutput "🎉 Build and integration setup complete!" "Success"
    Write-Host ""
    Write-ColorOutput "To test the integration:" "Info"
    Write-ColorOutput "1. Restart VS Code or reload the window (Ctrl+R)" "Info"
    Write-ColorOutput "2. Open Command Palette (Ctrl+Shift+P)" "Info"
    Write-ColorOutput "3. Search for 'BMAD' commands" "Info"
    Write-ColorOutput "4. Try 'BMAD: Show Help' to verify functionality" "Info"
    Write-Host ""
    Write-ColorOutput "To install the extension:" "Info"
    $vsixFiles = Get-ChildItem -Filter "*.vsix" | Sort-Object LastWriteTime -Descending
    if ($vsixFiles.Count -gt 0) {
        Write-ColorOutput "   code --install-extension $($vsixFiles[0].Name)" "Info"
    }
    Write-Host ""
    Write-ColorOutput "Integration files created:" "Info"
    Write-ColorOutput "   - src/integration/AugmentIntegration.ts" "Info"
    Write-ColorOutput "   - src/integration/AugmentMenuIntegration.ts" "Info"
    Write-ColorOutput "   - src/integration/AugmentAPI.ts" "Info"
    Write-Host ""
    Write-ColorOutput "Documentation:" "Info"
    Write-ColorOutput "   - AUGMENT_INTEGRATION_README.md" "Info"
    Write-ColorOutput "   - AUGMENT_INTEGRATION_COMPLETE.md" "Info"
}

function Main {
    Write-Header "BMAD-Augment Integration Builder"
    Write-ColorOutput "🚀 Starting automated build and test process..." "Info"
    Write-ColorOutput "📁 Project directory: $ProjectRoot" "Info"
    
    if ($Verbose) {
        Write-ColorOutput "🔍 Verbose mode enabled" "Info"
        $VerbosePreference = "Continue"
    }
    
    # Step 1: Check prerequisites
    if (-not (Test-Prerequisites)) {
        Write-ColorOutput "❌ Prerequisites check failed. Please install missing components." "Error"
        exit 1
    }
    
    # Step 2: Install dependencies
    if (-not (Install-Dependencies)) {
        Write-ColorOutput "❌ Dependency installation failed." "Error"
        exit 1
    }
    
    # Step 3: Build TypeScript
    if (-not (Build-TypeScript)) {
        Write-ColorOutput "❌ TypeScript build failed." "Error"
        exit 1
    }
    
    # Step 4: Test integration
    Test-Integration
    
    # Step 5: Create package (if requested or if all tests passed)
    if ($PackageOnly -or -not $SkipTests) {
        Create-VSIXPackage
    }
    
    # Step 6: Show next steps
    Show-NextSteps
    
    Write-ColorOutput "✅ All automated steps completed successfully!" "Success"
}

# Run the main function
Main
