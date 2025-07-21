# BMAD VS Code Extension - Technical Implementation Guide

## Architecture Overview

This document provides detailed technical implementation specifications for integrating the enhanced BMAD AI Agent Orchestrator system with VS Code and the AUGMENT AI Code extension.

## Core Extension Structure

### Extension Entry Point
```typescript
// src/extension.ts
import * as vscode from 'vscode';
import { BMadOrchestrator } from './orchestrator/BMadOrchestrator';
import { WorkspaceAnalyzer } from './analysis/WorkspaceAnalyzer';
import { CommandManager } from './commands/CommandManager';

export async function activate(context: vscode.ExtensionContext) {
    const orchestrator = new BMadOrchestrator(context);
    const analyzer = new WorkspaceAnalyzer();
    const commandManager = new CommandManager(orchestrator, analyzer);
    
    // Register all commands
    await commandManager.registerCommands(context);
    
    // Initialize workspace monitoring
    await orchestrator.initializeWorkspaceMonitoring();
    
    // Auto-initialize on workspace open
    if (vscode.workspace.workspaceFolders) {
        await orchestrator.autoInitializeWorkspace();
    }
}
```

### Project Type Detection Engine
```typescript
// src/analysis/ProjectTypeDetector.ts
export interface ProjectAnalysis {
    type: ProjectType;
    framework: string;
    complexity: ComplexityLevel;
    hasDatabase: boolean;
    hasAuthentication: boolean;
    hasFrontend: boolean;
    hasBackend: boolean;
    recommendedMode: BMadMode;
    recommendedAgents: string[];
}

export class ProjectTypeDetector {
    async analyzeWorkspace(): Promise<ProjectAnalysis> {
        const packageJson = await this.readPackageJson();
        const requirements = await this.readRequirementsTxt();
        const cargoToml = await this.readCargoToml();
        
        return {
            type: this.determineProjectType(packageJson, requirements, cargoToml),
            framework: this.detectFramework(packageJson),
            complexity: this.calculateComplexity(packageJson),
            hasDatabase: this.detectDatabase(packageJson),
            hasAuthentication: this.detectAuth(packageJson),
            hasFrontend: this.detectFrontend(packageJson),
            hasBackend: this.detectBackend(packageJson),
            recommendedMode: this.recommendMode(packageJson),
            recommendedAgents: this.recommendAgents(packageJson)
        };
    }
    
    private detectFramework(packageJson: any): string {
        const deps = { ...packageJson?.dependencies, ...packageJson?.devDependencies };
        
        if (deps.react) return 'React';
        if (deps.vue) return 'Vue';
        if (deps.angular) return 'Angular';
        if (deps.svelte) return 'Svelte';
        if (deps.express) return 'Express';
        if (deps.fastify) return 'Fastify';
        if (deps['@nestjs/core']) return 'NestJS';
        
        return 'Unknown';
    }
    
    private recommendAgents(packageJson: any): string[] {
        const baseAgents = ['john', 'fred']; // PM and Architect always
        const conditionalAgents = [];
        
        const deps = { ...packageJson?.dependencies, ...packageJson?.devDependencies };
        
        // Frontend detection
        if (deps.react || deps.vue || deps.angular) {
            conditionalAgents.push('jane'); // Design Architect
        }
        
        // Security-sensitive features
        if (deps.passport || deps.jsonwebtoken || deps.bcrypt) {
            conditionalAgents.push('sage'); // Security Engineer
        }
        
        // Infrastructure/DevOps
        if (packageJson?.scripts?.docker || deps.docker) {
            conditionalAgents.push('alex'); // Platform Engineer
        }
        
        return [...baseAgents, ...conditionalAgents];
    }
}
```

### Automated BMAD Initialization System
```typescript
// src/orchestrator/BMadInitializer.ts
export class BMadInitializer {
    private readonly BMAD_FOLDER = 'bmad-agent';
    
    async initializeWorkspace(workspaceFolder: vscode.WorkspaceFolder): Promise<void> {
        const bmadPath = path.join(workspaceFolder.uri.fsPath, this.BMAD_FOLDER);
        
        // Check if bmad-agent folder already exists
        if (await this.folderExists(bmadPath)) {
            await this.validateExistingSetup(bmadPath);
            return;
        }
        
        // Analyze project to determine setup requirements
        const analysis = await this.projectDetector.analyzeWorkspace();
        
        // Create bmad-agent structure
        await this.createBmadStructure(bmadPath, analysis);
        
        // Configure workspace settings
        await this.configureWorkspaceSettings(workspaceFolder, analysis);
        
        // Show success notification
        await this.showInitializationSuccess(analysis);
    }
    
    private async createBmadStructure(bmadPath: string, analysis: ProjectAnalysis): Promise<void> {
        const folders = ['personas', 'tasks', 'templates', 'checklists', 'data'];
        
        // Create folder structure
        for (const folder of folders) {
            await fs.mkdir(path.join(bmadPath, folder), { recursive: true });
        }
        
        // Copy base templates based on project type
        await this.copyTemplates(bmadPath, analysis);
        
        // Generate project-specific configuration
        await this.generateConfiguration(bmadPath, analysis);
    }
    
    private async generateConfiguration(bmadPath: string, analysis: ProjectAnalysis): Promise<void> {
        const config = {
            projectType: analysis.type,
            framework: analysis.framework,
            recommendedMode: analysis.recommendedMode,
            recommendedAgents: analysis.recommendedAgents,
            autoActivateAgents: true,
            enableRealTimeMonitoring: true
        };
        
        await fs.writeFile(
            path.join(bmadPath, 'bmad-config.json'),
            JSON.stringify(config, null, 2)
        );
    }
}
```

### Command Manager Implementation
```typescript
// src/commands/CommandManager.ts
export class CommandManager {
    async registerCommands(context: vscode.ExtensionContext): Promise<void> {
        const commands = [
            // Mode activation commands
            vscode.commands.registerCommand('bmad.activateDocumentationMode', 
                () => this.activateMode('documentation')),
            vscode.commands.registerCommand('bmad.activateFullDevelopmentMode', 
                () => this.activateMode('fullDevelopment')),
            vscode.commands.registerCommand('bmad.continueProject', 
                () => this.activateMode('continueProject')),
            
            // Workspace analysis commands
            vscode.commands.registerCommand('bmad.scanWorkspace', 
                () => this.scanWorkspace()),
            vscode.commands.registerCommand('bmad.autoSetup', 
                () => this.autoSetup()),
            vscode.commands.registerCommand('bmad.detectStack', 
                () => this.detectTechStack()),
            
            // Agent management commands
            vscode.commands.registerCommand('bmad.selectAgents', 
                () => this.showAgentSelector()),
            vscode.commands.registerCommand('bmad.agentHandoff', 
                () => this.performAgentHandoff()),
            
            // Utility commands
            vscode.commands.registerCommand('bmad.healthCheck', 
                () => this.performHealthCheck()),
            vscode.commands.registerCommand('bmad.showProgress', 
                () => this.showProgressDetails())
        ];
        
        context.subscriptions.push(...commands);
    }
    
    private async activateMode(mode: string): Promise<void> {
        const analysis = await this.analyzer.analyzeWorkspace();
        
        // Show mode activation notification
        await vscode.window.showInformationMessage(
            `Activating BMAD ${mode} mode with recommended agents: ${analysis.recommendedAgents.join(', ')}`
        );
        
        // Update status bar
        this.statusBar.updateMode(mode);
        
        // Activate recommended agents
        await this.orchestrator.activateAgents(analysis.recommendedAgents);
        
        // Execute mode-specific workflow
        await this.orchestrator.executeMode(mode, analysis);
    }
    
    private async showAgentSelector(): Promise<void> {
        const availableAgents = await this.orchestrator.getAvailableAgents();
        const analysis = await this.analyzer.analyzeWorkspace();
        
        const quickPick = vscode.window.createQuickPick();
        quickPick.items = availableAgents.map(agent => ({
            label: agent.name,
            description: agent.title,
            detail: agent.description,
            picked: analysis.recommendedAgents.includes(agent.id)
        }));
        
        quickPick.canSelectMany = true;
        quickPick.title = 'Select BMAD AI Agents';
        quickPick.placeholder = 'Choose agents for your project (recommended agents are pre-selected)';
        
        quickPick.onDidChangeSelection(async (selection) => {
            const selectedAgents = selection.map(item => item.label);
            await this.orchestrator.activateAgents(selectedAgents);
            quickPick.hide();
        });
        
        quickPick.show();
    }
}
```

### Real-Time Workspace Monitoring
```typescript
// src/monitoring/WorkspaceMonitor.ts
export class WorkspaceMonitor {
    private fileWatcher: vscode.FileSystemWatcher;
    private diagnosticWatcher: vscode.Disposable;
    
    async startMonitoring(): Promise<void> {
        // Monitor project configuration files
        this.fileWatcher = vscode.workspace.createFileSystemWatcher(
            '**/{package.json,requirements.txt,Cargo.toml,pom.xml,*.csproj}'
        );
        
        this.fileWatcher.onDidChange(this.onConfigFileChange.bind(this));
        this.fileWatcher.onDidCreate(this.onConfigFileCreate.bind(this));
        
        // Monitor diagnostics for automatic debug mode suggestions
        this.diagnosticWatcher = vscode.languages.onDidChangeDiagnostics(
            this.onDiagnosticsChange.bind(this)
        );
    }
    
    private async onConfigFileChange(uri: vscode.Uri): Promise<void> {
        // Debounce rapid changes
        clearTimeout(this.changeTimeout);
        this.changeTimeout = setTimeout(async () => {
            const newAnalysis = await this.analyzer.analyzeWorkspace();
            await this.suggestModeChanges(newAnalysis);
        }, 1000);
    }
    
    private async onDiagnosticsChange(event: vscode.DiagnosticChangeEvent): Promise<void> {
        const criticalIssues = this.filterCriticalIssues(event);
        
        if (criticalIssues.length > 5) { // Threshold for suggesting debug mode
            await this.suggestDebugMode(criticalIssues);
        }
    }
    
    private async suggestDebugMode(issues: vscode.Diagnostic[]): Promise<void> {
        const action = await vscode.window.showWarningMessage(
            `${issues.length} critical issues detected. Activate Debug & Troubleshoot mode?`,
            'Activate Debug Mode',
            'Show Issues',
            'Dismiss'
        );
        
        if (action === 'Activate Debug Mode') {
            await vscode.commands.executeCommand('bmad.activateDebugMode');
        } else if (action === 'Show Issues') {
            await vscode.commands.executeCommand('workbench.actions.view.problems');
        }
    }
}
```

### Status Bar Integration
```typescript
// src/ui/StatusBarManager.ts
export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;
    private progressItem: vscode.StatusBarItem;
    
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 100
        );
        this.progressItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 99
        );
    }
    
    updateMode(mode: string, agents: string[] = []): void {
        this.statusBarItem.text = `$(robot) BMAD: ${mode}`;
        this.statusBarItem.tooltip = `Active Mode: ${mode}\nActive Agents: ${agents.join(', ')}`;
        this.statusBarItem.command = 'bmad.showModeDetails';
        this.statusBarItem.show();
    }
    
    updateProgress(phase: string, progress: number): void {
        if (progress > 0 && progress < 100) {
            this.progressItem.text = `$(sync~spin) ${phase} (${progress}%)`;
            this.progressItem.tooltip = `BMAD workflow progress: ${phase}`;
            this.progressItem.command = 'bmad.showProgress';
            this.progressItem.show();
        } else {
            this.progressItem.hide();
        }
    }
    
    showError(message: string): void {
        this.statusBarItem.text = `$(error) BMAD: Error`;
        this.statusBarItem.tooltip = message;
        this.statusBarItem.command = 'bmad.showErrorDetails';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    }
}
```

### Integration with AUGMENT AI Code Extension
```typescript
// src/integration/AugmentIntegration.ts
export class AugmentIntegration {
    async integrateWithAugment(): Promise<void> {
        // Check if AUGMENT AI Code extension is available
        const augmentExtension = vscode.extensions.getExtension('augment.ai-code');
        
        if (!augmentExtension) {
            await this.showAugmentInstallPrompt();
            return;
        }
        
        // Register BMAD as an AI provider for AUGMENT
        await this.registerBmadProvider(augmentExtension);
    }
    
    private async registerBmadProvider(augmentExtension: vscode.Extension<any>): Promise<void> {
        const augmentAPI = await augmentExtension.activate();
        
        // Register BMAD modes as AI workflows
        await augmentAPI.registerWorkflowProvider({
            id: 'bmad-orchestrator',
            name: 'BMAD AI Agent Orchestrator',
            description: 'Collaborative AI agent workflows for comprehensive development',
            workflows: [
                {
                    id: 'documentation-mode',
                    name: 'Documentation Mode',
                    description: 'Generate comprehensive project documentation',
                    handler: this.handleDocumentationMode.bind(this)
                },
                {
                    id: 'debug-mode',
                    name: 'Debug & Troubleshoot',
                    description: 'Systematic issue diagnosis and resolution',
                    handler: this.handleDebugMode.bind(this)
                }
                // Add other modes...
            ]
        });
    }
    
    private async handleDocumentationMode(context: any): Promise<void> {
        // Execute BMAD documentation mode through AUGMENT
        const analysis = await this.analyzer.analyzeWorkspace();
        await this.orchestrator.executeMode('documentation', analysis);
    }
}
```

### Configuration Management
```typescript
// src/config/ConfigurationManager.ts
export class ConfigurationManager {
    private readonly CONFIG_SECTION = 'bmad';
    
    getConfiguration(): BMadConfiguration {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        
        return {
            autoInitialize: config.get('autoInitialize', true),
            defaultMode: config.get('defaultMode', 'documentation'),
            enableRealTimeMonitoring: config.get('enableRealTimeMonitoring', true),
            autoActivateRecommendedAgents: config.get('autoActivateRecommendedAgents', true),
            debugModeThreshold: config.get('debugModeThreshold', 5),
            progressNotifications: config.get('progressNotifications', true)
        };
    }
    
    async updateConfiguration(updates: Partial<BMadConfiguration>): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        
        for (const [key, value] of Object.entries(updates)) {
            await config.update(key, value, vscode.ConfigurationTarget.Workspace);
        }
    }
}
```

## Package.json Configuration
```json
{
  "name": "bmad-vscode-extension",
  "displayName": "BMAD AI Agent Orchestrator",
  "description": "Collaborative AI agent workflows for comprehensive development",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": ["Other", "Machine Learning"],
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "bmad.activateDocumentationMode",
        "title": "Activate Documentation Mode",
        "category": "BMAD"
      },
      {
        "command": "bmad.continueProject",
        "title": "Continue Existing Project",
        "category": "BMAD"
      },
      {
        "command": "bmad.scanWorkspace",
        "title": "Scan Workspace",
        "category": "BMAD"
      }
    ],
    "configuration": {
      "title": "BMAD AI Agent Orchestrator",
      "properties": {
        "bmad.autoInitialize": {
          "type": "boolean",
          "default": true,
          "description": "Automatically initialize BMAD structure in new workspaces"
        },
        "bmad.defaultMode": {
          "type": "string",
          "enum": ["documentation", "fullDevelopment", "continueProject"],
          "default": "documentation",
          "description": "Default mode for new projects"
        },
        "bmad.enableRealTimeMonitoring": {
          "type": "boolean",
          "default": true,
          "description": "Enable real-time workspace monitoring"
        }
      }
    }
  }
}
```

This technical implementation provides a comprehensive foundation for transforming the BMAD system into a fully integrated VS Code extension with intelligent automation, real-time monitoring, and seamless AUGMENT AI Code integration.
