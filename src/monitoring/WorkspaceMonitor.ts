import * as vscode from 'vscode';
import { WorkspaceAnalyzer } from '../analysis/WorkspaceAnalyzer';
import { BMadOrchestrator } from '../orchestrator/BMadOrchestrator';
import { StatusBarManager } from '../ui/StatusBarManager';
import { ProjectIssue, WorkspaceEvent, AgentId } from '../types/BMadTypes';

export class WorkspaceMonitor {
    private analyzer: WorkspaceAnalyzer;
    private orchestrator: BMadOrchestrator;
    private statusBar: StatusBarManager;
    
    private fileWatcher?: vscode.FileSystemWatcher;
    private diagnosticWatcher?: vscode.Disposable;
    private configWatcher?: vscode.Disposable;
    
    private changeTimeout?: NodeJS.Timeout;
    private isMonitoring = false;
    private lastAnalysis?: Date;

    constructor(
        analyzer: WorkspaceAnalyzer,
        orchestrator: BMadOrchestrator,
        statusBar: StatusBarManager
    ) {
        this.analyzer = analyzer;
        this.orchestrator = orchestrator;
        this.statusBar = statusBar;
    }

    /**
     * Start monitoring workspace for changes
     */
    async startMonitoring(): Promise<void> {
        if (this.isMonitoring) {
            return;
        }

        try {
            // Monitor project configuration files
            this.setupFileWatcher();
            
            // Monitor VS Code diagnostics
            this.setupDiagnosticWatcher();
            
            // Monitor configuration changes
            this.setupConfigurationWatcher();
            
            this.isMonitoring = true;
            console.log('BMAD workspace monitoring started');

        } catch (error) {
            console.error('Failed to start workspace monitoring:', error);
            throw error;
        }
    }

    /**
     * Stop monitoring workspace
     */
    stopMonitoring(): void {
        if (!this.isMonitoring) {
            return;
        }

        this.dispose();
        this.isMonitoring = false;
        console.log('BMAD workspace monitoring stopped');
    }

    /**
     * Check if monitoring is active
     */
    isActive(): boolean {
        return this.isMonitoring;
    }

    /**
     * Setup file system watcher for project files
     */
    private setupFileWatcher(): void {
        // Watch for changes in key project files
        this.fileWatcher = vscode.workspace.createFileSystemWatcher(
            '**/{package.json,requirements.txt,Cargo.toml,pom.xml,*.csproj,Dockerfile,docker-compose.yml,.env}'
        );

        this.fileWatcher.onDidChange(this.onConfigFileChange.bind(this));
        this.fileWatcher.onDidCreate(this.onConfigFileCreate.bind(this));
        this.fileWatcher.onDidDelete(this.onConfigFileDelete.bind(this));
    }

    /**
     * Setup diagnostic watcher for issue detection
     */
    private setupDiagnosticWatcher(): void {
        this.diagnosticWatcher = vscode.languages.onDidChangeDiagnostics(
            this.onDiagnosticsChange.bind(this)
        );
    }

    /**
     * Setup configuration watcher
     */
    private setupConfigurationWatcher(): void {
        this.configWatcher = vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('bmad')) {
                this.onBmadConfigurationChange();
            }
        });
    }

    /**
     * Handle configuration file changes
     */
    private async onConfigFileChange(uri: vscode.Uri): Promise<void> {
        this.emitWorkspaceEvent('fileChange', { uri: uri.fsPath, type: 'change' });
        
        // Debounce rapid changes
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
        }

        this.changeTimeout = setTimeout(async () => {
            try {
                await this.analyzeProjectChanges(uri);
            } catch (error) {
                console.error('Failed to analyze project changes:', error);
            }
        }, 1000);
    }

    /**
     * Handle configuration file creation
     */
    private async onConfigFileCreate(uri: vscode.Uri): Promise<void> {
        this.emitWorkspaceEvent('fileChange', { uri: uri.fsPath, type: 'create' });
        
        const fileName = uri.fsPath.split('/').pop() || '';
        
        // Show notification for important file creation
        if (['package.json', 'requirements.txt', 'Dockerfile'].includes(fileName)) {
            const action = await vscode.window.showInformationMessage(
                `New ${fileName} detected. Would you like to re-analyze the project?`,
                'Re-analyze',
                'Later'
            );

            if (action === 'Re-analyze') {
                await this.analyzeProjectChanges(uri);
            }
        }
    }

    /**
     * Handle configuration file deletion
     */
    private async onConfigFileDelete(uri: vscode.Uri): Promise<void> {
        this.emitWorkspaceEvent('fileChange', { uri: uri.fsPath, type: 'delete' });
        
        const fileName = uri.fsPath.split('/').pop() || '';
        
        // Show warning for important file deletion
        if (['package.json', 'requirements.txt'].includes(fileName)) {
            vscode.window.showWarningMessage(
                `Important file ${fileName} was deleted. This may affect project analysis.`
            );
        }
    }

    /**
     * Handle VS Code diagnostics changes
     */
    private async onDiagnosticsChange(event: vscode.DiagnosticChangeEvent): Promise<void> {
        this.emitWorkspaceEvent('diagnosticChange', { 
            changedUris: event.uris.map(uri => uri.fsPath) 
        });

        // Get current diagnostics
        const allDiagnostics = vscode.languages.getDiagnostics();
        const issues = this.processDiagnostics(allDiagnostics);
        
        // Update status bar with issues
        this.statusBar.updateIssues(issues);
        
        // Check if we should suggest debug mode
        const criticalIssues = issues.filter(issue => issue.severity === 'critical');
        const config = vscode.workspace.getConfiguration('bmad');
        const threshold = config.get('debugModeThreshold', 5);
        
        if (criticalIssues.length >= threshold) {
            await this.suggestDebugMode(criticalIssues);
        }
    }

    /**
     * Handle BMAD configuration changes
     */
    private onBmadConfigurationChange(): void {
        this.emitWorkspaceEvent('configChange', { 
            section: 'bmad',
            timestamp: new Date().toISOString()
        });

        const config = vscode.workspace.getConfiguration('bmad');
        
        // Update monitoring based on configuration
        if (!config.get('enableRealTimeMonitoring', true)) {
            this.stopMonitoring();
        }
        
        console.log('BMAD configuration updated');
    }

    /**
     * Analyze project changes and suggest actions
     */
    private async analyzeProjectChanges(changedUri: vscode.Uri): Promise<void> {
        try {
            // Prevent too frequent analysis
            if (this.lastAnalysis && Date.now() - this.lastAnalysis.getTime() < 5000) {
                return;
            }

            this.lastAnalysis = new Date();
            
            // Re-analyze workspace
            const analysis = await this.analyzer.analyzeWorkspace();
            
            // Check if recommendations have changed
            const currentMode = this.orchestrator.getCurrentMode();
            const recommendedMode = analysis.projectAnalysis.recommendedMode;
            
            if (currentMode && currentMode !== recommendedMode) {
                await this.suggestModeChange(currentMode, recommendedMode);
            }
            
            // Check for new agent recommendations
            const activeAgents = this.orchestrator.getActiveAgents();
            const recommendedAgents = analysis.projectAnalysis.recommendedAgents;
            
            const newAgents = recommendedAgents.filter(agent => !activeAgents.includes(agent));
            if (newAgents.length > 0) {
                await this.suggestNewAgents(newAgents);
            }

        } catch (error) {
            console.error('Failed to analyze project changes:', error);
        }
    }

    /**
     * Suggest debug mode activation
     */
    private async suggestDebugMode(criticalIssues: ProjectIssue[]): Promise<void> {
        const config = vscode.workspace.getConfiguration('bmad');
        if (!config.get('intelligentRecommendations', true)) {
            return;
        }

        const action = await vscode.window.showWarningMessage(
            `${criticalIssues.length} critical issues detected. Activate Debug & Troubleshoot mode?`,
            'Activate Debug Mode',
            'Show Issues',
            'Dismiss'
        );

        if (action === 'Activate Debug Mode') {
            await vscode.commands.executeCommand('bmad.debugMode');
            this.emitWorkspaceEvent('diagnosticChange', ['debug-mode-activated']);
        } else if (action === 'Show Issues') {
            await vscode.commands.executeCommand('workbench.actions.view.problems');
        }
    }

    /**
     * Suggest mode change
     */
    private async suggestModeChange(currentMode: string, recommendedMode: string): Promise<void> {
        const config = vscode.workspace.getConfiguration('bmad');
        if (!config.get('intelligentRecommendations', true)) {
            return;
        }

        const action = await vscode.window.showInformationMessage(
            `Project changes detected. Consider switching from ${currentMode} to ${recommendedMode} mode?`,
            'Switch Mode',
            'Keep Current',
            'Don\'t Ask Again'
        );

        if (action === 'Switch Mode') {
            await vscode.commands.executeCommand(`bmad.activate${recommendedMode.charAt(0).toUpperCase() + recommendedMode.slice(1)}Mode`);
            this.emitWorkspaceEvent('configChange', ['mode-switched', currentMode, recommendedMode]);
        } else if (action === 'Don\'t Ask Again') {
            await config.update('intelligentRecommendations', false, vscode.ConfigurationTarget.Workspace);
        }
    }

    /**
     * Suggest new agents
     */
    private async suggestNewAgents(newAgents: string[]): Promise<void> {
        const config = vscode.workspace.getConfiguration('bmad');
        if (!config.get('intelligentRecommendations', true)) {
            return;
        }

        const agentNames = newAgents.map(id => this.getAgentDisplayName(id)).join(', ');
        
        const action = await vscode.window.showInformationMessage(
            `New agents recommended based on project changes: ${agentNames}`,
            'Activate Agents',
            'Review Agents',
            'Ignore'
        );

        if (action === 'Activate Agents') {
            const currentAgents = this.orchestrator.getActiveAgents();
            const validAgents = newAgents as AgentId[];
            await this.orchestrator.activateAgents([...currentAgents, ...validAgents]);
            this.emitWorkspaceEvent('configChange', ['agents-added', ...newAgents]);
        } else if (action === 'Review Agents') {
            await vscode.commands.executeCommand('bmad.selectAgents');
        }
    }

    /**
     * Process VS Code diagnostics into project issues
     */
    private processDiagnostics(diagnostics: readonly [vscode.Uri, vscode.Diagnostic[]][]): ProjectIssue[] {
        const issues: ProjectIssue[] = [];
        
        for (const [uri, diags] of diagnostics) {
            for (const diag of diags) {
                let severity: 'critical' | 'high' | 'medium' | 'low';
                
                switch (diag.severity) {
                    case vscode.DiagnosticSeverity.Error:
                        severity = 'critical';
                        break;
                    case vscode.DiagnosticSeverity.Warning:
                        severity = 'high';
                        break;
                    case vscode.DiagnosticSeverity.Information:
                        severity = 'medium';
                        break;
                    case vscode.DiagnosticSeverity.Hint:
                        severity = 'low';
                        break;
                    default:
                        severity = 'medium';
                }

                issues.push({
                    severity,
                    category: this.categorizeIssue(diag),
                    message: diag.message,
                    file: uri.fsPath,
                    line: diag.range.start.line + 1,
                    canAutoFix: diag.code !== undefined
                });
            }
        }
        
        return issues;
    }

    /**
     * Categorize diagnostic issue
     */
    private categorizeIssue(diagnostic: vscode.Diagnostic): 'security' | 'performance' | 'quality' | 'dependency' | 'configuration' {
        const message = diagnostic.message.toLowerCase();
        
        if (message.includes('security') || message.includes('vulnerability')) {
            return 'security';
        }
        if (message.includes('performance') || message.includes('slow')) {
            return 'performance';
        }
        if (message.includes('dependency') || message.includes('import')) {
            return 'dependency';
        }
        if (message.includes('config') || message.includes('setting')) {
            return 'configuration';
        }
        
        return 'quality';
    }

    /**
     * Emit workspace event
     */
    private emitWorkspaceEvent(type: WorkspaceEvent['type'], details: any): void {
        const event: WorkspaceEvent = {
            type,
            timestamp: new Date(),
            details,
            triggeredActions: []
        };
        
        // Emit internal event
        vscode.commands.executeCommand('bmad.internal.workspaceEvent', event);
    }

    /**
     * Get agent display name
     */
    private getAgentDisplayName(agentId: string): string {
        const agentNames: Record<string, string> = {
            john: 'John (Product Manager)',
            fred: 'Fred (Architect)',
            jane: 'Jane (Design Architect)',
            sage: 'Sage (Security Engineer)',
            alex: 'Alex (Platform Engineer)',
            tyler: 'Tyler (Task Breakdown Specialist)',
            taylor: 'Taylor (Technical Writer)',
            sarah: 'Sarah (Product Owner)',
            bob: 'Bob (Scrum Master)'
        };
        return agentNames[agentId] || agentId;
    }

    /**
     * Dispose of all watchers and resources
     */
    dispose(): void {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
            this.fileWatcher = undefined;
        }
        
        if (this.diagnosticWatcher) {
            this.diagnosticWatcher.dispose();
            this.diagnosticWatcher = undefined;
        }
        
        if (this.configWatcher) {
            this.configWatcher.dispose();
            this.configWatcher = undefined;
        }
        
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
            this.changeTimeout = undefined;
        }
    }
}
