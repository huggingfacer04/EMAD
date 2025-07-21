# EMAD Repository Setup Script (PowerShell)
# This script helps set up the EMAD repository on GitHub

param(
    [string]$GitHubUsername,
    [string]$RepositoryName = "EMAD",
    [string]$RepositoryDescription = "EMAD - Ecosystem for BMad Method AI Development: Comprehensive VS Code extension with integrated AI agents for holistic software development enhancement"
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

# Main script
Write-Host "🚀 EMAD Repository Setup Script" -ForegroundColor $Colors.Blue
Write-Host "================================" -ForegroundColor $Colors.Blue
Write-Host ""

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Status "Git found: $gitVersion"
} catch {
    Write-Error "Git is not installed. Please install Git first."
    exit 1
}

# Check if GitHub CLI is installed
$hasGhCli = $false
try {
    $ghVersion = gh --version
    $hasGhCli = $true
    Write-Status "GitHub CLI detected - can create repository automatically"
} catch {
    Write-Warning "GitHub CLI not found - you'll need to create the repository manually"
}

# Get user input if not provided as parameters
if (-not $GitHubUsername) {
    $GitHubUsername = Read-Host "GitHub username"
    if (-not $GitHubUsername) {
        Write-Error "GitHub username is required"
        exit 1
    }
}

if (-not $RepositoryName) {
    $inputRepoName = Read-Host "Repository name (default: EMAD)"
    if ($inputRepoName) {
        $RepositoryName = $inputRepoName
    }
}

if (-not $RepositoryDescription) {
    $inputDescription = Read-Host "Repository description (press Enter for default)"
    if ($inputDescription) {
        $RepositoryDescription = $inputDescription
    }
}

# Confirm settings
Write-Host ""
Write-Status "Repository Configuration:"
Write-Host "  Username: $GitHubUsername"
Write-Host "  Repository: $RepositoryName"
Write-Host "  Description: $RepositoryDescription"
Write-Host ""

$confirm = Read-Host "Continue with these settings? (y/N)"
if ($confirm -notmatch "^[Yy]$") {
    Write-Warning "Setup cancelled by user"
    exit 0
}

# Create repository using GitHub CLI if available
$repoCreated = $false
if ($hasGhCli) {
    Write-Host ""
    Write-Status "Creating GitHub repository using GitHub CLI..."
    
    try {
        gh repo create $RepositoryName --public --description $RepositoryDescription --add-readme --gitignore Node --license MIT
        Write-Success "Repository created successfully on GitHub"
        $repoCreated = $true
    } catch {
        Write-Error "Failed to create repository with GitHub CLI: $_"
        $repoCreated = $false
    }
} else {
    Write-Warning "Please create the repository manually on GitHub:"
    Write-Host "  1. Go to https://github.com/new"
    Write-Host "  2. Repository name: $RepositoryName"
    Write-Host "  3. Description: $RepositoryDescription"
    Write-Host "  4. Set as Public"
    Write-Host "  5. Initialize with README"
    Write-Host "  6. Add .gitignore: Node"
    Write-Host "  7. Choose license: MIT"
    Write-Host ""
    Read-Host "Press Enter after creating the repository on GitHub"
    $repoCreated = $true
}

if ($repoCreated) {
    # Clone the repository
    Write-Host ""
    Write-Status "Cloning repository..."
    
    $repoUrl = "https://github.com/$GitHubUsername/$RepositoryName.git"
    
    if (Test-Path $RepositoryName) {
        Write-Warning "Directory $RepositoryName already exists. Removing..."
        Remove-Item -Path $RepositoryName -Recurse -Force
    }
    
    try {
        git clone $repoUrl
        Write-Success "Repository cloned successfully"
    } catch {
        Write-Error "Failed to clone repository: $_"
        exit 1
    }
    
    # Navigate to repository directory
    Set-Location $RepositoryName
    
    # Copy files from BMAD-METHOD
    Write-Host ""
    Write-Status "Copying BMAD-METHOD files..."
    
    # Find the BMAD-METHOD directory
    $bmadPath = $null
    $possiblePaths = @("../BMAD-METHOD", "../../BMAD-METHOD", "../../../BMAD-METHOD")
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $bmadPath = $path
            break
        }
    }
    
    if (-not $bmadPath) {
        Write-Error "Could not find BMAD-METHOD directory"
        $bmadPath = Read-Host "Please specify the path to BMAD-METHOD"
        if (-not (Test-Path $bmadPath)) {
            Write-Error "Invalid path: $bmadPath"
            exit 1
        }
    }
    
    # Copy all files except .git
    Write-Status "Copying files from $bmadPath..."
    
    try {
        # Copy main directories
        $directoriesToCopy = @("src", "bmad-agent", "docs", "images")
        foreach ($dir in $directoriesToCopy) {
            $sourcePath = Join-Path $bmadPath $dir
            if (Test-Path $sourcePath) {
                Copy-Item -Path $sourcePath -Destination . -Recurse -Force
                Write-Status "Copied $dir directory"
            }
        }
        
        # Copy configuration files
        $filesToCopy = @("package.json", "tsconfig.json", "tsconfig.webpack.json", "webpack.config.js")
        foreach ($file in $filesToCopy) {
            $sourcePath = Join-Path $bmadPath $file
            if (Test-Path $sourcePath) {
                Copy-Item -Path $sourcePath -Destination . -Force
                Write-Status "Copied $file"
            }
        }
        
        # Copy script files
        $scriptExtensions = @("*.ps1", "*.sh", "*.js", "*.bat")
        foreach ($ext in $scriptExtensions) {
            $scriptFiles = Get-ChildItem -Path $bmadPath -Filter $ext -File
            foreach ($script in $scriptFiles) {
                Copy-Item -Path $script.FullName -Destination . -Force
            }
        }
        
        # Copy EMAD-specific files
        $emadReadme = Join-Path $bmadPath "EMAD_README.md"
        if (Test-Path $emadReadme) {
            Copy-Item -Path $emadReadme -Destination "README.md" -Force
            Write-Success "Updated README.md with EMAD content"
        }
        
        $emadGitignore = Join-Path $bmadPath "EMAD_GITIGNORE"
        if (Test-Path $emadGitignore) {
            Copy-Item -Path $emadGitignore -Destination ".gitignore" -Force
            Write-Success "Updated .gitignore with EMAD configuration"
        }
        
        $contributingFile = Join-Path $bmadPath "CONTRIBUTING.md"
        if (Test-Path $contributingFile) {
            Copy-Item -Path $contributingFile -Destination . -Force
            Write-Success "Added CONTRIBUTING.md"
        }
        
        Write-Success "Files copied successfully"
        
    } catch {
        Write-Error "Failed to copy files: $_"
        exit 1
    }
    
    # Update package.json with EMAD information
    if (Test-Path "package.json") {
        Write-Status "Updating package.json..."
        
        try {
            $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
            $packageJson.name = "emad"
            $packageJson.displayName = "EMAD"
            $packageJson.description = $RepositoryDescription
            
            $packageJson | ConvertTo-Json -Depth 100 | Set-Content "package.json"
            Write-Success "Updated package.json"
        } catch {
            Write-Warning "Failed to update package.json: $_"
        }
    }
    
    # Install dependencies
    Write-Host ""
    Write-Status "Installing dependencies..."
    
    try {
        npm install
        Write-Success "Dependencies installed successfully"
    } catch {
        Write-Warning "Failed to install dependencies - you may need to run 'npm install' manually"
    }
    
    # Build the project
    Write-Host ""
    Write-Status "Building project..."
    
    try {
        npm run compile
        Write-Success "Project built successfully"
    } catch {
        Write-Warning "Build failed - you may need to fix any compilation errors"
    }
    
    # Stage all files for commit
    Write-Host ""
    Write-Status "Staging files for commit..."
    
    git add .
    
    # Create initial commit
    Write-Status "Creating initial commit..."
    
    $commitMessage = @"
Initial commit: EMAD ecosystem with complete BMAD agent implementation

- Complete VS Code extension with 12+ AI agents
- Synergy: Integrated Development & AI Enhancement Specialist
- Dakota: Dependency Modernization Specialist  
- Phoenix: Performance Optimization Specialist
- Chronos: Temporal Coordination Specialist
- Sentinel: Task Completion & Quality Assurance Specialist
- Agent Creator: AI Agent Generation Specialist
- Web Agent Creator: Web-based AI Interface Specialist
- DocQA: Document Analysis & Q&A Specialist
- Chunky: Task Execution & Resource Orchestration Specialist
- Meta-Orchestrator: Strategic Coordination Specialist
- Complete documentation, templates, and workflows
- Augment Code integration with purple theme workflows
- Context7 research integration capabilities
"@
    
    try {
        git commit -m $commitMessage
        Write-Success "Initial commit created"
    } catch {
        Write-Error "Failed to create initial commit: $_"
        exit 1
    }
    
    # Push to GitHub
    Write-Host ""
    Write-Status "Pushing to GitHub..."
    
    try {
        git push origin main
        Write-Success "Code pushed to GitHub successfully"
    } catch {
        Write-Error "Failed to push to GitHub: $_"
        exit 1
    }
    
    # Final success message
    Write-Host ""
    Write-Success "🎉 EMAD repository setup completed successfully!"
    Write-Host ""
    Write-Host "Repository URL: https://github.com/$GitHubUsername/$RepositoryName" -ForegroundColor $Colors.Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Visit your repository on GitHub"
    Write-Host "2. Review the README.md and update as needed"
    Write-Host "3. Set up branch protection rules"
    Write-Host "4. Configure GitHub Actions (optional)"
    Write-Host "5. Invite collaborators (if needed)"
    Write-Host ""
    Write-Status "Happy coding! 🚀"
    
} else {
    Write-Error "Repository setup failed"
    exit 1
}
