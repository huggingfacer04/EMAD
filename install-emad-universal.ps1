# EMAD Universal Intelligent Installation Script for Windows
# Version: 2.0.0 (July 2025)
# Supports: Windows 10/11 with intelligent adaptation
# Usage: powershell -ExecutionPolicy Bypass -c "iwr https://install.emad.dev/windows | iex"

param(
    [string]$InstallDir = "",
    [switch]$Force,
    [switch]$Quiet,
    [switch]$Debug,
    [string]$ProxyUrl = "",
    [switch]$OfflineMode
)

# Global Configuration
$Script:EMADVersion = "2.0.0"
$Script:EMADRepo = "https://github.com/huggingfacer04/EMAD"
$Script:EMADAPI = "https://api.emad.dev"
$Script:EMADCDN = "https://cdn.emad.dev"
$Script:InstallLog = "$env:TEMP\emad-install-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$Script:PythonMinVersion = [Version]"3.7"
$Script:PythonRecommendedVersion = [Version]"3.12"

# Environment Detection Variables
$Script:OSVersion = ""
$Script:Architecture = ""
$Script:PackageManager = ""
$Script:PythonCommand = ""
$Script:EMADDirectory = ""
$Script:EnvironmentType = ""
$Script:NetworkType = ""
$Script:ContainerRuntime = ""

# Error handling
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Logging Functions
function Write-Log {
    param(
        [string]$Message,
        [ValidateSet("INFO", "DEBUG", "WARN", "ERROR", "SUCCESS")]
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "$timestamp [$Level] $Message"
    Add-Content -Path $Script:InstallLog -Value $logMessage
    
    switch ($Level) {
        "INFO" { Write-Host "ℹ️  $Message" -ForegroundColor Blue }
        "DEBUG" { 
            if ($Debug) { Write-Host "🔍 $Message" -ForegroundColor Gray }
        }
        "WARN" { Write-Host "⚠️  $Message" -ForegroundColor Yellow }
        "ERROR" { Write-Host "❌ $Message" -ForegroundColor Red }
        "SUCCESS" { Write-Host "✅ $Message" -ForegroundColor Green }
    }
}

function Write-Header {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║                    EMAD Universal Installer                  ║" -ForegroundColor Magenta
    Write-Host "║              Intelligent Deployment System v2.0             ║" -ForegroundColor Magenta
    Write-Host "║                     July 2025 Edition                       ║" -ForegroundColor Magenta
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
}

# Intelligent Environment Detection
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-SystemInformation {
    Write-Log "Detecting system information..."
    
    # Get Windows version
    $osInfo = Get-CimInstance -ClassName Win32_OperatingSystem
    $Script:OSVersion = $osInfo.Version
    
    # Get architecture
    $Script:Architecture = $env:PROCESSOR_ARCHITECTURE
    if ($Script:Architecture -eq "AMD64") { $Script:Architecture = "x64" }
    elseif ($Script:Architecture -eq "ARM64") { $Script:Architecture = "arm64" }
    
    Write-Log "Windows $($osInfo.Caption) ($Script:OSVersion) on $Script:Architecture" "SUCCESS"
}

function Get-PackageManager {
    Write-Log "Detecting package manager..."
    
    # Check for package managers in order of preference
    $managers = @(
        @{Name="winget"; Command="winget"; Test="winget --version"},
        @{Name="chocolatey"; Command="choco"; Test="choco --version"},
        @{Name="scoop"; Command="scoop"; Test="scoop --version"}
    )
    
    foreach ($manager in $managers) {
        try {
            $null = Invoke-Expression $manager.Test 2>$null
            $Script:PackageManager = $manager.Name
            Write-Log "Package manager: $($Script:PackageManager)" "SUCCESS"
            return
        } catch {
            continue
        }
    }
    
    Write-Log "No package manager found, will use manual installation" "WARN"
    $Script:PackageManager = "manual"
}

function Get-EnvironmentType {
    Write-Log "Detecting environment type..."
    
    # Container detection
    if ($env:DOCKER_CONTAINER -eq "true" -or (Test-Path "/.dockerenv")) {
        $Script:EnvironmentType = "docker"
        $Script:ContainerRuntime = "docker"
    }
    # CI/CD detection
    elseif ($env:GITHUB_ACTIONS -eq "true") {
        $Script:EnvironmentType = "github_actions"
    }
    elseif ($env:GITLAB_CI -eq "true") {
        $Script:EnvironmentType = "gitlab_ci"
    }
    elseif ($env:JENKINS_URL) {
        $Script:EnvironmentType = "jenkins"
    }
    elseif ($env:AZURE_DEVOPS -eq "true") {
        $Script:EnvironmentType = "azure_devops"
    }
    # Cloud platform detection
    elseif (Test-CloudPlatform "aws") {
        $Script:EnvironmentType = "aws"
    }
    elseif (Test-CloudPlatform "azure") {
        $Script:EnvironmentType = "azure"
    }
    elseif (Test-CloudPlatform "gcp") {
        $Script:EnvironmentType = "gcp"
    }
    # Development environment detection
    elseif ($env:VSCODE_INJECTION -or $env:TERM_PROGRAM -eq "vscode") {
        $Script:EnvironmentType = "vscode"
    }
    elseif ($env:PYCHARM_HOSTED) {
        $Script:EnvironmentType = "pycharm"
    }
    else {
        $Script:EnvironmentType = "local"
    }
    
    Write-Log "Environment type: $Script:EnvironmentType" "SUCCESS"
}

function Test-CloudPlatform {
    param([string]$Platform)
    
    try {
        switch ($Platform) {
            "aws" {
                $response = Invoke-WebRequest -Uri "http://169.254.169.254/latest/meta-data/" -TimeoutSec 2 -UseBasicParsing
                return $response.StatusCode -eq 200
            }
            "azure" {
                $headers = @{"Metadata" = "true"}
                $response = Invoke-WebRequest -Uri "http://169.254.169.254/metadata/instance" -Headers $headers -TimeoutSec 2 -UseBasicParsing
                return $response.StatusCode -eq 200
            }
            "gcp" {
                $headers = @{"Metadata-Flavor" = "Google"}
                $response = Invoke-WebRequest -Uri "http://metadata.google.internal/" -Headers $headers -TimeoutSec 2 -UseBasicParsing
                return $response.StatusCode -eq 200
            }
        }
    } catch {
        return $false
    }
    return $false
}

function Get-NetworkConfiguration {
    Write-Log "Detecting network configuration..."
    
    # Test direct connectivity
    try {
        $response = Invoke-WebRequest -Uri "https://api.github.com" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $Script:NetworkType = "direct"
            Write-Log "Direct internet connectivity available" "SUCCESS"
            return
        }
    } catch {
        # Continue to proxy detection
    }
    
    # Test for proxy configuration
    $proxyVars = @("HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy")
    foreach ($var in $proxyVars) {
        if ($env:$var) {
            $Script:NetworkType = "proxy"
            Write-Log "Proxy configuration detected: $($env:$var)" "SUCCESS"
            return
        }
    }
    
    # Check system proxy settings
    $proxySettings = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" -ErrorAction SilentlyContinue
    if ($proxySettings.ProxyEnable -eq 1) {
        $Script:NetworkType = "proxy"
        Write-Log "System proxy detected: $($proxySettings.ProxyServer)" "SUCCESS"
        return
    }
    
    # Test for corporate network
    try {
        $dnsResult = Resolve-DnsName -Name "github.com" -ErrorAction SilentlyContinue
        if ($dnsResult -and !(Test-NetConnection -ComputerName "github.com" -Port 443 -InformationLevel Quiet)) {
            $Script:NetworkType = "corporate"
            Write-Log "Corporate network detected - may require proxy configuration" "WARN"
            return
        }
    } catch {
        # Continue
    }
    
    $Script:NetworkType = "offline"
    Write-Log "No internet connectivity detected" "WARN"
}

# Intelligent Python Detection and Management
function Get-PythonInstallation {
    Write-Log "Detecting Python installation..."
    
    $pythonCandidates = @(
        "python3.12", "python3.11", "python3.10", "python3.9", "python3.8", "python3.7",
        "python3", "python", "py"
    )
    
    foreach ($cmd in $pythonCandidates) {
        try {
            $versionOutput = & $cmd --version 2>$null
            if ($versionOutput -match "Python (\d+\.\d+\.\d+)") {
                $version = [Version]$matches[1]
                
                if ($version -ge $Script:PythonMinVersion) {
                    $Script:PythonCommand = $cmd
                    Write-Log "Found Python $version at $cmd" "SUCCESS"
                    
                    if ($version -ge $Script:PythonRecommendedVersion) {
                        Write-Log "Using recommended Python version" "SUCCESS"
                    } elseif ($version.Minor -lt 10) {
                        Write-Log "Python $version is supported but upgrading to 3.12+ is recommended" "WARN"
                    }
                    
                    return $true
                }
            }
        } catch {
            continue
        }
    }
    
    Write-Log "No suitable Python installation found (3.7+ required)" "ERROR"
    return $false
}

function Install-PythonIfNeeded {
    if (Get-PythonInstallation) {
        return $true
    }
    
    Write-Log "Installing Python..."
    
    switch ($Script:PackageManager) {
        "winget" {
            try {
                winget install Python.Python.3.12 --silent --accept-package-agreements --accept-source-agreements
            } catch {
                Write-Log "Failed to install Python via winget: $_" "ERROR"
                return $false
            }
        }
        "chocolatey" {
            try {
                choco install python312 -y
            } catch {
                Write-Log "Failed to install Python via chocolatey: $_" "ERROR"
                return $false
            }
        }
        "scoop" {
            try {
                scoop install python
            } catch {
                Write-Log "Failed to install Python via scoop: $_" "ERROR"
                return $false
            }
        }
        default {
            Write-Log "No package manager available for automatic Python installation" "ERROR"
            Write-Log "Please install Python 3.7+ from https://python.org and re-run the installer" "ERROR"
            return $false
        }
    }
    
    # Refresh PATH and verify installation
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
    
    if (!(Get-PythonInstallation)) {
        Write-Log "Python installation failed" "ERROR"
        return $false
    }
    
    Write-Log "Python installed successfully" "SUCCESS"
    return $true
}

# Intelligent Dependency Management
function Install-PythonDependencies {
    Write-Log "Installing Python dependencies..."
    
    $dependencies = @(
        "requests>=2.31.0",
        "psutil>=5.9.0",
        "pyyaml>=6.0",
        "click>=8.1.0",
        "rich>=13.0.0",
        "httpx>=0.24.0",
        "aiofiles>=23.0.0",
        "cryptography>=41.0.0"
    )
    
    foreach ($dep in $dependencies) {
        $attempts = 0
        $maxAttempts = 3
        
        while ($attempts -lt $maxAttempts) {
            try {
                & $Script:PythonCommand -m pip install --user $dep *>$null
                Write-Log "Installed: $dep" "DEBUG"
                break
            } catch {
                $attempts++
                if ($attempts -eq $maxAttempts) {
                    Write-Log "Failed to install $dep after $maxAttempts attempts" "ERROR"
                    return $false
                }
                Write-Log "Retrying installation of $dep (attempt $attempts/$maxAttempts)" "WARN"
                Start-Sleep -Seconds 2
            }
        }
    }
    
    Write-Log "All Python dependencies installed" "SUCCESS"
    return $true
}

# Intelligent EMAD System Download and Setup
function Get-EMADInstallationDirectory {
    if ($InstallDir) {
        $Script:EMADDirectory = $InstallDir
    } elseif ($Script:EnvironmentType -eq "docker") {
        $Script:EMADDirectory = "C:\emad"
    } elseif (Test-Administrator) {
        $Script:EMADDirectory = "C:\Program Files\EMAD"
    } else {
        $Script:EMADDirectory = "$env:USERPROFILE\.emad"
    }
    
    Write-Log "Installing EMAD to: $Script:EMADDirectory"
}

function Install-EMADSystem {
    Write-Log "Downloading EMAD system..."
    
    Get-EMADInstallationDirectory
    
    # Create directory
    New-Item -ItemType Directory -Path $Script:EMADDirectory -Force | Out-Null
    Set-Location $Script:EMADDirectory
    
    # Intelligent download strategy
    if ($Script:NetworkType -eq "offline" -or $OfflineMode) {
        return Install-OfflinePackage
    } elseif (Get-Command git -ErrorAction SilentlyContinue) {
        return Install-ViaGit
    } else {
        return Install-ViaDownload
    }
}

function Install-ViaGit {
    Write-Log "Downloading via Git..."
    
    try {
        # Configure Git for corporate environments
        if ($Script:NetworkType -eq "corporate") {
            git config --global http.sslverify false 2>$null
        }
        
        git clone --depth=1 --single-branch --branch=main $Script:EMADRepo . 2>$null
        Write-Log "EMAD system downloaded via Git" "SUCCESS"
        return $true
    } catch {
        Write-Log "Git clone failed, falling back to direct download" "WARN"
        return Install-ViaDownload
    }
}

function Install-ViaDownload {
    Write-Log "Downloading via PowerShell..."
    
    $archiveUrl = "$Script:EMADCDN/releases/latest/emad-$Script:EMADVersion.zip"
    $tempFile = "$env:TEMP\emad-$Script:EMADVersion.zip"
    
    $attempts = 0
    $maxAttempts = 3
    
    while ($attempts -lt $maxAttempts) {
        try {
            Invoke-WebRequest -Uri $archiveUrl -OutFile $tempFile -UseBasicParsing
            break
        } catch {
            $attempts++
            if ($attempts -eq $maxAttempts) {
                Write-Log "Failed to download EMAD system after $maxAttempts attempts" "ERROR"
                return $false
            }
            Write-Log "Download failed, retrying (attempt $attempts/$maxAttempts)" "WARN"
            Start-Sleep -Seconds 5
        }
    }
    
    try {
        Expand-Archive -Path $tempFile -DestinationPath $Script:EMADDirectory -Force
        Remove-Item $tempFile -Force
        Write-Log "EMAD system downloaded and extracted" "SUCCESS"
        return $true
    } catch {
        Write-Log "Failed to extract EMAD system: $_" "ERROR"
        return $false
    }
}

function Install-OfflinePackage {
    Write-Log "Offline mode detected - looking for local EMAD package" "WARN"
    
    $offlinePaths = @(
        ".\emad-offline-package.zip",
        "$env:TEMP\emad-offline-package.zip",
        "$env:USERPROFILE\Downloads\emad-offline-package.zip"
    )
    
    foreach ($path in $offlinePaths) {
        if (Test-Path $path) {
            Write-Log "Found offline package: $path"
            try {
                Expand-Archive -Path $path -DestinationPath $Script:EMADDirectory -Force
                Write-Log "EMAD system installed from offline package" "SUCCESS"
                return $true
            } catch {
                Write-Log "Failed to extract offline package: $_" "ERROR"
            }
        }
    }
    
    Write-Log "No offline EMAD package found" "ERROR"
    Write-Log "Please download the offline package from https://emad.dev/offline" "ERROR"
    return $false
}

# Main Installation Flow
function Start-Installation {
    Write-Header
    
    Write-Log "Starting EMAD Universal Installation v$Script:EMADVersion"
    Write-Log "Installation log: $Script:InstallLog"
    
    try {
        # Phase 1: Environment Detection
        Write-Log "Phase 1: Environment Detection"
        Get-SystemInformation
        Get-PackageManager
        Get-EnvironmentType
        Get-NetworkConfiguration
        
        # Phase 2: Prerequisites
        Write-Log "Phase 2: Installing Prerequisites"
        if (!(Install-PythonIfNeeded)) {
            throw "Failed to install Python prerequisites"
        }
        
        # Phase 3: EMAD System Setup
        Write-Log "Phase 3: EMAD System Setup"
        if (!(Install-EMADSystem)) {
            throw "Failed to install EMAD system"
        }
        
        if (!(Install-PythonDependencies)) {
            throw "Failed to install Python dependencies"
        }
        
        # Phase 4: Configuration
        Write-Log "Phase 4: Intelligent Configuration"
        New-IntelligentConfiguration
        
        # Phase 5: Verification
        Write-Log "Phase 5: System Verification"
        if (Test-Path "$Script:EMADDirectory\scripts\verify-installation.py") {
            try {
                & $Script:PythonCommand "$Script:EMADDirectory\scripts\verify-installation.py"
                Write-Log "Installation verification passed" "SUCCESS"
            } catch {
                Write-Log "Installation verification had issues" "WARN"
            }
        }
        
        # Phase 6: Completion
        Write-Log "EMAD Universal Installation completed successfully!" "SUCCESS"
        Show-CompletionMessage
        
    } catch {
        Write-Log "Installation failed: $_" "ERROR"
        Show-TroubleshootingGuide
        exit 1
    }
}

function New-IntelligentConfiguration {
    $projectType = Get-ProjectType
    
    $configDir = "$Script:EMADDirectory\config"
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    
    $systemConfig = @{
        version = $Script:EMADVersion
        installation = @{
            timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
            environment = $Script:EnvironmentType
            os = "windows"
            arch = $Script:Architecture
            python_version = (& $Script:PythonCommand --version).Split()[1]
            network_type = $Script:NetworkType
        }
        project = @{
            type = $projectType
            root = (Get-Location).Path
            auto_detected = $true
        }
        features = @{
            auto_sync = $true
            failsafe_monitoring = $true
            health_checks = $true
            intelligent_retry = $true
            self_healing = $true
        }
    }
    
    $systemConfig | ConvertTo-Json -Depth 4 | Out-File -FilePath "$configDir\emad-system-config.json" -Encoding UTF8
    Write-Log "System configuration generated" "SUCCESS"
}

function Get-ProjectType {
    $projectDir = (Get-Location).Path
    $projectType = "generic"
    
    if (Test-Path "$projectDir\package.json") {
        $packageContent = Get-Content "$projectDir\package.json" -Raw -ErrorAction SilentlyContinue
        if ($packageContent -match '"next"') { $projectType = "nextjs" }
        elseif ($packageContent -match '"react"') { $projectType = "react" }
        elseif ($packageContent -match '"vue"') { $projectType = "vue" }
        elseif ($packageContent -match '"@angular/core"') { $projectType = "angular" }
        elseif ($packageContent -match '"typescript"') { $projectType = "typescript" }
        else { $projectType = "nodejs" }
    }
    elseif (Test-Path "$projectDir\pyproject.toml") {
        $pyprojectContent = Get-Content "$projectDir\pyproject.toml" -Raw -ErrorAction SilentlyContinue
        if ($pyprojectContent -match 'fastapi') { $projectType = "fastapi" }
        elseif ($pyprojectContent -match 'django') { $projectType = "django" }
        elseif ($pyprojectContent -match 'flask') { $projectType = "flask" }
        else { $projectType = "python" }
    }
    elseif ((Test-Path "$projectDir\requirements.txt") -or (Test-Path "$projectDir\setup.py")) {
        $projectType = "python"
    }
    elseif (Test-Path "$projectDir\Cargo.toml") { $projectType = "rust" }
    elseif (Test-Path "$projectDir\go.mod") { $projectType = "go" }
    elseif (Test-Path "$projectDir\pom.xml") { $projectType = "maven" }
    elseif ((Test-Path "$projectDir\build.gradle") -or (Test-Path "$projectDir\build.gradle.kts")) { $projectType = "gradle" }
    
    Write-Log "Detected project type: $projectType" "SUCCESS"
    return $projectType
}

function Show-CompletionMessage {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                 Installation Complete!                      ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Next steps:"
    Write-Host "1. Add EMAD to your PATH or restart PowerShell"
    Write-Host "2. Initialize in your project: emad init"
    Write-Host "3. Start monitoring: emad start"
    Write-Host "4. Check status: emad status"
    Write-Host ""
    Write-Host "Documentation: https://docs.emad.dev"
    Write-Host "Support: https://github.com/huggingfacer04/EMAD/discussions"
}

function Show-TroubleshootingGuide {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║                    Troubleshooting Guide                     ║" -ForegroundColor Yellow
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Common solutions:"
    Write-Host "1. Run PowerShell as Administrator"
    Write-Host "2. Check execution policy: Get-ExecutionPolicy"
    Write-Host "3. Ensure internet connectivity"
    Write-Host "4. For corporate networks, configure proxy settings"
    Write-Host "5. Run with debug mode: -Debug parameter"
    Write-Host ""
    Write-Host "Log file: $Script:InstallLog"
    Write-Host "Support: https://github.com/huggingfacer04/EMAD/issues"
}

# Execute installation
Start-Installation
