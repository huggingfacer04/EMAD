/**
 * Type definitions for Augment AI Code extension API
 * These interfaces define the expected API structure for integration
 */

export interface AugmentWorkflow {
    id: string;
    name: string;
    description: string;
    icon?: string;
    category?: string;
    handler: (context?: AugmentWorkflowContext) => Promise<void>;
}

export interface AugmentWorkflowProvider {
    id: string;
    name: string;
    description: string;
    icon?: string;
    workflows: AugmentWorkflow[];
}

export interface AugmentWorkflowContext {
    workspaceUri?: string;
    selectedFiles?: string[];
    activeEditor?: {
        uri: string;
        selection?: {
            start: { line: number; character: number };
            end: { line: number; character: number };
        };
    };
    onProgress?: (progress: AugmentProgress) => void;
    onComplete?: (result: AugmentResult) => void;
    onError?: (error: Error | string) => void;
    onCancel?: () => void;
}

export interface AugmentProgress {
    message: string;
    percentage?: number;
    phase?: string;
}

export interface AugmentResult {
    success: boolean;
    message: string;
    outputs?: string[];
    data?: any;
}

export interface AugmentAPI {
    /**
     * Register a workflow provider with Augment
     */
    registerWorkflowProvider(provider: AugmentWorkflowProvider): Promise<void>;

    /**
     * Unregister a workflow provider
     */
    unregisterWorkflowProvider(providerId: string): Promise<void>;

    /**
     * Get list of registered workflow providers
     */
    getWorkflowProviders(): Promise<AugmentWorkflowProvider[]>;

    /**
     * Execute a specific workflow
     */
    executeWorkflow(providerId: string, workflowId: string, context?: AugmentWorkflowContext): Promise<AugmentResult>;

    /**
     * Show workflow selection UI
     */
    showWorkflowPicker(category?: string): Promise<void>;

    /**
     * Get Augment extension version and capabilities
     */
    getCapabilities(): Promise<AugmentCapabilities>;
}

export interface AugmentCapabilities {
    version: string;
    features: {
        workflowProviders: boolean;
        menuIntegration: boolean;
        progressReporting: boolean;
        fileOperations: boolean;
        contextAwareness: boolean;
    };
    supportedCategories: string[];
}

/**
 * Menu integration interfaces for Augment
 */
export interface AugmentMenuItem {
    id: string;
    label: string;
    icon?: string;
    command?: string;
    submenu?: AugmentMenuItem[];
    when?: string;
    group?: string;
}

export interface AugmentMenuProvider {
    id: string;
    name: string;
    menus: {
        [location: string]: AugmentMenuItem[];
    };
}

/**
 * Extended API for menu integration
 */
export interface AugmentExtendedAPI extends AugmentAPI {
    /**
     * Register menu items with Augment
     */
    registerMenuProvider(provider: AugmentMenuProvider): Promise<void>;

    /**
     * Add items to Augment's context menus
     */
    addContextMenuItems(location: string, items: AugmentMenuItem[]): Promise<void>;

    /**
     * Add items to Augment's main menu
     */
    addMainMenuItems(items: AugmentMenuItem[]): Promise<void>;

    /**
     * Show custom UI panel within Augment
     */
    showPanel(panelId: string, content: string | object): Promise<void>;

    /**
     * Register custom commands with Augment
     */
    registerCommands(commands: AugmentCommand[]): Promise<void>;
}

export interface AugmentCommand {
    id: string;
    title: string;
    category?: string;
    icon?: string;
    handler: (args?: any[]) => Promise<any>;
}

/**
 * Event interfaces for Augment integration
 */
export interface AugmentEvents {
    onWorkflowStarted: (providerId: string, workflowId: string) => void;
    onWorkflowCompleted: (providerId: string, workflowId: string, result: AugmentResult) => void;
    onWorkflowFailed: (providerId: string, workflowId: string, error: Error) => void;
    onProviderRegistered: (providerId: string) => void;
    onProviderUnregistered: (providerId: string) => void;
}

/**
 * Configuration interface for Augment integration
 */
export interface AugmentIntegrationConfig {
    enableWorkflowProvider: boolean;
    enableMenuIntegration: boolean;
    enableProgressReporting: boolean;
    defaultCategory: string;
    fallbackToVSCode: boolean;
    showNotifications: boolean;
}

/**
 * Type guard to check if an object implements AugmentAPI
 */
export function isAugmentAPI(obj: any): obj is AugmentAPI {
    return obj &&
           typeof obj.registerWorkflowProvider === 'function' &&
           typeof obj.unregisterWorkflowProvider === 'function' &&
           typeof obj.getWorkflowProviders === 'function';
}

/**
 * Type guard to check if an object implements AugmentExtendedAPI
 */
export function isAugmentExtendedAPI(obj: any): obj is AugmentExtendedAPI {
    return isAugmentAPI(obj) &&
           typeof (obj as any).addMainMenuItems === 'function' &&
           typeof (obj as any).showPanel === 'function';
}

/**
 * Default configuration for Augment integration
 */
export const DEFAULT_AUGMENT_CONFIG: AugmentIntegrationConfig = {
    enableWorkflowProvider: true,
    enableMenuIntegration: true,
    enableProgressReporting: true,
    defaultCategory: 'AI Workflows',
    fallbackToVSCode: true,
    showNotifications: true
};
