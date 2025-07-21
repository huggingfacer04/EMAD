# EMAD Repository Setup and Auto-Sync Monitoring Guide

## 🚀 Quick Start

### 1. **Fixed Repository Creation Scripts**

The GitHub API errors have been resolved in the updated scripts:

**Fixed Issues:**
- ✅ Added SHA hash retrieval for existing files
- ✅ Proper handling of file updates vs. new file creation
- ✅ Comprehensive error handling for 422 status codes
- ✅ Support for updating auto-generated files (README.md, .gitignore)

**Run the Fixed Scripts:**

```bash
# Node.js (Recommended)
node create-emad-repository.js

# Python Alternative
python create-emad-repository.py

# Windows Batch
create-emad-repository.bat
```

### 2. **Automated Monitoring System**

The new `emad-auto-sync.py` provides continuous monitoring and synchronization:

**Features:**
- 🔄 Hourly monitoring of BMAD-METHOD directory
- 🌿 Automatic branch creation with timestamps
- 📝 Descriptive commit messages for all changes
- 🔀 Automatic Pull Request creation and merging
- 📊 Comprehensive logging and error handling
- ⚙️ Configurable monitoring intervals
- 🛡️ Robust error recovery and retry mechanisms

## 📋 Repository Creation (Fixed Scripts)

### **What's Fixed:**

1. **SHA Hash Handling**: Scripts now check if files exist and retrieve their SHA hashes
2. **Update vs. Create**: Proper differentiation between updating existing files and creating new ones
3. **Error Recovery**: Better error handling for GitHub API responses
4. **File Conflict Resolution**: Handles conflicts with auto-generated repository files

### **Expected Output:**

```
🎯 EMAD Repository Creation Starting...

🔐 Authenticating with GitHub...
✅ Authenticated as: YOUR_USERNAME

🚀 Creating EMAD repository...
✅ Repository created: https://github.com/YOUR_USERNAME/EMAD

📁 Preparing files for upload...
📊 Found 150+ files to upload

📤 Uploading batch 1/30...
🔄 Updating existing file: README.md
✅ Updated: README.md
🔄 Updating existing file: .gitignore
✅ Updated: .gitignore
📝 Creating new file: src/agents/SynergyAgent.ts
✅ Created: src/agents/SynergyAgent.ts
...

📊 Upload complete: 150 successful, 0 failed

🎉 EMAD Repository Creation Complete!
📍 Repository URL: https://github.com/YOUR_USERNAME/EMAD
```

## 🔄 Auto-Sync Monitoring System

### **Installation**

```bash
# Install Python dependencies
pip install requests

# Optional: For daemon mode on Linux
pip install python-daemon

# Optional: For Windows service
pip install pywin32
```

### **Basic Usage**

```bash
# Run in foreground (recommended for testing)
python emad-auto-sync.py

# Run with custom interval (30 minutes)
python emad-auto-sync.py --interval 1800

# Run single test cycle
python emad-auto-sync.py --test

# Run as daemon (Linux/macOS)
python emad-auto-sync.py --daemon
```

### **Configuration Options**

```bash
# Custom BMAD path
python emad-auto-sync.py --bmad-path /path/to/your/BMAD-METHOD

# Custom monitoring interval (in seconds)
python emad-auto-sync.py --interval 3600  # 1 hour

# Test mode (single cycle)
python emad-auto-sync.py --test

# Daemon mode (background)
python emad-auto-sync.py --daemon
```

### **How It Works**

1. **Initial Scan**: Establishes baseline file hashes
2. **Periodic Monitoring**: Scans directory every hour (configurable)
3. **Change Detection**: Identifies added, modified, and deleted files
4. **Branch Creation**: Creates timestamped branch (e.g., `auto-update-2024-01-15-14-30`)
5. **File Synchronization**: Uploads/updates/deletes files in the branch
6. **Pull Request**: Creates PR with detailed change summary
7. **Auto-Merge**: Automatically merges PR if successful
8. **Cleanup**: Deletes the temporary branch

### **Example Monitoring Output**

```
2024-01-15 14:30:00 - INFO - Starting EMAD Auto-Sync monitoring...
2024-01-15 14:30:00 - INFO - Monitoring directory: /path/to/BMAD-METHOD
2024-01-15 14:30:00 - INFO - Repository: username/EMAD
2024-01-15 14:30:00 - INFO - Monitor interval: 3600 seconds
2024-01-15 14:30:01 - INFO - Baseline established with 150 files
2024-01-15 15:30:00 - INFO - Starting monitoring cycle...
2024-01-15 15:30:02 - INFO - Detected 3 changes: 1 added, 2 modified, 0 deleted
2024-01-15 15:30:03 - INFO - Created branch: auto-update-2024-01-15-15-30
2024-01-15 15:30:05 - INFO - Uploaded src/agents/NewAgent.ts to branch auto-update-2024-01-15-15-30
2024-01-15 15:30:07 - INFO - Uploaded src/agents/SynergyAgent.ts to branch auto-update-2024-01-15-15-30
2024-01-15 15:30:09 - INFO - Uploaded package.json to branch auto-update-2024-01-15-15-30
2024-01-15 15:30:11 - INFO - Created PR #5: Auto-sync: 3 file changes (2024-01-15-15-30)
2024-01-15 15:30:14 - INFO - Merged PR #5
2024-01-15 15:30:15 - INFO - Deleted branch: auto-update-2024-01-15-15-30
2024-01-15 15:30:15 - INFO - Successfully synced 3 changes
```

## 🖥️ System Service Setup

### **Linux (systemd)**

1. **Copy service file**:
   ```bash
   sudo cp emad-auto-sync.service /etc/systemd/system/
   ```

2. **Edit paths in service file**:
   ```bash
   sudo nano /etc/systemd/system/emad-auto-sync.service
   # Update paths to match your installation
   ```

3. **Enable and start service**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable emad-auto-sync
   sudo systemctl start emad-auto-sync
   ```

4. **Check status**:
   ```bash
   sudo systemctl status emad-auto-sync
   sudo journalctl -u emad-auto-sync -f
   ```

### **Windows Service**

1. **Install service**:
   ```cmd
   python emad-auto-sync-service.py install
   ```

2. **Start service**:
   ```cmd
   python emad-auto-sync-service.py start
   ```

3. **Check status**:
   ```cmd
   python emad-auto-sync-service.py status
   ```

4. **Debug mode**:
   ```cmd
   python emad-auto-sync-service.py debug
   ```

### **macOS (launchd)**

Create `~/Library/LaunchAgents/com.emad.autosync.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.emad.autosync</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/path/to/BMAD-METHOD/emad-auto-sync.py</string>
        <string>--bmad-path</string>
        <string>/path/to/BMAD-METHOD</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/path/to/BMAD-METHOD/logs/emad-auto-sync.log</string>
    <key>StandardErrorPath</key>
    <string>/path/to/BMAD-METHOD/logs/emad-auto-sync-error.log</string>
</dict>
</plist>
```

Load the service:
```bash
launchctl load ~/Library/LaunchAgents/com.emad.autosync.plist
```

## 📊 Monitoring and Logs

### **Log Files**

- **Main Log**: `logs/emad-auto-sync-YYYYMMDD.log`
- **Service Log**: `logs/emad-auto-sync-service.log` (Windows)
- **Error Log**: `logs/emad-auto-sync-error.log`

### **Log Levels**

- **INFO**: Normal operations, monitoring cycles, successful syncs
- **WARNING**: Non-critical issues, retries, skipped files
- **ERROR**: Failed operations, API errors, authentication issues

### **Monitoring Commands**

```bash
# View recent logs
tail -f logs/emad-auto-sync-*.log

# Check service status (Linux)
systemctl status emad-auto-sync

# View service logs (Linux)
journalctl -u emad-auto-sync -f

# Windows service status
sc query EMADAutoSync
```

## 🔧 Configuration

### **Environment Variables**

```bash
export EMAD_BMAD_PATH="/path/to/BMAD-METHOD"
export EMAD_MONITOR_INTERVAL="3600"
export EMAD_GITHUB_TOKEN="your_token_here"
```

### **Configuration File**

Edit `emad-auto-sync-config.json` for advanced configuration:

```json
{
  "monitoring": {
    "interval_seconds": 3600,
    "enable_auto_merge": true,
    "max_files_per_pr": 50
  },
  "exclusions": {
    "patterns": [".git", "node_modules", "*.log"]
  },
  "pull_request": {
    "auto_merge": true,
    "merge_method": "squash"
  }
}
```

## 🚨 Troubleshooting

### **Common Issues**

1. **Authentication Failed**
   - Verify GitHub token is valid
   - Check token permissions (repo access required)

2. **File Upload Errors**
   - Check file permissions
   - Verify file size limits (100MB max)

3. **Service Won't Start**
   - Check Python path in service file
   - Verify all dependencies installed
   - Check log files for specific errors

4. **High CPU Usage**
   - Increase monitoring interval
   - Add more exclusion patterns
   - Check for large files being monitored

### **Debug Mode**

```bash
# Run with verbose logging
python emad-auto-sync.py --test

# Check authentication
python -c "from emad_auto_sync import EMADAutoSync; sync = EMADAutoSync('.'); print(sync.authenticate())"
```

## ✅ Success Verification

After setup, you should see:

1. **Repository Created**: https://github.com/YOUR_USERNAME/EMAD
2. **Files Uploaded**: 150+ files from BMAD-METHOD
3. **Monitoring Active**: Log entries every hour
4. **Auto-Sync Working**: PRs created for changes
5. **Service Running**: System service active and stable

**Your EMAD repository is now fully automated with continuous synchronization!** 🚀✨
