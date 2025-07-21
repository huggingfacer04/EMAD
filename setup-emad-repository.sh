#!/bin/bash

# EMAD Repository Setup Script
# This script helps set up the EMAD repository on GitHub

set -e

echo "🚀 EMAD Repository Setup Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if GitHub CLI is installed (optional)
if command -v gh &> /dev/null; then
    HAS_GH_CLI=true
    print_status "GitHub CLI detected - can create repository automatically"
else
    HAS_GH_CLI=false
    print_warning "GitHub CLI not found - you'll need to create the repository manually"
fi

# Get user input
echo ""
print_status "Please provide the following information:"

read -p "GitHub username: " GITHUB_USERNAME
if [ -z "$GITHUB_USERNAME" ]; then
    print_error "GitHub username is required"
    exit 1
fi

read -p "Repository name (default: EMAD): " REPO_NAME
REPO_NAME=${REPO_NAME:-EMAD}

read -p "Repository description (press Enter for default): " REPO_DESCRIPTION
if [ -z "$REPO_DESCRIPTION" ]; then
    REPO_DESCRIPTION="EMAD - Ecosystem for BMad Method AI Development: Comprehensive VS Code extension with integrated AI agents for holistic software development enhancement"
fi

# Confirm settings
echo ""
print_status "Repository Configuration:"
echo "  Username: $GITHUB_USERNAME"
echo "  Repository: $REPO_NAME"
echo "  Description: $REPO_DESCRIPTION"
echo ""

read -p "Continue with these settings? (y/N): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    print_warning "Setup cancelled by user"
    exit 0
fi

# Create repository using GitHub CLI if available
if [ "$HAS_GH_CLI" = true ]; then
    echo ""
    print_status "Creating GitHub repository using GitHub CLI..."
    
    if gh repo create "$REPO_NAME" --public --description "$REPO_DESCRIPTION" --add-readme --gitignore Node --license MIT; then
        print_success "Repository created successfully on GitHub"
        REPO_CREATED=true
    else
        print_error "Failed to create repository with GitHub CLI"
        REPO_CREATED=false
    fi
else
    print_warning "Please create the repository manually on GitHub:"
    echo "  1. Go to https://github.com/new"
    echo "  2. Repository name: $REPO_NAME"
    echo "  3. Description: $REPO_DESCRIPTION"
    echo "  4. Set as Public"
    echo "  5. Initialize with README"
    echo "  6. Add .gitignore: Node"
    echo "  7. Choose license: MIT"
    echo ""
    read -p "Press Enter after creating the repository on GitHub..."
    REPO_CREATED=true
fi

if [ "$REPO_CREATED" = true ]; then
    # Clone the repository
    echo ""
    print_status "Cloning repository..."
    
    REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    
    if [ -d "$REPO_NAME" ]; then
        print_warning "Directory $REPO_NAME already exists. Removing..."
        rm -rf "$REPO_NAME"
    fi
    
    if git clone "$REPO_URL"; then
        print_success "Repository cloned successfully"
    else
        print_error "Failed to clone repository"
        exit 1
    fi
    
    # Navigate to repository directory
    cd "$REPO_NAME"
    
    # Copy files from BMAD-METHOD
    echo ""
    print_status "Copying BMAD-METHOD files..."
    
    # Find the BMAD-METHOD directory
    BMAD_PATH=""
    if [ -d "../BMAD-METHOD" ]; then
        BMAD_PATH="../BMAD-METHOD"
    elif [ -d "../../BMAD-METHOD" ]; then
        BMAD_PATH="../../BMAD-METHOD"
    elif [ -d "../../../BMAD-METHOD" ]; then
        BMAD_PATH="../../../BMAD-METHOD"
    else
        print_error "Could not find BMAD-METHOD directory"
        print_status "Please specify the path to BMAD-METHOD:"
        read -p "Path: " BMAD_PATH
        if [ ! -d "$BMAD_PATH" ]; then
            print_error "Invalid path: $BMAD_PATH"
            exit 1
        fi
    fi
    
    # Copy all files except .git
    print_status "Copying files from $BMAD_PATH..."
    
    # Copy main directories and files
    cp -r "$BMAD_PATH/src" . 2>/dev/null || true
    cp -r "$BMAD_PATH/bmad-agent" . 2>/dev/null || true
    cp -r "$BMAD_PATH/docs" . 2>/dev/null || true
    cp -r "$BMAD_PATH/images" . 2>/dev/null || true
    
    # Copy configuration files
    cp "$BMAD_PATH/package.json" . 2>/dev/null || true
    cp "$BMAD_PATH/tsconfig.json" . 2>/dev/null || true
    cp "$BMAD_PATH/tsconfig.webpack.json" . 2>/dev/null || true
    cp "$BMAD_PATH/webpack.config.js" . 2>/dev/null || true
    
    # Copy build and setup scripts
    cp "$BMAD_PATH"/*.ps1 . 2>/dev/null || true
    cp "$BMAD_PATH"/*.sh . 2>/dev/null || true
    cp "$BMAD_PATH"/*.js . 2>/dev/null || true
    cp "$BMAD_PATH"/*.bat . 2>/dev/null || true
    
    # Copy EMAD-specific files
    if [ -f "$BMAD_PATH/EMAD_README.md" ]; then
        cp "$BMAD_PATH/EMAD_README.md" README.md
        print_success "Updated README.md with EMAD content"
    fi
    
    if [ -f "$BMAD_PATH/EMAD_GITIGNORE" ]; then
        cp "$BMAD_PATH/EMAD_GITIGNORE" .gitignore
        print_success "Updated .gitignore with EMAD configuration"
    fi
    
    if [ -f "$BMAD_PATH/CONTRIBUTING.md" ]; then
        cp "$BMAD_PATH/CONTRIBUTING.md" .
        print_success "Added CONTRIBUTING.md"
    fi
    
    print_success "Files copied successfully"
    
    # Update package.json with EMAD information
    if [ -f "package.json" ]; then
        print_status "Updating package.json..."
        
        # Use sed to update package.json (basic updates)
        sed -i.bak "s/\"name\": \".*\"/\"name\": \"emad\"/" package.json 2>/dev/null || true
        sed -i.bak "s/\"displayName\": \".*\"/\"displayName\": \"EMAD\"/" package.json 2>/dev/null || true
        sed -i.bak "s/\"description\": \".*\"/\"description\": \"$REPO_DESCRIPTION\"/" package.json 2>/dev/null || true
        
        # Remove backup file
        rm -f package.json.bak
        
        print_success "Updated package.json"
    fi
    
    # Install dependencies
    echo ""
    print_status "Installing dependencies..."
    
    if command -v npm &> /dev/null; then
        if npm install; then
            print_success "Dependencies installed successfully"
        else
            print_warning "Failed to install dependencies - you may need to run 'npm install' manually"
        fi
    else
        print_warning "npm not found - please install Node.js and run 'npm install' manually"
    fi
    
    # Build the project
    echo ""
    print_status "Building project..."
    
    if npm run compile 2>/dev/null; then
        print_success "Project built successfully"
    else
        print_warning "Build failed - you may need to fix any compilation errors"
    fi
    
    # Stage all files for commit
    echo ""
    print_status "Staging files for commit..."
    
    git add .
    
    # Create initial commit
    print_status "Creating initial commit..."
    
    COMMIT_MESSAGE="Initial commit: EMAD ecosystem with complete BMAD agent implementation

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
- Context7 research integration capabilities"
    
    if git commit -m "$COMMIT_MESSAGE"; then
        print_success "Initial commit created"
    else
        print_error "Failed to create initial commit"
        exit 1
    fi
    
    # Push to GitHub
    echo ""
    print_status "Pushing to GitHub..."
    
    if git push origin main; then
        print_success "Code pushed to GitHub successfully"
    else
        print_error "Failed to push to GitHub"
        exit 1
    fi
    
    # Final success message
    echo ""
    print_success "🎉 EMAD repository setup completed successfully!"
    echo ""
    echo "Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "Next steps:"
    echo "1. Visit your repository on GitHub"
    echo "2. Review the README.md and update as needed"
    echo "3. Set up branch protection rules"
    echo "4. Configure GitHub Actions (optional)"
    echo "5. Invite collaborators (if needed)"
    echo ""
    print_status "Happy coding! 🚀"
    
else
    print_error "Repository setup failed"
    exit 1
fi
