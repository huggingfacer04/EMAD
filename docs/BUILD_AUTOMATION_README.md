# BMAD-Augment Integration: Build Automation

## 🚀 **Quick Start**

I've created comprehensive automation scripts that handle all the building, compilation, and testing steps for you! Here are your options:

### **Option 1: Windows Batch File (Easiest)**
```cmd
# Double-click or run from command prompt
build-integration.bat
```

### **Option 2: Cross-Platform Node.js Script**
```bash
# Works on Windows, Mac, and Linux
node build-integration.js
```

### **Option 3: PowerShell Script (Windows)**
```powershell
# Full-featured PowerShell automation
.\build-and-test-integration.ps1
```

### **Option 4: NPM Scripts**
```bash
# Quick build
npm run build-integration

# Verbose output
npm run build-integration:verbose

# Clean build
npm run build-integration:clean

# Package only
npm run build-integration:package
```

---

## 📋 **What the Scripts Do Automatically**

### **1. Prerequisites Check**
- ✅ Verifies Node.js is installed
- ✅ Verifies npm is available
- ✅ Checks for TypeScript (installs if missing)
- ✅ Checks for VS Code CLI (optional)

### **2. Dependency Management**
- ✅ Installs npm dependencies if needed
- ✅ Handles clean installs (removes node_modules)
- ✅ Updates packages if requested

### **3. TypeScript Compilation**
- ✅ Compiles all TypeScript files
- ✅ Verifies integration files are compiled
- ✅ Checks output directory structure
- ✅ Reports compilation errors clearly

### **4. Integration Testing**
- ✅ Validates package.json structure
- ✅ Runs integration test suite
- ✅ Verifies all required files exist
- ✅ Tests command registration

### **5. VSIX Package Creation**
- ✅ Installs vsce if needed
- ✅ Creates installable .vsix package
- ✅ Reports package location

### **6. Next Steps Guidance**
- ✅ Shows how to test the integration
- ✅ Provides installation commands
- ✅ Lists created files and documentation

---

## 🎯 **Recommended Workflow**

### **For First-Time Setup:**
```bash
# Run the comprehensive build
node build-integration.js --verbose
```

### **For Development:**
```bash
# Quick build during development
npm run build-integration

# Watch mode for continuous compilation
npm run watch
```

### **For Clean Rebuild:**
```bash
# Clean everything and rebuild
node build-integration.js --clean --verbose
```

### **For Distribution:**
```bash
# Create VSIX package
node build-integration.js --package-only
```

---

## 🔧 **Script Options**

### **Node.js Script Options:**
```bash
node build-integration.js [options]

Options:
  --verbose      Enable detailed output
  --skip-tests   Skip integration tests
  --clean        Clean build (remove node_modules and out)
  --package-only Only create VSIX package
  --help, -h     Show help message
```

### **PowerShell Script Options:**
```powershell
.\build-and-test-integration.ps1 [options]

Options:
  -SkipTests     Skip integration tests
  -PackageOnly   Only create VSIX package
  -Verbose       Enable detailed output
  -CleanBuild    Clean build (remove directories)
```

### **Batch File Options:**
The batch file provides an interactive menu:
1. Full build and test (recommended)
2. Clean build
3. Build only (skip tests)
4. Package only
5. Verbose build
6. Quick build

---

## 📊 **Expected Output**

### **Successful Build Output:**
```
========================================
  BMAD-Augment Integration Builder
========================================

✅ Node.js: v20.x.x
✅ npm: v10.x.x
✅ TypeScript: Version 5.x.x
✅ VS Code: Available

✅ Dependencies installed successfully
✅ TypeScript compilation successful
✅ Package.json commands verified
✅ Integration tests passed
✅ All integration source files present
✅ VSIX package created: bmad-vscode-extension-1.0.0.vsix

🎉 All automated steps completed successfully!
```

### **Next Steps Shown:**
```
To test the integration:
1. Restart VS Code or reload window (Ctrl+R)
2. Open Command Palette (Ctrl+Shift+P)
3. Search for "BMAD" commands
4. Try "BMAD: Show Help" to verify functionality

To install the extension:
   code --install-extension bmad-vscode-extension-1.0.0.vsix
```

---

## 🔍 **Troubleshooting**

### **Common Issues and Solutions:**

#### **"Node.js not found"**
```bash
# Install Node.js from https://nodejs.org/
# Or use package manager:
winget install OpenJS.NodeJS  # Windows
brew install node             # Mac
sudo apt install nodejs npm   # Ubuntu
```

#### **"Permission denied" (PowerShell)**
```powershell
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### **"TypeScript compilation failed"**
```bash
# Check for syntax errors in TypeScript files
npm run lint-check

# Install TypeScript globally if needed
npm install -g typescript
```

#### **"VSIX creation failed"**
```bash
# Install vsce globally
npm install -g @vscode/vsce

# Or use npx
npx @vscode/vsce package
```

---

## 📁 **Generated Files**

After running the automation scripts, you'll have:

### **Compiled Output:**
```
out/
├── extension.js
├── integration/
│   ├── AugmentIntegration.js
│   ├── AugmentMenuIntegration.js
│   └── AugmentAPI.js
├── commands/
│   └── CommandManager.js
└── ... (other compiled files)
```

### **Package:**
```
bmad-vscode-extension-1.0.0.vsix
```

### **Documentation:**
```
AUGMENT_INTEGRATION_README.md
AUGMENT_INTEGRATION_COMPLETE.md
BUILD_AUTOMATION_README.md
```

---

## 🎉 **Success Indicators**

### **Build Successful When:**
- ✅ All scripts complete without errors
- ✅ `out/` directory contains compiled JavaScript files
- ✅ Integration files are present in `out/integration/`
- ✅ VSIX package is created
- ✅ No TypeScript compilation errors

### **Integration Working When:**
- ✅ VS Code shows BMAD commands in Command Palette
- ✅ Status bar shows BMAD indicator
- ✅ Context menus show BMAD options
- ✅ No console errors in VS Code Developer Tools

---

## 🚀 **Ready to Go!**

Your BMAD-Augment integration is now fully automated! Simply run any of the build scripts, and everything will be compiled, tested, and packaged automatically.

**Recommended next step:** Run `node build-integration.js --verbose` to see the complete build process in action!

---

## 📞 **Support**

If you encounter any issues with the automation scripts:

1. **Check the verbose output** for detailed error messages
2. **Verify prerequisites** are installed correctly
3. **Run clean build** to start fresh
4. **Check the troubleshooting section** above

The automation scripts are designed to be robust and provide clear error messages to help you resolve any issues quickly!
