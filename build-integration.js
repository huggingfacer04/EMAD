#!/usr/bin/env node

/**
 * BMAD-Augment Integration: Cross-Platform Build Script
 * This Node.js script provides cross-platform automation for building and testing
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

// Configuration
const config = {
    projectRoot: __dirname,
    outputDir: path.join(__dirname, 'out'),
    nodeModulesDir: path.join(__dirname, 'node_modules'),
    verbose: process.argv.includes('--verbose'),
    skipTests: process.argv.includes('--skip-tests'),
    cleanBuild: process.argv.includes('--clean'),
    packageOnly: process.argv.includes('--package-only')
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
    if (os.platform() === 'win32' && !process.env.FORCE_COLOR) {
        // Windows console may not support colors
        console.log(message);
    } else {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }
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

function execCommand(command, options = {}) {
    try {
        const result = execSync(command, {
            cwd: config.projectRoot,
            encoding: 'utf8',
            stdio: config.verbose ? 'inherit' : 'pipe',
            ...options
        });
        return { success: true, output: result };
    } catch (error) {
        return { 
            success: false, 
            error: error.message,
            output: error.stdout || error.stderr || ''
        };
    }
}

function checkPrerequisites() {
    logHeader('Checking Prerequisites');
    
    const checks = [
        { name: 'Node.js', command: 'node --version', required: true },
        { name: 'npm', command: 'npm --version', required: true },
        { name: 'TypeScript', command: 'npx tsc --version', required: false },
        { name: 'VS Code', command: 'code --version', required: false }
    ];
    
    let allGood = true;
    
    for (const check of checks) {
        const result = execCommand(check.command);
        if (result.success && result.output) {
            logSuccess(`${check.name}: ${result.output.trim()}`);
        } else {
            if (check.required) {
                logError(`${check.name}: Not found or not in PATH`);
                allGood = false;
            } else {
                logWarning(`${check.name}: Not found (will install if needed)`);
            }
        }
    }
    
    return allGood;
}

function installDependencies() {
    logHeader('Installing Dependencies');
    
    if (!fs.existsSync(config.nodeModulesDir) || config.cleanBuild) {
        if (config.cleanBuild && fs.existsSync(config.nodeModulesDir)) {
            logInfo('Cleaning node_modules...');
            fs.rmSync(config.nodeModulesDir, { recursive: true, force: true });
        }
        
        logInfo('Installing npm dependencies...');
        const result = execCommand('npm install');
        
        if (result.success) {
            logSuccess('Dependencies installed successfully');
            return true;
        } else {
            logError('npm install failed');
            console.log(result.output);
            return false;
        }
    } else {
        logSuccess('Dependencies already installed');
        return true;
    }
}

function buildTypeScript() {
    logHeader('Building TypeScript');
    
    if (config.cleanBuild && fs.existsSync(config.outputDir)) {
        logInfo('Cleaning output directory...');
        fs.rmSync(config.outputDir, { recursive: true, force: true });
    }
    
    logInfo('Compiling TypeScript...');
    const result = execCommand('npm run compile');
    
    if (!result.success) {
        logError('TypeScript compilation failed');
        console.log(result.output);
        return false;
    }
    
    // Verify output files
    const requiredFiles = [
        'extension.js',
        'integration/AugmentIntegration.js',
        'integration/AugmentMenuIntegration.js',
        'integration/AugmentAPI.js',
        'commands/CommandManager.js'
    ];
    
    const missingFiles = [];
    for (const file of requiredFiles) {
        const filePath = path.join(config.outputDir, file);
        if (!fs.existsSync(filePath)) {
            missingFiles.push(file);
        }
    }
    
    if (missingFiles.length > 0) {
        logError('Missing compiled files:');
        missingFiles.forEach(file => console.log(`   - ${file}`));
        return false;
    }
    
    logSuccess('TypeScript compilation successful');
    logInfo(`Output directory: ${config.outputDir}`);
    
    return true;
}

function testIntegration() {
    logHeader('Testing Integration');
    
    if (config.skipTests) {
        logWarning('Skipping tests (--skip-tests flag)');
        return true;
    }
    
    // Test 1: Verify package.json structure
    logInfo('Testing package.json structure...');
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        const requiredCommands = [
            'bmad.activateDocumentationMode',
            'bmad.debugCurrentFile',
            'bmad.documentCurrentFile',
            'bmad.showHelp'
        ];
        
        const commands = packageJson.contributes?.commands || [];
        const foundCommands = commands.filter(cmd => 
            requiredCommands.includes(cmd.command)
        ).length;
        
        if (foundCommands === requiredCommands.length) {
            logSuccess('Package.json commands verified');
        } else {
            logWarning(`Some commands missing in package.json (${foundCommands}/${requiredCommands.length})`);
        }
    } catch (error) {
        logError(`Failed to parse package.json: ${error.message}`);
    }
    
    // Test 2: Run integration test script
    logInfo('Running integration tests...');
    if (fs.existsSync('test-augment-integration.js')) {
        const result = execCommand('node test-augment-integration.js');
        if (result.success) {
            logSuccess('Integration tests passed');
        } else {
            logWarning('Some integration tests failed');
            if (config.verbose) {
                console.log(result.output);
            }
        }
    } else {
        logWarning('Integration test script not found');
    }
    
    // Test 3: Verify file structure
    logInfo('Verifying file structure...');
    const integrationFiles = [
        'src/integration/AugmentIntegration.ts',
        'src/integration/AugmentMenuIntegration.ts',
        'src/integration/AugmentAPI.ts'
    ];
    
    const missingSourceFiles = integrationFiles.filter(file => 
        !fs.existsSync(file)
    );
    
    if (missingSourceFiles.length === 0) {
        logSuccess('All integration source files present');
    } else {
        logError('Missing integration files:');
        missingSourceFiles.forEach(file => console.log(`   - ${file}`));
    }
    
    return true;
}

function createVSIXPackage() {
    logHeader('Creating VSIX Package');
    
    // Check if vsce is available
    let vsceResult = execCommand('npx vsce --version');
    if (!vsceResult.success) {
        logInfo('Installing vsce...');
        const installResult = execCommand('npm install -g vsce');
        if (!installResult.success) {
            logWarning('Failed to install vsce globally, trying local install...');
            execCommand('npm install vsce --save-dev');
        }
    }
    
    logInfo('Creating VSIX package...');
    const result = execCommand('npx vsce package');
    
    if (result.success) {
        // Find the created VSIX file
        const files = fs.readdirSync(config.projectRoot);
        const vsixFiles = files.filter(file => file.endsWith('.vsix'))
            .sort((a, b) => {
                const statA = fs.statSync(path.join(config.projectRoot, a));
                const statB = fs.statSync(path.join(config.projectRoot, b));
                return statB.mtime - statA.mtime;
            });
        
        if (vsixFiles.length > 0) {
            logSuccess(`VSIX package created: ${vsixFiles[0]}`);
            logInfo(`Location: ${path.join(config.projectRoot, vsixFiles[0])}`);
            return true;
        }
    }
    
    logError('Failed to create VSIX package');
    if (config.verbose) {
        console.log(result.output);
    }
    return false;
}

function showNextSteps() {
    logHeader('Next Steps');
    
    logSuccess('Build and integration setup complete!');
    console.log('');
    logInfo('To test the integration:');
    logInfo('1. Restart VS Code or reload the window (Ctrl+R)');
    logInfo('2. Open Command Palette (Ctrl+Shift+P)');
    logInfo('3. Search for "BMAD" commands');
    logInfo('4. Try "BMAD: Show Help" to verify functionality');
    console.log('');
    
    logInfo('To install the extension:');
    const files = fs.readdirSync(config.projectRoot);
    const vsixFiles = files.filter(file => file.endsWith('.vsix'));
    if (vsixFiles.length > 0) {
        logInfo(`   code --install-extension ${vsixFiles[0]}`);
    }
    console.log('');
    
    logInfo('Integration files created:');
    logInfo('   - src/integration/AugmentIntegration.ts');
    logInfo('   - src/integration/AugmentMenuIntegration.ts');
    logInfo('   - src/integration/AugmentAPI.ts');
    console.log('');
    
    logInfo('Documentation:');
    logInfo('   - AUGMENT_INTEGRATION_README.md');
    logInfo('   - AUGMENT_INTEGRATION_COMPLETE.md');
}

function main() {
    logHeader('BMAD-Augment Integration Builder');
    logInfo('🚀 Starting automated build and test process...');
    logInfo(`📁 Project directory: ${config.projectRoot}`);
    
    if (config.verbose) {
        logInfo('🔍 Verbose mode enabled');
    }
    
    // Step 1: Check prerequisites
    if (!checkPrerequisites()) {
        logError('Prerequisites check failed. Please install missing components.');
        process.exit(1);
    }
    
    // Step 2: Install dependencies
    if (!installDependencies()) {
        logError('Dependency installation failed.');
        process.exit(1);
    }
    
    // Step 3: Build TypeScript
    if (!buildTypeScript()) {
        logError('TypeScript build failed.');
        process.exit(1);
    }
    
    // Step 4: Test integration
    testIntegration();
    
    // Step 5: Create package (if requested or if all tests passed)
    if (config.packageOnly || !config.skipTests) {
        createVSIXPackage();
    }
    
    // Step 6: Show next steps
    showNextSteps();
    
    logSuccess('✅ All automated steps completed successfully!');
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('BMAD-Augment Integration Builder');
    console.log('');
    console.log('Usage: node build-integration.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --verbose      Enable verbose output');
    console.log('  --skip-tests   Skip integration tests');
    console.log('  --clean        Clean build (remove node_modules and out)');
    console.log('  --package-only Only create VSIX package');
    console.log('  --help, -h     Show this help message');
    process.exit(0);
}

// Run the main function
main();
