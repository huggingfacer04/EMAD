#!/usr/bin/env python3

"""
EMAD Failsafe System

Critical failsafe mechanisms to prevent development workflow disruptions:
1. Uninitialized EMAD Detection
2. Post-Completion Development Detection

This system integrates with the EMAD monitoring to provide proactive warnings
and automated responses to common workflow issues.
"""

import os
import sys
import json
import time
import psutil
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import threading
import subprocess

class EMADFailsafeConfig:
    """Configuration management for EMAD failsafe system"""
    
    def __init__(self, config_path: Path):
        self.config_path = config_path
        self.default_config = {
            "failsafe_1_uninitialized_detection": {
                "enabled": True,
                "name": "Uninitialized EMAD Detection",
                "check_interval_seconds": 300,  # 5 minutes
                "initialization_timeout_hours": 24,
                "file_change_threshold": 3,
                "auto_enable_conditions": {
                    "new_project_detection": True,
                    "git_init_detection": True,
                    "multiple_changes_without_emad": True
                },
                "response_actions": {
                    "show_notification": True,
                    "prompt_initialization": True,
                    "pause_monitoring": False,
                    "auto_start_emad": False
                }
            },
            "failsafe_2_post_completion_detection": {
                "enabled": True,
                "name": "Post-Completion Development Detection",
                "check_interval_seconds": 600,  # 10 minutes
                "completion_grace_period_hours": 2,
                "significant_change_threshold": 5,
                "auto_enable_conditions": {
                    "high_priority_completion": True,
                    "multiple_completion_cycles": True,
                    "user_confusion_indicators": True
                },
                "response_actions": {
                    "alert_post_completion": True,
                    "prompt_status_clarification": True,
                    "offer_reopen_options": True,
                    "suggest_feature_branch": True
                }
            },
            "general": {
                "log_level": "INFO",
                "notification_method": "console",  # console, popup, both
                "persistence_enabled": True,
                "performance_monitoring": True
            }
        }
        self.config = self.load_config()
    
    def load_config(self) -> Dict:
        """Load configuration from file or create default"""
        try:
            if self.config_path.exists():
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                # Merge with defaults to ensure all keys exist
                return self._merge_config(self.default_config, config)
            else:
                self.save_config(self.default_config)
                return self.default_config.copy()
        except Exception as e:
            logging.error(f"Error loading config: {e}")
            return self.default_config.copy()
    
    def save_config(self, config: Dict = None):
        """Save configuration to file"""
        try:
            config_to_save = config or self.config
            self.config_path.parent.mkdir(exist_ok=True)
            with open(self.config_path, 'w') as f:
                json.dump(config_to_save, f, indent=2)
        except Exception as e:
            logging.error(f"Error saving config: {e}")
    
    def _merge_config(self, default: Dict, user: Dict) -> Dict:
        """Recursively merge user config with defaults"""
        result = default.copy()
        for key, value in user.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._merge_config(result[key], value)
            else:
                result[key] = value
        return result
    
    def update_setting(self, path: str, value):
        """Update a specific setting using dot notation"""
        keys = path.split('.')
        current = self.config
        
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        
        current[keys[-1]] = value
        self.save_config()

class EMADFailsafeSystem:
    """Main failsafe system implementation"""
    
    def __init__(self, emad_dir: Path):
        self.emad_dir = emad_dir
        self.config_path = emad_dir / "config" / "emad-failsafe-config.json"
        self.state_path = emad_dir / "config" / "emad-failsafe-state.json"
        self.log_path = emad_dir / "logs" / f"emad-failsafe-{datetime.now().strftime('%Y%m%d')}.log"
        
        # Ensure directories exist
        self.config_path.parent.mkdir(exist_ok=True)
        self.log_path.parent.mkdir(exist_ok=True)
        
        # Initialize components
        self.config = EMADFailsafeConfig(self.config_path)
        self.setup_logging()
        self.state = self.load_state()
        self.running = False
        
        # Monitoring threads
        self.failsafe_threads = []
        
        self.logger.info("EMAD Failsafe System initialized")
    
    def setup_logging(self):
        """Setup logging for failsafe system"""
        log_level = getattr(logging, self.config.config["general"]["log_level"])
        
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.log_path),
                logging.StreamHandler(sys.stdout)
            ]
        )
        
        self.logger = logging.getLogger("EMADFailsafe")
    
    def load_state(self) -> Dict:
        """Load persistent state"""
        try:
            if self.state_path.exists():
                with open(self.state_path, 'r') as f:
                    return json.load(f)
            else:
                return {
                    "last_emad_initialization": None,
                    "last_completion_check": None,
                    "project_completion_status": {},
                    "failsafe_activations": [],
                    "file_change_history": []
                }
        except Exception as e:
            self.logger.error(f"Error loading state: {e}")
            return {}
    
    def save_state(self):
        """Save persistent state"""
        try:
            with open(self.state_path, 'w') as f:
                json.dump(self.state, f, indent=2)
        except Exception as e:
            self.logger.error(f"Error saving state: {e}")
    
    def is_emad_running(self) -> bool:
        """Check if EMAD background runner is active"""
        try:
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    cmdline = proc.info['cmdline']
                    if cmdline and any('emad-background-runner.py' in arg for arg in cmdline):
                        return True
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            return False
        except Exception as e:
            self.logger.error(f"Error checking EMAD process: {e}")
            return False
    
    def detect_file_changes(self) -> List[Dict]:
        """Detect recent file changes in monitored directories"""
        changes = []
        current_time = datetime.now()
        
        try:
            # Monitor key directories
            monitor_dirs = [
                self.emad_dir / "src",
                self.emad_dir / "bmad-agent", 
                self.emad_dir / "docs",
                self.emad_dir
            ]
            
            for monitor_dir in monitor_dirs:
                if not monitor_dir.exists():
                    continue
                
                for file_path in monitor_dir.rglob("*"):
                    if file_path.is_file() and not self._should_ignore_file(file_path):
                        try:
                            mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                            if current_time - mtime < timedelta(minutes=30):  # Recent changes
                                changes.append({
                                    "file": str(file_path.relative_to(self.emad_dir)),
                                    "modified": mtime.isoformat(),
                                    "size": file_path.stat().st_size
                                })
                        except (OSError, ValueError):
                            continue
            
            return changes
            
        except Exception as e:
            self.logger.error(f"Error detecting file changes: {e}")
            return []
    
    def _should_ignore_file(self, file_path: Path) -> bool:
        """Check if file should be ignored in monitoring"""
        ignore_patterns = [
            ".git", "__pycache__", "node_modules", ".vscode",
            "logs", "config", ".log", ".tmp", ".temp", ".pyc"
        ]
        
        file_str = str(file_path).lower()
        return any(pattern in file_str for pattern in ignore_patterns)
    
    def check_project_completion_status(self) -> Dict:
        """Check if project has been marked as completed"""
        try:
            # Check for task completion markers
            task_files = list(self.emad_dir.glob("**/task*.json"))
            task_files.extend(list(self.emad_dir.glob("**/bmad-task*.json")))
            
            completion_status = {
                "is_completed": False,
                "completion_time": None,
                "completed_tasks": [],
                "active_tasks": []
            }
            
            for task_file in task_files:
                try:
                    with open(task_file, 'r') as f:
                        task_data = json.load(f)
                    
                    if isinstance(task_data, dict):
                        if task_data.get("state") == "COMPLETE":
                            completion_status["completed_tasks"].append({
                                "file": str(task_file.relative_to(self.emad_dir)),
                                "name": task_data.get("name", "Unknown"),
                                "completion_time": task_data.get("completed_at")
                            })
                            completion_status["is_completed"] = True
                        elif task_data.get("state") in ["IN_PROGRESS", "NOT_STARTED"]:
                            completion_status["active_tasks"].append({
                                "file": str(task_file.relative_to(self.emad_dir)),
                                "name": task_data.get("name", "Unknown"),
                                "state": task_data.get("state")
                            })
                            
                except (json.JSONDecodeError, KeyError):
                    continue
            
            return completion_status
            
        except Exception as e:
            self.logger.error(f"Error checking completion status: {e}")
            return {"is_completed": False, "completion_time": None, "completed_tasks": [], "active_tasks": []}
    
    def detect_git_initialization(self) -> bool:
        """Detect if Git repository was recently initialized"""
        try:
            git_dir = self.emad_dir / ".git"
            if git_dir.exists():
                git_init_time = datetime.fromtimestamp(git_dir.stat().st_ctime)
                return datetime.now() - git_init_time < timedelta(hours=1)
            return False
        except Exception:
            return False
    
    def detect_new_project(self) -> bool:
        """Detect if this appears to be a new project"""
        try:
            # Check for common new project indicators
            indicators = [
                self.emad_dir / "package.json",
                self.emad_dir / "requirements.txt", 
                self.emad_dir / "Cargo.toml",
                self.emad_dir / "pom.xml",
                self.emad_dir / "README.md"
            ]
            
            recent_indicators = 0
            for indicator in indicators:
                if indicator.exists():
                    creation_time = datetime.fromtimestamp(indicator.stat().st_ctime)
                    if datetime.now() - creation_time < timedelta(hours=24):
                        recent_indicators += 1
            
            return recent_indicators >= 2
            
        except Exception:
            return False
