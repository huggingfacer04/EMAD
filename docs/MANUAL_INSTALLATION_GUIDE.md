# 🚀 BMAD Extension Manual Installation Guide

## 🎯 **Quick Fix for Your Issues**

You're experiencing these issues because the **BMAD extension is not installed in VS Code**. Here's how to fix it:

## 📋 **Step-by-Step Installation**

### **Method 1: Direct Installation (Recommended)**

1. **📁 Open VS Code**
   - Launch Visual Studio Code

2. **🔧 Open Developer Command**
   - Press `F1` or `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type: `Developer: Install Extension from Location`
   - Press Enter

3. **📂 Select Extension Folder**
   - Navigate to and select this folder: 
   ```
   C:\Users\Lenovo ThinkPad T480\Desktop\BMAD\BMAD-METHOD
   ```
   - Click "Select Folder"

4. **🔄 Restart VS Code**
   - Close VS Code completely
   - Reopen VS Code
   - The extension should now be active

### **Method 2: Package Installation**

1. **📦 Package the Extension**
   ```bash
   # In the BMAD-METHOD directory
   npm install -g vsce
   vsce package
   ```

2. **📥 Install the Package**
   - In VS Code, press `F1`
   - Type: `Extensions: Install from VSIX`
   - Select the generated `.vsix` file
   - Restart VS Code

### **Method 3: Manual Copy (Alternative)**

1. **📁 Find VS Code Extensions Folder**
   - Windows: `%USERPROFILE%\.vscode\extensions`
   - Mac: `~/.vscode/extensions`
   - Linux: `~/.vscode/extensions`

2. **📋 Copy Extension**
   - Copy the entire `BMAD-METHOD` folder to the extensions directory
   - Rename it to `bmad-code.bmad-vscode-extension-1.0.0`
   - Restart VS Code

## ✅ **Verification Steps**

After installation, verify Dakota is working:

### **1. Check Extension is Loaded**
- Open VS Code
- Go to Extensions panel (`Ctrl+Shift+X`)
- Search for "BMAD"
- You should see "BMAD AI Agent Orchestrator"
- Ensure it's **enabled**

### **2. Test Dakota Commands**
- Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
- Type "Dakota" - you should see:
  - ✅ `Dakota: Dependency Audit`
  - ✅ `Dakota: Modernize Dependencies`
  - ✅ `Dakota: Start Monitoring`
  - ✅ `Dakota: Security Scan`
  - ✅ `Dakota: Update Outdated`
  - ✅ `Dakota: Generate Report`
  - ✅ `Dakota: License Analysis`

### **3. Test Basic Functionality**
- Open a project with a `package.json` file
- Run `Dakota: Dependency Audit`
- You should see Dakota analyzing your dependencies

## 🟣 **Augment Integration**

For the **purple BMAD buttons** in Augment:

### **Prerequisites**
1. **Install Augment Code Extension**
   - Go to VS Code Extensions
   - Search for "Augment Code"
   - Install the official Augment extension

2. **Ensure BMAD Extension is Active**
   - BMAD must be installed and enabled first
   - Restart VS Code after installing both extensions

### **Finding Purple Buttons**
1. **Open Augment Interface**
   - Look for Augment icon in VS Code sidebar
   - Or use Command Palette: "Augment: Open"

2. **Look for BMAD Workflows**
   - In Augment interface, look for:
     - 🔍 **Dakota: Dependency Audit**
     - ⬆️ **Dakota: Dependency Modernization**  
     - 🛡️ **Dakota: Security Scan**
   - These should appear as workflow options

## 🔧 **Troubleshooting**

### **Commands Not Appearing?**

1. **Check Extension Status**
   ```
   Extensions Panel → Search "BMAD" → Ensure enabled
   ```

2. **Check Developer Console**
   ```
   Help → Toggle Developer Tools → Console tab
   Look for BMAD-related errors
   ```

3. **Force Reload**
   ```
   Ctrl+Shift+P → "Developer: Reload Window"
   ```

4. **Check Activation**
   ```
   Ctrl+Shift+P → "Developer: Show Running Extensions"
   Look for "BMAD AI Agent Orchestrator"
   ```

### **Augment Buttons Missing?**

1. **Verify Both Extensions**
   - ✅ BMAD AI Agent Orchestrator (enabled)
   - ✅ Augment Code (enabled)

2. **Check Augment Version**
   - Ensure you have a recent version of Augment
   - Some older versions may not support workflow providers

3. **Restart Both Extensions**
   ```
   Extensions Panel → Disable both → Enable both → Restart VS Code
   ```

### **Extension Won't Load?**

1. **Check VS Code Version**
   - Minimum required: VS Code 1.92.0+
   - Update VS Code if needed

2. **Check Node.js Version**
   - Minimum required: Node.js 20.0.0+
   - Current detected: Node.js 24.1.0 ✅

3. **Reinstall Extension**
   - Remove from Extensions panel
   - Follow installation steps again

## 🎯 **Expected Results After Installation**

### **Command Palette**
When you type "Dakota" in Command Palette, you should see:
```
🔍 Dakota: Dependency Audit
⬆️ Dakota: Modernize Dependencies  
👁️ Dakota: Start Monitoring
🛑 Dakota: Stop Monitoring
🛡️ Dakota: Security Scan
📦 Dakota: Update Outdated
📋 Dakota: Generate Report
⚖️ Dakota: License Analysis
```

### **Augment Interface**
In Augment workflows, you should see:
```
🔍 Dakota: Dependency Audit
⬆️ Dakota: Dependency Modernization
🛡️ Dakota: Security Scan
```

### **Status Bar**
You should see BMAD status in the bottom status bar:
```
🤖 BMAD: Ready
```

## 🆘 **Still Having Issues?**

If you're still experiencing problems:

1. **Check the exact error messages** in VS Code Developer Console
2. **Verify file permissions** on the extension folder
3. **Try a clean VS Code workspace** (new window)
4. **Check for conflicting extensions** that might interfere

The extension is properly implemented and compiled - the issue is just getting it installed and activated in VS Code. Once installed, Dakota will work exactly as designed!

## 🎉 **Success Indicators**

You'll know it's working when:
- ✅ Dakota commands appear in Command Palette
- ✅ Purple BMAD workflows appear in Augment
- ✅ Status bar shows "BMAD: Ready"
- ✅ Extension appears in Extensions panel as enabled
- ✅ No errors in Developer Console

**Once installed, Dakota will revolutionize your dependency management!** 🚀
