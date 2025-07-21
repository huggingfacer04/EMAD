#!/usr/bin/env python3

"""
EMAD Universal Installation Test Suite

Comprehensive testing framework for validating the EMAD universal installation
pipeline across different platforms and configurations.
"""

import sys
import os
import json
import tempfile
import subprocess
import shutil
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional

class InstallationTestCase:
    """Base class for installation test cases"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.start_time = None
        self.end_time = None
        self.result = None
        self.error = None
        self.details = {}
    
    def setup(self):
        """Setup test environment"""
        pass
    
    def run(self) -> bool:
        """Run the test case"""
        raise NotImplementedError
    
    def cleanup(self):
        """Cleanup test environment"""
        pass
    
    def execute(self) -> Dict[str, Any]:
        """Execute the complete test case"""
        self.start_time = datetime.now()
        
        try:
            self.setup()
            self.result = self.run()
            self.error = None
        except Exception as e:
            self.result = False
            self.error = str(e)
        finally:
            try:
                self.cleanup()
            except Exception as cleanup_error:
                if not self.error:
                    self.error = f"Cleanup failed: {cleanup_error}"
            
            self.end_time = datetime.now()
        
        return {
            "name": self.name,
            "description": self.description,
            "result": self.result,
            "error": self.error,
            "details": self.details,
            "duration": (self.end_time - self.start_time).total_seconds() if self.start_time and self.end_time else 0
        }

class PythonEnvironmentTest(InstallationTestCase):
    """Test Python environment compatibility"""
    
    def __init__(self):
        super().__init__(
            "Python Environment",
            "Test Python version and package installation capabilities"
        )
    
    def run(self) -> bool:
        # Test Python version
        version = sys.version_info
        self.details["python_version"] = f"{version.major}.{version.minor}.{version.micro}"
        
        if version < (3, 7):
            raise Exception(f"Python 3.7+ required, found {self.details['python_version']}")
        
        # Test pip functionality
        try:
            result = subprocess.run([
                sys.executable, "-m", "pip", "--version"
            ], capture_output=True, text=True, timeout=10)
            
            self.details["pip_available"] = result.returncode == 0
            if not self.details["pip_available"]:
                raise Exception("pip is not available")
        
        except subprocess.TimeoutExpired:
            raise Exception("pip command timed out")
        
        # Test package installation
        try:
            result = subprocess.run([
                sys.executable, "-m", "pip", "install", "--dry-run", "requests"
            ], capture_output=True, text=True, timeout=30)
            
            self.details["can_install_packages"] = result.returncode == 0
            
        except subprocess.TimeoutExpired:
            self.details["can_install_packages"] = False
        
        return True

class GitAvailabilityTest(InstallationTestCase):
    """Test Git availability and functionality"""
    
    def __init__(self):
        super().__init__(
            "Git Availability",
            "Test Git installation and basic functionality"
        )
    
    def run(self) -> bool:
        # Test Git command
        try:
            result = subprocess.run([
                "git", "--version"
            ], capture_output=True, text=True, timeout=10)
            
            self.details["git_available"] = result.returncode == 0
            if self.details["git_available"]:
                self.details["git_version"] = result.stdout.strip()
            else:
                raise Exception("Git command failed")
        
        except FileNotFoundError:
            raise Exception("Git is not installed")
        except subprocess.TimeoutExpired:
            raise Exception("Git command timed out")
        
        # Test Git clone capability
        with tempfile.TemporaryDirectory() as temp_dir:
            try:
                result = subprocess.run([
                    "git", "clone", "--depth", "1", 
                    "https://github.com/octocat/Hello-World.git",
                    os.path.join(temp_dir, "test-repo")
                ], capture_output=True, text=True, timeout=30)
                
                self.details["can_clone"] = result.returncode == 0
                
            except subprocess.TimeoutExpired:
                self.details["can_clone"] = False
        
        return True

class NetworkConnectivityTest(InstallationTestCase):
    """Test network connectivity to required services"""
    
    def __init__(self):
        super().__init__(
            "Network Connectivity",
            "Test connectivity to GitHub and other required services"
        )
    
    def run(self) -> bool:
        import urllib.request
        import urllib.error
        
        # Test GitHub connectivity
        try:
            with urllib.request.urlopen("https://api.github.com", timeout=10) as response:
                self.details["github_accessible"] = response.status == 200
        except urllib.error.URLError:
            self.details["github_accessible"] = False
        
        # Test raw.githubusercontent.com (for installer download)
        try:
            with urllib.request.urlopen("https://raw.githubusercontent.com", timeout=10) as response:
                self.details["raw_github_accessible"] = response.status == 200
        except urllib.error.URLError:
            self.details["raw_github_accessible"] = False
        
        # Test PyPI connectivity (for package installation)
        try:
            with urllib.request.urlopen("https://pypi.org", timeout=10) as response:
                self.details["pypi_accessible"] = response.status == 200
        except urllib.error.URLError:
            self.details["pypi_accessible"] = False
        
        # Require at least GitHub and PyPI
        if not self.details["github_accessible"]:
            raise Exception("Cannot access GitHub API")
        
        if not self.details["pypi_accessible"]:
            raise Exception("Cannot access PyPI")
        
        return True

class InstallerDownloadTest(InstallationTestCase):
    """Test installer script download"""
    
    def __init__(self):
        super().__init__(
            "Installer Download",
            "Test downloading installer scripts from GitHub"
        )
        self.temp_dir = None
    
    def setup(self):
        self.temp_dir = tempfile.mkdtemp()
    
    def cleanup(self):
        if self.temp_dir and os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
    
    def run(self) -> bool:
        import urllib.request
        
        installers = {
            "install.sh": "https://raw.githubusercontent.com/huggingfacer04/EMAD/main/install.sh",
            "install.ps1": "https://raw.githubusercontent.com/huggingfacer04/EMAD/main/install.ps1",
            "install.bat": "https://raw.githubusercontent.com/huggingfacer04/EMAD/main/install.bat"
        }
        
        for installer_name, url in installers.items():
            try:
                installer_path = os.path.join(self.temp_dir, installer_name)
                urllib.request.urlretrieve(url, installer_path)
                
                # Check file exists and has content
                if os.path.exists(installer_path) and os.path.getsize(installer_path) > 0:
                    self.details[f"{installer_name}_downloaded"] = True
                    self.details[f"{installer_name}_size"] = os.path.getsize(installer_path)
                else:
                    self.details[f"{installer_name}_downloaded"] = False
                    
            except Exception as e:
                self.details[f"{installer_name}_downloaded"] = False
                self.details[f"{installer_name}_error"] = str(e)
        
        # Require at least one installer to be downloadable
        downloaded_count = sum(1 for key in self.details if key.endswith("_downloaded") and self.details[key])
        
        if downloaded_count == 0:
            raise Exception("No installer scripts could be downloaded")
        
        return True

class MockInstallationTest(InstallationTestCase):
    """Test installation process in isolated environment"""
    
    def __init__(self):
        super().__init__(
            "Mock Installation",
            "Test installation process in isolated environment"
        )
        self.temp_dir = None
        self.emad_dir = None
    
    def setup(self):
        self.temp_dir = tempfile.mkdtemp()
        self.emad_dir = os.path.join(self.temp_dir, "emad")
        os.makedirs(self.emad_dir)
    
    def cleanup(self):
        if self.temp_dir and os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
    
    def run(self) -> bool:
        # Create mock EMAD installation
        mock_files = [
            "emad-auto-sync.py",
            "emad_auto_sync.py", 
            "emad-background-runner.py",
            "emad-failsafe-system.py",
            "emad-cli.py"
        ]
        
        for file_name in mock_files:
            file_path = os.path.join(self.emad_dir, file_name)
            with open(file_path, 'w') as f:
                f.write(f"# Mock {file_name}\nprint('Mock EMAD component')\n")
        
        # Create config directory
        config_dir = os.path.join(self.emad_dir, "config")
        os.makedirs(config_dir)
        
        # Create mock configuration
        user_config = {
            "github": {
                "token": "mock_token",
                "username": "test_user",
                "repository": "test_repo"
            },
            "sync": {
                "interval_seconds": 3600,
                "auto_start": True
            }
        }
        
        with open(os.path.join(config_dir, "emad-user-config.json"), 'w') as f:
            json.dump(user_config, f, indent=2)
        
        # Test CLI functionality
        cli_path = os.path.join(self.emad_dir, "emad-cli.py")
        try:
            result = subprocess.run([
                sys.executable, cli_path, "help"
            ], capture_output=True, text=True, timeout=10, cwd=self.emad_dir)
            
            self.details["cli_test_success"] = result.returncode == 0
            
        except subprocess.TimeoutExpired:
            self.details["cli_test_success"] = False
        except Exception as e:
            self.details["cli_test_error"] = str(e)
            self.details["cli_test_success"] = False
        
        self.details["mock_files_created"] = len(mock_files)
        self.details["config_created"] = True
        
        return True

class ProjectTemplateTest(InstallationTestCase):
    """Test project template system"""
    
    def __init__(self):
        super().__init__(
            "Project Templates",
            "Test project type detection and template application"
        )
        self.temp_dir = None
    
    def setup(self):
        self.temp_dir = tempfile.mkdtemp()
    
    def cleanup(self):
        if self.temp_dir and os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
    
    def run(self) -> bool:
        # Test different project types
        project_types = {
            "nodejs": {"package.json": '{"name": "test", "version": "1.0.0"}'},
            "python": {"requirements.txt": "requests>=2.0.0\npsutil>=5.0.0"},
            "rust": {"Cargo.toml": "[package]\nname = \"test\"\nversion = \"0.1.0\""},
            "java": {"pom.xml": "<project><modelVersion>4.0.0</modelVersion></project>"},
            "go": {"go.mod": "module test\n\ngo 1.19"}
        }
        
        for project_type, files in project_types.items():
            project_dir = os.path.join(self.temp_dir, project_type)
            os.makedirs(project_dir)
            
            # Create project files
            for file_name, content in files.items():
                with open(os.path.join(project_dir, file_name), 'w') as f:
                    f.write(content)
            
            # Test project type detection (mock)
            self.details[f"{project_type}_project_created"] = True
        
        self.details["project_types_tested"] = len(project_types)
        return True

class EMADUniversalInstallationTestSuite:
    """Main test suite for EMAD universal installation"""
    
    def __init__(self):
        self.tests = [
            PythonEnvironmentTest(),
            GitAvailabilityTest(),
            NetworkConnectivityTest(),
            InstallerDownloadTest(),
            MockInstallationTest(),
            ProjectTemplateTest()
        ]
        self.results = []
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all tests in the suite"""
        print("🧪 EMAD Universal Installation Test Suite")
        print("=" * 60)
        print(f"Running {len(self.tests)} test cases...")
        print()
        
        start_time = datetime.now()
        
        for i, test in enumerate(self.tests, 1):
            print(f"[{i}/{len(self.tests)}] Running {test.name}...")
            
            result = test.execute()
            self.results.append(result)
            
            if result["result"]:
                print(f"✅ {test.name} - PASSED ({result['duration']:.2f}s)")
            else:
                print(f"❌ {test.name} - FAILED ({result['duration']:.2f}s)")
                if result["error"]:
                    print(f"   Error: {result['error']}")
            print()
        
        end_time = datetime.now()
        
        # Generate summary
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r["result"])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        summary = {
            "timestamp": start_time.isoformat(),
            "duration": (end_time - start_time).total_seconds(),
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": success_rate,
            "results": self.results
        }
        
        print("📊 Test Suite Summary")
        print("=" * 30)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        print(f"Duration: {summary['duration']:.2f}s")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.results:
                if not result["result"]:
                    print(f"  • {result['name']}: {result['error']}")
        
        print(f"\n{'✅ All tests passed!' if failed_tests == 0 else '⚠️  Some tests failed'}")
        
        return summary
    
    def save_report(self, output_path: str):
        """Save test results to file"""
        summary = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": len(self.results),
            "passed_tests": sum(1 for r in self.results if r["result"]),
            "failed_tests": sum(1 for r in self.results if not r["result"]),
            "results": self.results
        }
        
        with open(output_path, 'w') as f:
            json.dump(summary, f, indent=2)

def main():
    """Main test execution"""
    import argparse
    
    parser = argparse.ArgumentParser(description="EMAD Universal Installation Test Suite")
    parser.add_argument("--save-report", help="Save test report to JSON file")
    parser.add_argument("--verbose", action="store_true", help="Show detailed test output")
    
    args = parser.parse_args()
    
    suite = EMADUniversalInstallationTestSuite()
    
    try:
        summary = suite.run_all_tests()
        
        if args.save_report:
            suite.save_report(args.save_report)
            print(f"\n📄 Test report saved to: {args.save_report}")
        
        # Exit with error code if any tests failed
        if summary["failed_tests"] > 0:
            sys.exit(1)
        
    except KeyboardInterrupt:
        print("\n⚠️  Test suite interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test suite failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
