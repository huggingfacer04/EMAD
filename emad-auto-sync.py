#!/usr/bin/env python3

"""
EMAD Auto-Sync Monitoring System

This script runs as a background service/daemon to monitor the local BMAD-METHOD
directory for changes and automatically synchronize them with the EMAD GitHub repository.

Features:
- Monitors file system changes every hour
- Creates timestamped branches for changes
- Commits changes with descriptive messages
- Creates and auto-merges Pull Requests
- Comprehensive logging and error handling
- Configurable monitoring intervals
"""

import os
import sys
import json
import time
import hashlib
import logging
import requests
import threading
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set, Optional
import signal
import argparse

# Configuration
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN', 'your_github_token_here')
REPO_NAME = 'EMAD'
GITHUB_API_BASE = 'https://api.github.com'
DEFAULT_MONITOR_INTERVAL = 3600  # 1 hour in seconds
DEFAULT_BMAD_PATH = Path(__file__).parent.absolute()

class EMADAutoSync:
    def __init__(self, bmad_path: Path, monitor_interval: int = DEFAULT_MONITOR_INTERVAL):
        self.bmad_path = Path(bmad_path)
        self.monitor_interval = monitor_interval
        self.running = False
        self.username = None
        self.file_hashes = {}
        self.excluded_patterns = {
            '.git', '__pycache__', 'node_modules', '.vscode', '.DS_Store',
            '*.log', '*.tmp', '*.temp', '.env', '.env.*'
        }
        
        # Setup logging
        self.setup_logging()
        
        # Setup GitHub session
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {GITHUB_TOKEN}',
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'EMAD-Auto-Sync-Monitor'
        })
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)

    def setup_logging(self):
        """Setup comprehensive logging"""
        log_dir = self.bmad_path / 'logs'
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / f'emad-auto-sync-{datetime.now().strftime("%Y%m%d")}.log'
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler(sys.stdout)
            ]
        )
        
        self.logger = logging.getLogger(__name__)

    def signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        self.logger.info(f'Received signal {signum}, shutting down gracefully...')
        self.running = False

    def authenticate(self) -> bool:
        """Authenticate with GitHub and get user info"""
        try:
            response = self.session.get(f'{GITHUB_API_BASE}/user')
            
            if response.status_code == 200:
                user = response.json()
                self.username = user['login']
                self.logger.info(f'Authenticated as: {self.username}')
                return True
            else:
                self.logger.error(f'Authentication failed: {response.status_code} - {response.text}')
                return False
        except Exception as e:
            self.logger.error(f'Authentication error: {e}')
            return False

    def should_exclude_file(self, file_path: Path) -> bool:
        """Check if file should be excluded from monitoring"""
        file_str = str(file_path)
        
        for pattern in self.excluded_patterns:
            if pattern.startswith('*'):
                if file_str.endswith(pattern[1:]):
                    return True
            elif pattern in file_str:
                return True
        
        return False

    def calculate_file_hash(self, file_path: Path) -> Optional[str]:
        """Calculate SHA-256 hash of file content"""
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
                return hashlib.sha256(content).hexdigest()
        except Exception as e:
            self.logger.error(f'Error calculating hash for {file_path}: {e}')
            return None

    def scan_directory(self) -> Dict[str, str]:
        """Scan directory and return file hashes"""
        current_hashes = {}
        
        try:
            for file_path in self.bmad_path.rglob('*'):
                if file_path.is_file() and not self.should_exclude_file(file_path):
                    relative_path = file_path.relative_to(self.bmad_path)
                    file_hash = self.calculate_file_hash(file_path)
                    
                    if file_hash:
                        current_hashes[str(relative_path)] = file_hash
        except Exception as e:
            self.logger.error(f'Error scanning directory: {e}')
        
        return current_hashes

    def detect_changes(self) -> Dict[str, List[str]]:
        """Detect file changes since last scan"""
        current_hashes = self.scan_directory()
        
        changes = {
            'added': [],
            'modified': [],
            'deleted': []
        }
        
        # Find added and modified files
        for file_path, file_hash in current_hashes.items():
            if file_path not in self.file_hashes:
                changes['added'].append(file_path)
            elif self.file_hashes[file_path] != file_hash:
                changes['modified'].append(file_path)
        
        # Find deleted files
        for file_path in self.file_hashes:
            if file_path not in current_hashes:
                changes['deleted'].append(file_path)
        
        # Update stored hashes
        self.file_hashes = current_hashes
        
        return changes

    def create_branch(self, branch_name: str) -> bool:
        """Create a new branch from main"""
        try:
            # Get main branch SHA
            response = self.session.get(f'{GITHUB_API_BASE}/repos/{self.username}/{REPO_NAME}/git/refs/heads/main')
            
            if response.status_code != 200:
                self.logger.error(f'Failed to get main branch: {response.status_code}')
                return False
            
            main_sha = response.json()['object']['sha']
            
            # Create new branch
            branch_data = {
                'ref': f'refs/heads/{branch_name}',
                'sha': main_sha
            }
            
            response = self.session.post(f'{GITHUB_API_BASE}/repos/{self.username}/{REPO_NAME}/git/refs', json=branch_data)
            
            if response.status_code == 201:
                self.logger.info(f'Created branch: {branch_name}')
                return True
            else:
                self.logger.error(f'Failed to create branch: {response.status_code} - {response.text}')
                return False
        except Exception as e:
            self.logger.error(f'Error creating branch: {e}')
            return False

    def get_file_sha(self, file_path: str, branch: str = 'main') -> Optional[str]:
        """Get existing file SHA from repository"""
        try:
            api_path = f'{GITHUB_API_BASE}/repos/{self.username}/{REPO_NAME}/contents/{file_path}'
            params = {'ref': branch}
            
            response = self.session.get(api_path, params=params)
            
            if response.status_code == 200:
                return response.json().get('sha')
            else:
                return None
        except Exception as e:
            self.logger.error(f'Error getting file SHA for {file_path}: {e}')
            return None

    def upload_file_to_branch(self, file_path: str, branch_name: str, commit_message: str) -> bool:
        """Upload file to specific branch"""
        try:
            local_file_path = self.bmad_path / file_path
            
            # Read file content and encode to base64
            with open(local_file_path, 'rb') as f:
                import base64
                content = base64.b64encode(f.read()).decode('utf-8')
            
            # Get existing file SHA if it exists
            existing_sha = self.get_file_sha(file_path, branch_name)
            
            api_path = f'{GITHUB_API_BASE}/repos/{self.username}/{REPO_NAME}/contents/{file_path}'
            
            file_data = {
                'message': commit_message,
                'content': content,
                'branch': branch_name
            }
            
            if existing_sha:
                file_data['sha'] = existing_sha
            
            response = self.session.put(api_path, json=file_data)
            
            if response.status_code in [200, 201]:
                self.logger.info(f'Uploaded {file_path} to branch {branch_name}')
                return True
            else:
                self.logger.error(f'Failed to upload {file_path}: {response.status_code} - {response.text}')
                return False
        except Exception as e:
            self.logger.error(f'Error uploading file {file_path}: {e}')
            return False

    def delete_file_from_branch(self, file_path: str, branch_name: str, commit_message: str) -> bool:
        """Delete file from specific branch"""
        try:
            # Get file SHA
            file_sha = self.get_file_sha(file_path, branch_name)
            
            if not file_sha:
                self.logger.warning(f'File {file_path} not found in repository')
                return True  # File already doesn't exist
            
            api_path = f'{GITHUB_API_BASE}/repos/{self.username}/{REPO_NAME}/contents/{file_path}'
            
            delete_data = {
                'message': commit_message,
                'sha': file_sha,
                'branch': branch_name
            }
            
            response = self.session.delete(api_path, json=delete_data)
            
            if response.status_code == 200:
                self.logger.info(f'Deleted {file_path} from branch {branch_name}')
                return True
            else:
                self.logger.error(f'Failed to delete {file_path}: {response.status_code} - {response.text}')
                return False
        except Exception as e:
            self.logger.error(f'Error deleting file {file_path}: {e}')
            return False

    def create_pull_request(self, branch_name: str, title: str, body: str) -> Optional[int]:
        """Create pull request"""
        try:
            pr_data = {
                'title': title,
                'body': body,
                'head': branch_name,
                'base': 'main'
            }
            
            response = self.session.post(f'{GITHUB_API_BASE}/repos/{self.username}/{REPO_NAME}/pulls', json=pr_data)
            
            if response.status_code == 201:
                pr = response.json()
                self.logger.info(f'Created PR #{pr["number"]}: {title}')
                return pr['number']
            else:
                self.logger.error(f'Failed to create PR: {response.status_code} - {response.text}')
                return None
        except Exception as e:
            self.logger.error(f'Error creating PR: {e}')
            return None

    def merge_pull_request(self, pr_number: int) -> bool:
        """Merge pull request"""
        try:
            merge_data = {
                'commit_title': f'Auto-merge PR #{pr_number}',
                'merge_method': 'squash'
            }
            
            response = self.session.put(f'{GITHUB_API_BASE}/repos/{self.username}/{REPO_NAME}/pulls/{pr_number}/merge', json=merge_data)
            
            if response.status_code == 200:
                self.logger.info(f'Merged PR #{pr_number}')
                return True
            else:
                self.logger.error(f'Failed to merge PR #{pr_number}: {response.status_code} - {response.text}')
                return False
        except Exception as e:
            self.logger.error(f'Error merging PR #{pr_number}: {e}')
            return False

    def delete_branch(self, branch_name: str) -> bool:
        """Delete branch after merge"""
        try:
            response = self.session.delete(f'{GITHUB_API_BASE}/repos/{self.username}/{REPO_NAME}/git/refs/heads/{branch_name}')
            
            if response.status_code == 204:
                self.logger.info(f'Deleted branch: {branch_name}')
                return True
            else:
                self.logger.error(f'Failed to delete branch {branch_name}: {response.status_code}')
                return False
        except Exception as e:
            self.logger.error(f'Error deleting branch {branch_name}: {e}')
            return False

    def process_changes(self, changes: Dict[str, List[str]]) -> bool:
        """Process detected changes and sync to repository"""
        if not any(changes.values()):
            return True  # No changes to process

        # Create timestamp-based branch name
        timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M")
        branch_name = f"auto-update-{timestamp}"

        # Create branch
        if not self.create_branch(branch_name):
            return False

        success = True

        try:
            # Process added files
            for file_path in changes['added']:
                commit_msg = f"Add {file_path}"
                if not self.upload_file_to_branch(file_path, branch_name, commit_msg):
                    success = False

            # Process modified files
            for file_path in changes['modified']:
                commit_msg = f"Update {file_path}"
                if not self.upload_file_to_branch(file_path, branch_name, commit_msg):
                    success = False

            # Process deleted files
            for file_path in changes['deleted']:
                commit_msg = f"Delete {file_path}"
                if not self.delete_file_from_branch(file_path, branch_name, commit_msg):
                    success = False

            if success:
                # Create PR
                total_changes = len(changes['added']) + len(changes['modified']) + len(changes['deleted'])
                pr_title = f"Auto-sync: {total_changes} file changes ({timestamp})"

                pr_body = self.generate_pr_body(changes, timestamp)
                pr_number = self.create_pull_request(branch_name, pr_title, pr_body)

                if pr_number:
                    # Auto-merge PR
                    time.sleep(2)  # Brief delay for PR to be ready
                    if self.merge_pull_request(pr_number):
                        # Clean up branch
                        time.sleep(1)
                        self.delete_branch(branch_name)
                        self.logger.info(f'Successfully synced {total_changes} changes')
                        return True

            # If we get here, something failed
            self.logger.error(f'Failed to process changes, branch {branch_name} may need manual cleanup')
            return False

        except Exception as e:
            self.logger.error(f'Error processing changes: {e}')
            return False

    def generate_pr_body(self, changes: Dict[str, List[str]], timestamp: str) -> str:
        """Generate descriptive PR body"""
        body_parts = [
            f"**Automated sync from local BMAD-METHOD directory**",
            f"**Timestamp**: {timestamp}",
            f"",
            f"## Changes Summary"
        ]

        if changes['added']:
            body_parts.append(f"### ➕ Added Files ({len(changes['added'])})")
            for file_path in changes['added'][:10]:  # Limit to first 10
                body_parts.append(f"- `{file_path}`")
            if len(changes['added']) > 10:
                body_parts.append(f"- ... and {len(changes['added']) - 10} more")
            body_parts.append("")

        if changes['modified']:
            body_parts.append(f"### 📝 Modified Files ({len(changes['modified'])})")
            for file_path in changes['modified'][:10]:  # Limit to first 10
                body_parts.append(f"- `{file_path}`")
            if len(changes['modified']) > 10:
                body_parts.append(f"- ... and {len(changes['modified']) - 10} more")
            body_parts.append("")

        if changes['deleted']:
            body_parts.append(f"### ❌ Deleted Files ({len(changes['deleted'])})")
            for file_path in changes['deleted'][:10]:  # Limit to first 10
                body_parts.append(f"- `{file_path}`")
            if len(changes['deleted']) > 10:
                body_parts.append(f"- ... and {len(changes['deleted']) - 10} more")
            body_parts.append("")

        body_parts.extend([
            "---",
            "*This PR was automatically created by the EMAD Auto-Sync monitoring system.*"
        ])

        return "\n".join(body_parts)

    def monitor_cycle(self):
        """Single monitoring cycle"""
        try:
            self.logger.info('Starting monitoring cycle...')

            # Detect changes
            changes = self.detect_changes()

            total_changes = sum(len(files) for files in changes.values())

            if total_changes > 0:
                self.logger.info(f'Detected {total_changes} changes: '
                               f'{len(changes["added"])} added, '
                               f'{len(changes["modified"])} modified, '
                               f'{len(changes["deleted"])} deleted')

                # Process changes
                if self.process_changes(changes):
                    self.logger.info('Changes successfully synced to repository')
                else:
                    self.logger.error('Failed to sync changes')
            else:
                self.logger.info('No changes detected')

        except Exception as e:
            self.logger.error(f'Error in monitoring cycle: {e}')

    def run(self):
        """Main monitoring loop"""
        if not self.authenticate():
            self.logger.error('Failed to authenticate with GitHub')
            return False

        self.logger.info(f'Starting EMAD Auto-Sync monitoring...')
        self.logger.info(f'Monitoring directory: {self.bmad_path}')
        self.logger.info(f'Repository: {self.username}/{REPO_NAME}')
        self.logger.info(f'Monitor interval: {self.monitor_interval} seconds')

        # Initial scan to establish baseline
        self.logger.info('Performing initial directory scan...')
        self.file_hashes = self.scan_directory()
        self.logger.info(f'Baseline established with {len(self.file_hashes)} files')

        self.running = True

        try:
            while self.running:
                self.monitor_cycle()

                # Wait for next cycle
                for _ in range(self.monitor_interval):
                    if not self.running:
                        break
                    time.sleep(1)

        except KeyboardInterrupt:
            self.logger.info('Received keyboard interrupt, shutting down...')
        except Exception as e:
            self.logger.error(f'Unexpected error in main loop: {e}')
        finally:
            self.running = False
            self.logger.info('EMAD Auto-Sync monitoring stopped')

        return True

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='EMAD Auto-Sync Monitoring System')
    parser.add_argument('--bmad-path', type=str, default=str(DEFAULT_BMAD_PATH),
                       help='Path to BMAD-METHOD directory to monitor')
    parser.add_argument('--interval', type=int, default=DEFAULT_MONITOR_INTERVAL,
                       help='Monitoring interval in seconds (default: 3600)')
    parser.add_argument('--daemon', action='store_true',
                       help='Run as daemon (background process)')
    parser.add_argument('--test', action='store_true',
                       help='Run a single test cycle and exit')

    args = parser.parse_args()

    # Validate BMAD path
    bmad_path = Path(args.bmad_path)
    if not bmad_path.exists():
        print(f'Error: BMAD path does not exist: {bmad_path}')
        return 1

    # Create auto-sync instance
    auto_sync = EMADAutoSync(bmad_path, args.interval)

    if args.test:
        # Run single test cycle
        print('Running test cycle...')
        if auto_sync.authenticate():
            auto_sync.file_hashes = auto_sync.scan_directory()
            auto_sync.monitor_cycle()
            print('Test cycle completed')
            return 0
        else:
            print('Authentication failed')
            return 1

    if args.daemon:
        # Run as daemon
        try:
            import daemon
            with daemon.DaemonContext():
                auto_sync.run()
        except ImportError:
            print('python-daemon not available, running in foreground')
            auto_sync.run()
    else:
        # Run in foreground
        auto_sync.run()

    return 0

if __name__ == '__main__':
    sys.exit(main())
