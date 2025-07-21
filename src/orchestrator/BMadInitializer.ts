import * as vscode from 'vscode';
import * as path from 'path';
import { WorkspaceAnalyzer } from '../analysis/WorkspaceAnalyzer';
import { ProjectAnalysis, BMadFileStructure } from '../types/BMadTypes';

export class BMadInitializer {
    private readonly BMAD_FOLDER = 'bmad-agent';
    private analyzer: WorkspaceAnalyzer;

    constructor(analyzer: WorkspaceAnalyzer) {
        this.analyzer = analyzer;
    }

    /**
     * Check if workspace needs BMAD initialization
     */
    async checkIfInitializationNeeded(workspaceFolder: vscode.WorkspaceFolder): Promise<boolean> {
        const bmadPath = path.join(workspaceFolder.uri.fsPath, this.BMAD_FOLDER);
        
        try {
            const bmadUri = vscode.Uri.file(bmadPath);
            await vscode.workspace.fs.stat(bmadUri);
            return false; // Directory exists, no initialization needed
        } catch {
            return true; // Directory doesn't exist, initialization needed
        }
    }

    /**
     * Initialize BMAD structure in workspace
     */
    async initializeWorkspace(workspaceFolder: vscode.WorkspaceFolder): Promise<void> {
        try {
            const bmadPath = path.join(workspaceFolder.uri.fsPath, this.BMAD_FOLDER);
            
            // Check if already exists
            if (!(await this.checkIfInitializationNeeded(workspaceFolder))) {
                await this.validateExistingSetup(bmadPath);
                return;
            }

            // Analyze project to determine setup requirements
            const analysis = await this.analyzer.analyzeProject(workspaceFolder);

            // Create BMAD structure
            await this.createBmadStructure(bmadPath, analysis);

            // Configure workspace settings
            await this.configureWorkspaceSettings(workspaceFolder, analysis);

            // Show success notification
            await this.showInitializationSuccess(analysis);

            console.log(`BMAD initialized successfully for ${workspaceFolder.name}`);

        } catch (error) {
            console.error('Failed to initialize BMAD workspace:', error);
            throw new Error(`Failed to initialize BMAD workspace: ${error}`);
        }
    }

    /**
     * Create BMAD folder structure
     */
    private async createBmadStructure(bmadPath: string, analysis: ProjectAnalysis): Promise<void> {
        const folders = ['personas', 'tasks', 'templates', 'checklists', 'data'];
        
        // Create main bmad-agent directory
        await vscode.workspace.fs.createDirectory(vscode.Uri.file(bmadPath));

        // Create subdirectories
        for (const folder of folders) {
            const folderPath = path.join(bmadPath, folder);
            await vscode.workspace.fs.createDirectory(vscode.Uri.file(folderPath));
        }

        // Copy base templates based on project type
        await this.copyBaseTemplates(bmadPath, analysis);

        // Generate project-specific configuration
        await this.generateConfiguration(bmadPath, analysis);

        // Create IDE orchestrator configuration
        await this.createIdeOrchestratorConfig(bmadPath, analysis);
    }

    /**
     * Copy base templates and files
     */
    private async copyBaseTemplates(bmadPath: string, analysis: ProjectAnalysis): Promise<void> {
        // Create basic persona files
        await this.createPersonaFiles(bmadPath);
        
        // Create basic task files
        await this.createTaskFiles(bmadPath);
        
        // Create basic template files
        await this.createTemplateFiles(bmadPath, analysis);
        
        // Create basic checklist files
        await this.createChecklistFiles(bmadPath);
        
        // Create data files
        await this.createDataFiles(bmadPath);
    }

    /**
     * Create basic persona files
     */
    private async createPersonaFiles(bmadPath: string): Promise<void> {
        const personasPath = path.join(bmadPath, 'personas');
        
        // Create basic personas based on the enhanced system
        const personas = [
            { name: 'bmad.md', content: this.getBmadPersonaContent() },
            { name: 'pm.md', content: this.getPmPersonaContent() },
            { name: 'architect.md', content: this.getArchitectPersonaContent() },
            { name: 'design-architect.md', content: this.getDesignArchitectPersonaContent() },
            { name: 'security-engineer.md', content: this.getSecurityEngineerPersonaContent() },
            { name: 'platform-engineer.md', content: this.getPlatformEngineerPersonaContent() },
            { name: 'task-breakdown-specialist.md', content: this.getTaskBreakdownSpecialistPersonaContent() },
            { name: 'technical-writer.md', content: this.getTechnicalWriterPersonaContent() }
        ];

        for (const persona of personas) {
            const filePath = path.join(personasPath, persona.name);
            const content = new TextEncoder().encode(persona.content);
            await vscode.workspace.fs.writeFile(
                vscode.Uri.file(filePath),
                content
            );
        }
    }

    /**
     * Create basic task files
     */
    private async createTaskFiles(bmadPath: string): Promise<void> {
        const tasksPath = path.join(bmadPath, 'tasks');
        
        const tasks = [
            { name: 'documentation-mode-workflow.md', content: this.getDocumentationModeTaskContent() },
            { name: 'continue-existing-project-workflow.md', content: this.getContinueProjectTaskContent() },
            { name: 'task-list-overview-workflow.md', content: this.getTaskOverviewTaskContent() },
            { name: 'debug-troubleshoot-workflow.md', content: this.getDebugTaskContent() }
        ];

        for (const task of tasks) {
            const filePath = path.join(tasksPath, task.name);
            const content = new TextEncoder().encode(task.content);
            await vscode.workspace.fs.writeFile(
                vscode.Uri.file(filePath),
                content
            );
        }
    }

    /**
     * Create template files based on project type
     */
    private async createTemplateFiles(bmadPath: string, analysis: ProjectAnalysis): Promise<void> {
        const templatesPath = path.join(bmadPath, 'templates');
        
        const templates = [
            { name: 'prd-template.md', content: this.getPrdTemplateContent() },
            { name: 'architecture-template.md', content: this.getArchitectureTemplateContent(analysis) },
            { name: 'checklist-template.md', content: this.getChecklistTemplateContent() }
        ];

        for (const template of templates) {
            const filePath = path.join(templatesPath, template.name);
            const content = new TextEncoder().encode(template.content);
            await vscode.workspace.fs.writeFile(
                vscode.Uri.file(filePath),
                content
            );
        }
    }

    /**
     * Create checklist files
     */
    private async createChecklistFiles(bmadPath: string): Promise<void> {
        const checklistsPath = path.join(bmadPath, 'checklists');
        
        const checklists = [
            { name: 'pm-checklist.md', content: this.getPmChecklistContent() },
            { name: 'architect-checklist.md', content: this.getArchitectChecklistContent() },
            { name: 'security-checklist.md', content: this.getSecurityChecklistContent() }
        ];

        for (const checklist of checklists) {
            const filePath = path.join(checklistsPath, checklist.name);
            const content = new TextEncoder().encode(checklist.content);
            await vscode.workspace.fs.writeFile(
                vscode.Uri.file(filePath),
                content
            );
        }
    }

    /**
     * Create data files
     */
    private async createDataFiles(bmadPath: string): Promise<void> {
        const dataPath = path.join(bmadPath, 'data');
        
        const dataFiles = [
            { name: 'bmad-kb.md', content: this.getBmadKnowledgeBaseContent() }
        ];

        for (const dataFile of dataFiles) {
            const filePath = path.join(dataPath, dataFile.name);
            const content = new TextEncoder().encode(dataFile.content);
            await vscode.workspace.fs.writeFile(
                vscode.Uri.file(filePath),
                content
            );
        }
    }

    /**
     * Generate project-specific configuration
     */
    private async generateConfiguration(bmadPath: string, analysis: ProjectAnalysis): Promise<void> {
        const config = {
            projectType: analysis.type,
            framework: analysis.framework,
            language: analysis.language,
            complexity: analysis.complexity,
            recommendedMode: analysis.recommendedMode,
            recommendedAgents: analysis.recommendedAgents,
            autoActivateAgents: true,
            enableRealTimeMonitoring: true,
            features: {
                hasDatabase: analysis.hasDatabase,
                hasAuthentication: analysis.hasAuthentication,
                hasFrontend: analysis.hasFrontend,
                hasBackend: analysis.hasBackend,
                hasDocker: analysis.hasDocker,
                hasKubernetes: analysis.hasKubernetes,
                hasTests: analysis.hasTests,
                hasCICD: analysis.hasCICD
            },
            dependencies: analysis.dependencies,
            confidence: analysis.confidence,
            createdAt: new Date().toISOString(),
            version: '1.0.0'
        };

        const configPath = path.join(bmadPath, 'bmad-config.json');
        const content = new TextEncoder().encode(JSON.stringify(config, null, 2));
        await vscode.workspace.fs.writeFile(
            vscode.Uri.file(configPath),
            content
        );
    }

    /**
     * Create IDE orchestrator configuration
     */
    private async createIdeOrchestratorConfig(bmadPath: string, analysis: ProjectAnalysis): Promise<void> {
        const configContent = this.getIdeOrchestratorConfigContent(analysis);
        const configPath = path.join(bmadPath, 'ide-bmad-orchestrator.cfg.md');
        const content = new TextEncoder().encode(configContent);

        await vscode.workspace.fs.writeFile(
            vscode.Uri.file(configPath),
            content
        );
    }

    /**
     * Configure workspace settings
     */
    private async configureWorkspaceSettings(workspaceFolder: vscode.WorkspaceFolder, analysis: ProjectAnalysis): Promise<void> {
        const config = vscode.workspace.getConfiguration('bmad', workspaceFolder);
        
        // Set project-specific defaults
        await config.update('defaultMode', analysis.recommendedMode, vscode.ConfigurationTarget.Workspace);
        await config.update('autoActivateRecommendedAgents', true, vscode.ConfigurationTarget.Workspace);
        
        // Enable features based on project characteristics
        if (analysis.complexity === 'complex' || analysis.complexity === 'enterprise') {
            await config.update('enableRealTimeMonitoring', true, vscode.ConfigurationTarget.Workspace);
            await config.update('debugModeThreshold', 3, vscode.ConfigurationTarget.Workspace);
        }
    }

    /**
     * Validate existing BMAD setup
     */
    private async validateExistingSetup(bmadPath: string): Promise<void> {
        const requiredFolders = ['personas', 'tasks', 'templates', 'checklists', 'data'];
        const missingFolders: string[] = [];

        for (const folder of requiredFolders) {
            try {
                const folderPath = path.join(bmadPath, folder);
                await vscode.workspace.fs.stat(vscode.Uri.file(folderPath));
            } catch {
                missingFolders.push(folder);
            }
        }

        if (missingFolders.length > 0) {
            const action = await vscode.window.showWarningMessage(
                `BMAD setup is incomplete. Missing folders: ${missingFolders.join(', ')}. Would you like to repair it?`,
                'Repair Setup',
                'Ignore'
            );

            if (action === 'Repair Setup') {
                // Create missing folders
                for (const folder of missingFolders) {
                    const folderPath = path.join(bmadPath, folder);
                    await vscode.workspace.fs.createDirectory(vscode.Uri.file(folderPath));
                }
            }
        }
    }

    /**
     * Show initialization success message
     */
    private async showInitializationSuccess(analysis: ProjectAnalysis): Promise<void> {
        const message = `BMAD initialized successfully! Detected: ${analysis.framework} ${analysis.type} project. Recommended mode: ${analysis.recommendedMode}`;
        
        const action = await vscode.window.showInformationMessage(
            message,
            'Activate Recommended Mode',
            'Select Agents',
            'OK'
        );

        if (action === 'Activate Recommended Mode') {
            await vscode.commands.executeCommand(`bmad.activate${analysis.recommendedMode.charAt(0).toUpperCase() + analysis.recommendedMode.slice(1)}Mode`);
        } else if (action === 'Select Agents') {
            await vscode.commands.executeCommand('bmad.selectAgents');
        }
    }

    // Content generation methods (simplified versions)
    private getBmadPersonaContent(): string {
        return `# Role: BMad - AI Agent Orchestrator

## Core Principles
1. Orchestrate AI agent selection and activation
2. Provide guidance on the BMAD Method
3. Coordinate collaborative intelligence workflows
4. Maintain project context and continuity

## Responsibilities
- Mode selection and workflow orchestration
- Agent coordination and handoffs
- Progress tracking and status updates
- Quality assurance and validation
`;
    }

    private getPmPersonaContent(): string {
        return `# Role: Product Manager (John)

## Core Principles
1. Represent end user needs and business value
2. Define clear product requirements and specifications
3. Prioritize features based on user impact
4. Ensure product-market fit and viability

## Responsibilities
- Product Requirements Document (PRD) creation
- Feature prioritization and roadmap planning
- Stakeholder communication and alignment
- User story definition and acceptance criteria
`;
    }

    private getArchitectPersonaContent(): string {
        return `# Role: Architect (Fred)

## Core Principles
1. Design scalable and maintainable system architecture
2. Make informed technology decisions
3. Ensure non-functional requirements are met
4. Balance technical excellence with business needs

## Responsibilities
- System architecture design and documentation
- Technology stack selection and evaluation
- Technical risk assessment and mitigation
- Code quality standards and best practices
`;
    }

    private getDesignArchitectPersonaContent(): string {
        return `# Role: Design Architect (Jane)

## Core Principles
1. Create intuitive and accessible user experiences
2. Design consistent and scalable UI components
3. Ensure responsive and performant interfaces
4. Align design with business objectives

## Responsibilities
- UI/UX specification and design systems
- Frontend architecture and component design
- Accessibility and usability standards
- Design-development collaboration
`;
    }

    private getSecurityEngineerPersonaContent(): string {
        return `# Role: Security Engineer (Sage)

## Core Principles
1. Implement security by design principles
2. Identify and mitigate security vulnerabilities
3. Ensure compliance with security standards
4. Protect user data and system integrity

## Responsibilities
- Security architecture review and assessment
- Vulnerability scanning and penetration testing
- Security policy and procedure development
- Incident response and threat analysis
`;
    }

    private getPlatformEngineerPersonaContent(): string {
        return `# Role: Platform Engineer (Alex)

## Core Principles
1. Build reliable and scalable infrastructure
2. Automate deployment and operations
3. Ensure high availability and performance
4. Optimize costs and resource utilization

## Responsibilities
- Infrastructure architecture and automation
- CI/CD pipeline design and implementation
- Monitoring and observability setup
- Disaster recovery and backup strategies
`;
    }

    private getTaskBreakdownSpecialistPersonaContent(): string {
        return `# Role: Task Breakdown Specialist (Tyler)

## Core Principles
1. Break complex work into manageable tasks
2. Organize workflows for optimal efficiency
3. Track progress and identify blockers
4. Facilitate team coordination and handoffs

## Responsibilities
- Epic and story breakdown and estimation
- Task dependency mapping and scheduling
- Progress tracking and status reporting
- Workflow optimization and improvement
`;
    }

    private getTechnicalWriterPersonaContent(): string {
        return `# Role: Technical Writer (Taylor)

## Core Principles
1. Create clear and comprehensive documentation
2. Ensure information accessibility and usability
3. Maintain documentation quality and consistency
4. Support developer onboarding and productivity

## Responsibilities
- Technical documentation creation and maintenance
- API documentation and developer guides
- README and repository documentation
- Documentation standards and style guides
`;
    }

    // Task content methods (simplified)
    private getDocumentationModeTaskContent(): string {
        return `# Documentation Mode Workflow

## Purpose
Generate 3 complete handoff documents through collaborative AI agent intelligence.

## Deliverables
- prd.md - Product Requirements Document
- architecture.md - Technical Architecture Document  
- checklist.md - Development Checklist

## Workflow
1. Project Analysis & Agent Activation
2. Collaborative PRD Development
3. Collaborative Architecture Development
4. Collaborative Development Checklist
5. Final Validation & Handoff
`;
    }

    private getContinueProjectTaskContent(): string {
        return `# Continue Existing Project Workflow

## Purpose
Resume work on interrupted projects with full context restoration.

## Workflow
1. Comprehensive Workspace Analysis
2. Task Management Analysis
3. Project Resume Summary Generation
4. Continuation Point Selection
5. AI Agent Reactivation
6. Execution Resumption
`;
    }

    private getTaskOverviewTaskContent(): string {
        return `# Task List Overview Workflow

## Purpose
Provide comprehensive project status dashboard and task management.

## Workflow
1. Comprehensive Task Analysis
2. Project Status Dashboard Generation
3. Task Complexity and Effort Analysis
4. Priority and Risk Assessment
5. Interactive Task Management
6. Reporting and Export
`;
    }

    private getDebugTaskContent(): string {
        return `# Debug & Troubleshoot Workflow

## Purpose
Systematic issue diagnosis and resolution through specialist AI collaboration.

## Workflow
1. Comprehensive Project Health Diagnostics
2. Issue Classification and Severity Assessment
3. Security Vulnerability Scanning
4. Specialist AI Agent Consultation
5. Automated Analysis and Testing
6. Issue Resolution Planning
7. Interactive Debugging Support
`;
    }

    // Template content methods (simplified)
    private getPrdTemplateContent(): string {
        return `# Product Requirements Document

## Project Overview
[Project description and objectives]

## User Stories
[User stories and acceptance criteria]

## Technical Requirements
[Technical specifications and constraints]

## Success Metrics
[Key performance indicators and success criteria]
`;
    }

    private getArchitectureTemplateContent(analysis: ProjectAnalysis): string {
        return `# Technical Architecture Document

## System Overview
Project Type: ${analysis.type}
Framework: ${analysis.framework}
Language: ${analysis.language}

## Architecture Decisions
[Key architectural decisions and rationale]

## Technology Stack
[Selected technologies and justification]

## System Design
[High-level system design and components]

## Implementation Plan
[Development approach and milestones]
`;
    }

    private getChecklistTemplateContent(): string {
        return `# Development Checklist

## Planning Phase
- [ ] Requirements analysis complete
- [ ] Architecture design approved
- [ ] Technology stack selected

## Development Phase
- [ ] Core functionality implemented
- [ ] Testing framework setup
- [ ] Security measures implemented

## Deployment Phase
- [ ] Production environment configured
- [ ] Monitoring and logging setup
- [ ] Documentation complete
`;
    }

    private getPmChecklistContent(): string {
        return `# Product Manager Checklist

## Requirements Gathering
- [ ] Stakeholder interviews conducted
- [ ] User personas defined
- [ ] Use cases documented

## PRD Development
- [ ] Business objectives defined
- [ ] Success metrics established
- [ ] Technical requirements specified
`;
    }

    private getArchitectChecklistContent(): string {
        return `# Architect Checklist

## Architecture Design
- [ ] System architecture documented
- [ ] Technology decisions justified
- [ ] Non-functional requirements addressed

## Technical Review
- [ ] Security considerations evaluated
- [ ] Performance requirements defined
- [ ] Scalability plan established
`;
    }

    private getSecurityChecklistContent(): string {
        return `# Security Checklist

## Security Assessment
- [ ] Threat model created
- [ ] Vulnerability assessment completed
- [ ] Security controls implemented

## Compliance Review
- [ ] Regulatory requirements reviewed
- [ ] Data protection measures implemented
- [ ] Security policies documented
`;
    }

    private getBmadKnowledgeBaseContent(): string {
        return `# BMAD Knowledge Base

## BMAD Method Overview
The Breakthrough Method of Agile (AI-driven) Development (BMAD) is a comprehensive framework for managing software projects using collaborative AI agents.

## Core Principles
1. Collaborative Intelligence
2. Iterative Development
3. Quality Assurance
4. Continuous Improvement

## AI Agent Roles
- Product Manager (John): Requirements and planning
- Architect (Fred): Technical design and architecture
- Design Architect (Jane): UI/UX and frontend
- Security Engineer (Sage): Security and compliance
- Platform Engineer (Alex): Infrastructure and DevOps
- Task Breakdown Specialist (Tyler): Task management
- Technical Writer (Taylor): Documentation
`;
    }

    private getIdeOrchestratorConfigContent(analysis: ProjectAnalysis): string {
        return `# Configuration for IDE Agents

## Data Resolution
agent-root: (project-root)/bmad-agent
checklists: (agent-root)/checklists
data: (agent-root)/data
personas: (agent-root)/personas
tasks: (agent-root)/tasks
templates: (agent-root)/templates

## Agent Definitions

### Product Manager
- Name: John
- Description: Product requirements and planning
- Persona: pm.md
- Tasks: [Create PRD], [Correct Course]

### Architect  
- Name: Fred
- Description: System architecture and technical design
- Persona: architect.md
- Tasks: [Create Architecture], [Technical Review]

### Design Architect
- Name: Jane
- Description: UI/UX and frontend architecture
- Persona: design-architect.md
- Tasks: [Create Frontend Architecture], [UI Specification]
`;
    }
}
