#!/usr/bin/env node

/**
 * Extension Testing and Troubleshooting Script
 * Tests BMAD extension installation, compilation, and command registration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 BMAD Extension Troubleshooting Script');
console.log('=========================================\n');

// Test 1: Check if package.json exists and is valid
console.log('1. 📋 Checking package.json...');
try {
    const packagePath = path.join(__dirname, 'package.json');
    if (!fs.existsSync(packagePath)) {
        console.error('❌ package.json not found!');
        process.exit(1);
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log(`✅ Package: ${packageJson.name} v${packageJson.version}`);
    console.log(`✅ Main entry: ${packageJson.main}`);
    console.log(`✅ Activation events: ${packageJson.activationEvents?.length || 0} events`);
    
    // Check Dakota commands
    const dakotaCommands = packageJson.contributes.commands.filter(cmd => 
        cmd.title.includes('Dakota') || cmd.command.includes('dependency')
    );
    console.log(`✅ Dakota commands registered: ${dakotaCommands.length}`);
    dakotaCommands.forEach(cmd => {
        console.log(`   - ${cmd.command}: ${cmd.title}`);
    });
    
} catch (error) {
    console.error('❌ Error reading package.json:', error.message);
    process.exit(1);
}

// Test 2: Check if TypeScript compilation is successful
console.log('\n2. 🔨 Checking TypeScript compilation...');
try {
    execSync('npm run compile', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
} catch (error) {
    console.error('❌ TypeScript compilation failed:');
    console.error(error.stdout?.toString() || error.message);
}

// Test 3: Check if compiled output exists
console.log('\n3. 📁 Checking compiled output...');
const outPath = path.join(__dirname, 'out');
const extensionJsPath = path.join(outPath, 'extension.js');

if (!fs.existsSync(outPath)) {
    console.error('❌ Output directory "out" does not exist');
} else if (!fs.existsSync(extensionJsPath)) {
    console.error('❌ Main extension file "out/extension.js" does not exist');
} else {
    console.log('✅ Compiled extension.js exists');
    
    // Check file size
    const stats = fs.statSync(extensionJsPath);
    console.log(`✅ Extension size: ${Math.round(stats.size / 1024)}KB`);
}

// Test 4: Check if Dakota-related files exist
console.log('\n4. 🤖 Checking Dakota implementation files...');
const dakotaFiles = [
    'src/agents/DakotaAgent.ts',
    'src/integration/Context7Integration.ts',
    'src/monitoring/DependencyMonitor.ts',
    'BMAD-METHOD/bmad-agent/personas/dakota.md',
    'BMAD-METHOD/bmad-agent/tasks/dependency-audit.md',
    'BMAD-METHOD/bmad-agent/checklists/dependency-safety.md'
];

dakotaFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
    }
});

// Test 5: Check VS Code extension installation
console.log('\n5. 🔧 VS Code Extension Installation Check...');
console.log('To manually install the extension:');
console.log('1. Open VS Code');
console.log('2. Press F1 or Ctrl+Shift+P');
console.log('3. Type "Developer: Install Extension from Location"');
console.log(`4. Select this folder: ${__dirname}`);
console.log('5. Restart VS Code');

// Test 6: Generate installation commands
console.log('\n6. 📦 Extension Installation Commands...');
console.log('Run these commands to install the extension:');
console.log('');
console.log('# Method 1: Install from folder');
console.log('code --install-extension ' + __dirname);
console.log('');
console.log('# Method 2: Package and install');
console.log('npm install -g vsce');
console.log('vsce package');
console.log('code --install-extension bmad-vscode-extension-1.0.0.vsix');

// Test 7: Check for common issues
console.log('\n7. 🔍 Common Issues Check...');

// Check Node.js version
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js version: ${nodeVersion}`);
    
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    if (majorVersion < 20) {
        console.log('⚠️  Warning: Node.js version should be 20+ for best compatibility');
    }
} catch (error) {
    console.error('❌ Could not check Node.js version');
}

// Check VS Code version compatibility
console.log('\n8. 🎯 Troubleshooting Steps...');
console.log('If commands are still not visible:');
console.log('');
console.log('Step 1: Restart VS Code completely');
console.log('Step 2: Check VS Code Developer Console (Help > Toggle Developer Tools)');
console.log('Step 3: Look for BMAD extension in Extensions panel');
console.log('Step 4: Check if extension is enabled');
console.log('Step 5: Try Command Palette: "Developer: Reload Window"');
console.log('');
console.log('For Augment integration:');
console.log('Step 1: Ensure Augment Code extension is installed');
console.log('Step 2: Check Augment extension version compatibility');
console.log('Step 3: Look for BMAD workflows in Augment interface');
console.log('Step 4: Check browser console if using web version');

console.log('\n✅ Troubleshooting script complete!');
console.log('If issues persist, check the VS Code Developer Console for error messages.');
