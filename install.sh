#!/bin/bash

# EMAD Universal Installation Script for Unix/Linux/macOS
# Usage: curl -sSL https://raw.githubusercontent.com/huggingfacer04/EMAD/main/install.sh | bash

set -euo pipefail

# Configuration
EMAD_REPO="https://github.com/huggingfacer04/EMAD"
EMAD_RAW_BASE="https://raw.githubusercontent.com/huggingfacer04/EMAD/main"
EMAD_DIR="${EMAD_INSTALL_DIR:-$HOME/.emad}"
EMAD_BIN_DIR="$HOME/.local/bin"
PYTHON_MIN_VERSION="3.7"
LOG_FILE="/tmp/emad-install.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

header() {
    echo -e "${PURPLE}🚀 $1${NC}"
    echo "$(printf '=%.0s' {1..60})"
}

# Error handling
cleanup() {
    if [[ $? -ne 0 ]]; then
        error "Installation failed. Check log file: $LOG_FILE"
        error "For support, visit: https://github.com/huggingfacer04/EMAD/issues"
    fi
}
trap cleanup EXIT

# System detection
detect_system() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        SYSTEM="linux"
        if command -v apt-get >/dev/null 2>&1; then
            PACKAGE_MANAGER="apt"
        elif command -v yum >/dev/null 2>&1; then
            PACKAGE_MANAGER="yum"
        elif command -v dnf >/dev/null 2>&1; then
            PACKAGE_MANAGER="dnf"
        elif command -v pacman >/dev/null 2>&1; then
            PACKAGE_MANAGER="pacman"
        else
            PACKAGE_MANAGER="unknown"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        SYSTEM="macos"
        PACKAGE_MANAGER="brew"
    else
        SYSTEM="unknown"
        PACKAGE_MANAGER="unknown"
    fi
    
    info "Detected system: $SYSTEM with package manager: $PACKAGE_MANAGER"
}

# Check prerequisites
check_prerequisites() {
    info "Checking prerequisites..."
    
    # Check for required commands
    local required_commands=("curl" "git")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            error "Required command '$cmd' not found"
            case "$PACKAGE_MANAGER" in
                "apt")
                    info "Install with: sudo apt-get install $cmd"
                    ;;
                "yum"|"dnf")
                    info "Install with: sudo $PACKAGE_MANAGER install $cmd"
                    ;;
                "pacman")
                    info "Install with: sudo pacman -S $cmd"
                    ;;
                "brew")
                    info "Install with: brew install $cmd"
                    ;;
            esac
            exit 1
        fi
    done
    
    success "All required commands available"
}

# Check Python version
check_python() {
    info "Checking Python installation..."
    
    local python_cmd=""
    for cmd in python3 python; do
        if command -v "$cmd" >/dev/null 2>&1; then
            local version=$($cmd -c "import sys; print('.'.join(map(str, sys.version_info[:2])))")
            if [[ $(echo "$version >= $PYTHON_MIN_VERSION" | bc -l) -eq 1 ]] 2>/dev/null || \
               python3 -c "import sys; exit(0 if sys.version_info >= (3, 7) else 1)" 2>/dev/null; then
                python_cmd="$cmd"
                break
            fi
        fi
    done
    
    if [[ -z "$python_cmd" ]]; then
        error "Python $PYTHON_MIN_VERSION or higher is required"
        case "$PACKAGE_MANAGER" in
            "apt")
                info "Install with: sudo apt-get install python3 python3-pip"
                ;;
            "yum"|"dnf")
                info "Install with: sudo $PACKAGE_MANAGER install python3 python3-pip"
                ;;
            "pacman")
                info "Install with: sudo pacman -S python python-pip"
                ;;
            "brew")
                info "Install with: brew install python"
                ;;
        esac
        exit 1
    fi
    
    PYTHON_CMD="$python_cmd"
    success "Python found: $python_cmd"
}

# Install Python dependencies
install_python_deps() {
    info "Installing Python dependencies..."
    
    local deps=("requests" "psutil")
    
    for dep in "${deps[@]}"; do
        if ! $PYTHON_CMD -c "import $dep" >/dev/null 2>&1; then
            info "Installing $dep..."
            if ! $PYTHON_CMD -m pip install --user "$dep"; then
                error "Failed to install $dep"
                exit 1
            fi
        else
            success "$dep already installed"
        fi
    done
    
    success "All Python dependencies installed"
}

# Download EMAD system
download_emad() {
    info "Downloading EMAD system..."
    
    # Create EMAD directory
    mkdir -p "$EMAD_DIR"
    cd "$EMAD_DIR"
    
    # Clone repository
    if [[ -d ".git" ]]; then
        info "Updating existing EMAD installation..."
        git pull origin main
    else
        info "Cloning EMAD repository..."
        git clone "$EMAD_REPO" .
    fi
    
    success "EMAD system downloaded to $EMAD_DIR"
}

# Detect project type
detect_project_type() {
    local project_dir="${1:-$(pwd)}"
    
    if [[ -f "$project_dir/package.json" ]]; then
        echo "nodejs"
    elif [[ -f "$project_dir/requirements.txt" ]] || [[ -f "$project_dir/setup.py" ]] || [[ -f "$project_dir/pyproject.toml" ]]; then
        echo "python"
    elif [[ -f "$project_dir/Cargo.toml" ]]; then
        echo "rust"
    elif [[ -f "$project_dir/pom.xml" ]] || [[ -f "$project_dir/build.gradle" ]]; then
        echo "java"
    elif [[ -f "$project_dir/go.mod" ]]; then
        echo "go"
    elif [[ -f "$project_dir/composer.json" ]]; then
        echo "php"
    elif [[ -f "$project_dir/Gemfile" ]]; then
        echo "ruby"
    else
        echo "generic"
    fi
}

# Interactive configuration
interactive_setup() {
    header "EMAD Interactive Setup"
    
    # GitHub token
    echo -e "${CYAN}Please enter your GitHub Personal Access Token:${NC}"
    echo "You can create one at: https://github.com/settings/tokens"
    echo "Required scopes: repo, workflow"
    read -s -p "GitHub Token: " GITHUB_TOKEN
    echo
    
    if [[ -z "$GITHUB_TOKEN" ]]; then
        error "GitHub token is required"
        exit 1
    fi
    
    # Validate token
    info "Validating GitHub token..."
    if ! curl -s -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user >/dev/null; then
        error "Invalid GitHub token"
        exit 1
    fi
    success "GitHub token validated"
    
    # Repository name
    echo -e "${CYAN}Enter target repository name (default: EMAD-Project):${NC}"
    read -p "Repository: " REPO_NAME
    REPO_NAME="${REPO_NAME:-EMAD-Project}"
    
    # Sync frequency
    echo -e "${CYAN}Select sync frequency:${NC}"
    echo "1) Hourly (recommended)"
    echo "2) Every 30 minutes"
    echo "3) Every 15 minutes"
    echo "4) On file change"
    read -p "Choice (1-4): " SYNC_CHOICE
    
    case "$SYNC_CHOICE" in
        1) SYNC_INTERVAL=3600 ;;
        2) SYNC_INTERVAL=1800 ;;
        3) SYNC_INTERVAL=900 ;;
        4) SYNC_INTERVAL=300 ;;
        *) SYNC_INTERVAL=3600 ;;
    esac
    
    # Failsafe sensitivity
    echo -e "${CYAN}Select failsafe sensitivity:${NC}"
    echo "1) Strict (recommended for critical projects)"
    echo "2) Balanced (recommended for most projects)"
    echo "3) Permissive (minimal interruptions)"
    read -p "Choice (1-3): " FAILSAFE_CHOICE
    
    case "$FAILSAFE_CHOICE" in
        1) FAILSAFE_SENSITIVITY="strict" ;;
        2) FAILSAFE_SENSITIVITY="balanced" ;;
        3) FAILSAFE_SENSITIVITY="permissive" ;;
        *) FAILSAFE_SENSITIVITY="balanced" ;;
    esac
    
    # Detect project type
    PROJECT_TYPE=$(detect_project_type)
    info "Detected project type: $PROJECT_TYPE"
    
    success "Configuration completed"
}

# Generate configuration files
generate_config() {
    info "Generating configuration files..."
    
    mkdir -p "$EMAD_DIR/config"
    
    # User configuration
    cat > "$EMAD_DIR/config/emad-user-config.json" << EOF
{
  "github": {
    "token": "$GITHUB_TOKEN",
    "username": "$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user | grep -o '"login":"[^"]*' | cut -d'"' -f4)",
    "repository": "$REPO_NAME"
  },
  "sync": {
    "interval_seconds": $SYNC_INTERVAL,
    "auto_start": true,
    "create_repo_if_missing": true
  },
  "project": {
    "type": "$PROJECT_TYPE",
    "root_directory": "$(pwd)"
  }
}
EOF
    
    # Project-specific configuration
    cat > "$EMAD_DIR/config/emad-project-config.json" << EOF
{
  "monitoring": {
    "include_patterns": ["**/*.py", "**/*.js", "**/*.ts", "**/*.json", "**/*.md", "**/*.yml", "**/*.yaml"],
    "exclude_patterns": [".git/**", "node_modules/**", "__pycache__/**", "*.log", "*.tmp"],
    "watch_directories": ["src", "lib", "docs", "."],
    "ignore_hidden_files": true
  },
  "project_type": "$PROJECT_TYPE",
  "failsafe": {
    "sensitivity": "$FAILSAFE_SENSITIVITY"
  }
}
EOF
    
    success "Configuration files generated"
}

# Setup EMAD commands
setup_commands() {
    info "Setting up EMAD commands..."
    
    mkdir -p "$EMAD_BIN_DIR"
    
    # Create emad command
    cat > "$EMAD_BIN_DIR/emad" << 'EOF'
#!/bin/bash
EMAD_DIR="${EMAD_INSTALL_DIR:-$HOME/.emad}"
cd "$EMAD_DIR"
python3 emad-cli.py "$@"
EOF
    
    chmod +x "$EMAD_BIN_DIR/emad"
    
    # Add to PATH if not already there
    if [[ ":$PATH:" != *":$EMAD_BIN_DIR:"* ]]; then
        echo "export PATH=\"$EMAD_BIN_DIR:\$PATH\"" >> "$HOME/.bashrc"
        echo "export PATH=\"$EMAD_BIN_DIR:\$PATH\"" >> "$HOME/.zshrc" 2>/dev/null || true
        export PATH="$EMAD_BIN_DIR:$PATH"
    fi
    
    success "EMAD commands installed"
}

# Start EMAD system
start_emad() {
    info "Starting EMAD system..."
    
    cd "$EMAD_DIR"
    
    # Update configuration in existing scripts
    if [[ -f "emad-auto-sync.py" ]]; then
        # Update GitHub token in the script
        sed -i.bak "s/GITHUB_TOKEN = .*/GITHUB_TOKEN = '$GITHUB_TOKEN'/" emad-auto-sync.py
        sed -i.bak "s/REPO_NAME = .*/REPO_NAME = '$REPO_NAME'/" emad-auto-sync.py
    fi
    
    # Start background runner
    if $PYTHON_CMD emad-background-runner.py start; then
        success "EMAD background runner started"
    else
        warning "Failed to start background runner, will continue with manual setup"
    fi
    
    success "EMAD system initialized"
}

# Verification
verify_installation() {
    header "Verifying Installation"
    
    local tests_passed=0
    local total_tests=5
    
    # Test 1: EMAD directory exists
    if [[ -d "$EMAD_DIR" ]]; then
        success "EMAD directory exists"
        ((tests_passed++))
    else
        error "EMAD directory not found"
    fi
    
    # Test 2: Configuration files exist
    if [[ -f "$EMAD_DIR/config/emad-user-config.json" ]]; then
        success "Configuration files exist"
        ((tests_passed++))
    else
        error "Configuration files not found"
    fi
    
    # Test 3: Python dependencies
    if $PYTHON_CMD -c "import requests, psutil" >/dev/null 2>&1; then
        success "Python dependencies available"
        ((tests_passed++))
    else
        error "Python dependencies missing"
    fi
    
    # Test 4: EMAD command available
    if command -v emad >/dev/null 2>&1; then
        success "EMAD command available"
        ((tests_passed++))
    else
        warning "EMAD command not in PATH (restart shell or source ~/.bashrc)"
    fi
    
    # Test 5: GitHub connectivity
    if curl -s -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user >/dev/null; then
        success "GitHub connectivity verified"
        ((tests_passed++))
    else
        error "GitHub connectivity failed"
    fi
    
    echo
    info "Verification: $tests_passed/$total_tests tests passed"
    
    if [[ $tests_passed -eq $total_tests ]]; then
        success "Installation completed successfully!"
    else
        warning "Installation completed with issues. Check the log: $LOG_FILE"
    fi
}

# Main installation flow
main() {
    header "EMAD Universal Installer"
    info "Starting installation at $(date)"
    
    detect_system
    check_prerequisites
    check_python
    install_python_deps
    download_emad
    interactive_setup
    generate_config
    setup_commands
    start_emad
    verify_installation
    
    echo
    header "Installation Complete!"
    echo -e "${GREEN}🎉 EMAD has been successfully installed!${NC}"
    echo
    echo "Next steps:"
    echo "1. Restart your shell or run: source ~/.bashrc"
    echo "2. Navigate to your project directory"
    echo "3. Run: emad init"
    echo "4. Check status: emad status"
    echo
    echo "For help: emad --help"
    echo "Documentation: https://github.com/huggingfacer04/EMAD"
}

# Run main function
main "$@"
