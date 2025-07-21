#!/usr/bin/env python3

"""
EMAD Command Line Interface

Universal CLI for managing the EMAD (Ecosystem for BMad Method AI Development) system.
Provides unified access to all EMAD functionality across platforms.
"""

import sys
import os
import json
import argparse
import subprocess
from pathlib import Path
from datetime import datetime

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

try:
    from emad_auto_sync import EMADAutoSync
    from emad_failsafe_system import EMADFailsafeSystem
    EMAD_MODULES_AVAILABLE = True
except ImportError as e:
    EMAD_MODULES_AVAILABLE = False
    IMPORT_ERROR = str(e)

class EMADConfig:
    """EMAD configuration management"""
    
    def __init__(self, emad_dir: Path):
        self.emad_dir = emad_dir
        self.config_dir = emad_dir / "config"
        self.user_config_path = self.config_dir / "emad-user-config.json"
        self.project_config_path = self.config_dir / "emad-project-config.json"
        
        self.config_dir.mkdir(exist_ok=True)
        
    def load_user_config(self):
        """Load user configuration"""
        try:
            if self.user_config_path.exists():
                with open(self.user_config_path, 'r') as f:
                    return json.load(f)
            return {}
        except Exception as e:
            print(f"Error loading user config: {e}")
            return {}
    
    def load_project_config(self):
        """Load project configuration"""
        try:
            if self.project_config_path.exists():
                with open(self.project_config_path, 'r') as f:
                    return json.load(f)
            return {}
        except Exception as e:
            print(f"Error loading project config: {e}")
            return {}
    
    def save_user_config(self, config):
        """Save user configuration"""
        try:
            with open(self.user_config_path, 'w') as f:
                json.dump(config, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving user config: {e}")
            return False

class EMADCLI:
    """Main EMAD CLI class"""
    
    def __init__(self):
        self.emad_dir = Path(__file__).parent.absolute()
        self.config = EMADConfig(self.emad_dir)
        self.user_config = self.config.load_user_config()
        self.project_config = self.config.load_project_config()
    
    def print_header(self, title):
        """Print formatted header"""
        print(f"\n🚀 {title}")
        print("=" * 60)
    
    def print_status(self, message, status):
        """Print status message"""
        if status:
            print(f"✅ {message}")
        else:
            print(f"❌ {message}")
    
    def cmd_version(self, args):
        """Show EMAD version information"""
        print("EMAD (Ecosystem for BMad Method AI Development)")
        print("Version: 1.0.0")
        print(f"Installation: {self.emad_dir}")
        print(f"Python: {sys.version}")
        print(f"Modules Available: {'Yes' if EMAD_MODULES_AVAILABLE else 'No'}")
        if not EMAD_MODULES_AVAILABLE:
            print(f"Import Error: {IMPORT_ERROR}")
    
    def cmd_status(self, args):
        """Show EMAD system status"""
        self.print_header("EMAD System Status")
        
        # Configuration status
        has_user_config = self.user_config_path.exists()
        has_project_config = self.project_config_path.exists()
        self.print_status("User configuration", has_user_config)
        self.print_status("Project configuration", has_project_config)
        
        # Module availability
        self.print_status("EMAD modules", EMAD_MODULES_AVAILABLE)
        
        if EMAD_MODULES_AVAILABLE:
            # Background runner status
            try:
                result = subprocess.run([
                    sys.executable, str(self.emad_dir / "emad-background-runner.py"), "status"
                ], capture_output=True, text=True, timeout=10)
                
                if result.returncode == 0:
                    print("✅ Background runner status:")
                    print("   " + result.stdout.replace('\n', '\n   '))
                else:
                    print("❌ Background runner not running")
            except Exception as e:
                print(f"⚠️  Could not check background runner: {e}")
            
            # Failsafe system status
            try:
                result = subprocess.run([
                    sys.executable, str(self.emad_dir / "emad-failsafe-cli.py"), "status"
                ], capture_output=True, text=True, timeout=10)
                
                if result.returncode == 0:
                    print("✅ Failsafe system status:")
                    print("   " + result.stdout.replace('\n', '\n   '))
                else:
                    print("❌ Failsafe system not available")
            except Exception as e:
                print(f"⚠️  Could not check failsafe system: {e}")
        
        # Configuration details
        if has_user_config:
            print("\n📋 User Configuration:")
            github_config = self.user_config.get('github', {})
            print(f"   GitHub User: {github_config.get('username', 'Not set')}")
            print(f"   Repository: {github_config.get('repository', 'Not set')}")
            print(f"   Token: {'Set' if github_config.get('token') else 'Not set'}")
            
            sync_config = self.user_config.get('sync', {})
            interval = sync_config.get('interval_seconds', 3600)
            print(f"   Sync Interval: {interval} seconds ({interval//3600}h {(interval%3600)//60}m)")
        
        if has_project_config:
            print("\n📋 Project Configuration:")
            print(f"   Project Type: {self.project_config.get('project_type', 'Unknown')}")
            failsafe_config = self.project_config.get('failsafe', {})
            print(f"   Failsafe Sensitivity: {failsafe_config.get('sensitivity', 'balanced')}")
    
    def cmd_init(self, args):
        """Initialize EMAD in current directory"""
        self.print_header("EMAD Project Initialization")
        
        current_dir = Path.cwd()
        print(f"Initializing EMAD in: {current_dir}")
        
        # Check if already initialized
        if (current_dir / ".emad").exists():
            print("⚠️  EMAD already initialized in this directory")
            response = input("Reinitialize? (y/N): ").lower().strip()
            if response != 'y':
                return
        
        # Create .emad directory
        emad_project_dir = current_dir / ".emad"
        emad_project_dir.mkdir(exist_ok=True)
        
        # Create project-specific configuration
        project_config = {
            "emad_installation": str(self.emad_dir),
            "project_root": str(current_dir),
            "initialized_at": datetime.now().isoformat(),
            "project_type": self.detect_project_type(current_dir)
        }
        
        with open(emad_project_dir / "project.json", 'w') as f:
            json.dump(project_config, f, indent=2)
        
        # Create .gitignore entry
        gitignore_path = current_dir / ".gitignore"
        gitignore_entries = [
            "# EMAD system files",
            ".emad/",
            "emad-*.log",
            "emad-runner.pid"
        ]
        
        if gitignore_path.exists():
            with open(gitignore_path, 'r') as f:
                existing_content = f.read()
            
            if ".emad/" not in existing_content:
                with open(gitignore_path, 'a') as f:
                    f.write("\n" + "\n".join(gitignore_entries) + "\n")
                print("✅ Updated .gitignore with EMAD entries")
        else:
            with open(gitignore_path, 'w') as f:
                f.write("\n".join(gitignore_entries) + "\n")
            print("✅ Created .gitignore with EMAD entries")
        
        print("✅ EMAD initialized successfully")
        print(f"   Project type: {project_config['project_type']}")
        print(f"   Configuration: {emad_project_dir / 'project.json'}")
        
        # Suggest next steps
        print("\nNext steps:")
        print("1. Run: emad start")
        print("2. Check status: emad status")
    
    def cmd_start(self, args):
        """Start EMAD background monitoring"""
        self.print_header("Starting EMAD System")
        
        if not EMAD_MODULES_AVAILABLE:
            print("❌ EMAD modules not available")
            print(f"Error: {IMPORT_ERROR}")
            return
        
        try:
            # Start background runner
            result = subprocess.run([
                sys.executable, str(self.emad_dir / "emad-background-runner.py"), "start"
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ EMAD background runner started")
                print(result.stdout)
            else:
                print("❌ Failed to start background runner")
                print(result.stderr)
        except Exception as e:
            print(f"❌ Error starting EMAD: {e}")
    
    def cmd_stop(self, args):
        """Stop EMAD background monitoring"""
        self.print_header("Stopping EMAD System")
        
        try:
            # Stop background runner
            result = subprocess.run([
                sys.executable, str(self.emad_dir / "emad-background-runner.py"), "stop"
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ EMAD background runner stopped")
                print(result.stdout)
            else:
                print("❌ Failed to stop background runner")
                print(result.stderr)
        except Exception as e:
            print(f"❌ Error stopping EMAD: {e}")
    
    def cmd_restart(self, args):
        """Restart EMAD background monitoring"""
        self.print_header("Restarting EMAD System")
        
        # Stop first
        self.cmd_stop(args)
        
        # Wait a moment
        import time
        time.sleep(2)
        
        # Start again
        self.cmd_start(args)
    
    def cmd_test(self, args):
        """Run EMAD system tests"""
        self.print_header("EMAD System Tests")
        
        if not EMAD_MODULES_AVAILABLE:
            print("❌ EMAD modules not available")
            return
        
        try:
            # Run auto-sync test
            result = subprocess.run([
                sys.executable, str(self.emad_dir / "emad-auto-sync.py"), "--test"
            ], capture_output=True, text=True)
            
            print("📊 Auto-sync test results:")
            print(result.stdout)
            if result.stderr:
                print("Errors:")
                print(result.stderr)
            
            # Run failsafe tests
            result = subprocess.run([
                sys.executable, str(self.emad_dir / "emad-failsafe-cli.py"), "test"
            ], capture_output=True, text=True)
            
            print("\n📊 Failsafe test results:")
            print(result.stdout)
            if result.stderr:
                print("Errors:")
                print(result.stderr)
                
        except Exception as e:
            print(f"❌ Error running tests: {e}")
    
    def cmd_config(self, args):
        """Show or edit EMAD configuration"""
        if args.edit:
            self.edit_config()
        else:
            self.show_config()
    
    def show_config(self):
        """Show current configuration"""
        self.print_header("EMAD Configuration")
        
        print("📋 User Configuration:")
        if self.user_config:
            print(json.dumps(self.user_config, indent=2))
        else:
            print("   No user configuration found")
        
        print("\n📋 Project Configuration:")
        if self.project_config:
            print(json.dumps(self.project_config, indent=2))
        else:
            print("   No project configuration found")
    
    def edit_config(self):
        """Interactive configuration editor"""
        self.print_header("EMAD Configuration Editor")
        
        # Edit GitHub settings
        print("GitHub Settings:")
        current_token = self.user_config.get('github', {}).get('token', '')
        if current_token:
            print(f"Current token: {current_token[:10]}...")
            change_token = input("Change GitHub token? (y/N): ").lower().strip()
            if change_token == 'y':
                new_token = input("New GitHub token: ").strip()
                if new_token:
                    if 'github' not in self.user_config:
                        self.user_config['github'] = {}
                    self.user_config['github']['token'] = new_token
        else:
            new_token = input("GitHub token: ").strip()
            if new_token:
                if 'github' not in self.user_config:
                    self.user_config['github'] = {}
                self.user_config['github']['token'] = new_token
        
        # Save configuration
        if self.config.save_user_config(self.user_config):
            print("✅ Configuration saved")
        else:
            print("❌ Failed to save configuration")
    
    def detect_project_type(self, project_dir):
        """Detect project type from files"""
        if (project_dir / "package.json").exists():
            return "nodejs"
        elif (project_dir / "requirements.txt").exists():
            return "python"
        elif (project_dir / "Cargo.toml").exists():
            return "rust"
        elif (project_dir / "pom.xml").exists():
            return "java"
        elif (project_dir / "go.mod").exists():
            return "go"
        else:
            return "generic"
    
    def cmd_help(self, args):
        """Show help information"""
        print("EMAD - Ecosystem for BMad Method AI Development")
        print("\nAvailable commands:")
        print("  init      - Initialize EMAD in current directory")
        print("  start     - Start EMAD background monitoring")
        print("  stop      - Stop EMAD background monitoring")
        print("  restart   - Restart EMAD background monitoring")
        print("  status    - Show EMAD system status")
        print("  test      - Run EMAD system tests")
        print("  config    - Show configuration")
        print("  version   - Show version information")
        print("  help      - Show this help")
        print("\nFor more information: https://github.com/huggingfacer04/EMAD")

def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="EMAD - Ecosystem for BMad Method AI Development",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Commands
    subparsers.add_parser('init', help='Initialize EMAD in current directory')
    subparsers.add_parser('start', help='Start EMAD background monitoring')
    subparsers.add_parser('stop', help='Stop EMAD background monitoring')
    subparsers.add_parser('restart', help='Restart EMAD background monitoring')
    subparsers.add_parser('status', help='Show EMAD system status')
    subparsers.add_parser('test', help='Run EMAD system tests')
    subparsers.add_parser('version', help='Show version information')
    subparsers.add_parser('help', help='Show help information')
    
    config_parser = subparsers.add_parser('config', help='Show or edit configuration')
    config_parser.add_argument('--edit', action='store_true', help='Edit configuration interactively')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 0
    
    cli = EMADCLI()
    
    # Route to appropriate command
    command_map = {
        'init': cli.cmd_init,
        'start': cli.cmd_start,
        'stop': cli.cmd_stop,
        'restart': cli.cmd_restart,
        'status': cli.cmd_status,
        'test': cli.cmd_test,
        'config': cli.cmd_config,
        'version': cli.cmd_version,
        'help': cli.cmd_help
    }
    
    if args.command in command_map:
        try:
            command_map[args.command](args)
            return 0
        except KeyboardInterrupt:
            print("\n⚠️  Command interrupted by user")
            return 1
        except Exception as e:
            print(f"❌ Error executing command: {e}")
            return 1
    else:
        print(f"Unknown command: {args.command}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
