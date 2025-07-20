import * as vscode from 'vscode';
import { BMadOrchestrator } from './orchestrator/BMadOrchestrator';
import { WorkspaceAnalyzer } from './analysis/WorkspaceAnalyzer';
import { CommandManager } from './commands/CommandManager';
import { StatusBarManager } from './ui/StatusBarManager';
import { WorkspaceMonitor } from './monitoring/WorkspaceMonitor';
import { ConfigurationManager } from './config/ConfigurationManager';
import { BMadInitializer } from './orchestrator/BMadInitializer';
import { AugmentIntegration } from './integration/AugmentIntegration';
import { AugmentMenuIntegration } from './integration/AugmentMenuIntegration';

let orchestrator: BMadOrchestrator;
let analyzer: WorkspaceAnalyzer;
let commandManager: CommandManager;
let statusBar: StatusBarManager;
let monitor: WorkspaceMonitor;
let configManager: ConfigurationManager;
let initializer: BMadInitializer;
let augmentIntegration: AugmentIntegration;
let augmentMenuIntegration: AugmentMenuIntegration;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    console.log('BMAD AI Agent Orchestrator is now active!');

    try {
        // Initialize core components
        configManager = new ConfigurationManager();
        analyzer = new WorkspaceAnalyzer();
        statusBar = new StatusBarManager();
        initializer = new BMadInitializer(analyzer);
        orchestrator = new BMadOrchestrator(context, analyzer, statusBar, initializer);
        commandManager = new CommandManager(orchestrator, analyzer, statusBar);
        monitor = new WorkspaceMonitor(analyzer, orchestrator, statusBar);

        // Initialize Augment integration
        augmentIntegration = new AugmentIntegration(orchestrator, analyzer, statusBar);
        augmentMenuIntegration = new AugmentMenuIntegration(orchestrator, analyzer);

        // Register all commands
        await commandManager.registerCommands(context);

        // Initialize status bar
        statusBar.initialize();

        // Set context for when clauses using modern API
        await vscode.commands.executeCommand('setContext', 'bmadEnabled', true);

        // Auto-initialize workspace if enabled and workspace folders exist
        const config = configManager.getConfiguration();
        if (config.autoInitialize && vscode.workspace.workspaceFolders) {
            await autoInitializeWorkspaces();
        }

        // Start workspace monitoring if enabled
        if (config.enableRealTimeMonitoring) {
            await monitor.startMonitoring();
        }

        // Initialize Augment integration
        await augmentIntegration.initialize();

        // Show welcome message for first-time users
        await showWelcomeMessage(context);

        console.log('BMAD AI Agent Orchestrator activated successfully');

    } catch (error) {
        console.error('Failed to activate BMAD extension:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        await vscode.window.showErrorMessage(`Failed to activate BMAD extension: ${errorMessage}`);
    }
}

export function deactivate(): void {
    console.log('BMAD AI Agent Orchestrator is now deactivated');

    // Clean up resources in proper order
    try {
        if (monitor) {
            monitor.dispose();
        }
        if (statusBar) {
            statusBar.dispose();
        }
        if (configManager) {
            configManager.dispose();
        }
        if (augmentIntegration) {
            augmentIntegration.dispose();
        }
        if (augmentMenuIntegration) {
            augmentMenuIntegration.dispose();
        }
    } catch (error) {
        console.error('Error during deactivation:', error);
    }
}

async function autoInitializeWorkspaces(): Promise<void> {
    if (!vscode.workspace.workspaceFolders) {
        return;
    }

    for (const folder of vscode.workspace.workspaceFolders) {
        try {
            const needsInitialization = await initializer.checkIfInitializationNeeded(folder);
            if (needsInitialization) {
                await initializer.initializeWorkspace(folder);
            }
        } catch (error) {
            console.error(`Failed to auto-initialize workspace ${folder.name}:`, error);
        }
    }
}

async function showWelcomeMessage(context: vscode.ExtensionContext): Promise<void> {
    const hasShownWelcome = context.globalState.get('bmad.hasShownWelcome', false);

    if (!hasShownWelcome) {
        const action = await vscode.window.showInformationMessage(
            'Welcome to BMAD AI Agent Orchestrator! Would you like to see the quick start guide?',
            { modal: false },
            'Show Guide',
            'Quick Setup',
            'Later'
        );

        if (action === 'Show Guide') {
            await vscode.env.openExternal(
                vscode.Uri.parse('https://github.com/bmadcode/BMAD-METHOD#readme')
            );
        } else if (action === 'Quick Setup') {
            await vscode.commands.executeCommand('bmad.autoSetup');
        }

        await context.globalState.update('bmad.hasShownWelcome', true);
    }
}

// Export for testing
export {
    orchestrator,
    analyzer,
    commandManager,
    statusBar,
    monitor,
    configManager,
    initializer
};
