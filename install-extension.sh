#!/bin/bash

# BMAD Extension Installation Script (Linux/macOS)
# Installs the BMAD AI Agent Orchestrator extension with Dakota agent

echo "🚀 BMAD Extension Installation Script"
echo "====================================="
echo ""

# Get the current directory
EXTENSION_PATH=$(pwd)
echo "📁 Extension path: $EXTENSION_PATH"

# Step 1: Compile the extension
echo "🔨 Step 1: Compiling TypeScript..."
if npm run compile; then
    echo "✅ Compilation successful"
else
    echo "❌ Compilation failed"
    exit 1
fi

# Step 2: Check if VS Code is installed
echo "🔍 Step 2: Checking VS Code installation..."
if command -v code &> /dev/null; then
    echo "✅ VS Code found: $(which code)"
else
    echo "❌ VS Code 'code' command not found in PATH"
    echo "Please install VS Code and ensure 'code' command is available"
    exit 1
fi

# Step 3: Install the extension
echo "📦 Step 3: Installing BMAD extension..."
if code --install-extension "$EXTENSION_PATH" --force; then
    echo "✅ Extension installation command executed"
else
    echo "❌ Extension installation failed"
    
    # Try alternative method
    echo "🔄 Trying alternative installation method..."
    
    # Check if vsce is installed
    if ! command -v vsce &> /dev/null; then
        echo "Installing vsce..."
        npm install -g vsce
    fi
    
    # Package the extension
    echo "Packaging extension..."
    if vsce package --out bmad-extension.vsix; then
        # Install the packaged extension
        echo "Installing packaged extension..."
        if code --install-extension bmad-extension.vsix --force; then
            echo "✅ Alternative installation successful"
        else
            echo "❌ Alternative installation also failed"
        fi
    else
        echo "❌ Failed to package extension"
    fi
fi

# Step 4: Verify installation
echo "🔍 Step 4: Verifying installation..."
echo "Please follow these steps to verify:"
echo "1. Restart VS Code completely"
echo "2. Open Command Palette (Ctrl+Shift+P or Cmd+Shift+P)"
echo "3. Search for 'Dakota' - you should see Dakota commands"
echo "4. Try: 'Dakota: Dependency Audit'"

# Step 5: Augment integration check
echo ""
echo "🟣 Step 5: Augment Integration Check..."
echo "For purple BMAD buttons in Augment:"
echo "1. Ensure Augment Code extension is installed"
echo "2. Look for BMAD workflows in Augment interface"
echo "3. Check for purple-themed Dakota options"

# Step 6: Troubleshooting
echo ""
echo "🔧 Troubleshooting:"
echo "If commands don't appear:"
echo "• Check Extensions panel for 'BMAD AI Agent Orchestrator'"
echo "• Enable the extension if disabled"
echo "• Check Developer Console (Help > Toggle Developer Tools)"
echo "• Try 'Developer: Reload Window' command"

echo ""
echo "🎉 Installation script complete!"
echo "Dakota agent should now be available in VS Code"

# Optional: Open VS Code
read -p "Would you like to open VS Code now? (y/n): " open_vscode
if [[ $open_vscode == "y" || $open_vscode == "Y" ]]; then
    echo "🚀 Opening VS Code..."
    code .
fi
