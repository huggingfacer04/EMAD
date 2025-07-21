import * as vscode from 'vscode';
import { AugmentExtendedAPI, AugmentMenuItem, AugmentMenuProvider, isAugmentExtendedAPI } from './AugmentAPI';
import { BMadOrchestrator } from '../orchestrator/BMadOrchestrator';
import { WorkspaceAnalyzer } from '../analysis/WorkspaceAnalyzer';

/**
 * Enhanced menu integration for Augment AI Code extension
 * Provides BMAD functionality as menu buttons and context menu items
 */
export class AugmentMenuIntegration {
    private orchestrator: BMadOrchestrator;
    private analyzer: WorkspaceAnalyzer;
    private augmentAPI: AugmentExtendedAPI | null = null;

    constructor(orchestrator: BMadOrchestrator, analyzer: WorkspaceAnalyzer) {
        this.orchestrator = orchestrator;
        this.analyzer = analyzer;
    }

    /**
     * Initialize menu integration with Augment
     */
    async initialize(augmentAPI: any): Promise<boolean> {
        if (!isAugmentExtendedAPI(augmentAPI)) {
            console.log('Augment API does not support extended menu integration');
            return false;
        }

        this.augmentAPI = augmentAPI;
        await this.registerMenuProvider();
        await this.addContextMenuItems();
        await this.addMainMenuItems();
        
        console.log('BMAD menu integration with Augment initialized successfully');
        return true;
    }

    /**
     * Register BMAD as a menu provider with Augment
     */
    private async registerMenuProvider(): Promise<void> {
        if (!this.augmentAPI) return;

        const menuProvider: AugmentMenuProvider = {
            id: 'bmad-menu-provider',
            name: 'BMAD AI Agent Orchestrator',
            menus: {
                'editor/context': this.getEditorContextMenuItems(),
                'explorer/context': this.getExplorerContextMenuItems(),
                'view/title': this.getViewTitleMenuItems(),
                'commandPalette': this.getCommandPaletteItems()
            }
        };

        await this.augmentAPI.registerMenuProvider(menuProvider);
    }

    /**
     * Add BMAD items to Augment's context menus
     */
    private async addContextMenuItems(): Promise<void> {
        if (!this.augmentAPI) return;

        // Add to file explorer context menu
        await this.augmentAPI.addContextMenuItems('explorer/context', [
            {
                id: 'bmad.contextMenu.autoSetup',
                label: 'BMAD: Auto Setup Project',
                icon: '$(robot)',
                command: 'bmad.autoSetup',
                when: 'explorerResourceIsFolder',
                group: 'bmad@1'
            },
            {
                id: 'bmad.contextMenu.analyzeProject',
                label: 'BMAD: Analyze Project',
                icon: '$(search)',
                command: 'bmad.analyzeProject',
                when: 'explorerResourceIsFolder',
                group: 'bmad@2'
            }
        ]);

        // Add to editor context menu
        await this.augmentAPI.addContextMenuItems('editor/context', [
            {
                id: 'bmad.contextMenu.debugFile',
                label: 'BMAD: Debug This File',
                icon: '$(debug)',
                command: 'bmad.debugCurrentFile',
                when: 'editorHasSelection',
                group: 'bmad@1'
            },
            {
                id: 'bmad.contextMenu.documentFile',
                label: 'BMAD: Document This File',
                icon: '$(book)',
                command: 'bmad.documentCurrentFile',
                when: 'editorTextFocus',
                group: 'bmad@2'
            }
        ]);
    }

    /**
     * Add BMAD items to Augment's main menu
     */
    private async addMainMenuItems(): Promise<void> {
        if (!this.augmentAPI) return;

        const mainMenuItems: AugmentMenuItem[] = [
            {
                id: 'bmad.mainMenu.workflows',
                label: 'BMAD Workflows',
                icon: '$(robot)',
                submenu: [
                    {
                        id: 'bmad.mainMenu.documentationMode',
                        label: 'Documentation Mode',
                        icon: '$(book)',
                        command: 'bmad.activateDocumentationMode'
                    },
                    {
                        id: 'bmad.mainMenu.fullDevelopmentMode',
                        label: 'Full Development Mode',
                        icon: '$(rocket)',
                        command: 'bmad.activateFullDevelopmentMode'
                    },
                    {
                        id: 'bmad.mainMenu.debugMode',
                        label: 'Debug & Troubleshoot',
                        icon: '$(debug)',
                        command: 'bmad.debugMode'
                    },
                    {
                        id: 'bmad.mainMenu.separator1',
                        label: '---',
                        command: ''
                    },
                    {
                        id: 'bmad.mainMenu.continueProject',
                        label: 'Continue Project',
                        icon: '$(debug-continue)',
                        command: 'bmad.continueProject'
                    },
                    {
                        id: 'bmad.mainMenu.taskOverview',
                        label: 'Task Overview',
                        icon: '$(list-tree)',
                        command: 'bmad.taskOverview'
                    },
                    {
                        id: 'bmad.mainMenu.separator2',
                        label: '---',
                        command: ''
                    },
                    {
                        id: 'bmad.mainMenu.continuousExecution',
                        label: 'Continuous Execution',
                        icon: '$(sync)',
                        command: 'bmad.continuousExecution'
                    },
                    {
                        id: 'bmad.mainMenu.featureGapAnalysis',
                        label: 'Feature Gap Analysis',
                        icon: '$(search)',
                        command: 'bmad.featureGapAnalysis'
                    },
                    {
                        id: 'bmad.mainMenu.githubIntegration',
                        label: 'GitHub Integration',
                        icon: '$(github)',
                        command: 'bmad.githubIntegration'
                    }
                ]
            },
            {
                id: 'bmad.mainMenu.quickActions',
                label: 'BMAD Quick Actions',
                icon: '$(zap)',
                submenu: [
                    {
                        id: 'bmad.mainMenu.quickModeSelect',
                        label: 'Quick Mode Selection',
                        icon: '$(list-selection)',
                        command: 'bmad.quickModeSelect'
                    },
                    {
                        id: 'bmad.mainMenu.autoSetup',
                        label: 'Auto Setup Workspace',
                        icon: '$(gear)',
                        command: 'bmad.autoSetup'
                    },
                    {
                        id: 'bmad.mainMenu.showStatus',
                        label: 'Show Status',
                        icon: '$(info)',
                        command: 'bmad.showStatus'
                    }
                ]
            }
        ];

        await this.augmentAPI.addMainMenuItems(mainMenuItems);
    }

    /**
     * Get editor context menu items
     */
    private getEditorContextMenuItems(): AugmentMenuItem[] {
        return [
            {
                id: 'bmad.editor.debugSelection',
                label: 'Debug Selection with BMAD',
                icon: '$(debug)',
                command: 'bmad.debugSelection',
                when: 'editorHasSelection'
            },
            {
                id: 'bmad.editor.explainCode',
                label: 'Explain Code with BMAD',
                icon: '$(question)',
                command: 'bmad.explainCode',
                when: 'editorTextFocus'
            },
            {
                id: 'bmad.editor.generateTests',
                label: 'Generate Tests with BMAD',
                icon: '$(beaker)',
                command: 'bmad.generateTests',
                when: 'editorTextFocus'
            }
        ];
    }

    /**
     * Get explorer context menu items
     */
    private getExplorerContextMenuItems(): AugmentMenuItem[] {
        return [
            {
                id: 'bmad.explorer.setupProject',
                label: 'Setup with BMAD',
                icon: '$(robot)',
                command: 'bmad.autoSetup',
                when: 'explorerResourceIsFolder'
            },
            {
                id: 'bmad.explorer.analyzeFolder',
                label: 'Analyze with BMAD',
                icon: '$(search)',
                command: 'bmad.analyzeFolder',
                when: 'explorerResourceIsFolder'
            },
            {
                id: 'bmad.explorer.generateDocs',
                label: 'Generate Documentation',
                icon: '$(book)',
                command: 'bmad.generateDocsForFolder',
                when: 'explorerResourceIsFolder'
            }
        ];
    }

    /**
     * Get view title menu items
     */
    private getViewTitleMenuItems(): AugmentMenuItem[] {
        return [
            {
                id: 'bmad.viewTitle.refresh',
                label: 'Refresh BMAD Analysis',
                icon: '$(refresh)',
                command: 'bmad.refreshAnalysis'
            },
            {
                id: 'bmad.viewTitle.settings',
                label: 'BMAD Settings',
                icon: '$(settings-gear)',
                command: 'bmad.openSettings'
            }
        ];
    }

    /**
     * Get command palette items
     */
    private getCommandPaletteItems(): AugmentMenuItem[] {
        return [
            {
                id: 'bmad.palette.quickStart',
                label: 'BMAD: Quick Start',
                icon: '$(rocket)',
                command: 'bmad.quickModeSelect'
            },
            {
                id: 'bmad.palette.showHelp',
                label: 'BMAD: Show Help',
                icon: '$(question)',
                command: 'bmad.showHelp'
            }
        ];
    }

    /**
     * Create a custom BMAD panel within Augment
     */
    async showBmadPanel(): Promise<void> {
        if (!this.augmentAPI) return;

        const panelContent = {
            title: 'BMAD AI Agent Orchestrator',
            type: 'webview',
            content: this.generatePanelHTML(),
            actions: [
                {
                    id: 'documentation-mode',
                    label: 'Documentation Mode',
                    icon: 'book',
                    command: 'bmad.activateDocumentationMode'
                },
                {
                    id: 'full-development-mode',
                    label: 'Full Development',
                    icon: 'rocket',
                    command: 'bmad.activateFullDevelopmentMode'
                },
                {
                    id: 'debug-mode',
                    label: 'Debug & Troubleshoot',
                    icon: 'debug',
                    command: 'bmad.debugMode'
                }
            ]
        };

        await this.augmentAPI.showPanel('bmad-orchestrator', panelContent);
    }

    /**
     * Generate HTML content for BMAD panel
     */
    private generatePanelHTML(): string {
        return `
            <div class="bmad-panel">
                <h2>🤖 BMAD AI Agent Orchestrator</h2>
                <p>Choose a workflow to get started:</p>
                
                <div class="workflow-grid">
                    <button class="workflow-btn" onclick="executeCommand('bmad.activateDocumentationMode')">
                        <span class="icon">📚</span>
                        <span class="title">Documentation Mode</span>
                        <span class="desc">Generate PRD, Architecture, and Checklist</span>
                    </button>
                    
                    <button class="workflow-btn" onclick="executeCommand('bmad.activateFullDevelopmentMode')">
                        <span class="icon">🚀</span>
                        <span class="title">Full Development</span>
                        <span class="desc">Complete application development</span>
                    </button>
                    
                    <button class="workflow-btn" onclick="executeCommand('bmad.debugMode')">
                        <span class="icon">🐛</span>
                        <span class="title">Debug & Troubleshoot</span>
                        <span class="desc">Systematic issue resolution</span>
                    </button>
                    
                    <button class="workflow-btn" onclick="executeCommand('bmad.continueProject')">
                        <span class="icon">▶️</span>
                        <span class="title">Continue Project</span>
                        <span class="desc">Resume existing work</span>
                    </button>
                </div>
                
                <div class="quick-actions">
                    <button onclick="executeCommand('bmad.quickModeSelect')">Quick Mode Selection</button>
                    <button onclick="executeCommand('bmad.autoSetup')">Auto Setup</button>
                    <button onclick="executeCommand('bmad.showStatus')">Show Status</button>
                </div>
            </div>
            
            <style>
                .bmad-panel { padding: 20px; font-family: var(--vscode-font-family); }
                .workflow-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .workflow-btn {
                    padding: 15px; border: 2px solid #8B5CF6;
                    background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%);
                    color: white;
                    border-radius: 8px; cursor: pointer; text-align: left; display: flex; flex-direction: column;
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
                    transition: all 0.3s ease;
                }
                .workflow-btn:hover {
                    background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
                }
                .workflow-btn .icon { font-size: 24px; margin-bottom: 8px; color: #E5E7EB; }
                .workflow-btn .title { font-weight: bold; margin-bottom: 4px; color: white; }
                .workflow-btn .desc { font-size: 12px; opacity: 0.9; color: #E5E7EB; }
                .quick-actions { display: flex; gap: 10px; margin-top: 20px; }
                .quick-actions button {
                    padding: 8px 16px; border: 2px solid #8B5CF6;
                    background: rgba(139, 92, 246, 0.1); color: #8B5CF6;
                    border-radius: 6px; cursor: pointer;
                    transition: all 0.2s ease;
                }
                .quick-actions button:hover {
                    background: #8B5CF6; color: white;
                    transform: translateY(-1px);
                }
            </style>
            
            <script>
                function executeCommand(command) {
                    vscode.postMessage({ command: command });
                }
            </script>
        `;
    }

    /**
     * Dispose of menu integration resources
     */
    dispose(): void {
        this.augmentAPI = null;
    }
}
