#!/usr/bin/env python3

"""
EMAD Background Runner

A simpler alternative to Windows service that runs EMAD Auto-Sync in the background.
This approach is more reliable and easier to manage than Windows services.
"""

import sys
import os
import time
import signal
import subprocess
import threading
from pathlib import Path
from datetime import datetime

# Import failsafe system
try:
    from emad_failsafe_system import EMADFailsafeSystem
    FAILSAFE_AVAILABLE = True
except ImportError:
    FAILSAFE_AVAILABLE = False

class EMADBackgroundRunner:
    def __init__(self):
        self.running = False
        self.process = None
        self.script_dir = Path(__file__).parent.absolute()
        self.pid_file = self.script_dir / "emad-runner.pid"
        self.log_file = self.script_dir / "logs" / f"emad-background-{datetime.now().strftime('%Y%m%d')}.log"

        # Ensure logs directory exists
        self.log_file.parent.mkdir(exist_ok=True)

        # Initialize failsafe system
        self.failsafe = None
        if FAILSAFE_AVAILABLE:
            try:
                self.failsafe = EMADFailsafeSystem(self.script_dir)
                self.log("Failsafe system initialized")
            except Exception as e:
                self.log(f"Warning: Could not initialize failsafe system: {e}")

        # Setup signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)

    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        print(f"\n🛑 Received signal {signum}, shutting down...")
        self.stop()

    def log(self, message):
        """Log message to file and console"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] {message}"
        
        print(log_message)
        
        try:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(log_message + '\n')
        except Exception as e:
            print(f"Warning: Could not write to log file: {e}")

    def is_running(self):
        """Check if background runner is already running"""
        if not self.pid_file.exists():
            return False
        
        try:
            with open(self.pid_file, 'r') as f:
                pid = int(f.read().strip())
            
            # Check if process is still running
            try:
                os.kill(pid, 0)  # Signal 0 just checks if process exists
                return True
            except OSError:
                # Process doesn't exist, remove stale PID file
                self.pid_file.unlink()
                return False
                
        except (ValueError, FileNotFoundError):
            return False

    def write_pid(self):
        """Write current process ID to file"""
        try:
            with open(self.pid_file, 'w') as f:
                f.write(str(os.getpid()))
        except Exception as e:
            self.log(f"Warning: Could not write PID file: {e}")

    def remove_pid(self):
        """Remove PID file"""
        try:
            if self.pid_file.exists():
                self.pid_file.unlink()
        except Exception as e:
            self.log(f"Warning: Could not remove PID file: {e}")

    def start(self):
        """Start the background runner"""
        if self.is_running():
            print("❌ EMAD Background Runner is already running")
            return False
        
        print("🚀 Starting EMAD Background Runner...")
        self.log("EMAD Background Runner starting...")
        
        # Write PID file
        self.write_pid()
        
        # Import and create auto-sync instance
        try:
            sys.path.insert(0, str(self.script_dir))
            from emad_auto_sync import EMADAutoSync
            
            auto_sync = EMADAutoSync(self.script_dir)
            self.log(f"Created auto-sync instance for: {self.script_dir}")
            
        except Exception as e:
            self.log(f"Failed to create auto-sync instance: {e}")
            self.remove_pid()
            return False
        
        # Test authentication
        try:
            if auto_sync.authenticate():
                self.log(f"Authentication successful as: {auto_sync.username}")
            else:
                self.log("Authentication failed")
                self.remove_pid()
                return False
        except Exception as e:
            self.log(f"Authentication error: {e}")
            self.remove_pid()
            return False
        
        # Initial scan
        try:
            auto_sync.file_hashes = auto_sync.scan_directory()
            self.log(f"Baseline established with {len(auto_sync.file_hashes)} files")
        except Exception as e:
            self.log(f"Initial scan failed: {e}")
            self.remove_pid()
            return False
        
        # Start failsafe monitoring if available
        if self.failsafe:
            try:
                self.failsafe.start_monitoring()
                self.log("Failsafe monitoring started")

                # Update initialization timestamp
                self.failsafe.state["last_emad_initialization"] = datetime.now().isoformat()
                self.failsafe.save_state()

            except Exception as e:
                self.log(f"Warning: Could not start failsafe monitoring: {e}")

        # Main monitoring loop
        self.running = True
        self.log("Starting main monitoring loop...")

        try:
            while self.running:
                try:
                    auto_sync.monitor_cycle()

                    # Wait for next cycle (check for stop every second)
                    for _ in range(auto_sync.monitor_interval):
                        if not self.running:
                            break
                        time.sleep(1)

                except Exception as e:
                    self.log(f"Error in monitoring cycle: {e}")
                    # Wait 1 minute before retrying
                    for _ in range(60):
                        if not self.running:
                            break
                        time.sleep(1)
                        
        except KeyboardInterrupt:
            self.log("Received keyboard interrupt")
        except Exception as e:
            self.log(f"Unexpected error: {e}")
        finally:
            self.running = False

            # Stop failsafe monitoring
            if self.failsafe:
                try:
                    self.failsafe.stop_monitoring()
                    self.log("Failsafe monitoring stopped")
                except Exception as e:
                    self.log(f"Warning: Error stopping failsafe monitoring: {e}")

            self.remove_pid()
            self.log("EMAD Background Runner stopped")

        return True

    def stop(self):
        """Stop the background runner"""
        if not self.is_running():
            print("❌ EMAD Background Runner is not running")
            return False
        
        try:
            with open(self.pid_file, 'r') as f:
                pid = int(f.read().strip())
            
            print(f"🛑 Stopping EMAD Background Runner (PID: {pid})...")
            
            try:
                os.kill(pid, signal.SIGTERM)
                
                # Wait for process to stop
                for _ in range(10):
                    try:
                        os.kill(pid, 0)
                        time.sleep(1)
                    except OSError:
                        break
                else:
                    # Force kill if still running
                    print("⚠️ Process didn't stop gracefully, forcing...")
                    os.kill(pid, signal.SIGKILL)
                
                print("✅ EMAD Background Runner stopped")
                return True
                
            except OSError as e:
                if e.errno == 3:  # No such process
                    print("✅ Process was already stopped")
                    self.remove_pid()
                    return True
                else:
                    print(f"❌ Error stopping process: {e}")
                    return False
                    
        except (ValueError, FileNotFoundError):
            print("❌ Could not read PID file")
            return False

    def status(self):
        """Show status of background runner"""
        if self.is_running():
            try:
                with open(self.pid_file, 'r') as f:
                    pid = f.read().strip()
                print(f"✅ EMAD Background Runner is running (PID: {pid})")
                
                # Show recent log entries
                if self.log_file.exists():
                    print("\n📋 Recent log entries:")
                    try:
                        with open(self.log_file, 'r', encoding='utf-8') as f:
                            lines = f.readlines()
                            for line in lines[-5:]:
                                print(f"   {line.rstrip()}")
                    except Exception as e:
                        print(f"   Could not read log: {e}")
                
                return True
            except Exception as e:
                print(f"❌ Error checking status: {e}")
                return False
        else:
            print("⏹️ EMAD Background Runner is not running")
            return False

def main():
    """Main entry point"""
    runner = EMADBackgroundRunner()
    
    if len(sys.argv) < 2:
        print("🔧 EMAD Background Runner")
        print("=" * 30)
        print("Available commands:")
        print("  start   - Start background monitoring")
        print("  stop    - Stop background monitoring")
        print("  status  - Show current status")
        print("  restart - Restart background monitoring")
        print("")
        print(f"Usage: python {Path(__file__).name} <command>")
        return 0
    
    command = sys.argv[1].lower()
    
    if command == "start":
        if runner.start():
            print("✅ EMAD Background Runner started successfully")
            return 0
        else:
            print("❌ Failed to start EMAD Background Runner")
            return 1
    elif command == "stop":
        if runner.stop():
            return 0
        else:
            return 1
    elif command == "status":
        runner.status()
        return 0
    elif command == "restart":
        print("🔄 Restarting EMAD Background Runner...")
        runner.stop()
        time.sleep(2)
        if runner.start():
            print("✅ EMAD Background Runner restarted successfully")
            return 0
        else:
            print("❌ Failed to restart EMAD Background Runner")
            return 1
    else:
        print(f"❌ Unknown command: {command}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
