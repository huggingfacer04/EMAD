#!/bin/bash

# EMAD Universal Intelligent Installation Script
# Version: 2.0.0 (July 2025)
# Supports: All major platforms with intelligent adaptation
# Usage: curl -sSL https://install.emad.dev | bash

set -euo pipefail

# Global Configuration
readonly EMAD_VERSION="2.0.0"
readonly EMAD_REPO="https://github.com/huggingfacer04/EMAD"
readonly EMAD_API_BASE="https://api.emad.dev"
readonly EMAD_CDN="https://cdn.emad.dev"
readonly INSTALL_LOG="/tmp/emad-install-$(date +%s).log"
readonly PYTHON_MIN_VERSION="3.7"
readonly PYTHON_RECOMMENDED_VERSION="3.12"

# Environment Detection Variables
declare -g OS_TYPE=""
declare -g OS_VERSION=""
declare -g ARCH=""
declare -g PACKAGE_MANAGER=""
declare -g PYTHON_CMD=""
declare -g EMAD_DIR=""
declare -g ENVIRONMENT_TYPE=""
declare -g NETWORK_TYPE=""
declare -g CONTAINER_RUNTIME=""

# Color Codes for Output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

# Logging Functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $*" | tee -a "$INSTALL_LOG"
}

log_debug() {
    if [[ "${EMAD_DEBUG:-false}" == "true" ]]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') [DEBUG] $*" | tee -a "$INSTALL_LOG"
    fi
}

log_warn() {
    echo -e "${YELLOW}$(date '+%Y-%m-%d %H:%M:%S') [WARN] $*${NC}" | tee -a "$INSTALL_LOG"
}

log_error() {
    echo -e "${RED}$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $*${NC}" | tee -a "$INSTALL_LOG" >&2
}

log_success() {
    echo -e "${GREEN}$(date '+%Y-%m-%d %H:%M:%S') [SUCCESS] $*${NC}" | tee -a "$INSTALL_LOG"
}

print_header() {
    echo -e "${PURPLE}${BOLD}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    EMAD Universal Installer                  ║"
    echo "║              Intelligent Deployment System v2.0             ║"
    echo "║                     July 2025 Edition                       ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Error Handling and Cleanup
cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log_error "Installation failed with exit code $exit_code"
        log_error "Log file available at: $INSTALL_LOG"
        
        # Attempt self-healing for common issues
        if [[ $exit_code -eq 130 ]]; then
            log_warn "Installation interrupted by user"
        else
            attempt_self_healing
        fi
        
        # Provide troubleshooting guidance
        show_troubleshooting_guide
    fi
}

trap cleanup EXIT

# Intelligent Environment Detection
detect_operating_system() {
    log "Detecting operating system and architecture..."
    
    # Detect architecture
    ARCH=$(uname -m)
    case "$ARCH" in
        x86_64|amd64) ARCH="x64" ;;
        aarch64|arm64) ARCH="arm64" ;;
        armv7l) ARCH="armv7" ;;
        i386|i686) ARCH="x86" ;;
        *) log_warn "Unknown architecture: $ARCH" ;;
    esac
    
    # Detect OS type and version
    if [[ -f /etc/os-release ]]; then
        source /etc/os-release
        OS_TYPE="$ID"
        OS_VERSION="$VERSION_ID"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS_TYPE="macos"
        OS_VERSION=$(sw_vers -productVersion)
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS_TYPE="windows"
        OS_VERSION=$(cmd.exe /c ver 2>/dev/null | grep -o '[0-9]\+\.[0-9]\+' | head -1)
    else
        OS_TYPE="unknown"
        OS_VERSION="unknown"
    fi
    
    log_success "Detected: $OS_TYPE $OS_VERSION on $ARCH"
}

detect_package_manager() {
    log "Detecting package manager..."
    
    local managers=(
        "apt:apt-get"
        "yum:yum"
        "dnf:dnf"
        "pacman:pacman"
        "brew:brew"
        "zypper:zypper"
        "apk:apk"
        "pkg:pkg"
        "portage:emerge"
    )
    
    for manager_pair in "${managers[@]}"; do
        local manager="${manager_pair%%:*}"
        local command="${manager_pair##*:}"
        
        if command -v "$command" >/dev/null 2>&1; then
            PACKAGE_MANAGER="$manager"
            log_success "Package manager: $PACKAGE_MANAGER"
            return 0
        fi
    done
    
    log_warn "No supported package manager found"
    PACKAGE_MANAGER="manual"
}

detect_environment_type() {
    log "Detecting environment type..."
    
    # Container detection
    if [[ -f /.dockerenv ]] || grep -q docker /proc/1/cgroup 2>/dev/null; then
        ENVIRONMENT_TYPE="docker"
        CONTAINER_RUNTIME="docker"
    elif [[ -n "${KUBERNETES_SERVICE_HOST:-}" ]]; then
        ENVIRONMENT_TYPE="kubernetes"
        CONTAINER_RUNTIME="kubernetes"
    elif [[ -n "${PODMAN_VERSION:-}" ]] || command -v podman >/dev/null 2>&1; then
        ENVIRONMENT_TYPE="podman"
        CONTAINER_RUNTIME="podman"
    # CI/CD detection
    elif [[ -n "${GITHUB_ACTIONS:-}" ]]; then
        ENVIRONMENT_TYPE="github_actions"
    elif [[ -n "${GITLAB_CI:-}" ]]; then
        ENVIRONMENT_TYPE="gitlab_ci"
    elif [[ -n "${JENKINS_URL:-}" ]]; then
        ENVIRONMENT_TYPE="jenkins"
    elif [[ -n "${AZURE_DEVOPS:-}" ]]; then
        ENVIRONMENT_TYPE="azure_devops"
    # Cloud platform detection
    elif curl -s --max-time 2 http://169.254.169.254/latest/meta-data/ >/dev/null 2>&1; then
        ENVIRONMENT_TYPE="aws"
    elif curl -s --max-time 2 -H "Metadata-Flavor: Google" http://metadata.google.internal/ >/dev/null 2>&1; then
        ENVIRONMENT_TYPE="gcp"
    elif curl -s --max-time 2 -H "Metadata: true" http://169.254.169.254/metadata/instance >/dev/null 2>&1; then
        ENVIRONMENT_TYPE="azure"
    # Development environment detection
    elif [[ -n "${VSCODE_INJECTION:-}" ]] || [[ -n "${TERM_PROGRAM:-}" && "$TERM_PROGRAM" == "vscode" ]]; then
        ENVIRONMENT_TYPE="vscode"
    elif [[ -n "${PYCHARM_HOSTED:-}" ]]; then
        ENVIRONMENT_TYPE="pycharm"
    else
        ENVIRONMENT_TYPE="local"
    fi
    
    log_success "Environment type: $ENVIRONMENT_TYPE"
}

detect_network_configuration() {
    log "Detecting network configuration..."
    
    # Test direct connectivity
    if curl -s --max-time 5 https://api.github.com >/dev/null 2>&1; then
        NETWORK_TYPE="direct"
        log_success "Direct internet connectivity available"
        return 0
    fi
    
    # Test for proxy configuration
    local proxy_vars=("HTTP_PROXY" "HTTPS_PROXY" "http_proxy" "https_proxy")
    for var in "${proxy_vars[@]}"; do
        if [[ -n "${!var:-}" ]]; then
            NETWORK_TYPE="proxy"
            log_success "Proxy configuration detected: ${!var}"
            return 0
        fi
    done
    
    # Test for corporate network
    if nslookup github.com >/dev/null 2>&1 && ! curl -s --max-time 5 https://github.com >/dev/null 2>&1; then
        NETWORK_TYPE="corporate"
        log_warn "Corporate network detected - may require proxy configuration"
    else
        NETWORK_TYPE="offline"
        log_warn "No internet connectivity detected"
    fi
}

# Intelligent Python Detection and Management
detect_python_installation() {
    log "Detecting Python installation..."
    
    local python_candidates=(
        "python3.12" "python3.11" "python3.10" "python3.9" "python3.8" "python3.7"
        "python3" "python" "py"
    )
    
    for cmd in "${python_candidates[@]}"; do
        if command -v "$cmd" >/dev/null 2>&1; then
            local version
            version=$($cmd -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')" 2>/dev/null)
            
            if [[ -n "$version" ]]; then
                local major minor
                IFS='.' read -r major minor _ <<< "$version"
                
                if [[ $major -eq 3 && $minor -ge 7 ]]; then
                    PYTHON_CMD="$cmd"
                    log_success "Found Python $version at $cmd"
                    
                    # Check if this is the recommended version
                    if [[ $minor -ge 12 ]]; then
                        log_success "Using recommended Python version"
                    elif [[ $minor -lt 10 ]]; then
                        log_warn "Python $version is supported but upgrading to 3.12+ is recommended"
                    fi
                    
                    return 0
                fi
            fi
        fi
    done
    
    log_error "No suitable Python installation found (3.7+ required)"
    return 1
}

install_python_if_needed() {
    if detect_python_installation; then
        return 0
    fi
    
    log "Installing Python..."
    
    case "$PACKAGE_MANAGER" in
        "apt")
            sudo apt-get update -qq
            sudo apt-get install -y python3 python3-pip python3-venv
            ;;
        "yum"|"dnf")
            sudo $PACKAGE_MANAGER install -y python3 python3-pip
            ;;
        "pacman")
            sudo pacman -S --noconfirm python python-pip
            ;;
        "brew")
            brew install python@3.12
            ;;
        "apk")
            sudo apk add python3 py3-pip
            ;;
        *)
            log_error "Cannot automatically install Python on this system"
            log_error "Please install Python 3.7+ manually and re-run the installer"
            return 1
            ;;
    esac
    
    # Verify installation
    if ! detect_python_installation; then
        log_error "Python installation failed"
        return 1
    fi
    
    log_success "Python installed successfully"
}

# Intelligent Dependency Management
setup_virtual_environment() {
    log "Setting up Python virtual environment..."
    
    local venv_dir="$EMAD_DIR/venv"
    
    # Create virtual environment
    if ! $PYTHON_CMD -m venv "$venv_dir" 2>/dev/null; then
        log_warn "Failed to create virtual environment, proceeding with system Python"
        return 0
    fi
    
    # Activate virtual environment
    source "$venv_dir/bin/activate"
    
    # Update pip to latest version
    python -m pip install --upgrade pip >/dev/null 2>&1
    
    log_success "Virtual environment created and activated"
}

install_python_dependencies() {
    log "Installing Python dependencies..."
    
    local dependencies=(
        "requests>=2.31.0"
        "psutil>=5.9.0"
        "pyyaml>=6.0"
        "click>=8.1.0"
        "rich>=13.0.0"
        "httpx>=0.24.0"
        "aiofiles>=23.0.0"
        "cryptography>=41.0.0"
    )
    
    # Install with intelligent retry mechanism
    for dep in "${dependencies[@]}"; do
        local attempts=0
        local max_attempts=3
        
        while [[ $attempts -lt $max_attempts ]]; do
            if $PYTHON_CMD -m pip install --user "$dep" >/dev/null 2>&1; then
                log_debug "Installed: $dep"
                break
            else
                ((attempts++))
                if [[ $attempts -eq $max_attempts ]]; then
                    log_error "Failed to install $dep after $max_attempts attempts"
                    return 1
                fi
                log_warn "Retrying installation of $dep (attempt $attempts/$max_attempts)"
                sleep 2
            fi
        done
    done
    
    log_success "All Python dependencies installed"
}

# Intelligent EMAD System Download and Setup
download_emad_system() {
    log "Downloading EMAD system..."
    
    # Determine installation directory
    if [[ "$ENVIRONMENT_TYPE" == "docker" ]] || [[ "$ENVIRONMENT_TYPE" == "kubernetes" ]]; then
        EMAD_DIR="/opt/emad"
    elif [[ -w "/usr/local" ]] && [[ "$EUID" -eq 0 ]]; then
        EMAD_DIR="/usr/local/emad"
    else
        EMAD_DIR="$HOME/.emad"
    fi
    
    log "Installing EMAD to: $EMAD_DIR"
    
    # Create directory
    mkdir -p "$EMAD_DIR"
    cd "$EMAD_DIR"
    
    # Intelligent download strategy
    if [[ "$NETWORK_TYPE" == "offline" ]]; then
        download_offline_package
    elif command -v git >/dev/null 2>&1; then
        download_via_git
    else
        download_via_curl
    fi
}

download_via_git() {
    log "Downloading via Git..."
    
    local git_opts=(
        "--depth=1"
        "--single-branch"
        "--branch=main"
    )
    
    # Configure Git for corporate environments
    if [[ "$NETWORK_TYPE" == "corporate" ]]; then
        git config --global http.sslverify false 2>/dev/null || true
    fi
    
    if git clone "${git_opts[@]}" "$EMAD_REPO" . 2>/dev/null; then
        log_success "EMAD system downloaded via Git"
    else
        log_warn "Git clone failed, falling back to curl"
        download_via_curl
    fi
}

download_via_curl() {
    log "Downloading via curl..."
    
    local archive_url="$EMAD_CDN/releases/latest/emad-${EMAD_VERSION}.tar.gz"
    local temp_file="/tmp/emad-${EMAD_VERSION}.tar.gz"
    
    # Download with retry mechanism
    local attempts=0
    local max_attempts=3
    
    while [[ $attempts -lt $max_attempts ]]; do
        if curl -fsSL --retry 3 --retry-delay 2 "$archive_url" -o "$temp_file"; then
            break
        else
            ((attempts++))
            if [[ $attempts -eq $max_attempts ]]; then
                log_error "Failed to download EMAD system after $max_attempts attempts"
                return 1
            fi
            log_warn "Download failed, retrying (attempt $attempts/$max_attempts)"
            sleep 5
        fi
    done
    
    # Extract archive
    if tar -xzf "$temp_file" -C "$EMAD_DIR" --strip-components=1; then
        rm -f "$temp_file"
        log_success "EMAD system downloaded and extracted"
    else
        log_error "Failed to extract EMAD system"
        return 1
    fi
}

download_offline_package() {
    log_warn "Offline mode detected - looking for local EMAD package"
    
    local offline_paths=(
        "./emad-offline-package.tar.gz"
        "/tmp/emad-offline-package.tar.gz"
        "$HOME/Downloads/emad-offline-package.tar.gz"
    )
    
    for path in "${offline_paths[@]}"; do
        if [[ -f "$path" ]]; then
            log "Found offline package: $path"
            if tar -xzf "$path" -C "$EMAD_DIR" --strip-components=1; then
                log_success "EMAD system installed from offline package"
                return 0
            fi
        fi
    done
    
    log_error "No offline EMAD package found"
    log_error "Please download the offline package from https://emad.dev/offline"
    return 1
}

# Intelligent Project Detection and Configuration
detect_project_type() {
    log "Detecting project type..."
    
    local project_dir="${1:-$(pwd)}"
    local project_type="generic"
    
    # Modern project type detection with priority
    if [[ -f "$project_dir/package.json" ]]; then
        local package_content
        package_content=$(cat "$project_dir/package.json" 2>/dev/null)
        
        if echo "$package_content" | grep -q '"next"'; then
            project_type="nextjs"
        elif echo "$package_content" | grep -q '"react"'; then
            project_type="react"
        elif echo "$package_content" | grep -q '"vue"'; then
            project_type="vue"
        elif echo "$package_content" | grep -q '"@angular/core"'; then
            project_type="angular"
        elif echo "$package_content" | grep -q '"typescript"'; then
            project_type="typescript"
        else
            project_type="nodejs"
        fi
    elif [[ -f "$project_dir/pyproject.toml" ]]; then
        local pyproject_content
        pyproject_content=$(cat "$project_dir/pyproject.toml" 2>/dev/null)
        
        if echo "$pyproject_content" | grep -q 'fastapi'; then
            project_type="fastapi"
        elif echo "$pyproject_content" | grep -q 'django'; then
            project_type="django"
        elif echo "$pyproject_content" | grep -q 'flask'; then
            project_type="flask"
        else
            project_type="python"
        fi
    elif [[ -f "$project_dir/requirements.txt" ]] || [[ -f "$project_dir/setup.py" ]]; then
        project_type="python"
    elif [[ -f "$project_dir/Cargo.toml" ]]; then
        project_type="rust"
    elif [[ -f "$project_dir/go.mod" ]]; then
        project_type="go"
    elif [[ -f "$project_dir/pom.xml" ]]; then
        project_type="maven"
    elif [[ -f "$project_dir/build.gradle" ]] || [[ -f "$project_dir/build.gradle.kts" ]]; then
        project_type="gradle"
    elif [[ -f "$project_dir/composer.json" ]]; then
        project_type="php"
    elif [[ -f "$project_dir/Gemfile" ]]; then
        project_type="ruby"
    elif [[ -f "$project_dir/mix.exs" ]]; then
        project_type="elixir"
    elif [[ -f "$project_dir/deno.json" ]] || [[ -f "$project_dir/deno.jsonc" ]]; then
        project_type="deno"
    fi
    
    log_success "Detected project type: $project_type"
    echo "$project_type"
}

# Intelligent Configuration Generation
generate_intelligent_config() {
    log "Generating intelligent configuration..."
    
    local project_type
    project_type=$(detect_project_type)
    
    local config_dir="$EMAD_DIR/config"
    mkdir -p "$config_dir"
    
    # Generate environment-aware configuration
    cat > "$config_dir/emad-system-config.json" << EOF
{
  "version": "$EMAD_VERSION",
  "installation": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "environment": "$ENVIRONMENT_TYPE",
    "os": "$OS_TYPE",
    "arch": "$ARCH",
    "python_version": "$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2)",
    "network_type": "$NETWORK_TYPE"
  },
  "project": {
    "type": "$project_type",
    "root": "$(pwd)",
    "auto_detected": true
  },
  "features": {
    "auto_sync": true,
    "failsafe_monitoring": true,
    "health_checks": true,
    "intelligent_retry": true,
    "self_healing": true
  }
}
EOF
    
    log_success "System configuration generated"
}

# Self-Healing and Recovery Mechanisms
attempt_self_healing() {
    log "Attempting self-healing..."
    
    # Common issue fixes
    fix_permission_issues
    fix_python_path_issues
    fix_network_issues
    
    log "Self-healing attempt completed"
}

fix_permission_issues() {
    if [[ ! -w "$EMAD_DIR" ]]; then
        log "Fixing permission issues..."
        chmod -R u+w "$EMAD_DIR" 2>/dev/null || true
    fi
}

fix_python_path_issues() {
    if [[ -z "$PYTHON_CMD" ]]; then
        log "Attempting to fix Python path issues..."
        detect_python_installation || install_python_if_needed
    fi
}

fix_network_issues() {
    if [[ "$NETWORK_TYPE" == "offline" ]]; then
        log "Checking for network recovery..."
        detect_network_configuration
    fi
}

show_troubleshooting_guide() {
    echo -e "${YELLOW}${BOLD}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    Troubleshooting Guide                     ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo "Common solutions:"
    echo "1. Ensure you have internet connectivity"
    echo "2. Check if Python 3.7+ is installed: python3 --version"
    echo "3. Verify Git is available: git --version"
    echo "4. For corporate networks, configure proxy settings"
    echo "5. Run with debug mode: EMAD_DEBUG=true bash install.sh"
    echo ""
    echo "Log file: $INSTALL_LOG"
    echo "Support: https://github.com/huggingfacer04/EMAD/issues"
}

# Main Installation Flow
main() {
    print_header
    
    log "Starting EMAD Universal Installation v$EMAD_VERSION"
    log "Installation log: $INSTALL_LOG"
    
    # Phase 1: Environment Detection
    log "Phase 1: Environment Detection"
    detect_operating_system
    detect_package_manager
    detect_environment_type
    detect_network_configuration
    
    # Phase 2: Prerequisites
    log "Phase 2: Installing Prerequisites"
    install_python_if_needed
    
    # Phase 3: EMAD System Setup
    log "Phase 3: EMAD System Setup"
    download_emad_system
    setup_virtual_environment
    install_python_dependencies
    
    # Phase 4: Configuration
    log "Phase 4: Intelligent Configuration"
    generate_intelligent_config
    
    # Phase 5: Verification
    log "Phase 5: System Verification"
    if "$EMAD_DIR/scripts/verify-installation.py"; then
        log_success "Installation verification passed"
    else
        log_warn "Installation verification had issues"
    fi
    
    # Phase 6: Completion
    log_success "EMAD Universal Installation completed successfully!"
    
    echo -e "${GREEN}${BOLD}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                 Installation Complete!                      ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo "Next steps:"
    echo "1. Add EMAD to your PATH: export PATH=\"$EMAD_DIR/bin:\$PATH\""
    echo "2. Initialize in your project: emad init"
    echo "3. Start monitoring: emad start"
    echo "4. Check status: emad status"
    echo ""
    echo "Documentation: https://docs.emad.dev"
    echo "Support: https://github.com/huggingfacer04/EMAD/discussions"
}

# Execute main function if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
