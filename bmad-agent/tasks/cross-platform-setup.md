# Cross-Platform Setup Workflow

## Task Overview
**Task ID**: cross-platform-setup  
**Agent**: Phoenix (System Deployment & Containerization Specialist)  
**Purpose**: Automated cross-platform deployment setup with intelligent platform detection and adaptation  
**Estimated Duration**: 45-75 minutes  
**Date Context**: July 13, 2025  
**Prerequisites**: Deployment preparation completed, target platforms identified  

## Workflow Phases

### Phase 1: Platform Detection & Analysis (10-15 minutes)

#### 🔍 **Intelligent Platform Detection**
```yaml
Platform Detection Matrix:
  Operating Systems:
    - Windows (10, 11, Server 2019/2022)
    - macOS (Monterey, Ventura, Sonoma)
    - Linux (Ubuntu, CentOS, RHEL, Alpine, Debian)
    - Container Platforms (Docker, Podman, containerd)
  
  Architecture Detection:
    - x86_64 (AMD64)
    - ARM64 (Apple Silicon, ARM servers)
    - ARM32 (Raspberry Pi, IoT devices)
    - Multi-architecture support
  
  Environment Context:
    - Development workstations
    - CI/CD environments
    - Cloud platforms (AWS, Azure, GCP)
    - Edge computing devices
```

#### 🧪 **Platform Capability Assessment**
```bash
# Platform Detection Script Template
#!/bin/bash
detect_platform() {
    OS=$(uname -s)
    ARCH=$(uname -m)
    DISTRO=""
    
    case "$OS" in
        Linux*)
            if [ -f /etc/os-release ]; then
                DISTRO=$(grep '^ID=' /etc/os-release | cut -d'=' -f2 | tr -d '"')
            fi
            ;;
        Darwin*)
            DISTRO="macos"
            ;;
        CYGWIN*|MINGW*|MSYS*)
            DISTRO="windows"
            ;;
    esac
    
    echo "Platform: $OS-$ARCH-$DISTRO"
    echo "Date: $(date -I)"
}
```

#### 📊 **Dependency Mapping**
- **Package Managers**: apt, yum, dnf, brew, chocolatey, winget, pacman
- **Runtime Requirements**: Node.js, Python, .NET, Java, Docker
- **System Dependencies**: SSL certificates, network tools, monitoring agents
- **Development Tools**: Git, build tools, debugging utilities

### Phase 2: Script Generation & Automation (20-30 minutes)

#### 🪟 **PowerShell Deployment Scripts (.ps1)**
```powershell
# Windows PowerShell Deployment Script Template
#Requires -Version 5.1
#Requires -RunAsAdministrator

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [string]$ConfigPath = ".\config\",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipDependencies
)

# Script metadata
$ScriptVersion = "1.0.0"
$GeneratedDate = "2025-07-13"
$Agent = "Phoenix"

Write-Host "🔥 Phoenix Deployment Script v$ScriptVersion" -ForegroundColor Cyan
Write-Host "Generated: $GeneratedDate" -ForegroundColor Gray
Write-Host "Environment: $Environment" -ForegroundColor Yellow

# Platform validation
function Test-WindowsCompatibility {
    $osVersion = [System.Environment]::OSVersion.Version
    if ($osVersion.Major -lt 10) {
        throw "Windows 10 or later required"
    }
    Write-Host "✅ Windows compatibility verified" -ForegroundColor Green
}

# Dependency installation
function Install-Dependencies {
    if (-not $SkipDependencies) {
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        
        # Check for package managers
        if (Get-Command winget -ErrorAction SilentlyContinue) {
            winget install --id Docker.DockerDesktop
            winget install --id Git.Git
        } elseif (Get-Command choco -ErrorAction SilentlyContinue) {
            choco install docker-desktop git -y
        } else {
            Write-Warning "No package manager found. Manual installation required."
        }
    }
}

# Configuration management
function Set-Configuration {
    param([string]$ConfigPath)
    
    Write-Host "⚙️ Configuring environment..." -ForegroundColor Yellow
    
    # Load environment-specific configuration
    $configFile = Join-Path $ConfigPath "$Environment.json"
    if (Test-Path $configFile) {
        $config = Get-Content $configFile | ConvertFrom-Json
        
        # Set environment variables
        foreach ($key in $config.PSObject.Properties.Name) {
            [Environment]::SetEnvironmentVariable($key, $config.$key, "Process")
            Write-Host "Set $key = $($config.$key)" -ForegroundColor Gray
        }
    }
}

# Health check
function Test-DeploymentHealth {
    Write-Host "🏥 Running health checks..." -ForegroundColor Yellow
    
    $healthChecks = @(
        @{ Name = "Docker"; Command = "docker --version" },
        @{ Name = "Git"; Command = "git --version" },
        @{ Name = "Network"; Command = "Test-NetConnection google.com -Port 443" }
    )
    
    foreach ($check in $healthChecks) {
        try {
            Invoke-Expression $check.Command | Out-Null
            Write-Host "✅ $($check.Name) check passed" -ForegroundColor Green
        } catch {
            Write-Host "❌ $($check.Name) check failed" -ForegroundColor Red
        }
    }
}

# Main execution
try {
    Test-WindowsCompatibility
    Install-Dependencies
    Set-Configuration -ConfigPath $ConfigPath
    Test-DeploymentHealth
    
    Write-Host "🎉 Deployment preparation completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "💥 Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
```

#### 🐧 **Bash Deployment Scripts (.sh)**
```bash
#!/bin/bash
# Linux/macOS Bash Deployment Script Template
set -euo pipefail

# Script metadata
readonly SCRIPT_VERSION="1.0.0"
readonly GENERATED_DATE="2025-07-13"
readonly AGENT="Phoenix"

# Configuration
ENVIRONMENT="${1:-production}"
CONFIG_PATH="${2:-./config}"
SKIP_DEPENDENCIES="${SKIP_DEPENDENCIES:-false}"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Platform detection
detect_platform() {
    local os_name
    local arch
    local distro=""
    
    os_name=$(uname -s)
    arch=$(uname -m)
    
    case "$os_name" in
        Linux*)
            if [[ -f /etc/os-release ]]; then
                distro=$(grep '^ID=' /etc/os-release | cut -d'=' -f2 | tr -d '"')
            fi
            ;;
        Darwin*)
            distro="macos"
            ;;
    esac
    
    echo "$os_name-$arch-$distro"
}

# Dependency installation
install_dependencies() {
    if [[ "$SKIP_DEPENDENCIES" == "true" ]]; then
        log_info "Skipping dependency installation"
        return
    fi
    
    log_info "Installing dependencies..."
    local platform
    platform=$(detect_platform)
    
    case "$platform" in
        Linux*ubuntu*|Linux*debian*)
            sudo apt-get update
            sudo apt-get install -y docker.io git curl
            ;;
        Linux*centos*|Linux*rhel*)
            sudo yum install -y docker git curl
            ;;
        Darwin*)
            if command -v brew >/dev/null 2>&1; then
                brew install docker git
            else
                log_error "Homebrew not found. Please install manually."
                exit 1
            fi
            ;;
        *)
            log_warning "Unknown platform: $platform"
            ;;
    esac
}

# Configuration management
setup_configuration() {
    log_info "Setting up configuration for environment: $ENVIRONMENT"
    
    local config_file="$CONFIG_PATH/$ENVIRONMENT.json"
    if [[ -f "$config_file" ]]; then
        # Export environment variables from JSON config
        while IFS='=' read -r key value; do
            export "$key"="$value"
            log_info "Set $key=$value"
        done < <(jq -r 'to_entries[] | "\(.key)=\(.value)"' "$config_file")
    else
        log_warning "Configuration file not found: $config_file"
    fi
}

# Health checks
run_health_checks() {
    log_info "Running health checks..."
    
    local checks=(
        "docker:docker --version"
        "git:git --version"
        "curl:curl --version"
        "network:curl -s https://google.com"
    )
    
    for check in "${checks[@]}"; do
        local name="${check%%:*}"
        local command="${check#*:}"
        
        if eval "$command" >/dev/null 2>&1; then
            log_success "$name check passed"
        else
            log_error "$name check failed"
        fi
    done
}

# Main execution
main() {
    echo -e "${CYAN}🔥 Phoenix Deployment Script v$SCRIPT_VERSION${NC}"
    echo -e "${CYAN}Generated: $GENERATED_DATE${NC}"
    echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
    
    detect_platform
    install_dependencies
    setup_configuration
    run_health_checks
    
    log_success "Deployment preparation completed successfully!"
}

# Error handling
trap 'log_error "Script failed at line $LINENO"' ERR

# Execute main function
main "$@"
```

#### 🐍 **Python Deployment Scripts (.py)**
```python
#!/usr/bin/env python3
"""
Phoenix Cross-Platform Deployment Script
Generated: 2025-07-13
Agent: Phoenix (System Deployment & Containerization Specialist)
"""

import os
import sys
import json
import platform
import subprocess
import argparse
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

# Script metadata
SCRIPT_VERSION = "1.0.0"
GENERATED_DATE = "2025-07-13"
AGENT = "Phoenix"

class PlatformDetector:
    """Intelligent platform detection and capability assessment."""
    
    @staticmethod
    def detect_platform() -> Dict[str, str]:
        """Detect current platform details."""
        system = platform.system().lower()
        machine = platform.machine().lower()
        
        # Normalize architecture names
        arch_map = {
            'x86_64': 'amd64',
            'amd64': 'amd64',
            'arm64': 'arm64',
            'aarch64': 'arm64',
            'armv7l': 'arm32'
        }
        
        arch = arch_map.get(machine, machine)
        
        # Detect distribution for Linux
        distro = ""
        if system == "linux":
            try:
                with open("/etc/os-release", "r") as f:
                    for line in f:
                        if line.startswith("ID="):
                            distro = line.split("=")[1].strip().strip('"')
                            break
            except FileNotFoundError:
                distro = "unknown"
        elif system == "darwin":
            distro = "macos"
        elif system == "windows":
            distro = "windows"
        
        return {
            "system": system,
            "architecture": arch,
            "distribution": distro,
            "platform_string": f"{system}-{arch}-{distro}",
            "python_version": platform.python_version(),
            "detection_date": datetime.now().isoformat()
        }

class DependencyManager:
    """Cross-platform dependency management."""
    
    def __init__(self, platform_info: Dict[str, str]):
        self.platform = platform_info
    
    def install_dependencies(self, skip: bool = False) -> bool:
        """Install platform-specific dependencies."""
        if skip:
            print("⏭️  Skipping dependency installation")
            return True
        
        print("📦 Installing dependencies...")
        
        system = self.platform["system"]
        distro = self.platform["distribution"]
        
        try:
            if system == "linux":
                if distro in ["ubuntu", "debian"]:
                    self._run_command(["sudo", "apt-get", "update"])
                    self._run_command(["sudo", "apt-get", "install", "-y", "docker.io", "git", "curl"])
                elif distro in ["centos", "rhel", "fedora"]:
                    self._run_command(["sudo", "yum", "install", "-y", "docker", "git", "curl"])
                else:
                    print(f"⚠️  Unknown Linux distribution: {distro}")
                    return False
            
            elif system == "darwin":
                if self._command_exists("brew"):
                    self._run_command(["brew", "install", "docker", "git"])
                else:
                    print("❌ Homebrew not found. Please install manually.")
                    return False
            
            elif system == "windows":
                if self._command_exists("winget"):
                    self._run_command(["winget", "install", "--id", "Docker.DockerDesktop"])
                    self._run_command(["winget", "install", "--id", "Git.Git"])
                elif self._command_exists("choco"):
                    self._run_command(["choco", "install", "docker-desktop", "git", "-y"])
                else:
                    print("❌ No package manager found. Please install manually.")
                    return False
            
            print("✅ Dependencies installed successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Dependency installation failed: {e}")
            return False
    
    def _command_exists(self, command: str) -> bool:
        """Check if a command exists in PATH."""
        try:
            subprocess.run([command, "--version"], 
                         capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    
    def _run_command(self, command: List[str]) -> subprocess.CompletedProcess:
        """Run a command with error handling."""
        print(f"🔧 Running: {' '.join(command)}")
        return subprocess.run(command, check=True)

class ConfigurationManager:
    """Environment configuration management."""
    
    def __init__(self, config_path: Path):
        self.config_path = config_path
    
    def load_configuration(self, environment: str) -> Dict[str, str]:
        """Load environment-specific configuration."""
        config_file = self.config_path / f"{environment}.json"
        
        if not config_file.exists():
            print(f"⚠️  Configuration file not found: {config_file}")
            return {}
        
        try:
            with open(config_file, "r") as f:
                config = json.load(f)
            
            print(f"⚙️  Loaded configuration for environment: {environment}")
            
            # Set environment variables
            for key, value in config.items():
                os.environ[key] = str(value)
                print(f"🔧 Set {key}={value}")
            
            return config
            
        except (json.JSONDecodeError, IOError) as e:
            print(f"❌ Failed to load configuration: {e}")
            return {}

class HealthChecker:
    """System health validation."""
    
    def __init__(self):
        self.checks = [
            ("Docker", ["docker", "--version"]),
            ("Git", ["git", "--version"]),
            ("Python", ["python3", "--version"]),
            ("Curl", ["curl", "--version"])
        ]
    
    def run_health_checks(self) -> bool:
        """Run comprehensive health checks."""
        print("🏥 Running health checks...")
        
        all_passed = True
        
        for name, command in self.checks:
            try:
                subprocess.run(command, capture_output=True, check=True)
                print(f"✅ {name} check passed")
            except (subprocess.CalledProcessError, FileNotFoundError):
                print(f"❌ {name} check failed")
                all_passed = False
        
        # Network connectivity check
        try:
            subprocess.run(["curl", "-s", "https://google.com"], 
                         capture_output=True, check=True, timeout=10)
            print("✅ Network connectivity check passed")
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError):
            print("❌ Network connectivity check failed")
            all_passed = False
        
        return all_passed

def main():
    """Main deployment script execution."""
    parser = argparse.ArgumentParser(description="Phoenix Cross-Platform Deployment Script")
    parser.add_argument("--environment", "-e", default="production",
                       help="Deployment environment (default: production)")
    parser.add_argument("--config-path", "-c", default="./config",
                       help="Configuration directory path (default: ./config)")
    parser.add_argument("--skip-dependencies", "-s", action="store_true",
                       help="Skip dependency installation")
    
    args = parser.parse_args()
    
    print(f"🔥 Phoenix Deployment Script v{SCRIPT_VERSION}")
    print(f"📅 Generated: {GENERATED_DATE}")
    print(f"🌍 Environment: {args.environment}")
    print(f"📁 Config Path: {args.config_path}")
    print()
    
    try:
        # Platform detection
        detector = PlatformDetector()
        platform_info = detector.detect_platform()
        print(f"🖥️  Platform: {platform_info['platform_string']}")
        print(f"🐍 Python: {platform_info['python_version']}")
        print()
        
        # Dependency installation
        dep_manager = DependencyManager(platform_info)
        if not dep_manager.install_dependencies(args.skip_dependencies):
            sys.exit(1)
        
        # Configuration management
        config_manager = ConfigurationManager(Path(args.config_path))
        config = config_manager.load_configuration(args.environment)
        
        # Health checks
        health_checker = HealthChecker()
        if not health_checker.run_health_checks():
            print("⚠️  Some health checks failed, but continuing...")
        
        print()
        print("🎉 Deployment preparation completed successfully!")
        
    except KeyboardInterrupt:
        print("\n⏹️  Deployment interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Deployment failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

### Phase 3: Configuration Management (10-15 minutes)

#### 🔐 **Secure Configuration Templates**
```yaml
# Environment Configuration Template
# File: config/production.json
{
  "APP_NAME": "MyApplication",
  "APP_VERSION": "1.0.0",
  "DEPLOYMENT_DATE": "2025-07-13",
  "NODE_ENV": "production",
  "PORT": "3000",
  "DATABASE_URL": "${DATABASE_URL}",
  "REDIS_URL": "${REDIS_URL}",
  "JWT_SECRET": "${JWT_SECRET}",
  "LOG_LEVEL": "info",
  "METRICS_ENABLED": "true",
  "HEALTH_CHECK_PATH": "/health",
  "CORS_ORIGIN": "https://myapp.com",
  "RATE_LIMIT_WINDOW": "900000",
  "RATE_LIMIT_MAX": "100"
}
```

#### 🌍 **Environment-Specific Configurations**
- **Development**: Debug logging, hot reload, development databases
- **Staging**: Production-like settings, test data, monitoring
- **Production**: Optimized performance, security hardening, monitoring
- **Testing**: Isolated environments, test databases, mock services

### Phase 4: Platform Validation & Testing (5-10 minutes)

#### ✅ **Cross-Platform Validation Matrix**
```yaml
Validation Tests:
  Script Execution:
    - PowerShell script runs on Windows 10/11
    - Bash script runs on Ubuntu, CentOS, macOS
    - Python script runs on all platforms with Python 3.8+
  
  Dependency Installation:
    - Package managers work correctly
    - Dependencies install without conflicts
    - Version compatibility verified
  
  Configuration Loading:
    - Environment variables set correctly
    - Configuration files parsed properly
    - Secrets management integration works
  
  Health Checks:
    - All required services accessible
    - Network connectivity verified
    - Resource availability confirmed
```

## Context7 Research Integration

### 🔬 **Automated Research Queries**
```yaml
Cross-Platform Best Practices:
  query_template: "cross platform deployment {technology_stack} {target_platforms} 2025"
  sources: ["platform_documentation", "deployment_guides", "community_best_practices"]
  focus: ["compatibility", "automation", "security", "performance"]

Platform-Specific Optimization:
  query_template: "{platform} deployment optimization {application_type} production"
  sources: ["official_documentation", "performance_guides", "troubleshooting"]
  focus: ["performance", "security", "monitoring", "maintenance"]
```

## Deliverables & Outputs

### 📄 **Generated Cross-Platform Assets**
1. **Deployment Scripts**
   - deploy.ps1 (Windows PowerShell)
   - deploy.sh (Linux/macOS Bash)
   - deploy.py (Cross-platform Python)
   - Platform detection utilities

2. **Configuration Management**
   - Environment-specific config files
   - Secret management templates
   - Validation schemas
   - Configuration testing scripts

3. **Platform Documentation**
   - Platform-specific deployment guides
   - Troubleshooting procedures
   - Performance optimization tips
   - Security configuration guides

### ✅ **Success Criteria**
- **Script Compatibility**: All scripts execute successfully on target platforms
- **Dependency Resolution**: Automated dependency installation works correctly
- **Configuration Validation**: Environment configurations load and validate properly
- **Health Check Success**: All platform health checks pass
- **Documentation Completeness**: Clear platform-specific instructions provided

This cross-platform setup workflow ensures seamless deployment across any target environment with intelligent platform adaptation and comprehensive automation.
