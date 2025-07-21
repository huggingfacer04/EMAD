# EMAD Universal Installation Script for Windows PowerShell
# Usage: powershell -ExecutionPolicy Bypass -c "iwr https://raw.githubusercontent.com/huggingfacer04/EMAD/main/install.ps1 | iex"

param(
    [string]$InstallDir = "$env:USERPROFILE\.emad",
    [switch]$Force,
    [switch]$Quiet
)

# Configuration
$EMADRepo = "https://github.com/huggingfacer04/EMAD"
$EMADRawBase = "https://raw.githubusercontent.com/huggingfacer04/EMAD/main"
$PythonMinVersion = [Version]"3.7"
$LogFile = "$env:TEMP\emad-install.log"

# Error handling
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Logging functions
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "$timestamp - [$Level] $Message"
    Add-Content -Path $LogFile -Value $logMessage
    
    switch ($Level) {
        "INFO" { Write-Host "ℹ️  $Message" -ForegroundColor Blue }
        "SUCCESS" { Write-Host "✅ $Message" -ForegroundColor Green }
        "WARNING" { Write-Host "⚠️  $Message" -ForegroundColor Yellow }
        "ERROR" { Write-Host "❌ $Message" -ForegroundColor Red }
    }
}

function Write-Header {
    param([string]$Title)
    Write-Host "`n🚀 $Title" -ForegroundColor Magenta
    Write-Host ("=" * 60) -ForegroundColor Magenta
}

# System detection
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-ExecutionPolicy {
    $policy = Get-ExecutionPolicy
    if ($policy -eq "Restricted") {
        Write-Log "PowerShell execution policy is Restricted" "WARNING"
        Write-Log "Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" "INFO"
        return $false
    }
    return $true
}

# Check prerequisites
function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    # Check PowerShell version
    if ($PSVersionTable.PSVersion -lt [Version]"5.1") {
        Write-Log "PowerShell 5.1 or higher is required" "ERROR"
        return $false
    }
    
    # Check execution policy
    if (-not (Test-ExecutionPolicy)) {
        return $false
    }
    
    # Check for Git
    try {
        git --version | Out-Null
        Write-Log "Git is available" "SUCCESS"
    } catch {
        Write-Log "Git is required but not found" "ERROR"
        Write-Log "Download from: https://git-scm.com/download/win" "INFO"
        return $false
    }
    
    Write-Log "All prerequisites met" "SUCCESS"
    return $true
}

# Check Python installation
function Test-Python {
    Write-Log "Checking Python installation..."
    
    $pythonCommands = @("python", "python3", "py")
    $pythonCmd = $null
    
    foreach ($cmd in $pythonCommands) {
        try {
            $version = & $cmd --version 2>$null
            if ($version -match "Python (\d+\.\d+\.\d+)") {
                $pythonVersion = [Version]$matches[1]
                if ($pythonVersion -ge $PythonMinVersion) {
                    $pythonCmd = $cmd
                    Write-Log "Found Python $pythonVersion using command: $cmd" "SUCCESS"
                    break
                }
            }
        } catch {
            continue
        }
    }
    
    if (-not $pythonCmd) {
        Write-Log "Python $PythonMinVersion or higher is required" "ERROR"
        Write-Log "Download from: https://python.org/downloads/" "INFO"
        return $null
    }
    
    return $pythonCmd
}

# Install Python dependencies
function Install-PythonDependencies {
    param([string]$PythonCmd)
    
    Write-Log "Installing Python dependencies..."
    
    $dependencies = @("requests", "psutil")
    
    foreach ($dep in $dependencies) {
        try {
            & $PythonCmd -c "import $dep" 2>$null
            Write-Log "$dep already installed" "SUCCESS"
        } catch {
            Write-Log "Installing $dep..."
            try {
                & $PythonCmd -m pip install --user $dep
                Write-Log "$dep installed successfully" "SUCCESS"
            } catch {
                Write-Log "Failed to install $dep" "ERROR"
                return $false
            }
        }
    }
    
    Write-Log "All Python dependencies installed" "SUCCESS"
    return $true
}

# Download EMAD system
function Install-EMADSystem {
    Write-Log "Downloading EMAD system..."
    
    # Create EMAD directory
    if (Test-Path $InstallDir) {
        if ($Force) {
            Remove-Item $InstallDir -Recurse -Force
        } else {
            Write-Log "EMAD directory already exists. Use -Force to overwrite" "WARNING"
            $response = Read-Host "Update existing installation? (y/N)"
            if ($response -ne "y") {
                return $false
            }
        }
    }
    
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    Set-Location $InstallDir
    
    # Clone repository
    try {
        if (Test-Path ".git") {
            Write-Log "Updating existing EMAD installation..."
            git pull origin main
        } else {
            Write-Log "Cloning EMAD repository..."
            git clone $EMADRepo .
        }
        Write-Log "EMAD system downloaded to $InstallDir" "SUCCESS"
        return $true
    } catch {
        Write-Log "Failed to download EMAD system: $_" "ERROR"
        return $false
    }
}

# Detect project type
function Get-ProjectType {
    param([string]$ProjectDir = (Get-Location).Path)
    
    if (Test-Path "$ProjectDir\package.json") { return "nodejs" }
    elseif (Test-Path "$ProjectDir\requirements.txt") { return "python" }
    elseif (Test-Path "$ProjectDir\setup.py") { return "python" }
    elseif (Test-Path "$ProjectDir\pyproject.toml") { return "python" }
    elseif (Test-Path "$ProjectDir\Cargo.toml") { return "rust" }
    elseif (Test-Path "$ProjectDir\pom.xml") { return "java" }
    elseif (Test-Path "$ProjectDir\build.gradle") { return "java" }
    elseif (Test-Path "$ProjectDir\go.mod") { return "go" }
    elseif (Test-Path "$ProjectDir\composer.json") { return "php" }
    elseif (Test-Path "$ProjectDir\Gemfile") { return "ruby" }
    else { return "generic" }
}

# Interactive setup
function Start-InteractiveSetup {
    Write-Header "EMAD Interactive Setup"
    
    # GitHub token
    Write-Host "Please enter your GitHub Personal Access Token:" -ForegroundColor Cyan
    Write-Host "You can create one at: https://github.com/settings/tokens"
    Write-Host "Required scopes: repo, workflow"
    $githubToken = Read-Host "GitHub Token" -AsSecureString
    $githubTokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($githubToken))
    
    if ([string]::IsNullOrEmpty($githubTokenPlain)) {
        Write-Log "GitHub token is required" "ERROR"
        return $null
    }
    
    # Validate token
    Write-Log "Validating GitHub token..."
    try {
        $headers = @{ Authorization = "Bearer $githubTokenPlain" }
        $user = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
        Write-Log "GitHub token validated for user: $($user.login)" "SUCCESS"
    } catch {
        Write-Log "Invalid GitHub token" "ERROR"
        return $null
    }
    
    # Repository name
    $repoName = Read-Host "Enter target repository name (default: EMAD-Project)"
    if ([string]::IsNullOrEmpty($repoName)) { $repoName = "EMAD-Project" }
    
    # Sync frequency
    Write-Host "Select sync frequency:" -ForegroundColor Cyan
    Write-Host "1) Hourly (recommended)"
    Write-Host "2) Every 30 minutes"
    Write-Host "3) Every 15 minutes"
    Write-Host "4) On file change"
    $syncChoice = Read-Host "Choice (1-4)"
    
    $syncInterval = switch ($syncChoice) {
        "1" { 3600 }
        "2" { 1800 }
        "3" { 900 }
        "4" { 300 }
        default { 3600 }
    }
    
    # Failsafe sensitivity
    Write-Host "Select failsafe sensitivity:" -ForegroundColor Cyan
    Write-Host "1) Strict (recommended for critical projects)"
    Write-Host "2) Balanced (recommended for most projects)"
    Write-Host "3) Permissive (minimal interruptions)"
    $failsafeChoice = Read-Host "Choice (1-3)"
    
    $failsafeSensitivity = switch ($failsafeChoice) {
        "1" { "strict" }
        "2" { "balanced" }
        "3" { "permissive" }
        default { "balanced" }
    }
    
    # Detect project type
    $projectType = Get-ProjectType
    Write-Log "Detected project type: $projectType" "INFO"
    
    return @{
        GitHubToken = $githubTokenPlain
        RepositoryName = $repoName
        SyncInterval = $syncInterval
        FailsafeSensitivity = $failsafeSensitivity
        ProjectType = $projectType
        Username = $user.login
    }
}

# Generate configuration files
function New-ConfigurationFiles {
    param([hashtable]$Config)
    
    Write-Log "Generating configuration files..."
    
    $configDir = Join-Path $InstallDir "config"
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    
    # User configuration
    $userConfig = @{
        github = @{
            token = $Config.GitHubToken
            username = $Config.Username
            repository = $Config.RepositoryName
        }
        sync = @{
            interval_seconds = $Config.SyncInterval
            auto_start = $true
            create_repo_if_missing = $true
        }
        project = @{
            type = $Config.ProjectType
            root_directory = (Get-Location).Path
        }
    }
    
    $userConfig | ConvertTo-Json -Depth 3 | Out-File -FilePath "$configDir\emad-user-config.json" -Encoding UTF8
    
    # Project-specific configuration
    $projectConfig = @{
        monitoring = @{
            include_patterns = @("**/*.py", "**/*.js", "**/*.ts", "**/*.json", "**/*.md", "**/*.yml", "**/*.yaml")
            exclude_patterns = @(".git/**", "node_modules/**", "__pycache__/**", "*.log", "*.tmp")
            watch_directories = @("src", "lib", "docs", ".")
            ignore_hidden_files = $true
        }
        project_type = $Config.ProjectType
        failsafe = @{
            sensitivity = $Config.FailsafeSensitivity
        }
    }
    
    $projectConfig | ConvertTo-Json -Depth 3 | Out-File -FilePath "$configDir\emad-project-config.json" -Encoding UTF8
    
    Write-Log "Configuration files generated" "SUCCESS"
}

# Setup EMAD commands
function Install-EMADCommands {
    Write-Log "Setting up EMAD commands..."
    
    $binDir = "$env:USERPROFILE\.local\bin"
    New-Item -ItemType Directory -Path $binDir -Force | Out-Null
    
    # Create emad.bat command
    $emadBat = @"
@echo off
cd /d "$InstallDir"
python emad-cli.py %*
"@
    
    $emadBat | Out-File -FilePath "$binDir\emad.bat" -Encoding ASCII
    
    # Add to PATH if not already there
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($currentPath -notlike "*$binDir*") {
        $newPath = "$currentPath;$binDir"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
        $env:PATH = "$env:PATH;$binDir"
        Write-Log "Added EMAD commands to PATH" "SUCCESS"
    }
    
    Write-Log "EMAD commands installed" "SUCCESS"
}

# Start EMAD system
function Start-EMADSystem {
    param([hashtable]$Config)
    
    Write-Log "Starting EMAD system..."
    
    Set-Location $InstallDir
    
    # Update configuration in existing scripts
    if (Test-Path "emad-auto-sync.py") {
        $content = Get-Content "emad-auto-sync.py" -Raw
        $content = $content -replace "GITHUB_TOKEN = .*", "GITHUB_TOKEN = '$($Config.GitHubToken)'"
        $content = $content -replace "REPO_NAME = .*", "REPO_NAME = '$($Config.RepositoryName)'"
        $content | Out-File "emad-auto-sync.py" -Encoding UTF8
    }
    
    # Start background runner
    try {
        $pythonCmd = Test-Python
        & $pythonCmd emad-background-runner.py start
        Write-Log "EMAD background runner started" "SUCCESS"
    } catch {
        Write-Log "Failed to start background runner: $_" "WARNING"
    }
    
    Write-Log "EMAD system initialized" "SUCCESS"
}

# Verification
function Test-Installation {
    param([hashtable]$Config)
    
    Write-Header "Verifying Installation"
    
    $testsPassed = 0
    $totalTests = 5
    
    # Test 1: EMAD directory exists
    if (Test-Path $InstallDir) {
        Write-Log "EMAD directory exists" "SUCCESS"
        $testsPassed++
    } else {
        Write-Log "EMAD directory not found" "ERROR"
    }
    
    # Test 2: Configuration files exist
    if (Test-Path "$InstallDir\config\emad-user-config.json") {
        Write-Log "Configuration files exist" "SUCCESS"
        $testsPassed++
    } else {
        Write-Log "Configuration files not found" "ERROR"
    }
    
    # Test 3: Python dependencies
    try {
        $pythonCmd = Test-Python
        & $pythonCmd -c "import requests, psutil" 2>$null
        Write-Log "Python dependencies available" "SUCCESS"
        $testsPassed++
    } catch {
        Write-Log "Python dependencies missing" "ERROR"
    }
    
    # Test 4: EMAD command available
    try {
        emad --version 2>$null
        Write-Log "EMAD command available" "SUCCESS"
        $testsPassed++
    } catch {
        Write-Log "EMAD command not available (restart shell)" "WARNING"
    }
    
    # Test 5: GitHub connectivity
    try {
        $headers = @{ Authorization = "Bearer $($Config.GitHubToken)" }
        Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers | Out-Null
        Write-Log "GitHub connectivity verified" "SUCCESS"
        $testsPassed++
    } catch {
        Write-Log "GitHub connectivity failed" "ERROR"
    }
    
    Write-Log "Verification: $testsPassed/$totalTests tests passed" "INFO"
    
    if ($testsPassed -eq $totalTests) {
        Write-Log "Installation completed successfully!" "SUCCESS"
        return $true
    } else {
        Write-Log "Installation completed with issues. Check log: $LogFile" "WARNING"
        return $false
    }
}

# Main installation flow
function Start-Installation {
    Write-Header "EMAD Universal Installer for Windows"
    Write-Log "Starting installation at $(Get-Date)"
    
    if (-not (Test-Prerequisites)) {
        return $false
    }
    
    $pythonCmd = Test-Python
    if (-not $pythonCmd) {
        return $false
    }
    
    if (-not (Install-PythonDependencies -PythonCmd $pythonCmd)) {
        return $false
    }
    
    if (-not (Install-EMADSystem)) {
        return $false
    }
    
    $config = Start-InteractiveSetup
    if (-not $config) {
        return $false
    }
    
    New-ConfigurationFiles -Config $config
    Install-EMADCommands
    Start-EMADSystem -Config $config
    
    $success = Test-Installation -Config $config
    
    Write-Host "`n"
    Write-Header "Installation Complete!"
    
    if ($success) {
        Write-Host "🎉 EMAD has been successfully installed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  EMAD installation completed with issues." -ForegroundColor Yellow
    }
    
    Write-Host "`nNext steps:"
    Write-Host "1. Restart PowerShell or refresh environment"
    Write-Host "2. Navigate to your project directory"
    Write-Host "3. Run: emad init"
    Write-Host "4. Check status: emad status"
    Write-Host "`nFor help: emad --help"
    Write-Host "Documentation: https://github.com/huggingfacer04/EMAD"
    
    return $success
}

# Run installation
try {
    $result = Start-Installation
    if (-not $result) {
        exit 1
    }
} catch {
    Write-Log "Installation failed with error: $_" "ERROR"
    Write-Log "Check log file: $LogFile" "ERROR"
    exit 1
}
