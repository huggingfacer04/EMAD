#!/usr/bin/env python3

"""
EMAD Project Templates System

Provides pre-configured templates for different project types with optimized
EMAD settings, monitoring patterns, and development workflows.
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any

class EMADProjectTemplate:
    """Base class for EMAD project templates"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
    
    def get_monitoring_config(self) -> Dict[str, Any]:
        """Get monitoring configuration for this project type"""
        return {
            "include_patterns": ["**/*"],
            "exclude_patterns": [".git/**", "node_modules/**", "__pycache__/**"],
            "watch_directories": ["."],
            "ignore_hidden_files": True
        }
    
    def get_failsafe_config(self) -> Dict[str, Any]:
        """Get failsafe configuration for this project type"""
        return {
            "sensitivity": "balanced",
            "file_change_threshold": 5,
            "initialization_timeout_hours": 24
        }
    
    def get_sync_config(self) -> Dict[str, Any]:
        """Get sync configuration for this project type"""
        return {
            "interval_seconds": 3600,
            "auto_start": True,
            "create_repo_if_missing": True
        }
    
    def get_gitignore_entries(self) -> List[str]:
        """Get .gitignore entries for this project type"""
        return [
            "# EMAD system files",
            ".emad/",
            "emad-*.log",
            "emad-runner.pid"
        ]
    
    def get_readme_section(self) -> str:
        """Get README.md section for EMAD integration"""
        return """
## EMAD Integration

This project is integrated with EMAD (Ecosystem for BMad Method AI Development) for automated development workflow management.

### EMAD Commands

- `emad status` - Check EMAD system status
- `emad start` - Start background monitoring
- `emad stop` - Stop background monitoring
- `emad test` - Run EMAD system tests

### Features

- **Automatic GitHub Sync**: Changes are automatically synced to GitHub
- **Failsafe Protection**: Prevents common development workflow issues
- **Project Monitoring**: Intelligent file change detection and response
- **Cross-Platform**: Works on Windows, macOS, and Linux

For more information, visit: https://github.com/huggingfacer04/EMAD
"""
    
    def generate_config(self, project_dir: Path) -> Dict[str, Any]:
        """Generate complete project configuration"""
        return {
            "template": self.name,
            "project_type": self.name.lower(),
            "monitoring": self.get_monitoring_config(),
            "failsafe": self.get_failsafe_config(),
            "sync": self.get_sync_config(),
            "generated_at": "2024-01-15T00:00:00Z"
        }

class NodeJSTemplate(EMADProjectTemplate):
    """Template for Node.js/JavaScript projects"""
    
    def __init__(self):
        super().__init__(
            "NodeJS",
            "Optimized for Node.js, React, Next.js, and JavaScript projects"
        )
    
    def get_monitoring_config(self) -> Dict[str, Any]:
        return {
            "include_patterns": [
                "**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx",
                "**/*.json", "**/*.md", "**/*.yml", "**/*.yaml",
                "package.json", "package-lock.json", "yarn.lock"
            ],
            "exclude_patterns": [
                ".git/**", "node_modules/**", "dist/**", "build/**",
                ".next/**", "coverage/**", "*.log", ".env*"
            ],
            "watch_directories": ["src", "components", "pages", "lib", "public", "."],
            "ignore_hidden_files": True,
            "debounce_seconds": 2
        }
    
    def get_failsafe_config(self) -> Dict[str, Any]:
        return {
            "sensitivity": "balanced",
            "file_change_threshold": 3,
            "initialization_timeout_hours": 12,
            "npm_install_detection": True
        }
    
    def get_gitignore_entries(self) -> List[str]:
        return super().get_gitignore_entries() + [
            "# Node.js specific EMAD exclusions",
            "node_modules/",
            ".next/",
            "dist/",
            "build/",
            "coverage/"
        ]

class PythonTemplate(EMADProjectTemplate):
    """Template for Python projects"""
    
    def __init__(self):
        super().__init__(
            "Python",
            "Optimized for Python, Django, Flask, and FastAPI projects"
        )
    
    def get_monitoring_config(self) -> Dict[str, Any]:
        return {
            "include_patterns": [
                "**/*.py", "**/*.pyx", "**/*.pyi",
                "**/*.json", "**/*.yml", "**/*.yaml", "**/*.toml",
                "requirements*.txt", "setup.py", "pyproject.toml"
            ],
            "exclude_patterns": [
                ".git/**", "__pycache__/**", "*.pyc", "*.pyo",
                ".pytest_cache/**", ".coverage", "htmlcov/**",
                "venv/**", "env/**", ".env/**", "*.egg-info/**"
            ],
            "watch_directories": ["src", "app", "lib", "tests", "."],
            "ignore_hidden_files": True,
            "debounce_seconds": 1
        }
    
    def get_failsafe_config(self) -> Dict[str, Any]:
        return {
            "sensitivity": "strict",
            "file_change_threshold": 2,
            "initialization_timeout_hours": 24,
            "virtual_env_detection": True
        }
    
    def get_gitignore_entries(self) -> List[str]:
        return super().get_gitignore_entries() + [
            "# Python specific EMAD exclusions",
            "__pycache__/",
            "*.pyc",
            "*.pyo",
            ".pytest_cache/",
            "venv/",
            "env/"
        ]

class RustTemplate(EMADProjectTemplate):
    """Template for Rust projects"""
    
    def __init__(self):
        super().__init__(
            "Rust",
            "Optimized for Rust and Cargo projects"
        )
    
    def get_monitoring_config(self) -> Dict[str, Any]:
        return {
            "include_patterns": [
                "**/*.rs", "**/*.toml", "**/*.md",
                "Cargo.toml", "Cargo.lock"
            ],
            "exclude_patterns": [
                ".git/**", "target/**", "*.log"
            ],
            "watch_directories": ["src", "tests", "examples", "."],
            "ignore_hidden_files": True,
            "debounce_seconds": 3
        }
    
    def get_failsafe_config(self) -> Dict[str, Any]:
        return {
            "sensitivity": "balanced",
            "file_change_threshold": 2,
            "initialization_timeout_hours": 24,
            "cargo_build_detection": True
        }

class JavaTemplate(EMADProjectTemplate):
    """Template for Java/Maven/Gradle projects"""
    
    def __init__(self):
        super().__init__(
            "Java",
            "Optimized for Java, Maven, and Gradle projects"
        )
    
    def get_monitoring_config(self) -> Dict[str, Any]:
        return {
            "include_patterns": [
                "**/*.java", "**/*.xml", "**/*.gradle", "**/*.properties",
                "pom.xml", "build.gradle", "settings.gradle"
            ],
            "exclude_patterns": [
                ".git/**", "target/**", "build/**", ".gradle/**",
                "*.class", "*.jar", "*.war"
            ],
            "watch_directories": ["src", "test", "."],
            "ignore_hidden_files": True,
            "debounce_seconds": 5
        }

class GoTemplate(EMADProjectTemplate):
    """Template for Go projects"""
    
    def __init__(self):
        super().__init__(
            "Go",
            "Optimized for Go projects"
        )
    
    def get_monitoring_config(self) -> Dict[str, Any]:
        return {
            "include_patterns": [
                "**/*.go", "go.mod", "go.sum", "**/*.md"
            ],
            "exclude_patterns": [
                ".git/**", "vendor/**", "*.exe", "*.log"
            ],
            "watch_directories": [".", "cmd", "pkg", "internal"],
            "ignore_hidden_files": True,
            "debounce_seconds": 2
        }

class GenericTemplate(EMADProjectTemplate):
    """Generic template for unknown project types"""
    
    def __init__(self):
        super().__init__(
            "Generic",
            "Generic template for any project type"
        )
    
    def get_monitoring_config(self) -> Dict[str, Any]:
        return {
            "include_patterns": [
                "**/*.py", "**/*.js", "**/*.ts", "**/*.java", "**/*.go",
                "**/*.rs", "**/*.cpp", "**/*.c", "**/*.h",
                "**/*.json", "**/*.yml", "**/*.yaml", "**/*.toml",
                "**/*.md", "**/*.txt"
            ],
            "exclude_patterns": [
                ".git/**", "node_modules/**", "__pycache__/**",
                "target/**", "build/**", "dist/**", "*.log", "*.tmp"
            ],
            "watch_directories": ["src", "lib", "app", "."],
            "ignore_hidden_files": True,
            "debounce_seconds": 3
        }

class EMADTemplateManager:
    """Manager for EMAD project templates"""
    
    def __init__(self):
        self.templates = {
            "nodejs": NodeJSTemplate(),
            "python": PythonTemplate(),
            "rust": RustTemplate(),
            "java": JavaTemplate(),
            "go": GoTemplate(),
            "generic": GenericTemplate()
        }
    
    def get_template(self, project_type: str) -> EMADProjectTemplate:
        """Get template for project type"""
        return self.templates.get(project_type.lower(), self.templates["generic"])
    
    def detect_project_type(self, project_dir: Path) -> str:
        """Auto-detect project type from files"""
        if (project_dir / "package.json").exists():
            return "nodejs"
        elif any((project_dir / f).exists() for f in ["requirements.txt", "setup.py", "pyproject.toml"]):
            return "python"
        elif (project_dir / "Cargo.toml").exists():
            return "rust"
        elif any((project_dir / f).exists() for f in ["pom.xml", "build.gradle"]):
            return "java"
        elif (project_dir / "go.mod").exists():
            return "go"
        else:
            return "generic"
    
    def apply_template(self, project_dir: Path, project_type: str = None) -> bool:
        """Apply template to project directory"""
        try:
            # Auto-detect if not specified
            if not project_type:
                project_type = self.detect_project_type(project_dir)
            
            template = self.get_template(project_type)
            
            # Create .emad directory
            emad_dir = project_dir / ".emad"
            emad_dir.mkdir(exist_ok=True)
            
            # Generate and save configuration
            config = template.generate_config(project_dir)
            with open(emad_dir / "project-config.json", 'w') as f:
                json.dump(config, f, indent=2)
            
            # Update .gitignore
            gitignore_path = project_dir / ".gitignore"
            gitignore_entries = template.get_gitignore_entries()
            
            if gitignore_path.exists():
                with open(gitignore_path, 'r') as f:
                    existing_content = f.read()
                
                new_entries = [entry for entry in gitignore_entries if entry not in existing_content]
                if new_entries:
                    with open(gitignore_path, 'a') as f:
                        f.write("\n" + "\n".join(new_entries) + "\n")
            else:
                with open(gitignore_path, 'w') as f:
                    f.write("\n".join(gitignore_entries) + "\n")
            
            # Update README.md
            readme_path = project_dir / "README.md"
            readme_section = template.get_readme_section()
            
            if readme_path.exists():
                with open(readme_path, 'r') as f:
                    existing_content = f.read()
                
                if "EMAD Integration" not in existing_content:
                    with open(readme_path, 'a') as f:
                        f.write(readme_section)
            else:
                with open(readme_path, 'w') as f:
                    f.write(f"# {project_dir.name}\n{readme_section}")
            
            return True
            
        except Exception as e:
            print(f"Error applying template: {e}")
            return False
    
    def list_templates(self) -> Dict[str, str]:
        """List available templates"""
        return {name: template.description for name, template in self.templates.items()}

def main():
    """CLI for template management"""
    import argparse
    
    parser = argparse.ArgumentParser(description="EMAD Project Template Manager")
    parser.add_argument("--list", action="store_true", help="List available templates")
    parser.add_argument("--apply", help="Apply template to current directory")
    parser.add_argument("--detect", action="store_true", help="Detect project type")
    
    args = parser.parse_args()
    
    manager = EMADTemplateManager()
    
    if args.list:
        print("Available EMAD Project Templates:")
        for name, description in manager.list_templates().items():
            print(f"  {name}: {description}")
    
    elif args.apply:
        project_dir = Path.cwd()
        if manager.apply_template(project_dir, args.apply):
            print(f"✅ Applied {args.apply} template to {project_dir}")
        else:
            print(f"❌ Failed to apply template")
    
    elif args.detect:
        project_type = manager.detect_project_type(Path.cwd())
        print(f"Detected project type: {project_type}")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
