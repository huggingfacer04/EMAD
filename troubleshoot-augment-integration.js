#!/usr/bin/env node

/**
 * BMAD-Augment Integration Troubleshooting Script
 * This script helps diagnose why BMAD integration isn't appearing in Augment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
    console.log('');
    colorLog('='.repeat(60), 'magenta');
    colorLog(`  ${title}`, 'magenta');
    colorLog('='.repeat(60), 'magenta');
    console.log('');
}

function logSuccess(message) {
    colorLog(`✅ ${message}`, 'green');
}

function logWarning(message) {
    colorLog(`⚠️ ${message}`, 'yellow');
}

function logError(message) {
    colorLog(`❌ ${message}`, 'red');
}

function logInfo(message) {
    colorLog(`ℹ️ ${message}`, 'cyan');
}

function execCommand(command) {
    try {
        const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        return { success: true, output: result.trim() };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function checkVSCodeExtensions() {
    logHeader('Checking VS Code Extensions');
    
    // Check if VS Code CLI is available
    const codeCheck = execCommand('code --version');
    if (!codeCheck.success) {
        logError('VS Code CLI not available. Cannot check installed extensions.');
        logInfo('To enable VS Code CLI:');
        logInfo('1. Open VS Code');
        logInfo('2. Press Ctrl+Shift+P');
        logInfo('3. Type "Shell Command: Install code command in PATH"');
        logInfo('4. Select and run the command');
        return false;
    }
    
    logSuccess(`VS Code CLI available: ${codeCheck.output.split('\n')[0]}`);
    
    // Check for BMAD extension
    const bmadCheck = execCommand('code --list-extensions | findstr bmad');
    if (bmadCheck.success && bmadCheck.output) {
        logSuccess(`BMAD extension found: ${bmadCheck.output}`);
    } else {
        logWarning('BMAD extension not found in installed extensions');
        logInfo('The extension may be running in development mode');
    }
    
    // Check for Augment extensions
    const augmentPatterns = ['augment', 'ai-code', 'code-ai'];
    let augmentFound = false;
    
    for (const pattern of augmentPatterns) {
        const augmentCheck = execCommand(`code --list-extensions | findstr -i ${pattern}`);
        if (augmentCheck.success && augmentCheck.output) {
            logSuccess(`Augment-related extension found: ${augmentCheck.output}`);
            augmentFound = true;
        }
    }
    
    if (!augmentFound) {
        logError('No Augment extension found!');
        logInfo('Please install the Augment AI Code extension:');
        logInfo('1. Open VS Code Extensions (Ctrl+Shift+X)');
        logInfo('2. Search for "Augment"');
        logInfo('3. Install the official Augment AI Code extension');
        return false;
    }
    
    return true;
}

function checkBMADFiles() {
    logHeader('Checking BMAD Integration Files');
    
    const requiredFiles = [
        'src/integration/AugmentIntegration.ts',
        'src/integration/AugmentMenuIntegration.ts',
        'src/integration/AugmentAPI.ts',
        'out/integration/AugmentIntegration.js',
        'out/integration/AugmentMenuIntegration.js',
        'out/integration/AugmentAPI.js'
    ];
    
    let allFilesExist = true;
    
    for (const file of requiredFiles) {
        if (fs.existsSync(file)) {
            logSuccess(`Found: ${file}`);
        } else {
            logError(`Missing: ${file}`);
            allFilesExist = false;
        }
    }
    
    if (!allFilesExist) {
        logWarning('Some integration files are missing. Run the build script:');
        logInfo('node build-integration.js');
        return false;
    }
    
    return true;
}

function checkPackageJson() {
    logHeader('Checking package.json Configuration');
    
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Check main entry point
        if (packageJson.main === './out/extension.js') {
            logSuccess('Main entry point correctly set to ./out/extension.js');
        } else {
            logWarning(`Main entry point: ${packageJson.main} (should be ./out/extension.js)`);
        }
        
        // Check activation events
        if (packageJson.activationEvents && packageJson.activationEvents.length > 0) {
            logSuccess(`Activation events configured: ${packageJson.activationEvents.length} events`);
        } else {
            logWarning('No activation events configured');
        }
        
        // Check BMAD commands
        const bmadCommands = packageJson.contributes?.commands?.filter(cmd => 
            cmd.command.startsWith('bmad.')
        ) || [];
        
        if (bmadCommands.length > 0) {
            logSuccess(`BMAD commands registered: ${bmadCommands.length} commands`);
        } else {
            logError('No BMAD commands found in package.json');
            return false;
        }
        
        // Check for integration-specific commands
        const integrationCommands = bmadCommands.filter(cmd => 
            cmd.command.includes('debug') || 
            cmd.command.includes('document') || 
            cmd.command.includes('analyze')
        );
        
        if (integrationCommands.length > 0) {
            logSuccess(`Integration commands found: ${integrationCommands.length} commands`);
        } else {
            logWarning('No integration-specific commands found');
        }
        
        return true;
        
    } catch (error) {
        logError(`Failed to parse package.json: ${error.message}`);
        return false;
    }
}

function checkExtensionOutput() {
    logHeader('Checking Extension Output');
    
    if (fs.existsSync('out/extension.js')) {
        logSuccess('Extension compiled successfully: out/extension.js');
        
        // Check if integration imports are present
        try {
            const extensionContent = fs.readFileSync('out/extension.js', 'utf8');
            
            if (extensionContent.includes('AugmentIntegration')) {
                logSuccess('AugmentIntegration import found in compiled extension');
            } else {
                logWarning('AugmentIntegration import not found in compiled extension');
            }
            
            if (extensionContent.includes('AugmentMenuIntegration')) {
                logSuccess('AugmentMenuIntegration import found in compiled extension');
            } else {
                logWarning('AugmentMenuIntegration import not found in compiled extension');
            }
            
        } catch (error) {
            logWarning(`Could not read extension.js: ${error.message}`);
        }
        
    } else {
        logError('Extension not compiled: out/extension.js missing');
        logInfo('Run: npm run compile');
        return false;
    }
    
    return true;
}

function provideSolutions() {
    logHeader('Troubleshooting Solutions');
    
    logInfo('If BMAD integration is not appearing in Augment, try these steps:');
    console.log('');
    
    colorLog('1. 🔄 Reload VS Code Window', 'yellow');
    logInfo('   Press Ctrl+R or Ctrl+Shift+P → "Developer: Reload Window"');
    console.log('');
    
    colorLog('2. 🔧 Rebuild the Extension', 'yellow');
    logInfo('   Run: node build-integration.js --clean');
    console.log('');
    
    colorLog('3. 📦 Install Extension Manually', 'yellow');
    logInfo('   1. Press Ctrl+Shift+P');
    logInfo('   2. Type "Extensions: Install from VSIX"');
    logInfo('   3. Select the .vsix file (if available)');
    console.log('');
    
    colorLog('4. 🔍 Check Developer Console', 'yellow');
    logInfo('   1. Press F12 or Help → Toggle Developer Tools');
    logInfo('   2. Look for BMAD-related errors in Console');
    logInfo('   3. Check for "BMAD AI Agent Orchestrator activated successfully"');
    console.log('');
    
    colorLog('5. 🎯 Test BMAD Commands Directly', 'yellow');
    logInfo('   1. Press Ctrl+Shift+P');
    logInfo('   2. Search for "BMAD"');
    logInfo('   3. Try "BMAD: Show Help" command');
    console.log('');
    
    colorLog('6. 🔗 Verify Augment Extension', 'yellow');
    logInfo('   1. Make sure Augment AI Code extension is installed and enabled');
    logInfo('   2. Check if Augment is working with other features');
    logInfo('   3. Try restarting VS Code after installing both extensions');
    console.log('');
    
    colorLog('7. 📋 Check Extension Host Log', 'yellow');
    logInfo('   1. Press Ctrl+Shift+P');
    logInfo('   2. Type "Developer: Show Logs"');
    logInfo('   3. Select "Extension Host"');
    logInfo('   4. Look for BMAD initialization messages');
}

function generateDiagnosticReport() {
    logHeader('Generating Diagnostic Report');
    
    const report = {
        timestamp: new Date().toISOString(),
        vsCodeVersion: null,
        extensions: [],
        bmadFiles: {},
        packageJson: {},
        recommendations: []
    };
    
    // Get VS Code version
    const vscodeCheck = execCommand('code --version');
    if (vscodeCheck.success) {
        report.vsCodeVersion = vscodeCheck.output.split('\n')[0];
    }
    
    // Get extensions
    const extCheck = execCommand('code --list-extensions');
    if (extCheck.success) {
        report.extensions = extCheck.output.split('\n').filter(ext => ext.trim());
    }
    
    // Check BMAD files
    const bmadFiles = [
        'src/integration/AugmentIntegration.ts',
        'out/integration/AugmentIntegration.js',
        'package.json'
    ];
    
    for (const file of bmadFiles) {
        report.bmadFiles[file] = fs.existsSync(file);
    }
    
    // Save report
    const reportPath = 'bmad-diagnostic-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    logSuccess(`Diagnostic report saved: ${reportPath}`);
    
    return report;
}

function main() {
    logHeader('BMAD-Augment Integration Troubleshooter');
    logInfo('🔍 Diagnosing why BMAD integration is not appearing in Augment...');
    
    let allChecksPass = true;
    
    // Run all checks
    allChecksPass &= checkVSCodeExtensions();
    allChecksPass &= checkBMADFiles();
    allChecksPass &= checkPackageJson();
    allChecksPass &= checkExtensionOutput();
    
    // Generate diagnostic report
    generateDiagnosticReport();
    
    // Provide solutions
    provideSolutions();
    
    if (allChecksPass) {
        logSuccess('All checks passed! The integration should be working.');
        logInfo('If you still can\'t see BMAD in Augment, try the solutions above.');
    } else {
        logWarning('Some issues were found. Please address them and try again.');
    }
    
    console.log('');
    logInfo('For additional help, check the diagnostic report: bmad-diagnostic-report.json');
}

// Run the troubleshooter
main();
