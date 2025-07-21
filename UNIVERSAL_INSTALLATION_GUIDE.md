# EMAD Universal Installation Guide

## 🚀 One-Command Installation

EMAD (Ecosystem for BMad Method AI Development) can be installed with a single command on any platform:

### **Unix/Linux/macOS**
```bash
curl -sSL https://raw.githubusercontent.com/huggingfacer04/EMAD/main/install.sh | bash
```

### **Windows PowerShell**
```powershell
powershell -ExecutionPolicy Bypass -c "iwr https://raw.githubusercontent.com/huggingfacer04/EMAD/main/install.ps1 | iex"
```

### **Windows Command Prompt**
```cmd
curl -sSL https://raw.githubusercontent.com/huggingfacer04/EMAD/main/install.bat -o install-emad.bat && install-emad.bat
```

## 📋 Prerequisites

### **System Requirements**
- **Python 3.7+** (automatically checked and guided installation)
- **Git** (for repository management)
- **Internet connection** (for GitHub integration)
- **10MB disk space** (for EMAD system files)

### **Supported Platforms**
- ✅ **Windows 10/11** (PowerShell 5.1+, Command Prompt)
- ✅ **macOS 10.15+** (bash, zsh)
- ✅ **Ubuntu 20.04+** (bash)
- ✅ **CentOS/RHEL 8+** (bash)
- ✅ **Debian 10+** (bash)
- ✅ **Arch Linux** (bash)

## 🎯 Installation Process

### **What Happens During Installation**

1. **System Detection**: Automatically detects OS, package manager, and Python installation
2. **Dependency Check**: Verifies and installs required Python packages (`requests`, `psutil`)
3. **EMAD Download**: Clones the complete EMAD system from GitHub
4. **Interactive Setup**: Guides you through configuration with smart defaults
5. **Project Detection**: Automatically detects your project type and optimizes settings
6. **Configuration Generation**: Creates personalized configuration files
7. **Command Setup**: Installs `emad` command for easy system management
8. **System Start**: Launches EMAD background monitoring
9. **Verification**: Runs comprehensive tests to ensure everything works

### **Interactive Configuration**

During installation, you'll be prompted for:

- **GitHub Personal Access Token** (with scope validation)
- **Target Repository Name** (with auto-creation option)
- **Sync Frequency** (hourly, 30min, 15min, on-change)
- **Failsafe Sensitivity** (strict, balanced, permissive)

### **Project Type Detection**

EMAD automatically detects and optimizes for:

- **Node.js/JavaScript** (`package.json` detected)
- **Python** (`requirements.txt`, `setup.py`, `pyproject.toml`)
- **Rust** (`Cargo.toml`)
- **Java** (`pom.xml`, `build.gradle`)
- **Go** (`go.mod`)
- **Generic** (fallback for other project types)

## 🔧 Post-Installation

### **Verification**

After installation, verify everything is working:

```bash
# Check system status
emad status

# Run comprehensive tests
emad test

# View health report
python ~/.emad/emad-health-monitor.py
```

### **Project Initialization**

Navigate to your project directory and initialize EMAD:

```bash
cd /path/to/your/project
emad init
emad start
```

### **Essential Commands**

```bash
# System management
emad start          # Start background monitoring
emad stop           # Stop background monitoring
emad restart        # Restart monitoring
emad status         # Show system status

# Configuration
emad config         # Show current configuration
emad config --edit  # Edit configuration interactively

# Troubleshooting
emad test           # Run system tests
emad help           # Show help information
```

## 🛠️ Advanced Installation Options

### **Custom Installation Directory**

```bash
# Unix/Linux/macOS
export EMAD_INSTALL_DIR="/custom/path"
curl -sSL https://raw.githubusercontent.com/huggingfacer04/EMAD/main/install.sh | bash

# Windows PowerShell
$env:EMAD_INSTALL_DIR = "C:\custom\path"
iwr https://raw.githubusercontent.com/huggingfacer04/EMAD/main/install.ps1 | iex
```

### **Offline Installation**

1. Download the installer and EMAD repository:
```bash
# Download installer
curl -sSL https://raw.githubusercontent.com/huggingfacer04/EMAD/main/install.sh -o install-emad.sh

# Download EMAD repository
git clone https://github.com/huggingfacer04/EMAD.git
```

2. Run offline installation:
```bash
chmod +x install-emad.sh
EMAD_OFFLINE=true EMAD_REPO_PATH="./EMAD" ./install-emad.sh
```

### **Silent Installation**

For automated deployments:

```bash
# Unix/Linux/macOS
export EMAD_GITHUB_TOKEN="your_token_here"
export EMAD_REPO_NAME="your-repo-name"
export EMAD_SYNC_INTERVAL="3600"
export EMAD_FAILSAFE_SENSITIVITY="balanced"
curl -sSL https://raw.githubusercontent.com/huggingfacer04/EMAD/main/install.sh | bash -s -- --silent
```

## 🔍 Troubleshooting

### **Common Installation Issues**

**Issue**: Python version too old
```bash
# Solution: Install Python 3.7+
# Ubuntu/Debian: sudo apt-get install python3.8
# CentOS/RHEL: sudo yum install python38
# macOS: brew install python@3.8
# Windows: Download from python.org
```

**Issue**: Permission denied
```bash
# Solution: Check permissions and run as appropriate user
# Don't run as root unless necessary
# Ensure user has write access to installation directory
```

**Issue**: Network connectivity problems
```bash
# Solution: Check firewall and proxy settings
# For corporate networks, configure proxy:
export https_proxy=http://proxy:port
export http_proxy=http://proxy:port
```

**Issue**: Git not found
```bash
# Solution: Install Git
# Ubuntu/Debian: sudo apt-get install git
# CentOS/RHEL: sudo yum install git
# macOS: xcode-select --install
# Windows: Download from git-scm.com
```

### **Verification and Diagnostics**

```bash
# Run comprehensive health check
python ~/.emad/emad-health-monitor.py

# Run installation verification
python ~/.emad/emad-installation-verifier.py

# Check system logs
cat ~/.emad/logs/emad-*.log

# Test GitHub connectivity
python -c "
import requests
token = 'your_token'
r = requests.get('https://api.github.com/user', 
                headers={'Authorization': f'Bearer {token}'})
print(f'Status: {r.status_code}, User: {r.json().get(\"login\", \"Unknown\")}')
"
```

### **Manual Recovery**

If installation fails, you can manually recover:

```bash
# 1. Clean up partial installation
rm -rf ~/.emad
rm -f ~/.local/bin/emad

# 2. Clear Python cache
python -c "import sys; print(sys.path)" # Check paths
find ~/.local/lib/python*/site-packages -name "*emad*" -delete

# 3. Reinstall
curl -sSL https://raw.githubusercontent.com/huggingfacer04/EMAD/main/install.sh | bash
```

## 🔄 Updates and Maintenance

### **Updating EMAD**

```bash
# Update to latest version
cd ~/.emad
git pull origin main

# Restart services
emad restart

# Verify update
emad status
```

### **Backup Configuration**

```bash
# Backup configuration
cp -r ~/.emad/config ~/.emad/config.backup.$(date +%Y%m%d)

# Restore configuration
cp -r ~/.emad/config.backup.YYYYMMDD ~/.emad/config
```

## 🌐 Integration Examples

### **CI/CD Integration**

**GitHub Actions**:
```yaml
name: EMAD Integration
on: [push, pull_request]
jobs:
  emad-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install EMAD
        run: curl -sSL https://raw.githubusercontent.com/huggingfacer04/EMAD/main/install.sh | bash
        env:
          EMAD_GITHUB_TOKEN: ${{ secrets.EMAD_TOKEN }}
      - name: Run EMAD Tests
        run: emad test
```

### **Docker Integration**

```dockerfile
FROM python:3.9-slim

# Install EMAD
RUN curl -sSL https://raw.githubusercontent.com/huggingfacer04/EMAD/main/install.sh | bash

# Configure EMAD
ENV EMAD_GITHUB_TOKEN=${GITHUB_TOKEN}
ENV EMAD_REPO_NAME=${REPO_NAME}

# Start EMAD
CMD ["emad", "start"]
```

## 📞 Support and Resources

### **Getting Help**

- **Documentation**: https://github.com/huggingfacer04/EMAD/wiki
- **Issues**: https://github.com/huggingfacer04/EMAD/issues
- **Discussions**: https://github.com/huggingfacer04/EMAD/discussions

### **Community**

- **Discord**: [EMAD Community Server](https://discord.gg/emad)
- **Reddit**: r/EMADDevelopment
- **Stack Overflow**: Tag questions with `emad-system`

### **Contributing**

- **Bug Reports**: Use GitHub Issues with detailed reproduction steps
- **Feature Requests**: Use GitHub Discussions for new feature ideas
- **Pull Requests**: Follow the contribution guidelines in CONTRIBUTING.md

## 🎉 Success Indicators

After successful installation, you should see:

- ✅ `emad status` shows all systems operational
- ✅ Background runner process active
- ✅ Failsafe systems enabled and monitoring
- ✅ GitHub connectivity verified
- ✅ Project files being monitored
- ✅ Automatic sync to GitHub repository

**Welcome to the EMAD ecosystem! Your development workflow is now protected and automated.** 🚀✨

---

*For the complete EMAD documentation, visit: https://github.com/huggingfacer04/EMAD*
