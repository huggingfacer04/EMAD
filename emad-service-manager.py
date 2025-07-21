#!/usr/bin/env python3

"""
EMAD Service Manager

A simple utility to manage the EMAD Auto-Sync Windows service with better
error handling and status reporting.
"""

import sys
import time
import subprocess
from pathlib import Path

try:
    import win32service
    import win32serviceutil
    import win32api
    WINDOWS_SERVICE_AVAILABLE = True
except ImportError:
    WINDOWS_SERVICE_AVAILABLE = False

SERVICE_NAME = "EMADAutoSync"
SERVICE_DISPLAY_NAME = "EMAD Auto-Sync Monitoring Service"

def print_header(title):
    """Print a formatted header"""
    print(f"\n{'='*50}")
    print(f"🔧 {title}")
    print(f"{'='*50}")

def print_status(message, status):
    """Print a status message"""
    if status:
        print(f"✅ {message}")
    else:
        print(f"❌ {message}")

def check_admin_rights():
    """Check if running as administrator"""
    try:
        import ctypes
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def get_service_status():
    """Get detailed service status"""
    if not WINDOWS_SERVICE_AVAILABLE:
        print("❌ pywin32 not available")
        return None

    try:
        # Try to query the service
        status = win32serviceutil.QueryServiceStatus(SERVICE_NAME)

        status_map = {
            win32service.SERVICE_STOPPED: ("Stopped", "⏹️"),
            win32service.SERVICE_START_PENDING: ("Start Pending", "🔄"),
            win32service.SERVICE_STOP_PENDING: ("Stop Pending", "🔄"),
            win32service.SERVICE_RUNNING: ("Running", "✅"),
            win32service.SERVICE_CONTINUE_PENDING: ("Continue Pending", "🔄"),
            win32service.SERVICE_PAUSE_PENDING: ("Pause Pending", "🔄"),
            win32service.SERVICE_PAUSED: ("Paused", "⏸️")
        }

        status_text, emoji = status_map.get(status[1], (f"Unknown ({status[1]})", "❓"))

        print(f"{emoji} Service Status: {status_text}")

        # Additional service info
        try:
            config = win32serviceutil.QueryServiceConfig(SERVICE_NAME)
            print(f"📁 Service Path: {config[3]}")
            print(f"👤 Run As: {config[7]}")

            startup_map = {
                win32service.SERVICE_AUTO_START: "Automatic",
                win32service.SERVICE_DEMAND_START: "Manual",
                win32service.SERVICE_DISABLED: "Disabled",
                win32service.SERVICE_BOOT_START: "Boot",
                win32service.SERVICE_SYSTEM_START: "System"
            }
            startup_type = startup_map.get(config[1], f"Unknown ({config[1]})")
            print(f"🚀 Startup Type: {startup_type}")

        except Exception as e:
            print(f"⚠️ Could not get additional service info: {e}")

        return status[1]

    except Exception as e:
        if "specified service does not exist" in str(e).lower():
            print("❌ Service is not installed")
            return "NOT_INSTALLED"
        else:
            print(f"❌ Could not get service status: {e}")
            return None

def install_service():
    """Install the service"""
    print_header("Installing EMAD Auto-Sync Service")
    
    if not check_admin_rights():
        print("❌ Administrator rights required for service installation")
        print("Please run as Administrator")
        return False
    
    script_path = Path(__file__).parent / "emad-auto-sync-service.py"
    
    if not script_path.exists():
        print(f"❌ Service script not found: {script_path}")
        return False
    
    try:
        print("🔧 Installing service...")
        result = subprocess.run([
            sys.executable, str(script_path), "install"
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ Service installed successfully")
            
            # Set to automatic startup
            try:
                win32serviceutil.ChangeServiceConfig(
                    serviceName=SERVICE_NAME,
                    startType=win32service.SERVICE_AUTO_START
                )
                print("✅ Service set to automatic startup")
            except Exception as e:
                print(f"⚠️ Could not set automatic startup: {e}")
            
            return True
        else:
            print(f"❌ Service installation failed:")
            print(f"   stdout: {result.stdout}")
            print(f"   stderr: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Service installation timed out")
        return False
    except Exception as e:
        print(f"❌ Service installation error: {e}")
        return False

def start_service():
    """Start the service"""
    print_header("Starting EMAD Auto-Sync Service")
    
    status = get_service_status()
    
    if status == "NOT_INSTALLED":
        print("❌ Service is not installed. Install it first.")
        return False
    
    if status == win32service.SERVICE_RUNNING:
        print("✅ Service is already running")
        return True
    
    try:
        print("🚀 Starting service...")
        win32serviceutil.StartService(SERVICE_NAME)
        
        # Wait for service to start
        print("⏳ Waiting for service to start...")
        for i in range(30):  # Wait up to 30 seconds
            time.sleep(1)
            current_status = win32serviceutil.QueryServiceStatus(SERVICE_NAME)[1]
            
            if current_status == win32service.SERVICE_RUNNING:
                print("✅ Service started successfully")
                return True
            elif current_status == win32service.SERVICE_START_PENDING:
                print(f"🔄 Still starting... ({i+1}/30)")
            else:
                print(f"❌ Service failed to start (status: {current_status})")
                return False
        
        print("❌ Service start timed out")
        return False
        
    except Exception as e:
        print(f"❌ Failed to start service: {e}")
        return False

def stop_service():
    """Stop the service"""
    print_header("Stopping EMAD Auto-Sync Service")
    
    status = get_service_status()
    
    if status == "NOT_INSTALLED":
        print("❌ Service is not installed")
        return False
    
    if status == win32service.SERVICE_STOPPED:
        print("✅ Service is already stopped")
        return True
    
    try:
        print("⏹️ Stopping service...")
        win32serviceutil.StopService(SERVICE_NAME)
        
        # Wait for service to stop
        print("⏳ Waiting for service to stop...")
        for i in range(15):  # Wait up to 15 seconds
            time.sleep(1)
            current_status = win32serviceutil.QueryServiceStatus(SERVICE_NAME)[1]
            
            if current_status == win32service.SERVICE_STOPPED:
                print("✅ Service stopped successfully")
                return True
            elif current_status == win32service.SERVICE_STOP_PENDING:
                print(f"🔄 Still stopping... ({i+1}/15)")
            else:
                print(f"⚠️ Service status: {current_status}")
        
        print("❌ Service stop timed out")
        return False
        
    except Exception as e:
        print(f"❌ Failed to stop service: {e}")
        return False

def remove_service():
    """Remove the service"""
    print_header("Removing EMAD Auto-Sync Service")
    
    if not check_admin_rights():
        print("❌ Administrator rights required for service removal")
        return False
    
    # Stop service first
    status = get_service_status()
    if status == win32service.SERVICE_RUNNING:
        print("🔄 Stopping service before removal...")
        if not stop_service():
            print("⚠️ Could not stop service, attempting removal anyway...")
    
    script_path = Path(__file__).parent / "emad-auto-sync-service.py"
    
    try:
        print("🗑️ Removing service...")
        result = subprocess.run([
            sys.executable, str(script_path), "remove"
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ Service removed successfully")
            return True
        else:
            print(f"❌ Service removal failed:")
            print(f"   stdout: {result.stdout}")
            print(f"   stderr: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Service removal error: {e}")
        return False

def restart_service():
    """Restart the service"""
    print_header("Restarting EMAD Auto-Sync Service")
    
    if stop_service():
        time.sleep(2)  # Brief pause
        return start_service()
    else:
        return False

def show_logs():
    """Show recent log entries"""
    print_header("Recent Log Entries")
    
    logs_dir = Path(__file__).parent / "logs"
    
    if not logs_dir.exists():
        print("❌ Logs directory not found")
        return
    
    # Find the most recent log file
    log_files = list(logs_dir.glob("emad-auto-sync-*.log"))
    
    if not log_files:
        print("❌ No log files found")
        return
    
    latest_log = max(log_files, key=lambda f: f.stat().st_mtime)
    
    print(f"📄 Latest log file: {latest_log.name}")
    print("📋 Last 20 lines:")
    print("-" * 50)
    
    try:
        with open(latest_log, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for line in lines[-20:]:
                print(line.rstrip())
    except Exception as e:
        print(f"❌ Could not read log file: {e}")

def main():
    """Main entry point"""
    if not WINDOWS_SERVICE_AVAILABLE:
        print("❌ pywin32 is required for Windows service management")
        print("Install with: pip install pywin32")
        return 1
    
    if len(sys.argv) < 2:
        print("🔧 EMAD Service Manager")
        print("=" * 30)
        print("Available commands:")
        print("  install   - Install the service")
        print("  start     - Start the service")
        print("  stop      - Stop the service")
        print("  restart   - Restart the service")
        print("  remove    - Remove the service")
        print("  status    - Show service status")
        print("  logs      - Show recent log entries")
        print("")
        print(f"Usage: python {Path(__file__).name} <command>")
        return 0
    
    command = sys.argv[1].lower()
    
    if command == "install":
        success = install_service()
    elif command == "start":
        success = start_service()
    elif command == "stop":
        success = stop_service()
    elif command == "restart":
        success = restart_service()
    elif command == "remove":
        success = remove_service()
    elif command == "status":
        get_service_status()
        success = True
    elif command == "logs":
        show_logs()
        success = True
    else:
        print(f"❌ Unknown command: {command}")
        success = False
    
    return 0 if success else 1

if __name__ == '__main__':
    sys.exit(main())
