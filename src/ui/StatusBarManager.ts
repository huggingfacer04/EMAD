import * as vscode from 'vscode';
import { BMadMode, AgentId, WorkflowProgress, ProjectIssue, StatusBarInfo } from '../types/BMadTypes';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;
    private progressItem: vscode.StatusBarItem;
    private issueItem: vscode.StatusBarItem;
    private currentInfo: StatusBarInfo;

    constructor() {
        // Create status bar items
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 100
        );
        this.progressItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 99
        );
        this.issueItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 98
        );

        // Initialize current info
        this.currentInfo = {
            activeAgents: [],
            lastUpdate: new Date()
        };
    }

    /**
     * Initialize status bar with default state
     */
    initialize(): void {
        this.statusBarItem.text = '$(robot) BMAD: Ready';
        this.statusBarItem.tooltip = 'BMAD AI Agent Orchestrator - Click to select mode';
        this.statusBarItem.command = 'bmad.quickModeSelect';
        this.statusBarItem.show();

        console.log('BMAD Status Bar initialized');
    }

    /**
     * Update status bar with current mode and agents
     */
    updateMode(mode: BMadMode, agents: AgentId[] = []): void {
        this.currentInfo.mode = mode;
        this.currentInfo.activeAgents = agents;
        this.currentInfo.lastUpdate = new Date();

        const modeDisplayName = this.getModeDisplayName(mode);
        const agentNames = agents.map(id => this.getAgentDisplayName(id)).join(', ');

        this.statusBarItem.text = `$(robot) BMAD: ${modeDisplayName}`;
        this.statusBarItem.tooltip = this.buildModeTooltip(mode, agents);
        this.statusBarItem.command = 'bmad.showModeDetails';
        this.statusBarItem.backgroundColor = undefined; // Clear any error background
        this.statusBarItem.show();

        // Show notification if enabled
        const config = vscode.workspace.getConfiguration('bmad');
        if (config.get('progressNotifications', true)) {
            vscode.window.showInformationMessage(
                `BMAD ${modeDisplayName} mode activated${agents.length > 0 ? ` with agents: ${agentNames}` : ''}`
            );
        }
    }

    /**
     * Update progress information
     */
    updateProgress(progress: WorkflowProgress): void {
        this.currentInfo.progress = progress;
        this.currentInfo.lastUpdate = new Date();

        if (progress.progress > 0 && progress.progress < 100) {
            this.progressItem.text = `$(sync~spin) ${progress.phase} (${progress.progress}%)`;
            this.progressItem.tooltip = this.buildProgressTooltip(progress);
            this.progressItem.command = 'bmad.showProgress';
            this.progressItem.show();
        } else if (progress.progress >= 100) {
            this.progressItem.text = `$(check) ${progress.phase} Complete`;
            this.progressItem.tooltip = 'Workflow completed successfully';
            this.progressItem.command = 'bmad.showProgress';
            
            // Hide progress item after 5 seconds
            setTimeout(() => {
                this.progressItem.hide();
            }, 5000);
        } else {
            this.progressItem.hide();
        }
    }

    /**
     * Update issue information
     */
    updateIssues(issues: ProjectIssue[]): void {
        this.currentInfo.issues = issues;
        this.currentInfo.lastUpdate = new Date();

        if (issues.length === 0) {
            this.issueItem.hide();
            return;
        }

        const criticalIssues = issues.filter(issue => issue.severity === 'critical');
        const highIssues = issues.filter(issue => issue.severity === 'high');

        if (criticalIssues.length > 0) {
            this.issueItem.text = `$(error) ${criticalIssues.length} Critical`;
            this.issueItem.tooltip = this.buildIssueTooltip(issues);
            this.issueItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        } else if (highIssues.length > 0) {
            this.issueItem.text = `$(warning) ${highIssues.length} High`;
            this.issueItem.tooltip = this.buildIssueTooltip(issues);
            this.issueItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        } else {
            this.issueItem.text = `$(info) ${issues.length} Issues`;
            this.issueItem.tooltip = this.buildIssueTooltip(issues);
            this.issueItem.backgroundColor = undefined;
        }

        this.issueItem.command = 'bmad.debugMode';
        this.issueItem.show();
    }

    /**
     * Show error state
     */
    showError(message: string, command?: string): void {
        this.statusBarItem.text = '$(error) BMAD: Error';
        this.statusBarItem.tooltip = `Error: ${message}\nClick for details`;
        this.statusBarItem.command = command || 'bmad.showErrorDetails';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        this.statusBarItem.show();

        // Show error notification
        vscode.window.showErrorMessage(`BMAD Error: ${message}`, 'Show Details').then(action => {
            if (action === 'Show Details' && command) {
                vscode.commands.executeCommand(command);
            }
        });
    }

    /**
     * Show loading state
     */
    showLoading(message: string): void {
        this.statusBarItem.text = `$(sync~spin) BMAD: ${message}`;
        this.statusBarItem.tooltip = `BMAD is ${message.toLowerCase()}...`;
        this.statusBarItem.command = undefined;
        this.statusBarItem.backgroundColor = undefined;
        this.statusBarItem.show();
    }

    /**
     * Show success state
     */
    showSuccess(message: string, command?: string): void {
        this.statusBarItem.text = '$(check) BMAD: Success';
        this.statusBarItem.tooltip = `Success: ${message}\nClick for details`;
        this.statusBarItem.command = command || 'bmad.quickModeSelect';
        this.statusBarItem.backgroundColor = undefined;
        this.statusBarItem.show();

        // Show success notification
        vscode.window.showInformationMessage(`BMAD: ${message}`);

        // Auto-clear success state after 5 seconds
        setTimeout(() => {
            this.statusBarItem.text = '$(robot) BMAD: Ready';
            this.statusBarItem.tooltip = 'BMAD AI Agent Orchestrator - Click to select mode';
            this.statusBarItem.command = 'bmad.quickModeSelect';
        }, 5000);
    }

    /**
     * Show info state
     */
    showInfo(message: string, command?: string): void {
        this.statusBarItem.text = '$(info) BMAD: Info';
        this.statusBarItem.tooltip = `Info: ${message}\nClick for details`;
        this.statusBarItem.command = command || 'bmad.quickModeSelect';
        this.statusBarItem.backgroundColor = undefined;
        this.statusBarItem.show();

        // Show info notification
        vscode.window.showInformationMessage(`BMAD: ${message}`);

        // Auto-clear info state after 3 seconds
        setTimeout(() => {
            this.statusBarItem.text = '$(robot) BMAD: Ready';
            this.statusBarItem.tooltip = 'BMAD AI Agent Orchestrator - Click to select mode';
            this.statusBarItem.command = 'bmad.quickModeSelect';
        }, 3000);
    }

    /**
     * Clear all status items
     */
    clear(): void {
        this.statusBarItem.hide();
        this.progressItem.hide();
        this.issueItem.hide();
    }

    /**
     * Get current status information
     */
    getCurrentInfo(): StatusBarInfo {
        return { ...this.currentInfo };
    }

    /**
     * Dispose of status bar items
     */
    dispose(): void {
        this.statusBarItem.dispose();
        this.progressItem.dispose();
        this.issueItem.dispose();
    }

    // Helper methods
    private getModeDisplayName(mode: BMadMode): string {
        const modeNames: Record<BMadMode, string> = {
            documentation: 'Documentation',
            fullDevelopment: 'Full Development',
            continueProject: 'Continue Project',
            taskOverview: 'Task Overview',
            debugMode: 'Debug & Troubleshoot',
            continuousExecution: 'Continuous Execution',
            featureGapAnalysis: 'Feature Gap Analysis',
            githubIntegration: 'GitHub Integration'
        };
        return modeNames[mode] || mode;
    }

    private getAgentDisplayName(agentId: AgentId): string {
        const agentNames: Record<AgentId, string> = {
            john: 'John (PM)',
            fred: 'Fred (Architect)',
            jane: 'Jane (Design)',
            sage: 'Sage (Security)',
            alex: 'Alex (Platform)',
            tyler: 'Tyler (Tasks)',
            taylor: 'Taylor (Writer)',
            sarah: 'Sarah (PO)',
            bob: 'Bob (SM)',
            dakota: 'Dakota (Dependencies)',
            phoenix: 'Phoenix (Deployment)',
            chronos: 'Chronos (Versioning)',
            sentinel: 'Sentinel (QA)'
        };
        return agentNames[agentId] || agentId;
    }

    private buildModeTooltip(mode: BMadMode, agents: AgentId[]): string {
        const modeDescription = this.getModeDescription(mode);
        const agentList = agents.length > 0 
            ? `\n\nActive Agents:\n${agents.map(id => `• ${this.getAgentDisplayName(id)}`).join('\n')}`
            : '';
        
        return `BMAD AI Agent Orchestrator\n\nMode: ${this.getModeDisplayName(mode)}\n${modeDescription}${agentList}\n\nClick to view mode details`;
    }

    private buildProgressTooltip(progress: WorkflowProgress): string {
        const timeRemaining = progress.estimatedTimeRemaining 
            ? `\nEstimated time remaining: ${Math.round(progress.estimatedTimeRemaining / 60)} minutes`
            : '';
        
        const currentAgent = progress.currentAgent 
            ? `\nCurrent agent: ${this.getAgentDisplayName(progress.currentAgent)}`
            : '';

        const completedTasks = progress.completedTasks.length > 0
            ? `\n\nCompleted tasks:\n${progress.completedTasks.map(task => `• ${task}`).join('\n')}`
            : '';

        return `BMAD Workflow Progress\n\nPhase: ${progress.phase}\nProgress: ${progress.progress}%${timeRemaining}${currentAgent}${completedTasks}\n\nClick for detailed progress view`;
    }

    private buildIssueTooltip(issues: ProjectIssue[]): string {
        const issueSummary = issues.reduce((acc, issue) => {
            acc[issue.severity] = (acc[issue.severity] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const summaryText = Object.entries(issueSummary)
            .map(([severity, count]) => `${count} ${severity}`)
            .join(', ');

        const recentIssues = issues.slice(0, 3).map(issue => 
            `• ${issue.severity.toUpperCase()}: ${issue.message}`
        ).join('\n');

        return `Project Issues Detected\n\nSummary: ${summaryText}\n\nRecent issues:\n${recentIssues}\n\nClick to activate Debug & Troubleshoot mode`;
    }

    private getModeDescription(mode: BMadMode): string {
        const descriptions: Record<BMadMode, string> = {
            documentation: 'Generate comprehensive project documentation',
            fullDevelopment: 'Complete application development workflow',
            continueProject: 'Resume interrupted project work',
            taskOverview: 'Project status dashboard and task management',
            debugMode: 'Systematic issue diagnosis and resolution',
            continuousExecution: 'Autonomous workflow execution',
            featureGapAnalysis: 'Analyze missing features and improvements',
            githubIntegration: 'GitHub repository documentation and workflow'
        };
        return descriptions[mode] || 'BMAD workflow mode';
    }
}
