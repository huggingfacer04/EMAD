# EMAD Windows Setup Guide

## 🚀 Quick Fix for Your Issue

The error you encountered is now fixed. Here's how to proceed:

### **Step 1: Run Diagnostics (Recommended)**

First, let's check if everything is set up correctly:

```cmd
python troubleshoot-emad.py
```

This will check:
- ✅ Python version compatibility
- ✅ Required packages installation
- ✅ File availability
- ✅ GitHub token configuration
- ✅ API connectivity
- ✅ File permissions

### **Step 2: Install Dependencies**

If diagnostics show missing packages, install them:

```cmd
pip install requests pywin32
```

### **Step 3: Easy Service Installation**

Use the automated installer (run as Administrator):

**Option A: Batch File (Recommended)**
```cmd
# Right-click Command Prompt -> "Run as administrator"
install-emad-service.bat
```

**Option B: PowerShell**
```powershell
# Right-click PowerShell -> "Run as administrator"
.\install-emad-service.ps1
```

**Option C: Manual Installation**
```cmd
# Run as administrator
python emad-auto-sync-service.py install
python emad-auto-sync-service.py start
```

## 🔧 What Was Fixed

The original error occurred because:
- ❌ Python couldn't import `emad_auto_sync` from `emad-auto-sync.py` (hyphen vs underscore)
- ✅ **Fixed**: Created `emad_auto_sync.py` that properly imports from the main script
- ✅ **Fixed**: Updated service wrapper to use correct imports
- ✅ **Fixed**: Added automated installation scripts

## 📋 Step-by-Step Manual Setup

If you prefer manual setup:

### **1. Check Prerequisites**
```cmd
python --version
# Should show Python 3.7 or higher
```

### **2. Install Required Packages**
```cmd
pip install requests pywin32
```

### **3. Test the Main Script**
```cmd
python emad-auto-sync.py --test
```

### **4. Install Windows Service**
```cmd
# Run as Administrator
python emad-auto-sync-service.py install
```

### **5. Start the Service**
```cmd
python emad-auto-sync-service.py start
```

### **6. Check Service Status**
```cmd
python emad-auto-sync-service.py status
```

## 🎯 Service Management Commands

Once installed, you can manage the service with:

```cmd
# Start the service
python emad-auto-sync-service.py start

# Stop the service
python emad-auto-sync-service.py stop

# Check status
python emad-auto-sync-service.py status

# Remove service
python emad-auto-sync-service.py remove

# Run in debug mode (foreground)
python emad-auto-sync-service.py debug
```

## 📊 Monitoring the Service

### **View Logs**
```cmd
# View recent logs
type logs\emad-auto-sync-*.log

# Monitor logs in real-time (if you have tail)
tail -f logs\emad-auto-sync-*.log
```

### **Windows Event Viewer**
1. Open Event Viewer (`eventvwr.msc`)
2. Navigate to: Windows Logs → Application
3. Look for "EMADAutoSync" entries

### **Service Manager**
1. Open Services (`services.msc`)
2. Find "EMAD Auto-Sync Monitoring Service"
3. Check status and configure startup type

## 🔍 Troubleshooting

### **Common Issues & Solutions**

**Issue**: Service won't install
```cmd
# Solution: Run as Administrator
# Right-click Command Prompt → "Run as administrator"
python emad-auto-sync-service.py install
```

**Issue**: Import errors
```cmd
# Solution: Run diagnostics
python troubleshoot-emad.py

# Install missing packages
pip install requests pywin32
```

**Issue**: GitHub authentication fails
```cmd
# Solution: Check token in script or set environment variable
set GITHUB_TOKEN=your_token_here
python emad-auto-sync.py --test
```

**Issue**: Permission denied
```cmd
# Solution: Run as Administrator or check file permissions
# Ensure you have write access to the BMAD-METHOD directory
```

### **Debug Mode**

If the service isn't working, run in debug mode to see detailed output:

```cmd
python emad-auto-sync-service.py debug
```

This runs the service in the foreground so you can see all log messages.

## 📁 File Structure

After setup, you should have:

```
BMAD-METHOD/
├── emad-auto-sync.py          # Main monitoring script
├── emad_auto_sync.py          # Python-compatible import module
├── emad-auto-sync-service.py  # Windows service wrapper
├── install-emad-service.bat   # Automated installer (batch)
├── install-emad-service.ps1   # Automated installer (PowerShell)
├── troubleshoot-emad.py       # Diagnostic script
├── logs/                      # Log files directory
│   ├── emad-auto-sync-*.log   # Daily log files
│   └── emad-auto-sync-service.log
└── ... (other BMAD files)
```

## ✅ Verification

After installation, verify everything works:

1. **Check service status**:
   ```cmd
   python emad-auto-sync-service.py status
   ```

2. **Check logs**:
   ```cmd
   type logs\emad-auto-sync-*.log
   ```

3. **Test GitHub connection**:
   ```cmd
   python troubleshoot-emad.py
   ```

4. **Monitor for changes**:
   - Make a small change to any file in BMAD-METHOD
   - Wait for the next monitoring cycle (default: 1 hour)
   - Check logs for sync activity

## 🎉 Success!

Once everything is working, you should see:

- ✅ Service running in Windows Services
- ✅ Log entries every hour showing monitoring activity
- ✅ Automatic PRs created when files change
- ✅ Repository stays synchronized with local changes

The EMAD Auto-Sync service will now continuously monitor your BMAD-METHOD directory and automatically sync any changes to your GitHub repository!

## 📞 Need Help?

If you encounter any issues:

1. **Run diagnostics**: `python troubleshoot-emad.py`
2. **Check logs**: Look in the `logs/` directory
3. **Try debug mode**: `python emad-auto-sync-service.py debug`
4. **Verify permissions**: Ensure you're running as Administrator

The system is now fully automated and should work seamlessly in the background! 🚀✨
