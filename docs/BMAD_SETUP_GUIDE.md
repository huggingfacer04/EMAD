# 🚀 BMAD Extension Setup & Configuration Guide

## 📋 **Quick Setup Checklist**

### ✅ **1. Icon Setup**
- [ ] Convert `images/bmad-icon.svg` to PNG format (128x128px)
- [ ] Use any online SVG to PNG converter or image editor
- [ ] Save as `images/bmad-icon.png`

### ✅ **2. Extension Testing**
Your extension is already compiled and ready! Here's how to test it:

#### **In VS Code Insiders (Extension Development Host):**
1. Press `Ctrl+Shift+P` to open Command Palette
2. Type "BMAD" to see all available commands:
   - `BMAD: Quick Mode Selection` (Ctrl+Shift+B)
   - `BMAD: Activate Documentation Mode`
   - `BMAD: Activate Full Development Mode`
   - `BMAD: Continue Existing Project`
   - `BMAD: Task List Overview`
   - `BMAD: Debug & Troubleshoot Mode`
   - `BMAD: Continuous Execution Mode`
   - `BMAD: Feature Gap Analysis Mode`
   - `BMAD: GitHub Integration & Documentation Mode`
   - `BMAD: Scan Workspace` (Ctrl+Shift+Alt+S)
   - `BMAD: Auto Setup Project` (Ctrl+Shift+Alt+I)

### ✅ **3. Augment Code Integration**

**YES! This extension will work perfectly with Augment Code!** Here's why:

#### **🤝 Compatibility Features:**
- **VS Code Extension**: Works in any VS Code environment including Augment Code
- **Command Palette Integration**: All BMAD commands accessible via `Ctrl+Shift+P`
- **Keyboard Shortcuts**: Quick access without interfering with Augment Code
- **Context Menu Integration**: Right-click folder → "Auto Setup Project"
- **Status Bar Integration**: Shows BMAD status alongside other extensions

#### **🔄 Workflow Integration:**
1. **Use Augment Code** for your regular AI coding assistance
2. **Use BMAD** for:
   - Project planning and documentation
   - AI agent orchestration
   - Architecture design
   - Task breakdown and management
   - Multi-agent collaboration workflows

#### **💡 Recommended Workflow:**
```
1. Open project in VS Code with Augment Code
2. Use BMAD: Quick Mode Selection (Ctrl+Shift+B)
3. Choose Documentation Mode for planning
4. Use Augment Code for actual coding
5. Use BMAD for project management and orchestration
```

### ✅ **4. Configuration Options**

Access via: `File > Preferences > Settings > Extensions > BMAD AI Agent Orchestrator`

**Key Settings:**
- `bmad.autoInitialize`: Auto-setup BMAD in new workspaces (default: true)
- `bmad.defaultMode`: Default mode for new projects (default: documentation)
- `bmad.enableRealTimeMonitoring`: Real-time workspace monitoring (default: true)
- `bmad.statusBarIntegration`: Show status in VS Code status bar (default: true)

### ✅ **5. Publishing Your Extension**

When ready to share:
```bash
# Install VSCE (VS Code Extension Manager)
npm install -g @vscode/vsce

# Package your extension
npm run vsce:package

# This creates: bmad-vscode-extension-1.0.0.vsix
```

## 🎯 **Testing Commands**

### **Start Here:**
1. `BMAD: Quick Mode Selection` - Main entry point
2. `BMAD: Scan Workspace` - Analyze current project
3. `BMAD: Auto Setup Project` - Initialize BMAD structure

### **Documentation Workflow:**
1. `BMAD: Activate Documentation Mode`
2. Follow the AI agent prompts
3. Get professional handoff documents

### **Development Workflow:**
1. `BMAD: Activate Full Development Mode`
2. Select AI agents for your project
3. Collaborate with AI team

## 🔧 **Troubleshooting**

### **Extension Not Loading:**
- Check VS Code Insiders is running in Extension Development Host mode
- Look for "[Extension Development Host]" in window title
- Check terminal for compilation errors

### **Commands Not Appearing:**
- Press `Ctrl+Shift+P` and type "BMAD"
- Check if extension is activated (status bar should show BMAD status)
- Try reloading window: `Ctrl+Shift+P` → "Developer: Reload Window"

### **Icon Not Showing:**
- Convert SVG to PNG (128x128px)
- Save as `images/bmad-icon.png`
- Recompile: `npm run compile`

## 🌟 **Next Steps**

1. **Test all commands** in Extension Development Host
2. **Create the PNG icon** from the provided SVG
3. **Configure settings** to your preferences
4. **Use alongside Augment Code** for enhanced AI development
5. **Package and share** when ready!

---

**🎉 Your BMAD extension is ready to revolutionize your AI-assisted development workflow!**
