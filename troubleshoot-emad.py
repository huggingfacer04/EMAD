#!/usr/bin/env python3

"""
EMAD Troubleshooting Script

This script helps diagnose common issues with the EMAD Auto-Sync system.
"""

import sys
import os
import json
import importlib.util
from pathlib import Path

def print_header(title):
    """Print a formatted header"""
    print(f"\n{'='*50}")
    print(f"🔍 {title}")
    print(f"{'='*50}")

def print_status(message, status):
    """Print a status message"""
    if status:
        print(f"✅ {message}")
    else:
        print(f"❌ {message}")

def check_python_version():
    """Check Python version"""
    print_header("Python Environment")
    
    version = sys.version_info
    print(f"Python Version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major >= 3 and version.minor >= 7:
        print_status("Python version is compatible", True)
        return True
    else:
        print_status("Python version is too old (requires 3.7+)", False)
        return False

def check_required_packages():
    """Check if required packages are installed"""
    print_header("Required Packages")
    
    packages = {
        'requests': 'HTTP library for GitHub API',
        'pathlib': 'Path handling (built-in)',
        'json': 'JSON handling (built-in)',
        'hashlib': 'File hashing (built-in)',
        'logging': 'Logging (built-in)'
    }
    
    optional_packages = {
        'win32serviceutil': 'Windows service support (pywin32)',
        'daemon': 'Unix daemon support (python-daemon)'
    }
    
    all_good = True
    
    for package, description in packages.items():
        try:
            __import__(package)
            print_status(f"{package}: {description}", True)
        except ImportError:
            print_status(f"{package}: {description} - MISSING", False)
            all_good = False
    
    print("\nOptional Packages:")
    for package, description in optional_packages.items():
        try:
            __import__(package)
            print_status(f"{package}: {description}", True)
        except ImportError:
            print_status(f"{package}: {description} - Not installed", False)
    
    return all_good

def check_files():
    """Check if required files exist"""
    print_header("Required Files")
    
    current_dir = Path(__file__).parent
    
    required_files = [
        'emad-auto-sync.py',
        'emad_auto_sync.py',
        'create-emad-repository.py',
        'create-emad-repository.js'
    ]
    
    optional_files = [
        'emad-auto-sync-service.py',
        'emad-auto-sync-config.json',
        'EMAD_README.md',
        'EMAD_GITIGNORE',
        'CONTRIBUTING.md'
    ]
    
    all_good = True
    
    for file_name in required_files:
        file_path = current_dir / file_name
        exists = file_path.exists()
        print_status(f"{file_name}", exists)
        if not exists:
            all_good = False
    
    print("\nOptional Files:")
    for file_name in optional_files:
        file_path = current_dir / file_name
        exists = file_path.exists()
        print_status(f"{file_name}", exists)
    
    return all_good

def check_github_token():
    """Check GitHub token configuration"""
    print_header("GitHub Configuration")
    
    # Check if token is in environment
    token_env = os.environ.get('GITHUB_TOKEN') or os.environ.get('EMAD_GITHUB_TOKEN')
    
    # Check if token is in script files
    token_in_script = False
    try:
        with open('emad-auto-sync.py', 'r') as f:
            content = f.read()
            if 'ghp_' in content:
                token_in_script = True
    except:
        pass
    
    print_status("GitHub token in environment", bool(token_env))
    print_status("GitHub token in script", token_in_script)
    
    if token_env:
        print(f"Environment token: {token_env[:10]}...")
    
    return token_env or token_in_script

def test_github_connection():
    """Test GitHub API connection"""
    print_header("GitHub API Connection")
    
    try:
        import requests
        
        # Try to load the auto-sync module
        spec = importlib.util.spec_from_file_location("emad_auto_sync", "emad-auto-sync.py")
        if spec and spec.loader:
            emad_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(emad_module)
            
            # Create an instance and test authentication
            auto_sync = emad_module.EMADAutoSync(Path('.'))
            
            if auto_sync.authenticate():
                print_status("GitHub authentication successful", True)
                print(f"Authenticated as: {auto_sync.username}")
                return True
            else:
                print_status("GitHub authentication failed", False)
                return False
        else:
            print_status("Could not load emad-auto-sync module", False)
            return False
            
    except Exception as e:
        print_status(f"GitHub connection test failed: {e}", False)
        return False

def check_permissions():
    """Check file and directory permissions"""
    print_header("File Permissions")
    
    current_dir = Path(__file__).parent
    
    # Check if we can read the directory
    can_read = os.access(current_dir, os.R_OK)
    print_status("Can read current directory", can_read)
    
    # Check if we can write to the directory
    can_write = os.access(current_dir, os.W_OK)
    print_status("Can write to current directory", can_write)
    
    # Check if logs directory exists or can be created
    logs_dir = current_dir / 'logs'
    if logs_dir.exists():
        can_write_logs = os.access(logs_dir, os.W_OK)
        print_status("Can write to logs directory", can_write_logs)
    else:
        try:
            logs_dir.mkdir(exist_ok=True)
            print_status("Can create logs directory", True)
            can_write_logs = True
        except:
            print_status("Can create logs directory", False)
            can_write_logs = False
    
    return can_read and can_write and can_write_logs

def run_quick_test():
    """Run a quick functionality test"""
    print_header("Quick Functionality Test")
    
    try:
        # Try to import and create an instance
        spec = importlib.util.spec_from_file_location("emad_auto_sync", "emad-auto-sync.py")
        if spec and spec.loader:
            emad_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(emad_module)
            
            auto_sync = emad_module.EMADAutoSync(Path('.'), 60)  # 1 minute interval for testing
            print_status("Can create EMADAutoSync instance", True)
            
            # Test directory scanning
            file_hashes = auto_sync.scan_directory()
            print_status(f"Can scan directory ({len(file_hashes)} files found)", True)
            
            # Test change detection
            changes = auto_sync.detect_changes()
            print_status("Can detect changes", True)
            
            return True
        else:
            print_status("Cannot load emad-auto-sync module", False)
            return False
            
    except Exception as e:
        print_status(f"Quick test failed: {e}", False)
        return False

def generate_report():
    """Generate a comprehensive diagnostic report"""
    print_header("EMAD Diagnostic Report")
    
    results = {
        'python_version': check_python_version(),
        'required_packages': check_required_packages(),
        'required_files': check_files(),
        'github_token': check_github_token(),
        'github_connection': test_github_connection(),
        'permissions': check_permissions(),
        'functionality': run_quick_test()
    }
    
    print_header("Summary")
    
    total_checks = len(results)
    passed_checks = sum(results.values())
    
    print(f"Diagnostic Results: {passed_checks}/{total_checks} checks passed")
    print(f"Success Rate: {(passed_checks/total_checks)*100:.1f}%")
    
    if passed_checks == total_checks:
        print("\n🎉 All checks passed! EMAD should work correctly.")
    else:
        print("\n⚠️  Some issues found. Please address the failed checks above.")
        
        print("\nCommon Solutions:")
        if not results['required_packages']:
            print("- Install missing packages: pip install requests pywin32")
        if not results['github_token']:
            print("- Set GitHub token in environment or update script")
        if not results['permissions']:
            print("- Run as administrator or check file permissions")
        if not results['required_files']:
            print("- Ensure all EMAD files are in the current directory")
    
    return passed_checks == total_checks

if __name__ == '__main__':
    try:
        success = generate_report()
        
        print(f"\n{'='*50}")
        if success:
            print("🏁 Diagnostics completed successfully!")
        else:
            print("🏁 Diagnostics completed with issues.")
        print(f"{'='*50}")
        
        input("\nPress Enter to exit...")
        
    except KeyboardInterrupt:
        print("\n⚠️  Diagnostics interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error during diagnostics: {e}")
        input("Press Enter to exit...")
