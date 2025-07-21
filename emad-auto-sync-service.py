#!/usr/bin/env python3

"""
EMAD Auto-Sync Windows Service Wrapper

This script provides Windows service functionality for the EMAD Auto-Sync monitoring system.
It can be installed as a Windows service using the pywin32 package.

Installation:
1. Install pywin32: pip install pywin32
2. Install service: python emad-auto-sync-service.py install
3. Start service: python emad-auto-sync-service.py start

Usage:
python emad-auto-sync-service.py [install|remove|start|stop|restart|debug]
"""

import sys
import os
import time
import logging
from pathlib import Path

try:
    import win32serviceutil
    import win32service
    import win32event
    import servicemanager
    WINDOWS_SERVICE_AVAILABLE = True
except ImportError:
    WINDOWS_SERVICE_AVAILABLE = False
    print("Warning: pywin32 not available. Windows service functionality disabled.")

# Import the main auto-sync class
sys.path.insert(0, str(Path(__file__).parent))
from emad_auto_sync import EMADAutoSync, DEFAULT_BMAD_PATH, DEFAULT_MONITOR_INTERVAL

class EMADAutoSyncService(win32serviceutil.ServiceFramework):
    """Windows service wrapper for EMAD Auto-Sync"""
    
    _svc_name_ = "EMADAutoSync"
    _svc_display_name_ = "EMAD Auto-Sync Monitoring Service"
    _svc_description_ = "Monitors BMAD-METHOD directory and automatically syncs changes to EMAD GitHub repository"
    
    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        self.is_running = True

        # Configuration - use the directory where the service script is located
        service_dir = Path(__file__).parent.absolute()
        self.bmad_path = Path(os.environ.get('EMAD_BMAD_PATH', service_dir))
        self.monitor_interval = int(os.environ.get('EMAD_MONITOR_INTERVAL', DEFAULT_MONITOR_INTERVAL))

        # Setup logging for service
        self.setup_service_logging()
        
    def setup_service_logging(self):
        """Setup logging for Windows service"""
        log_dir = self.bmad_path / 'logs'
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / 'emad-auto-sync-service.log'
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        
        self.logger = logging.getLogger(__name__)
    
    def SvcStop(self):
        """Stop the service"""
        self.logger.info('EMAD Auto-Sync service stop requested')
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)
        self.is_running = False
    
    def SvcDoRun(self):
        """Main service execution"""
        try:
            # Report that we're starting
            self.ReportServiceStatus(win32service.SERVICE_START_PENDING)

            self.logger.info('EMAD Auto-Sync service starting...')
            servicemanager.LogMsg(
                servicemanager.EVENTLOG_INFORMATION_TYPE,
                servicemanager.PYS_SERVICE_STARTED,
                (self._svc_name_, '')
            )

            # Report that we're running
            self.ReportServiceStatus(win32service.SERVICE_RUNNING)

            # Create and run auto-sync instance
            try:
                auto_sync = EMADAutoSync(self.bmad_path, self.monitor_interval)
                self.logger.info(f'Created auto-sync instance for path: {self.bmad_path}')
            except Exception as e:
                self.logger.error(f'Failed to create auto-sync instance: {e}')
                return

            # Test authentication first
            try:
                if auto_sync.authenticate():
                    self.logger.info(f'Authentication successful as: {auto_sync.username}')
                else:
                    self.logger.error('Authentication failed, service cannot start')
                    return
            except Exception as e:
                self.logger.error(f'Authentication error: {e}')
                return

            # Initial scan
            try:
                auto_sync.file_hashes = auto_sync.scan_directory()
                self.logger.info(f'Baseline established with {len(auto_sync.file_hashes)} files')
            except Exception as e:
                self.logger.error(f'Initial scan failed: {e}')
                return

            # Main monitoring loop
            self.logger.info('Starting main monitoring loop...')
            while self.is_running:
                try:
                    auto_sync.monitor_cycle()

                    # Wait for next cycle or stop event
                    wait_time = 0
                    while wait_time < self.monitor_interval and self.is_running:
                        if win32event.WaitForSingleObject(self.hWaitStop, 1000) == win32event.WAIT_OBJECT_0:
                            self.logger.info('Stop event received')
                            break
                        wait_time += 1

                except Exception as e:
                    self.logger.error(f'Error in monitoring cycle: {e}')
                    # Wait 1 minute before retrying, but check for stop event
                    for _ in range(60):
                        if not self.is_running or win32event.WaitForSingleObject(self.hWaitStop, 1000) == win32event.WAIT_OBJECT_0:
                            break
                        time.sleep(1)

        except Exception as e:
            self.logger.error(f'Service error: {e}')
            servicemanager.LogErrorMsg(f'EMAD Auto-Sync service error: {e}')
        finally:
            self.logger.info('EMAD Auto-Sync service stopped')
            servicemanager.LogMsg(
                servicemanager.EVENTLOG_INFORMATION_TYPE,
                servicemanager.PYS_SERVICE_STOPPED,
                (self._svc_name_, '')
            )

def run_debug():
    """Run in debug mode (foreground)"""
    print("Running EMAD Auto-Sync in debug mode...")
    
    bmad_path = Path(os.environ.get('EMAD_BMAD_PATH', DEFAULT_BMAD_PATH))
    monitor_interval = int(os.environ.get('EMAD_MONITOR_INTERVAL', DEFAULT_MONITOR_INTERVAL))
    
    auto_sync = EMADAutoSync(bmad_path, monitor_interval)
    
    try:
        auto_sync.run()
    except KeyboardInterrupt:
        print("Debug mode interrupted by user")

def get_service_status():
    """Get the current status of the service"""
    try:
        import win32service
        import win32serviceutil

        status = win32serviceutil.QueryServiceStatus(EMADAutoSyncService._svc_name_)
        status_map = {
            win32service.SERVICE_STOPPED: "Stopped",
            win32service.SERVICE_START_PENDING: "Start Pending",
            win32service.SERVICE_STOP_PENDING: "Stop Pending",
            win32service.SERVICE_RUNNING: "Running",
            win32service.SERVICE_CONTINUE_PENDING: "Continue Pending",
            win32service.SERVICE_PAUSE_PENDING: "Pause Pending",
            win32service.SERVICE_PAUSED: "Paused"
        }

        current_status = status_map.get(status[1], f"Unknown ({status[1]})")
        print(f"Service Status: {current_status}")

        if status[1] == win32service.SERVICE_RUNNING:
            print("✅ Service is running normally")
        elif status[1] == win32service.SERVICE_STOPPED:
            print("⏹️ Service is stopped")
        else:
            print(f"⚠️ Service is in transitional state: {current_status}")

        return status[1]

    except Exception as e:
        print(f"❌ Could not get service status: {e}")
        print("Service may not be installed")
        return None

def main():
    """Main entry point"""
    if not WINDOWS_SERVICE_AVAILABLE:
        print("Error: pywin32 is required for Windows service functionality")
        print("Install with: pip install pywin32")
        return 1

    if len(sys.argv) == 1:
        # No arguments, try to start as service
        try:
            servicemanager.Initialize()
            servicemanager.PrepareToHostSingle(EMADAutoSyncService)
            servicemanager.StartServiceCtrlDispatcher()
        except win32service.error as details:
            print(f"Failed to start service: {details}")
            return 1
    else:
        # Handle command line arguments
        command = sys.argv[1].lower()

        if command == 'debug':
            run_debug()
        elif command == 'status':
            get_service_status()
        else:
            win32serviceutil.HandleCommandLine(EMADAutoSyncService)

    return 0

if __name__ == '__main__':
    sys.exit(main())
