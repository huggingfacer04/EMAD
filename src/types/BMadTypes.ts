import * as vscode from 'vscode';

// Core BMAD Types
export type BMadMode = 
    | 'documentation'
    | 'fullDevelopment'
    | 'continueProject'
    | 'taskOverview'
    | 'debugMode'
    | 'continuousExecution'
    | 'featureGapAnalysis'
    | 'githubIntegration';

export type ProjectType = 
    | 'react-frontend'
    | 'vue-frontend'
    | 'angular-frontend'
    | 'nodejs-api'
    | 'python-api'
    | 'rust-api'
    | 'fullstack-web'
    | 'mobile-app'
    | 'desktop-app'
    | 'library'
    | 'unknown';

export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'enterprise';

export type AgentId = 'john' | 'fred' | 'jane' | 'sage' | 'alex' | 'tyler' | 'taylor' | 'sarah' | 'bob' | 'dakota' | 'phoenix' | 'chronos' | 'sentinel' | 'meta-orchestrator' | 'agent-creator' | 'web-agent-creator' | 'docqa' | 'chunky' | 'synergy';

// Project Analysis Interface
export interface ProjectAnalysis {
    type: ProjectType;
    framework: string;
    language: string;
    complexity: ComplexityLevel;
    hasDatabase: boolean;
    hasAuthentication: boolean;
    hasFrontend: boolean;
    hasBackend: boolean;
    hasDocker: boolean;
    hasKubernetes: boolean;
    hasTests: boolean;
    hasCICD: boolean;
    dependencies: string[];
    devDependencies: string[];
    recommendedMode: BMadMode;
    recommendedAgents: AgentId[];
    confidence: number; // 0-1 confidence score
}

// Agent Configuration
export interface AgentConfig {
    id: AgentId;
    name: string;
    title: string;
    description: string;
    persona: string;
    tasks: string[];
    templates?: string[];
    checklists?: string[];
    specializations: string[];
}

// Agent Selection and Recommendations
export interface AgentRecommendation {
    agent: AgentConfig;
    reason: string;
    confidence: number;
    required: boolean;
}

export interface AgentSelection {
    required: AgentId[];
    recommended: AgentId[];
    rationale: string;
}

// BMAD Configuration
export interface BMadConfiguration {
    autoInitialize: boolean;
    defaultMode: BMadMode;
    enableRealTimeMonitoring: boolean;
    autoActivateRecommendedAgents: boolean;
    debugModeThreshold: number;
    progressNotifications: boolean;
    intelligentRecommendations: boolean;
    statusBarIntegration: boolean;
}

// Workspace Analysis Results
export interface WorkspaceAnalysisResult {
    projectAnalysis: ProjectAnalysis;
    existingBmadSetup: boolean;
    bmadConfigPath?: string;
    needsInitialization: boolean;
    recommendations: {
        mode: BMadMode;
        agents: AgentRecommendation[];
        actions: string[];
    };
}

// Progress Tracking
export interface WorkflowProgress {
    mode: BMadMode;
    phase: string;
    progress: number; // 0-100
    currentAgent?: AgentId;
    estimatedTimeRemaining?: number;
    completedTasks: string[];
    remainingTasks: string[];
}

// Issue Detection
export interface ProjectIssue {
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'security' | 'performance' | 'quality' | 'dependency' | 'configuration';
    message: string;
    file?: string;
    line?: number;
    suggestedAction?: string;
    canAutoFix: boolean;
}

// Mode Execution Context
export interface ModeExecutionContext {
    mode: BMadMode;
    workspaceFolder: vscode.WorkspaceFolder;
    projectAnalysis: ProjectAnalysis;
    selectedAgents: AgentId[];
    userPreferences: Partial<BMadConfiguration>;
    existingArtifacts: string[];
}

// File System Operations
export interface BMadFileStructure {
    bmadAgentPath: string;
    personasPath: string;
    tasksPath: string;
    templatesPath: string;
    checklistsPath: string;
    dataPath: string;
    configPath: string;
}

// Technology Stack Detection
export interface TechnologyStack {
    frontend: {
        framework?: string;
        version?: string;
        buildTool?: string;
        packageManager?: string;
    };
    backend: {
        language?: string;
        framework?: string;
        version?: string;
        runtime?: string;
    };
    database: {
        type?: string;
        version?: string;
        orm?: string;
    };
    infrastructure: {
        containerization?: string;
        orchestration?: string;
        cloudProvider?: string;
        cicd?: string;
    };
    testing: {
        unitTesting?: string;
        e2eTesting?: string;
        coverage?: string;
    };
}

// Command Execution Results
export interface CommandResult {
    success: boolean;
    message: string;
    data?: any;
    errors?: string[];
    warnings?: string[];
}

// Workspace Monitoring Events
export interface WorkspaceEvent {
    type: 'fileChange' | 'diagnosticChange' | 'configChange' | 'dependencyChange';
    timestamp: Date;
    details: any;
    triggeredActions: string[];
}

// Agent Handoff Context
export interface AgentHandoffContext {
    fromAgent: AgentId;
    toAgent: AgentId;
    currentTask: string;
    completedWork: string[];
    pendingWork: string[];
    contextData: any;
    handoffReason: string;
}

// Quick Pick Items for VS Code UI
export interface BMadQuickPickItem extends vscode.QuickPickItem {
    id: string;
    data?: any;
}

// Meta-Orchestrator Agent Types
export interface SquadArchitectureReport {
    reportId: string;
    timestamp: string;
    agentInventory: any;
    performanceMetrics: any;
    collaborationAnalysis: any;
    architectureHealth: any;
    optimizationRecommendations: any[];
    nextActions: any[];
    qualityScore: number;
}

export interface ResearchIntelligenceReport {
    reportId: string;
    timestamp: string;
    methodologyFindings: any[];
    technologyTrends: any[];
    competitiveIntelligence: any[];
    strategicImplications: any[];
    actionableRecommendations: any[];
    researchQuality: number;
    implementationPriority: number;
}

export interface SquadGenerationReport {
    reportId: string;
    timestamp: string;
    requirements: any;
    capabilityGapAnalysis: any;
    agentSpecifications: any[];
    technicalImplementation: any;
    qualityValidation: any;
    implementationPlan: any;
    strategicValue: number;
    implementationReadiness: number;
}

export interface AgentPerformanceMetrics {
    agentId: AgentId;
    responseTime: number;
    throughput: number;
    successRate: number;
    resourceUtilization: number;
    collaborationScore: number;
    qualityScore: number;
    timestamp: string;
}

export interface SquadRequirements {
    squadId: string;
    purpose: string;
    capabilities: string[];
    constraints: string[];
    timeline: string;
    budget: number;
    stakeholders: string[];
}

export interface AgentPerformanceReport {
    reportId: string;
    timestamp: string;
    performanceData: any[];
    overallScore: number;
    recommendations: any[];
}

export interface SquadEvolutionAnalysis {
    analysisId: string;
    timestamp: string;
    evolutionPatterns: any[];
    transformationTrends: any[];
    performanceEvolution: any;
    strategicAlignment: any;
    futureRecommendations: any[];
}

export interface SquadProposal {
    proposalId: string;
    squadName: string;
    purpose: string;
    agents: any[];
    justification: string;
    timeline: string;
    resources: any[];
}

export interface AgentStatus {
    agentId: AgentId;
    isActive: boolean;
    squadMonitoringActive?: boolean;
    researchCycleActive?: boolean;
    evolutionPlanningActive?: boolean;
    lastActivity: string;
    performanceScore: number;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface EvolutionData {
    evolutionId: string;
    period: string;
    agents: AgentId[];
    metrics: any[];
    transformations: any[];
    outcomes: any[];
}

export interface AgentPerformanceData {
    agentId: AgentId;
    metrics: any;
    collaborationScore: number;
    qualityScore: number;
    timestamp: string;
}

export interface ValidationResult {
    validationId: string;
    timestamp: string;
    proposal: any;
    safetyValidation: any;
    qualityValidation: any;
    integrationValidation: any;
    strategicValidation: any;
    overallScore: number;
    approved: boolean;
}

// Status Bar Information
export interface StatusBarInfo {
    mode?: BMadMode;
    activeAgents: AgentId[];
    progress?: WorkflowProgress;
    issues?: ProjectIssue[];
    lastUpdate: Date;
}

// Error Types
export class BMadError extends Error {
    constructor(
        message: string,
        public code: string,
        public category: 'initialization' | 'analysis' | 'execution' | 'configuration' = 'execution'
    ) {
        super(message);
        this.name = 'BMadError';
    }
}

// Event Emitter Types
export interface BMadEvents {
    'modeActivated': { mode: BMadMode; agents: AgentId[] };
    'agentActivated': { agent: AgentId; context: any };
    'progressUpdated': WorkflowProgress;
    'issueDetected': ProjectIssue[];
    'workspaceAnalyzed': WorkspaceAnalysisResult;
    'configurationChanged': BMadConfiguration;
}

// Synergy (Integrated Development & AI Enhancement) Types

export interface DependencyValidationOptions {
    includeDevDependencies?: boolean;
    performSecurityScan?: boolean;
    analyzeFutureCompatibility?: boolean;
    generateRecommendations?: boolean;
}

export interface DependencyValidationResult {
    validationId: string;
    timestamp: string;
    projectPath: string;
    dependencyDiscovery: any;
    compatibilityAnalysis: any;
    securityAssessment: any;
    futureProofingAnalysis: any;
    validationPlanning: any;
    validationMetrics: any;
    securityScore: number;
    futureReadinessScore: number;
    isValidationSuccessful: boolean;
}

export interface DependencyValidation {
    validationId: string;
    projectPath: string;
    validationResult: DependencyValidationResult;
    timestamp: string;
}

export interface CodeRefinementOptions {
    performAutomatedRefactoring?: boolean;
    enhanceTestCoverage?: boolean;
    optimizePerformance?: boolean;
    improveDocumentation?: boolean;
}

export interface CodeRefinementResult {
    refinementId: string;
    timestamp: string;
    projectPath: string;
    codeQualityAssessment: any;
    codeQualityEnhancement: any;
    refactoringImprovement: any;
    testSuiteEnhancement: any;
    documentationEnhancement: any;
    refinementMetrics: any;
    qualityImprovement: number;
    isRefinementSuccessful: boolean;
}

export interface CodeEnhancement {
    refinementId: string;
    projectPath: string;
    refinementResult: CodeRefinementResult;
    timestamp: string;
}

export interface AIIntegrationOptions {
    identifyAIOpportunities?: boolean;
    developPrototypes?: boolean;
    implementIntelligentAutomation?: boolean;
    optimizePerformance?: boolean;
}

export interface AIIntegrationResult {
    integrationId: string;
    timestamp: string;
    projectPath: string;
    aiOpportunityDiscovery: any;
    aiArchitectureDesign: any;
    aiModelDevelopment: any;
    aiIntegrationDeployment: any;
    aiEnhancementLearning: any;
    integrationMetrics: any;
    intelligenceEnhancement: number;
    isIntegrationSuccessful: boolean;
}

export interface AIIntegration {
    integrationId: string;
    projectPath: string;
    integrationResult: AIIntegrationResult;
    timestamp: string;
}

export interface EnhancementScope {
    includeDependencyManagement?: boolean;
    includeCodeQuality?: boolean;
    includeAIIntegration?: boolean;
    includePerformanceOptimization?: boolean;
    includeSecurityHardening?: boolean;
}

export interface AIRequirements {
    domain: string;
    includeModelServing?: boolean;
    includeDataPipeline?: boolean;
    includeMonitoring?: boolean;
    includeGovernance?: boolean;
}

export interface IntegratedDevelopmentResearchResult {
    researchId: string;
    domain: string;
    enhancementAreas: string[];
    timestamp: string;
    developmentLandscape: any;
    enhancementRecommendations: any[];
    implementationAssessment: any;
    implementationGuidance: any;
    enhancementFramework: any;
}

export interface EnhancementMetrics {
    qualityImprovement: number;
    performanceImprovement: number;
    overallImprovement: number;
}

export interface EnhancementStatus {
    isActive: boolean;
    activeDependencyValidations: number;
    activeCodeEnhancements: number;
    activeAIIntegrations: number;
    lastActivity: string;
    enhancementMetrics: EnhancementMetrics | null;
    integrationPatternsCount: number;
    aiEnhancementTechnologiesCount: number;
}

export interface IntegrationPattern {
    patternId: string;
    name: string;
    description: string;
    category: string;
    applicability: string[];
    implementation: any;
}

export interface AIEnhancementTechnology {
    technologyId: string;
    name: string;
    description: string;
    category: string;
    capabilities: string[];
    integrationApproach: any;
}

export interface EnhancementStrategy {
    strategyId: string;
    name: string;
    description: string;
    scope: string[];
    implementation: any;
}

export interface EnhancementRequest {
    requestId: string;
    projectPath: string;
    enhancementType: string;
    options: any;
    timestamp: string;
}

export interface EnhancementSession {
    sessionId: string;
    requestId: string;
    startTime: string;
    status: string;
    progress: number;
}

export interface EnhancementResult {
    enhancementId: string;
    requestId: string;
    timestamp: string;
    enhancementResults: any;
    enhancementMetrics: any;
    overallImprovement: number;
    qualityEnhancement: boolean;
    performanceEnhancement: boolean;
    isSuccessful: boolean;
    futureReadinessScore: number;
}

export interface ProjectHealthAssessmentResult {
    assessmentId: string;
    timestamp: string;
    projectStructureAnalysis: any;
    codeQualityAssessment: any;
    dependencyHealthEvaluation: any;
    performanceScalabilityAssessment: any;
    aiIntegrationPotential: any;
    overallHealthScore: number;
    enhancementPriorities: any[];
    healthMetrics: any;
}

export interface EnhancementFramework {
    frameworkId: string;
    name: string;
    description: string;
    components: string[];
    implementation: any;
}

export interface IntegrationStrategy {
    strategyId: string;
    name: string;
    description: string;
    patterns: string[];
    implementation: any;
}
