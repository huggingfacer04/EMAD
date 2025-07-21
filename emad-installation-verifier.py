#!/usr/bin/env python3

"""
EMAD Installation Verification System

Comprehensive post-installation verification suite that validates all components
of the EMAD system and provides detailed troubleshooting guidance.
"""

import sys
import os
import json
import time
import subprocess
import tempfile
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Any

class InstallationTest:
    """Base class for installation tests"""
    
    def __init__(self, name: str, description: str, critical: bool = True):
        self.name = name
        self.description = description
        self.critical = critical
    
    def run(self) -> Tuple[bool, str, Dict[str, Any]]:
        """Run the test. Returns (success, message, details)"""
        raise NotImplementedError
    
    def get_fix_instructions(self) -> List[str]:
        """Get instructions to fix issues found by this test"""
        return ["Refer to EMAD documentation for troubleshooting"]

class PythonInstallationTest(InstallationTest):
    """Test Python installation and version"""
    
    def __init__(self):
        super().__init__(
            "Python Installation",
            "Verify Python 3.7+ is installed and accessible",
            critical=True
        )
    
    def run(self) -> Tuple[bool, str, Dict[str, Any]]:
        details = {}
        
        # Check Python version
        version = sys.version_info
        details["version"] = f"{version.major}.{version.minor}.{version.micro}"
        details["executable"] = sys.executable
        
        if version < (3, 7):
            return False, f"Python 3.7+ required, found {details['version']}", details
        
        # Check pip availability
        try:
            import pip
            details["pip_available"] = True
        except ImportError:
            details["pip_available"] = False
            return False, "pip is not available", details
        
        return True, f"Python {details['version']} with pip", details
    
    def get_fix_instructions(self) -> List[str]:
        return [
            "Install Python 3.7 or higher from https://python.org",
            "Ensure pip is installed: python -m ensurepip --upgrade",
            "Add Python to your system PATH"
        ]

class DependencyInstallationTest(InstallationTest):
    """Test required Python dependencies"""
    
    def __init__(self):
        super().__init__(
            "Python Dependencies",
            "Verify required Python packages are installed",
            critical=True
        )
    
    def run(self) -> Tuple[bool, str, Dict[str, Any]]:
        details = {}
        required_packages = {
            "requests": "HTTP library for GitHub API",
            "psutil": "Process and system utilities"
        }
        
        missing_packages = []
        
        for package, description in required_packages.items():
            try:
                __import__(package)
                details[f"{package}_available"] = True
                details[f"{package}_description"] = description
            except ImportError:
                missing_packages.append(package)
                details[f"{package}_available"] = False
        
        if missing_packages:
            return False, f"Missing packages: {', '.join(missing_packages)}", details
        
        return True, "All required dependencies available", details
    
    def get_fix_instructions(self) -> List[str]:
        return [
            "Install missing packages: pip install requests psutil",
            "If behind a proxy, use: pip install --proxy http://proxy:port requests psutil",
            "For user installation: pip install --user requests psutil"
        ]

class EMADFilesTest(InstallationTest):
    """Test EMAD core files are present"""
    
    def __init__(self, emad_dir: Path):
        super().__init__(
            "EMAD Core Files",
            "Verify all EMAD system files are present",
            critical=True
        )
        self.emad_dir = emad_dir
    
    def run(self) -> Tuple[bool, str, Dict[str, Any]]:
        details = {"emad_dir": str(self.emad_dir)}
        
        if not self.emad_dir.exists():
            return False, f"EMAD directory not found: {self.emad_dir}", details
        
        required_files = [
            "emad-auto-sync.py",
            "emad_auto_sync.py",
            "emad-background-runner.py",
            "emad-failsafe-system.py",
            "emad-failsafe-cli.py",
            "emad-cli.py",
            "emad-health-monitor.py"
        ]
        
        missing_files = []
        for file_name in required_files:
            file_path = self.emad_dir / file_name
            if file_path.exists():
                details[f"{file_name}_exists"] = True
                details[f"{file_name}_size"] = file_path.stat().st_size
            else:
                missing_files.append(file_name)
                details[f"{file_name}_exists"] = False
        
        if missing_files:
            return False, f"Missing files: {', '.join(missing_files)}", details
        
        return True, f"All {len(required_files)} core files present", details
    
    def get_fix_instructions(self) -> List[str]:
        return [
            "Reinstall EMAD using the universal installer",
            "Check if installation completed successfully",
            "Verify network connectivity during installation",
            "Try manual git clone: git clone https://github.com/huggingfacer04/EMAD"
        ]

class ConfigurationTest(InstallationTest):
    """Test EMAD configuration"""
    
    def __init__(self, emad_dir: Path):
        super().__init__(
            "Configuration Files",
            "Verify EMAD configuration is valid",
            critical=False
        )
        self.emad_dir = emad_dir
    
    def run(self) -> Tuple[bool, str, Dict[str, Any]]:
        details = {}
        config_dir = self.emad_dir / "config"
        
        details["config_dir_exists"] = config_dir.exists()
        if not details["config_dir_exists"]:
            return False, "Configuration directory not found", details
        
        # Check user config
        user_config_path = config_dir / "emad-user-config.json"
        details["user_config_exists"] = user_config_path.exists()
        
        if details["user_config_exists"]:
            try:
                with open(user_config_path, 'r') as f:
                    user_config = json.load(f)
                details["user_config_valid"] = True
                details["github_configured"] = bool(user_config.get("github", {}).get("token"))
                details["sync_configured"] = "sync" in user_config
            except json.JSONDecodeError as e:
                details["user_config_valid"] = False
                details["user_config_error"] = str(e)
                return False, f"Invalid user configuration: {e}", details
        
        # Check project config
        project_config_path = config_dir / "emad-project-config.json"
        details["project_config_exists"] = project_config_path.exists()
        
        if details["project_config_exists"]:
            try:
                with open(project_config_path, 'r') as f:
                    project_config = json.load(f)
                details["project_config_valid"] = True
                details["monitoring_configured"] = "monitoring" in project_config
            except json.JSONDecodeError as e:
                details["project_config_valid"] = False
                details["project_config_error"] = str(e)
        
        config_score = sum([
            details.get("user_config_exists", False),
            details.get("user_config_valid", False),
            details.get("project_config_exists", False),
            details.get("project_config_valid", False)
        ])
        
        if config_score >= 2:
            return True, f"Configuration valid ({config_score}/4 checks)", details
        else:
            return False, f"Configuration issues ({config_score}/4 checks)", details
    
    def get_fix_instructions(self) -> List[str]:
        return [
            "Run the installer again to regenerate configuration",
            "Manually create configuration: emad config --edit",
            "Check JSON syntax in configuration files",
            "Ensure GitHub token is properly set"
        ]

class GitHubConnectivityTest(InstallationTest):
    """Test GitHub API connectivity"""
    
    def __init__(self, github_token: str = None):
        super().__init__(
            "GitHub Connectivity",
            "Test GitHub API access and authentication",
            critical=True
        )
        self.github_token = github_token
    
    def run(self) -> Tuple[bool, str, Dict[str, Any]]:
        details = {}
        
        if not self.github_token:
            return False, "No GitHub token provided", details
        
        try:
            import requests
            
            headers = {"Authorization": f"Bearer {self.github_token}"}
            response = requests.get("https://api.github.com/user", headers=headers, timeout=10)
            
            details["status_code"] = response.status_code
            details["response_time"] = response.elapsed.total_seconds()
            
            if response.status_code == 200:
                user_data = response.json()
                details["username"] = user_data.get("login")
                details["user_id"] = user_data.get("id")
                details["rate_limit"] = response.headers.get("X-RateLimit-Remaining")
                return True, f"Connected as {details['username']}", details
            elif response.status_code == 401:
                return False, "Invalid GitHub token", details
            else:
                return False, f"GitHub API error: {response.status_code}", details
                
        except ImportError:
            return False, "requests library not available", details
        except Exception as e:
            details["error"] = str(e)
            return False, f"Connection failed: {e}", details
    
    def get_fix_instructions(self) -> List[str]:
        return [
            "Create GitHub Personal Access Token at https://github.com/settings/tokens",
            "Ensure token has 'repo' and 'workflow' scopes",
            "Check network connectivity and firewall settings",
            "Update EMAD configuration with valid token"
        ]

class EMADFunctionalityTest(InstallationTest):
    """Test core EMAD functionality"""
    
    def __init__(self, emad_dir: Path):
        super().__init__(
            "EMAD Functionality",
            "Test core EMAD system functionality",
            critical=True
        )
        self.emad_dir = emad_dir
    
    def run(self) -> Tuple[bool, str, Dict[str, Any]]:
        details = {}
        
        # Test auto-sync import
        try:
            sys.path.insert(0, str(self.emad_dir))
            from emad_auto_sync import EMADAutoSync
            details["auto_sync_import"] = True
            
            # Test basic instantiation
            auto_sync = EMADAutoSync(self.emad_dir)
            details["auto_sync_instantiation"] = True
            
        except ImportError as e:
            details["auto_sync_import"] = False
            details["import_error"] = str(e)
            return False, f"Cannot import EMAD modules: {e}", details
        except Exception as e:
            details["auto_sync_instantiation"] = False
            details["instantiation_error"] = str(e)
            return False, f"Cannot create EMAD instance: {e}", details
        
        # Test failsafe system
        try:
            from emad_failsafe_system import EMADFailsafeSystem
            failsafe = EMADFailsafeSystem(self.emad_dir)
            details["failsafe_import"] = True
            details["failsafe_instantiation"] = True
        except Exception as e:
            details["failsafe_import"] = False
            details["failsafe_error"] = str(e)
        
        return True, "Core functionality working", details
    
    def get_fix_instructions(self) -> List[str]:
        return [
            "Reinstall EMAD completely",
            "Check Python path and module imports",
            "Verify all required files are present",
            "Run: python -c 'import sys; print(sys.path)' to debug imports"
        ]

class CommandLineInterfaceTest(InstallationTest):
    """Test EMAD CLI functionality"""
    
    def __init__(self, emad_dir: Path):
        super().__init__(
            "Command Line Interface",
            "Test EMAD CLI commands",
            critical=False
        )
        self.emad_dir = emad_dir
    
    def run(self) -> Tuple[bool, str, Dict[str, Any]]:
        details = {}
        
        # Test CLI script exists
        cli_script = self.emad_dir / "emad-cli.py"
        details["cli_script_exists"] = cli_script.exists()
        
        if not details["cli_script_exists"]:
            return False, "CLI script not found", details
        
        # Test CLI help command
        try:
            result = subprocess.run([
                sys.executable, str(cli_script), "help"
            ], capture_output=True, text=True, timeout=10, cwd=str(self.emad_dir))
            
            details["help_command_success"] = result.returncode == 0
            details["help_output_length"] = len(result.stdout)
            
            if result.returncode == 0:
                return True, "CLI commands working", details
            else:
                details["help_error"] = result.stderr
                return False, f"CLI help failed: {result.stderr}", details
                
        except subprocess.TimeoutExpired:
            return False, "CLI command timed out", details
        except Exception as e:
            details["cli_error"] = str(e)
            return False, f"CLI test failed: {e}", details
    
    def get_fix_instructions(self) -> List[str]:
        return [
            "Ensure emad-cli.py is present and executable",
            "Check Python path and imports in CLI script",
            "Test manually: python emad-cli.py help",
            "Reinstall EMAD if CLI is corrupted"
        ]

class EMADInstallationVerifier:
    """Main installation verification system"""
    
    def __init__(self, emad_dir: Path):
        self.emad_dir = emad_dir
        self.tests = []
        self.setup_tests()
    
    def setup_tests(self):
        """Initialize all verification tests"""
        self.tests = [
            PythonInstallationTest(),
            DependencyInstallationTest(),
            EMADFilesTest(self.emad_dir),
            ConfigurationTest(self.emad_dir),
            EMADFunctionalityTest(self.emad_dir),
            CommandLineInterfaceTest(self.emad_dir)
        ]
        
        # Add GitHub test if token is available
        try:
            config_path = self.emad_dir / "config" / "emad-user-config.json"
            if config_path.exists():
                with open(config_path, 'r') as f:
                    config = json.load(f)
                    github_token = config.get("github", {}).get("token")
                    if github_token:
                        self.tests.append(GitHubConnectivityTest(github_token))
        except Exception:
            pass
    
    def run_verification(self) -> Dict[str, Any]:
        """Run complete installation verification"""
        results = {
            "timestamp": datetime.now().isoformat(),
            "emad_directory": str(self.emad_dir),
            "tests": {},
            "summary": {
                "total": len(self.tests),
                "passed": 0,
                "failed": 0,
                "critical_failed": 0,
                "success_rate": 0.0
            }
        }
        
        for test in self.tests:
            try:
                success, message, details = test.run()
                
                results["tests"][test.name] = {
                    "success": success,
                    "message": message,
                    "details": details,
                    "critical": test.critical,
                    "fix_instructions": test.get_fix_instructions() if not success else []
                }
                
                if success:
                    results["summary"]["passed"] += 1
                else:
                    results["summary"]["failed"] += 1
                    if test.critical:
                        results["summary"]["critical_failed"] += 1
                        
            except Exception as e:
                results["tests"][test.name] = {
                    "success": False,
                    "message": f"Test failed with error: {e}",
                    "details": {"error": str(e)},
                    "critical": test.critical,
                    "fix_instructions": ["Contact support with error details"]
                }
                results["summary"]["failed"] += 1
                if test.critical:
                    results["summary"]["critical_failed"] += 1
        
        # Calculate success rate
        if results["summary"]["total"] > 0:
            results["summary"]["success_rate"] = (
                results["summary"]["passed"] / results["summary"]["total"] * 100
            )
        
        return results
    
    def generate_report(self) -> str:
        """Generate human-readable verification report"""
        results = self.run_verification()
        
        report = []
        report.append("🔍 EMAD Installation Verification Report")
        report.append("=" * 60)
        report.append(f"Timestamp: {results['timestamp']}")
        report.append(f"EMAD Directory: {results['emad_directory']}")
        report.append("")
        
        # Summary
        summary = results["summary"]
        report.append(f"📊 Overall Results:")
        report.append(f"   Tests Passed: {summary['passed']}/{summary['total']}")
        report.append(f"   Success Rate: {summary['success_rate']:.1f}%")
        
        if summary["critical_failed"] > 0:
            report.append(f"   🚨 Critical Failures: {summary['critical_failed']}")
            report.append("   ❌ Installation is NOT ready for use")
        elif summary["failed"] > 0:
            report.append(f"   ⚠️  Non-critical Issues: {summary['failed']}")
            report.append("   ✅ Installation is ready for use with minor issues")
        else:
            report.append("   ✅ Installation is fully ready for use")
        
        report.append("")
        
        # Individual test results
        report.append("📋 Detailed Test Results:")
        report.append("")
        
        for test_name, result in results["tests"].items():
            status_icon = "✅" if result["success"] else "❌"
            critical_marker = " (CRITICAL)" if result["critical"] else ""
            
            report.append(f"{status_icon} {test_name}{critical_marker}")
            report.append(f"   {result['message']}")
            
            if not result["success"] and result["fix_instructions"]:
                report.append("   Fix Instructions:")
                for instruction in result["fix_instructions"]:
                    report.append(f"   • {instruction}")
            
            report.append("")
        
        # Next steps
        report.append("🚀 Next Steps:")
        if summary["critical_failed"] > 0:
            report.append("   1. Fix critical issues listed above")
            report.append("   2. Re-run verification: python emad-installation-verifier.py")
            report.append("   3. Contact support if issues persist")
        else:
            report.append("   1. Navigate to your project directory")
            report.append("   2. Run: emad init")
            report.append("   3. Start monitoring: emad start")
            report.append("   4. Check status: emad status")
        
        return "\n".join(report)
    
    def is_installation_valid(self) -> bool:
        """Check if installation is valid (no critical failures)"""
        results = self.run_verification()
        return results["summary"]["critical_failed"] == 0

def main():
    """CLI for installation verification"""
    import argparse
    
    parser = argparse.ArgumentParser(description="EMAD Installation Verifier")
    parser.add_argument("--emad-dir", default=".", help="EMAD installation directory")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")
    parser.add_argument("--save-report", help="Save report to file")
    parser.add_argument("--quiet", action="store_true", help="Only show summary")
    
    args = parser.parse_args()
    
    emad_dir = Path(args.emad_dir).absolute()
    verifier = EMADInstallationVerifier(emad_dir)
    
    if args.json:
        results = verifier.run_verification()
        print(json.dumps(results, indent=2))
    else:
        if args.quiet:
            results = verifier.run_verification()
            summary = results["summary"]
            print(f"EMAD Installation Verification: {summary['passed']}/{summary['total']} tests passed ({summary['success_rate']:.1f}%)")
            if summary["critical_failed"] > 0:
                print(f"❌ {summary['critical_failed']} critical failures - installation not ready")
            else:
                print("✅ Installation ready for use")
        else:
            report = verifier.generate_report()
            print(report)
            
            if args.save_report:
                with open(args.save_report, 'w') as f:
                    f.write(report)
                print(f"\n📄 Report saved to: {args.save_report}")
    
    # Exit with error code if critical issues found
    if not verifier.is_installation_valid():
        sys.exit(1)

if __name__ == "__main__":
    main()
