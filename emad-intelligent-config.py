#!/usr/bin/env python3

"""
EMAD Intelligent Configuration System

Advanced configuration management that automatically adapts to different
environments, project types, and deployment scenarios for optimal performance.
"""

import os
import sys
import json
import platform
import subprocess
import socket
import urllib.request
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime

class EMADIntelligentConfig:
    """Intelligent configuration system for EMAD"""
    
    def __init__(self, emad_dir: Path):
        self.emad_dir = emad_dir
        self.config_dir = emad_dir / "config"
        self.config_dir.mkdir(exist_ok=True)
        
        # Environment detection results
        self.environment_info = {}
        self.project_info = {}
        self.network_info = {}
        self.system_info = {}
        
    def detect_complete_environment(self) -> Dict[str, Any]:
        """Perform comprehensive environment detection"""
        self.detect_system_environment()
        self.detect_network_environment()
        self.detect_development_environment()
        self.detect_project_characteristics()
        self.detect_security_requirements()
        
        return {
            "system": self.system_info,
            "network": self.network_info,
            "environment": self.environment_info,
            "project": self.project_info
        }
    
    def detect_system_environment(self):
        """Detect system-level environment characteristics"""
        self.system_info = {
            "platform": platform.system(),
            "platform_version": platform.version(),
            "architecture": platform.machine(),
            "python_version": platform.python_version(),
            "hostname": socket.gethostname(),
            "user": os.getenv("USER", os.getenv("USERNAME", "unknown")),
            "home_dir": str(Path.home()),
            "cpu_count": os.cpu_count(),
            "is_admin": self._is_admin(),
            "container_type": self._detect_container(),
            "ci_cd_platform": self._detect_ci_cd(),
            "cloud_platform": self._detect_cloud_platform(),
            "package_managers": self._detect_package_managers()
        }
    
    def detect_network_environment(self):
        """Detect network configuration and capabilities"""
        self.network_info = {
            "connectivity_type": self._test_connectivity(),
            "proxy_config": self._detect_proxy_config(),
            "dns_servers": self._get_dns_servers(),
            "github_accessible": self._test_github_access(),
            "pypi_accessible": self._test_pypi_access(),
            "bandwidth_class": self._estimate_bandwidth(),
            "firewall_restrictions": self._detect_firewall_restrictions()
        }
    
    def detect_development_environment(self):
        """Detect development tools and environment"""
        self.environment_info = {
            "ide": self._detect_ide(),
            "terminal": self._detect_terminal(),
            "shell": self._detect_shell(),
            "git_config": self._get_git_config(),
            "virtual_env": self._detect_virtual_env(),
            "development_mode": self._detect_development_mode(),
            "debugging_tools": self._detect_debugging_tools(),
            "code_quality_tools": self._detect_code_quality_tools()
        }
    
    def detect_project_characteristics(self):
        """Analyze current project characteristics"""
        project_dir = Path.cwd()
        
        self.project_info = {
            "type": self._detect_project_type(project_dir),
            "framework": self._detect_framework(project_dir),
            "size": self._estimate_project_size(project_dir),
            "complexity": self._estimate_complexity(project_dir),
            "languages": self._detect_languages(project_dir),
            "dependencies": self._analyze_dependencies(project_dir),
            "build_tools": self._detect_build_tools(project_dir),
            "testing_frameworks": self._detect_testing_frameworks(project_dir),
            "deployment_targets": self._detect_deployment_targets(project_dir)
        }
    
    def detect_security_requirements(self):
        """Detect security requirements and constraints"""
        security_info = {
            "corporate_environment": self._is_corporate_environment(),
            "security_tools": self._detect_security_tools(),
            "compliance_requirements": self._detect_compliance_requirements(),
            "encryption_requirements": self._detect_encryption_requirements()
        }
        
        self.environment_info["security"] = security_info
    
    def _is_admin(self) -> bool:
        """Check if running with admin privileges"""
        try:
            if platform.system() == "Windows":
                import ctypes
                return ctypes.windll.shell32.IsUserAnAdmin() != 0
            else:
                return os.geteuid() == 0
        except:
            return False
    
    def _detect_container(self) -> Optional[str]:
        """Detect container runtime"""
        if Path("/.dockerenv").exists():
            return "docker"
        elif os.getenv("KUBERNETES_SERVICE_HOST"):
            return "kubernetes"
        elif os.getenv("PODMAN_VERSION"):
            return "podman"
        elif Path("/proc/1/cgroup").exists():
            try:
                with open("/proc/1/cgroup", "r") as f:
                    content = f.read()
                    if "docker" in content:
                        return "docker"
                    elif "lxc" in content:
                        return "lxc"
            except:
                pass
        return None
    
    def _detect_ci_cd(self) -> Optional[str]:
        """Detect CI/CD platform"""
        ci_platforms = {
            "GITHUB_ACTIONS": "github_actions",
            "GITLAB_CI": "gitlab_ci",
            "JENKINS_URL": "jenkins",
            "AZURE_DEVOPS": "azure_devops",
            "CIRCLECI": "circleci",
            "TRAVIS": "travis_ci",
            "BUILDKITE": "buildkite"
        }
        
        for env_var, platform in ci_platforms.items():
            if os.getenv(env_var):
                return platform
        
        return None
    
    def _detect_cloud_platform(self) -> Optional[str]:
        """Detect cloud platform"""
        try:
            # AWS
            response = urllib.request.urlopen("http://169.254.169.254/latest/meta-data/", timeout=2)
            if response.status == 200:
                return "aws"
        except:
            pass
        
        try:
            # Azure
            headers = {"Metadata": "true"}
            req = urllib.request.Request("http://169.254.169.254/metadata/instance", headers=headers)
            response = urllib.request.urlopen(req, timeout=2)
            if response.status == 200:
                return "azure"
        except:
            pass
        
        try:
            # GCP
            headers = {"Metadata-Flavor": "Google"}
            req = urllib.request.Request("http://metadata.google.internal/", headers=headers)
            response = urllib.request.urlopen(req, timeout=2)
            if response.status == 200:
                return "gcp"
        except:
            pass
        
        return None
    
    def _detect_package_managers(self) -> List[str]:
        """Detect available package managers"""
        managers = []
        
        package_managers = {
            "apt": "apt-get",
            "yum": "yum",
            "dnf": "dnf",
            "pacman": "pacman",
            "brew": "brew",
            "pip": "pip",
            "npm": "npm",
            "yarn": "yarn",
            "cargo": "cargo",
            "go": "go"
        }
        
        for manager, command in package_managers.items():
            try:
                subprocess.run([command, "--version"], capture_output=True, timeout=5)
                managers.append(manager)
            except:
                continue
        
        return managers
    
    def _test_connectivity(self) -> str:
        """Test network connectivity type"""
        try:
            response = urllib.request.urlopen("https://api.github.com", timeout=5)
            if response.status == 200:
                return "direct"
        except:
            pass
        
        # Test for proxy
        proxy_vars = ["HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy"]
        for var in proxy_vars:
            if os.getenv(var):
                return "proxy"
        
        return "restricted"
    
    def _detect_proxy_config(self) -> Dict[str, Any]:
        """Detect proxy configuration"""
        proxy_config = {}
        
        proxy_vars = ["HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy", "NO_PROXY", "no_proxy"]
        for var in proxy_vars:
            value = os.getenv(var)
            if value:
                proxy_config[var.lower()] = value
        
        return proxy_config
    
    def _get_dns_servers(self) -> List[str]:
        """Get DNS server configuration"""
        dns_servers = []
        
        try:
            if platform.system() == "Windows":
                result = subprocess.run(["nslookup", "github.com"], capture_output=True, text=True)
                # Parse DNS servers from nslookup output
                lines = result.stdout.split('\n')
                for line in lines:
                    if "Server:" in line:
                        server = line.split("Server:")[-1].strip()
                        if server:
                            dns_servers.append(server)
            else:
                # Unix-like systems
                if Path("/etc/resolv.conf").exists():
                    with open("/etc/resolv.conf", "r") as f:
                        for line in f:
                            if line.startswith("nameserver"):
                                server = line.split()[1]
                                dns_servers.append(server)
        except:
            pass
        
        return dns_servers
    
    def _test_github_access(self) -> bool:
        """Test GitHub API accessibility"""
        try:
            response = urllib.request.urlopen("https://api.github.com", timeout=10)
            return response.status == 200
        except:
            return False
    
    def _test_pypi_access(self) -> bool:
        """Test PyPI accessibility"""
        try:
            response = urllib.request.urlopen("https://pypi.org", timeout=10)
            return response.status == 200
        except:
            return False
    
    def _estimate_bandwidth(self) -> str:
        """Estimate network bandwidth class"""
        try:
            import time
            start_time = time.time()
            response = urllib.request.urlopen("https://httpbin.org/bytes/1024", timeout=10)
            response.read()
            elapsed = time.time() - start_time
            
            if elapsed < 0.5:
                return "high"
            elif elapsed < 2.0:
                return "medium"
            else:
                return "low"
        except:
            return "unknown"
    
    def _detect_firewall_restrictions(self) -> List[str]:
        """Detect firewall restrictions"""
        restrictions = []
        
        # Test common ports
        test_ports = [22, 80, 443, 8080, 9418]  # SSH, HTTP, HTTPS, Alt HTTP, Git
        
        for port in test_ports:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(2)
                result = sock.connect_ex(("github.com", port))
                sock.close()
                
                if result != 0:
                    restrictions.append(f"port_{port}_blocked")
            except:
                restrictions.append(f"port_{port}_unknown")
        
        return restrictions
    
    def _detect_ide(self) -> Optional[str]:
        """Detect IDE/editor being used"""
        ide_indicators = {
            "VSCODE_INJECTION": "vscode",
            "TERM_PROGRAM": "vscode",
            "PYCHARM_HOSTED": "pycharm",
            "INTELLIJ_ENVIRONMENT_READER": "intellij",
            "VIM": "vim",
            "EMACS": "emacs"
        }
        
        for env_var, ide in ide_indicators.items():
            if os.getenv(env_var):
                return ide
        
        # Check for common IDE processes
        try:
            if platform.system() == "Windows":
                result = subprocess.run(["tasklist"], capture_output=True, text=True)
                processes = result.stdout.lower()
            else:
                result = subprocess.run(["ps", "aux"], capture_output=True, text=True)
                processes = result.stdout.lower()
            
            ide_processes = {
                "code": "vscode",
                "pycharm": "pycharm",
                "idea": "intellij",
                "vim": "vim",
                "emacs": "emacs",
                "atom": "atom",
                "sublime": "sublime_text"
            }
            
            for process, ide in ide_processes.items():
                if process in processes:
                    return ide
        except:
            pass
        
        return None
    
    def _detect_terminal(self) -> Optional[str]:
        """Detect terminal being used"""
        terminal_vars = {
            "TERM_PROGRAM": None,
            "TERMINAL_EMULATOR": None,
            "TERM": None
        }
        
        for var in terminal_vars:
            value = os.getenv(var)
            if value:
                return value.lower()
        
        return None
    
    def _detect_shell(self) -> Optional[str]:
        """Detect shell being used"""
        shell = os.getenv("SHELL")
        if shell:
            return Path(shell).name
        
        # Windows detection
        if platform.system() == "Windows":
            if os.getenv("PSModulePath"):
                return "powershell"
            else:
                return "cmd"
        
        return None
    
    def _get_git_config(self) -> Dict[str, Any]:
        """Get Git configuration"""
        git_config = {}
        
        try:
            # Get user name and email
            result = subprocess.run(["git", "config", "user.name"], capture_output=True, text=True)
            if result.returncode == 0:
                git_config["user_name"] = result.stdout.strip()
            
            result = subprocess.run(["git", "config", "user.email"], capture_output=True, text=True)
            if result.returncode == 0:
                git_config["user_email"] = result.stdout.strip()
            
            # Check if in a git repository
            result = subprocess.run(["git", "rev-parse", "--is-inside-work-tree"], capture_output=True, text=True)
            git_config["in_git_repo"] = result.returncode == 0
            
            if git_config["in_git_repo"]:
                # Get remote origin
                result = subprocess.run(["git", "remote", "get-url", "origin"], capture_output=True, text=True)
                if result.returncode == 0:
                    git_config["remote_origin"] = result.stdout.strip()
        except:
            pass
        
        return git_config
    
    def _detect_virtual_env(self) -> Optional[str]:
        """Detect virtual environment"""
        if os.getenv("VIRTUAL_ENV"):
            return "virtualenv"
        elif os.getenv("CONDA_DEFAULT_ENV"):
            return "conda"
        elif os.getenv("PIPENV_ACTIVE"):
            return "pipenv"
        elif os.getenv("POETRY_ACTIVE"):
            return "poetry"
        
        return None
    
    def _detect_development_mode(self) -> str:
        """Detect development mode"""
        debug_vars = ["DEBUG", "DEVELOPMENT", "DEV_MODE"]
        for var in debug_vars:
            if os.getenv(var, "").lower() in ["true", "1", "yes"]:
                return "development"
        
        if os.getenv("NODE_ENV") == "development":
            return "development"
        elif os.getenv("NODE_ENV") == "production":
            return "production"
        
        return "unknown"
    
    def _detect_debugging_tools(self) -> List[str]:
        """Detect available debugging tools"""
        tools = []
        
        debug_tools = ["pdb", "ipdb", "pudb", "gdb", "lldb", "node-inspector"]
        
        for tool in debug_tools:
            try:
                subprocess.run([tool, "--version"], capture_output=True, timeout=2)
                tools.append(tool)
            except:
                continue
        
        return tools
    
    def _detect_code_quality_tools(self) -> List[str]:
        """Detect code quality tools"""
        tools = []
        
        quality_tools = ["pylint", "flake8", "black", "mypy", "eslint", "prettier", "rustfmt"]
        
        for tool in quality_tools:
            try:
                subprocess.run([tool, "--version"], capture_output=True, timeout=2)
                tools.append(tool)
            except:
                continue
        
        return tools
    
    def _detect_project_type(self, project_dir: Path) -> str:
        """Detect project type with advanced analysis"""
        # Check for specific framework files first
        framework_files = {
            "next.config.js": "nextjs",
            "nuxt.config.js": "nuxtjs",
            "angular.json": "angular",
            "vue.config.js": "vue",
            "svelte.config.js": "svelte",
            "gatsby-config.js": "gatsby",
            "remix.config.js": "remix"
        }
        
        for file, framework in framework_files.items():
            if (project_dir / file).exists():
                return framework
        
        # Check package.json for dependencies
        package_json = project_dir / "package.json"
        if package_json.exists():
            try:
                with open(package_json, 'r') as f:
                    package_data = json.load(f)
                    deps = {**package_data.get("dependencies", {}), **package_data.get("devDependencies", {})}
                    
                    if "next" in deps:
                        return "nextjs"
                    elif "react" in deps:
                        return "react"
                    elif "vue" in deps:
                        return "vue"
                    elif "@angular/core" in deps:
                        return "angular"
                    elif "svelte" in deps:
                        return "svelte"
                    elif "typescript" in deps:
                        return "typescript"
                    else:
                        return "nodejs"
            except:
                return "nodejs"
        
        # Check Python project files
        if (project_dir / "pyproject.toml").exists():
            try:
                with open(project_dir / "pyproject.toml", 'r') as f:
                    content = f.read().lower()
                    if "fastapi" in content:
                        return "fastapi"
                    elif "django" in content:
                        return "django"
                    elif "flask" in content:
                        return "flask"
                    else:
                        return "python"
            except:
                return "python"
        
        # Check other project indicators
        project_indicators = {
            "requirements.txt": "python",
            "setup.py": "python",
            "Pipfile": "python",
            "Cargo.toml": "rust",
            "go.mod": "go",
            "pom.xml": "maven",
            "build.gradle": "gradle",
            "composer.json": "php",
            "Gemfile": "ruby",
            "mix.exs": "elixir",
            "deno.json": "deno"
        }
        
        for file, project_type in project_indicators.items():
            if (project_dir / file).exists():
                return project_type
        
        return "generic"
    
    def _detect_framework(self, project_dir: Path) -> Optional[str]:
        """Detect specific framework within project type"""
        project_type = self._detect_project_type(project_dir)
        
        if project_type in ["nextjs", "react", "vue", "angular", "svelte"]:
            return project_type
        elif project_type == "python":
            # Check for Python frameworks
            requirements_file = project_dir / "requirements.txt"
            if requirements_file.exists():
                try:
                    with open(requirements_file, 'r') as f:
                        content = f.read().lower()
                        if "django" in content:
                            return "django"
                        elif "flask" in content:
                            return "flask"
                        elif "fastapi" in content:
                            return "fastapi"
                except:
                    pass
        
        return None
    
    def _estimate_project_size(self, project_dir: Path) -> str:
        """Estimate project size"""
        try:
            file_count = sum(1 for _ in project_dir.rglob("*") if _.is_file())
            
            if file_count < 50:
                return "small"
            elif file_count < 500:
                return "medium"
            elif file_count < 2000:
                return "large"
            else:
                return "enterprise"
        except:
            return "unknown"
    
    def _estimate_complexity(self, project_dir: Path) -> str:
        """Estimate project complexity"""
        complexity_indicators = {
            "docker-compose.yml": 2,
            "Dockerfile": 1,
            "kubernetes": 3,
            ".github/workflows": 2,
            "tests": 1,
            "docs": 1,
            "microservices": 3,
            "monorepo": 2
        }
        
        complexity_score = 0
        
        for indicator, score in complexity_indicators.items():
            if (project_dir / indicator).exists():
                complexity_score += score
        
        if complexity_score < 3:
            return "simple"
        elif complexity_score < 7:
            return "moderate"
        else:
            return "complex"
    
    def _detect_languages(self, project_dir: Path) -> List[str]:
        """Detect programming languages used"""
        languages = set()
        
        language_extensions = {
            ".py": "python",
            ".js": "javascript",
            ".ts": "typescript",
            ".jsx": "javascript",
            ".tsx": "typescript",
            ".rs": "rust",
            ".go": "go",
            ".java": "java",
            ".kt": "kotlin",
            ".scala": "scala",
            ".rb": "ruby",
            ".php": "php",
            ".cpp": "cpp",
            ".c": "c",
            ".cs": "csharp",
            ".swift": "swift",
            ".dart": "dart",
            ".ex": "elixir"
        }
        
        try:
            for file_path in project_dir.rglob("*"):
                if file_path.is_file():
                    suffix = file_path.suffix.lower()
                    if suffix in language_extensions:
                        languages.add(language_extensions[suffix])
        except:
            pass
        
        return list(languages)
    
    def _analyze_dependencies(self, project_dir: Path) -> Dict[str, Any]:
        """Analyze project dependencies"""
        dependencies = {
            "package_files": [],
            "dependency_count": 0,
            "security_vulnerabilities": []
        }
        
        package_files = [
            "package.json", "requirements.txt", "Cargo.toml", "go.mod",
            "pom.xml", "build.gradle", "composer.json", "Gemfile"
        ]
        
        for file in package_files:
            if (project_dir / file).exists():
                dependencies["package_files"].append(file)
        
        # Count dependencies in package.json
        package_json = project_dir / "package.json"
        if package_json.exists():
            try:
                with open(package_json, 'r') as f:
                    data = json.load(f)
                    deps = len(data.get("dependencies", {}))
                    dev_deps = len(data.get("devDependencies", {}))
                    dependencies["dependency_count"] = deps + dev_deps
            except:
                pass
        
        return dependencies
    
    def _detect_build_tools(self, project_dir: Path) -> List[str]:
        """Detect build tools"""
        build_tools = []
        
        build_indicators = {
            "webpack.config.js": "webpack",
            "rollup.config.js": "rollup",
            "vite.config.js": "vite",
            "gulpfile.js": "gulp",
            "Gruntfile.js": "grunt",
            "Makefile": "make",
            "CMakeLists.txt": "cmake",
            "build.gradle": "gradle",
            "pom.xml": "maven",
            "setup.py": "setuptools",
            "pyproject.toml": "poetry"
        }
        
        for file, tool in build_indicators.items():
            if (project_dir / file).exists():
                build_tools.append(tool)
        
        return build_tools
    
    def _detect_testing_frameworks(self, project_dir: Path) -> List[str]:
        """Detect testing frameworks"""
        testing_frameworks = []
        
        # Check package.json for testing dependencies
        package_json = project_dir / "package.json"
        if package_json.exists():
            try:
                with open(package_json, 'r') as f:
                    data = json.load(f)
                    all_deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                    
                    test_frameworks = ["jest", "mocha", "jasmine", "cypress", "playwright", "vitest"]
                    for framework in test_frameworks:
                        if framework in all_deps:
                            testing_frameworks.append(framework)
            except:
                pass
        
        # Check for Python testing frameworks
        requirements_file = project_dir / "requirements.txt"
        if requirements_file.exists():
            try:
                with open(requirements_file, 'r') as f:
                    content = f.read().lower()
                    python_test_frameworks = ["pytest", "unittest", "nose", "tox"]
                    for framework in python_test_frameworks:
                        if framework in content:
                            testing_frameworks.append(framework)
            except:
                pass
        
        return testing_frameworks
    
    def _detect_deployment_targets(self, project_dir: Path) -> List[str]:
        """Detect deployment targets"""
        deployment_targets = []
        
        deployment_indicators = {
            "Dockerfile": "docker",
            "docker-compose.yml": "docker-compose",
            "kubernetes": "kubernetes",
            "k8s": "kubernetes",
            ".github/workflows": "github-actions",
            ".gitlab-ci.yml": "gitlab-ci",
            "Jenkinsfile": "jenkins",
            "azure-pipelines.yml": "azure-devops",
            "vercel.json": "vercel",
            "netlify.toml": "netlify",
            "serverless.yml": "serverless",
            "terraform": "terraform",
            "ansible": "ansible"
        }
        
        for indicator, target in deployment_indicators.items():
            if (project_dir / indicator).exists():
                deployment_targets.append(target)
        
        return deployment_targets
    
    def _is_corporate_environment(self) -> bool:
        """Detect if running in corporate environment"""
        corporate_indicators = [
            self.network_info.get("proxy_config", {}),
            "corp" in socket.gethostname().lower(),
            "company" in socket.gethostname().lower(),
            self.network_info.get("firewall_restrictions", [])
        ]
        
        return any(corporate_indicators)
    
    def _detect_security_tools(self) -> List[str]:
        """Detect security tools"""
        security_tools = []
        
        tools = ["bandit", "safety", "semgrep", "snyk", "sonarqube"]
        
        for tool in tools:
            try:
                subprocess.run([tool, "--version"], capture_output=True, timeout=2)
                security_tools.append(tool)
            except:
                continue
        
        return security_tools
    
    def _detect_compliance_requirements(self) -> List[str]:
        """Detect compliance requirements"""
        # This would be expanded based on specific organizational needs
        return []
    
    def _detect_encryption_requirements(self) -> Dict[str, bool]:
        """Detect encryption requirements"""
        return {
            "at_rest": self._is_corporate_environment(),
            "in_transit": True,  # Always recommended
            "key_management": self._is_corporate_environment()
        }
    
    def generate_optimized_config(self) -> Dict[str, Any]:
        """Generate optimized configuration based on environment detection"""
        env_data = self.detect_complete_environment()
        
        # Base configuration
        config = {
            "version": "2.0.0",
            "generated_at": datetime.now().isoformat(),
            "environment_detection": env_data,
            "monitoring": self._generate_monitoring_config(),
            "sync": self._generate_sync_config(),
            "failsafe": self._generate_failsafe_config(),
            "security": self._generate_security_config(),
            "performance": self._generate_performance_config(),
            "integrations": self._generate_integration_config()
        }
        
        return config
    
    def _generate_monitoring_config(self) -> Dict[str, Any]:
        """Generate monitoring configuration"""
        project_type = self.project_info.get("type", "generic")
        project_size = self.project_info.get("size", "medium")
        
        # Base patterns
        include_patterns = ["**/*.py", "**/*.js", "**/*.ts", "**/*.json", "**/*.md", "**/*.yml", "**/*.yaml"]
        exclude_patterns = [".git/**", "node_modules/**", "__pycache__/**", "*.log", "*.tmp"]
        
        # Adjust based on project type
        if project_type in ["nodejs", "react", "nextjs", "vue", "angular"]:
            include_patterns.extend(["**/*.jsx", "**/*.tsx", "**/*.css", "**/*.scss", "**/*.less"])
            exclude_patterns.extend([".next/**", "dist/**", "build/**", "coverage/**"])
        elif project_type == "python":
            include_patterns.extend(["**/*.pyx", "**/*.pyi", "requirements*.txt", "setup.py", "pyproject.toml"])
            exclude_patterns.extend(["venv/**", "env/**", ".pytest_cache/**", "*.egg-info/**"])
        elif project_type == "rust":
            include_patterns.extend(["**/*.rs", "Cargo.toml", "Cargo.lock"])
            exclude_patterns.extend(["target/**"])
        
        # Adjust debounce based on project size and environment
        if project_size == "small":
            debounce_seconds = 1
        elif project_size == "large":
            debounce_seconds = 5
        else:
            debounce_seconds = 2
        
        # Adjust for CI/CD environments
        if self.system_info.get("ci_cd_platform"):
            debounce_seconds = 10  # Longer debounce for CI/CD
        
        return {
            "include_patterns": include_patterns,
            "exclude_patterns": exclude_patterns,
            "watch_directories": self._get_watch_directories(),
            "debounce_seconds": debounce_seconds,
            "ignore_hidden_files": True,
            "max_file_size_mb": 10,
            "batch_size": 100 if project_size == "large" else 50
        }
    
    def _generate_sync_config(self) -> Dict[str, Any]:
        """Generate sync configuration"""
        network_type = self.network_info.get("connectivity_type", "direct")
        bandwidth = self.network_info.get("bandwidth_class", "medium")
        ci_cd = self.system_info.get("ci_cd_platform")
        
        # Base interval
        if ci_cd:
            interval_seconds = 300  # 5 minutes for CI/CD
        elif bandwidth == "low":
            interval_seconds = 7200  # 2 hours for low bandwidth
        elif bandwidth == "high":
            interval_seconds = 1800  # 30 minutes for high bandwidth
        else:
            interval_seconds = 3600  # 1 hour default
        
        return {
            "interval_seconds": interval_seconds,
            "auto_start": True,
            "create_repo_if_missing": True,
            "retry_attempts": 3 if network_type == "direct" else 5,
            "retry_delay_seconds": 30 if network_type == "direct" else 60,
            "compression_enabled": bandwidth == "low",
            "batch_commits": ci_cd is not None
        }
    
    def _generate_failsafe_config(self) -> Dict[str, Any]:
        """Generate failsafe configuration"""
        environment_type = self.environment_info.get("development_mode", "unknown")
        project_complexity = self.project_info.get("complexity", "moderate")
        
        if environment_type == "production":
            sensitivity = "strict"
        elif project_complexity == "complex":
            sensitivity = "balanced"
        else:
            sensitivity = "permissive"
        
        return {
            "sensitivity": sensitivity,
            "file_change_threshold": 3 if sensitivity == "strict" else 5,
            "initialization_timeout_hours": 12 if sensitivity == "strict" else 24,
            "auto_recovery": True,
            "notification_methods": ["console", "log"]
        }
    
    def _generate_security_config(self) -> Dict[str, Any]:
        """Generate security configuration"""
        corporate = self.environment_info.get("security", {}).get("corporate_environment", False)
        encryption_reqs = self.environment_info.get("security", {}).get("encryption_requirements", {})
        
        return {
            "encrypt_config": corporate or encryption_reqs.get("at_rest", False),
            "secure_token_storage": True,
            "audit_logging": corporate,
            "compliance_mode": corporate,
            "tls_verification": True,
            "certificate_pinning": corporate
        }
    
    def _generate_performance_config(self) -> Dict[str, Any]:
        """Generate performance configuration"""
        cpu_count = self.system_info.get("cpu_count", 1)
        project_size = self.project_info.get("size", "medium")
        container = self.system_info.get("container_type")
        
        # Adjust worker count based on resources
        if container:
            worker_count = min(2, cpu_count)  # Conservative for containers
        elif project_size == "large":
            worker_count = min(cpu_count, 8)
        else:
            worker_count = min(cpu_count // 2, 4)
        
        return {
            "worker_count": max(1, worker_count),
            "memory_limit_mb": 512 if container else 1024,
            "cache_enabled": True,
            "cache_size_mb": 100,
            "parallel_processing": project_size in ["large", "enterprise"]
        }
    
    def _generate_integration_config(self) -> Dict[str, Any]:
        """Generate integration configuration"""
        ide = self.environment_info.get("ide")
        ci_cd = self.system_info.get("ci_cd_platform")
        testing_frameworks = self.project_info.get("testing_frameworks", [])
        
        integrations = {
            "ide_integration": ide is not None,
            "ci_cd_integration": ci_cd is not None,
            "testing_integration": len(testing_frameworks) > 0,
            "supported_ides": [ide] if ide else [],
            "supported_ci_cd": [ci_cd] if ci_cd else [],
            "supported_testing": testing_frameworks
        }
        
        return integrations
    
    def _get_watch_directories(self) -> List[str]:
        """Get directories to watch based on project type"""
        project_type = self.project_info.get("type", "generic")
        
        base_dirs = ["."]
        
        if project_type in ["nodejs", "react", "nextjs", "vue", "angular"]:
            base_dirs.extend(["src", "components", "pages", "lib", "public"])
        elif project_type == "python":
            base_dirs.extend(["src", "app", "lib", "tests"])
        elif project_type == "rust":
            base_dirs.extend(["src", "tests", "examples"])
        elif project_type in ["java", "maven", "gradle"]:
            base_dirs.extend(["src", "test"])
        
        # Filter to only existing directories
        project_dir = Path.cwd()
        existing_dirs = []
        for dir_name in base_dirs:
            dir_path = project_dir / dir_name
            if dir_path.exists() and dir_path.is_dir():
                existing_dirs.append(dir_name)
        
        return existing_dirs if existing_dirs else ["."]
    
    def save_config(self, config: Dict[str, Any], filename: str = "emad-intelligent-config.json"):
        """Save configuration to file"""
        config_path = self.config_dir / filename
        
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2, default=str)
        
        return config_path

def main():
    """CLI for intelligent configuration generation"""
    import argparse
    
    parser = argparse.ArgumentParser(description="EMAD Intelligent Configuration Generator")
    parser.add_argument("--emad-dir", default=".", help="EMAD installation directory")
    parser.add_argument("--output", help="Output configuration file")
    parser.add_argument("--detect-only", action="store_true", help="Only show environment detection")
    
    args = parser.parse_args()
    
    emad_dir = Path(args.emad_dir).absolute()
    config_generator = EMADIntelligentConfig(emad_dir)
    
    if args.detect_only:
        env_data = config_generator.detect_complete_environment()
        print(json.dumps(env_data, indent=2, default=str))
    else:
        config = config_generator.generate_optimized_config()
        
        if args.output:
            output_path = config_generator.save_config(config, args.output)
            print(f"Configuration saved to: {output_path}")
        else:
            print(json.dumps(config, indent=2, default=str))

if __name__ == "__main__":
    main()
