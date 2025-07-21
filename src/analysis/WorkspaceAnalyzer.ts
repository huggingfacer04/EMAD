import * as vscode from 'vscode';
import * as path from 'path';
import { 
    ProjectAnalysis, 
    ProjectType, 
    ComplexityLevel, 
    BMadMode, 
    AgentId, 
    WorkspaceAnalysisResult,
    TechnologyStack,
    AgentRecommendation
} from '../types/BMadTypes';
// ProjectTypeDetector will be implemented inline for now

export class WorkspaceAnalyzer {
    constructor() {
        // Initialize any required components
    }

    /**
     * Perform comprehensive workspace analysis
     */
    async analyzeWorkspace(workspaceFolder?: vscode.WorkspaceFolder): Promise<WorkspaceAnalysisResult> {
        const folder = workspaceFolder || vscode.workspace.workspaceFolders?.[0];
        if (!folder) {
            throw new Error('No workspace folder available for analysis');
        }

        try {
            // Analyze project characteristics
            const projectAnalysis = await this.analyzeProject(folder);
            
            // Check for existing BMAD setup
            const existingBmadSetup = await this.checkExistingBmadSetup(folder);
            
            // Generate recommendations
            const recommendations = await this.generateRecommendations(projectAnalysis);

            return {
                projectAnalysis,
                existingBmadSetup: existingBmadSetup.exists,
                bmadConfigPath: existingBmadSetup.configPath,
                needsInitialization: !existingBmadSetup.exists,
                recommendations
            };
        } catch (error) {
            console.error('Workspace analysis failed:', error);
            throw new Error(`Failed to analyze workspace: ${error}`);
        }
    }

    /**
     * Analyze project characteristics and technology stack
     */
    async analyzeProject(workspaceFolder: vscode.WorkspaceFolder): Promise<ProjectAnalysis> {
        const projectPath = workspaceFolder.uri.fsPath;

        // Read and analyze configuration files
        const packageJson = await this.readPackageJson(projectPath);
        const requirementsTxt = await this.readRequirementsTxt(projectPath);
        const cargoToml = await this.readCargoToml(projectPath);
        const pomXml = await this.readPomXml(projectPath);

        // Detect project type and framework
        const projectType = this.determineProjectType(
            packageJson, requirementsTxt, cargoToml, pomXml
        );

        const framework = this.detectFramework(packageJson);
        const language = this.detectLanguage(
            packageJson, requirementsTxt, cargoToml, pomXml
        );

        // Analyze project characteristics
        const hasDatabase = this.detectDatabase(packageJson, requirementsTxt);
        const hasAuthentication = this.detectAuthentication(packageJson, requirementsTxt);
        const hasFrontend = this.detectFrontend(packageJson);
        const hasBackend = this.detectBackend(packageJson, requirementsTxt);
        const hasDocker = await this.detectDocker(projectPath);
        const hasKubernetes = await this.detectKubernetes(projectPath);
        const hasTests = this.detectTests(packageJson, requirementsTxt);
        const hasCICD = await this.detectCICD(projectPath);

        // Calculate complexity
        const complexity = this.calculateComplexity(packageJson, requirementsTxt, {
            hasDatabase,
            hasAuthentication,
            hasFrontend,
            hasBackend,
            hasDocker,
            hasKubernetes,
            hasTests,
            hasCICD
        });

        // Extract dependencies
        const dependencies = this.extractDependencies(packageJson, requirementsTxt);
        const devDependencies = this.extractDevDependencies(packageJson);

        // Generate recommendations
        const recommendedMode = this.recommendMode(projectType, complexity);
        const recommendedAgents = this.recommendAgents(projectType, {
            hasDatabase,
            hasAuthentication,
            hasFrontend,
            hasBackend,
            hasDocker,
            hasKubernetes
        });

        // Calculate confidence score
        const confidence = this.calculateConfidence(projectType, framework, language);

        return {
            type: projectType,
            framework,
            language,
            complexity,
            hasDatabase,
            hasAuthentication,
            hasFrontend,
            hasBackend,
            hasDocker,
            hasKubernetes,
            hasTests,
            hasCICD,
            dependencies,
            devDependencies,
            recommendedMode,
            recommendedAgents,
            confidence
        };
    }

    /**
     * Check for existing BMAD setup in workspace
     */
    private async checkExistingBmadSetup(workspaceFolder: vscode.WorkspaceFolder): Promise<{
        exists: boolean;
        configPath?: string;
    }> {
        const bmadPath = path.join(workspaceFolder.uri.fsPath, 'bmad-agent');
        
        try {
            const bmadUri = vscode.Uri.file(bmadPath);
            const stat = await vscode.workspace.fs.stat(bmadUri);
            
            if (stat.type === vscode.FileType.Directory) {
                // Check for configuration file
                const configPath = path.join(bmadPath, 'bmad-config.json');
                try {
                    await vscode.workspace.fs.stat(vscode.Uri.file(configPath));
                    return { exists: true, configPath };
                } catch {
                    return { exists: true }; // Directory exists but no config
                }
            }
        } catch {
            // Directory doesn't exist
        }

        return { exists: false };
    }

    /**
     * Generate intelligent recommendations based on project analysis
     */
    private async generateRecommendations(projectAnalysis: ProjectAnalysis): Promise<{
        mode: BMadMode;
        agents: AgentRecommendation[];
        actions: string[];
    }> {
        const mode = projectAnalysis.recommendedMode;
        const agents = await this.generateAgentRecommendations(projectAnalysis);
        const actions = this.generateActionRecommendations(projectAnalysis);

        return { mode, agents, actions };
    }

    /**
     * Generate agent recommendations with reasoning
     */
    private async generateAgentRecommendations(analysis: ProjectAnalysis): Promise<AgentRecommendation[]> {
        const recommendations: AgentRecommendation[] = [];

        // Always recommend core agents
        recommendations.push({
            agent: { id: 'john', name: 'John', title: 'Product Manager', description: 'Product requirements and planning', persona: 'pm', tasks: [], specializations: ['requirements', 'planning'] },
            reason: 'Essential for product requirements and project planning',
            confidence: 1.0,
            required: true
        });

        recommendations.push({
            agent: { id: 'fred', name: 'Fred', title: 'Architect', description: 'System architecture and technical design', persona: 'architect', tasks: [], specializations: ['architecture', 'design'] },
            reason: 'Required for technical architecture and system design',
            confidence: 1.0,
            required: true
        });

        // Conditional recommendations based on project characteristics
        if (analysis.hasFrontend) {
            recommendations.push({
                agent: { id: 'jane', name: 'Jane', title: 'Design Architect', description: 'UI/UX and frontend architecture', persona: 'design-architect', tasks: [], specializations: ['frontend', 'ui-ux'] },
                reason: 'Frontend components detected - UI/UX expertise needed',
                confidence: 0.9,
                required: false
            });
        }

        if (analysis.hasAuthentication || analysis.hasDatabase) {
            recommendations.push({
                agent: { id: 'sage', name: 'Sage', title: 'Security Engineer', description: 'Security analysis and vulnerability assessment', persona: 'security-engineer', tasks: [], specializations: ['security', 'compliance'] },
                reason: 'Authentication/database detected - security expertise recommended',
                confidence: 0.8,
                required: false
            });
        }

        if (analysis.hasDocker || analysis.hasKubernetes) {
            recommendations.push({
                agent: { id: 'alex', name: 'Alex', title: 'Platform Engineer', description: 'Infrastructure and DevOps', persona: 'platform-engineer', tasks: [], specializations: ['infrastructure', 'devops'] },
                reason: 'Containerization/orchestration detected - infrastructure expertise needed',
                confidence: 0.85,
                required: false
            });
        }

        if (analysis.complexity === 'complex' || analysis.complexity === 'enterprise') {
            recommendations.push({
                agent: { id: 'tyler', name: 'Tyler', title: 'Task Breakdown Specialist', description: 'Task management and workflow organization', persona: 'task-breakdown-specialist', tasks: [], specializations: ['task-management', 'workflow'] },
                reason: 'Complex project detected - task breakdown expertise recommended',
                confidence: 0.75,
                required: false
            });
        }

        return recommendations;
    }

    /**
     * Generate action recommendations
     */
    private generateActionRecommendations(analysis: ProjectAnalysis): string[] {
        const actions: string[] = [];

        if (analysis.confidence < 0.7) {
            actions.push('Review project structure manually for better analysis');
        }

        if (!analysis.hasTests) {
            actions.push('Consider adding testing framework');
        }

        if (!analysis.hasCICD) {
            actions.push('Set up CI/CD pipeline for automated deployment');
        }

        if (analysis.hasAuthentication && !analysis.dependencies.some(dep => 
            dep.includes('security') || dep.includes('auth') || dep.includes('jwt'))) {
            actions.push('Review security dependencies and authentication setup');
        }

        return actions;
    }

    // Helper methods for file reading using modern VS Code APIs
    private async readPackageJson(projectPath: string): Promise<any> {
        try {
            const packagePath = path.join(projectPath, 'package.json');
            const packageUri = vscode.Uri.file(packagePath);
            const packageData = await vscode.workspace.fs.readFile(packageUri);
            const content = new TextDecoder().decode(packageData);
            return JSON.parse(content);
        } catch {
            return null;
        }
    }

    private async readRequirementsTxt(projectPath: string): Promise<string[]> {
        try {
            const reqPath = path.join(projectPath, 'requirements.txt');
            const reqUri = vscode.Uri.file(reqPath);
            const reqData = await vscode.workspace.fs.readFile(reqUri);
            const content = new TextDecoder().decode(reqData);
            return content.split('\n').filter(line => line.trim());
        } catch {
            return [];
        }
    }

    private async readCargoToml(projectPath: string): Promise<any> {
        try {
            const cargoPath = path.join(projectPath, 'Cargo.toml');
            const cargoUri = vscode.Uri.file(cargoPath);
            const cargoData = await vscode.workspace.fs.readFile(cargoUri);
            const content = new TextDecoder().decode(cargoData);
            // Simple TOML parsing - in production, use a proper TOML parser
            return { exists: true, content };
        } catch {
            return null;
        }
    }

    private async readPomXml(projectPath: string): Promise<any> {
        try {
            const pomPath = path.join(projectPath, 'pom.xml');
            const pomUri = vscode.Uri.file(pomPath);
            const pomData = await vscode.workspace.fs.readFile(pomUri);
            const content = new TextDecoder().decode(pomData);
            return { exists: true, content };
        } catch {
            return null;
        }
    }

    // Detection methods
    private detectDatabase(packageJson: any, requirements: string[]): boolean {
        if (packageJson) {
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            const dbLibs = ['mongoose', 'sequelize', 'typeorm', 'prisma', 'pg', 'mysql', 'sqlite3'];
            return dbLibs.some(lib => deps[lib]);
        }
        
        return requirements.some(req => 
            req.includes('django') || req.includes('sqlalchemy') || req.includes('psycopg2')
        );
    }

    private detectAuthentication(packageJson: any, requirements: string[]): boolean {
        if (packageJson) {
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            const authLibs = ['passport', 'jsonwebtoken', 'bcrypt', 'auth0', 'firebase-auth'];
            return authLibs.some(lib => deps[lib]);
        }
        
        return requirements.some(req => 
            req.includes('django-auth') || req.includes('flask-login') || req.includes('jwt')
        );
    }

    private detectFrontend(packageJson: any): boolean {
        if (!packageJson) return false;
        
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        const frontendLibs = ['react', 'vue', 'angular', '@angular/core', 'svelte'];
        return frontendLibs.some(lib => deps[lib]);
    }

    private detectBackend(packageJson: any, requirements: string[]): boolean {
        if (packageJson) {
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            const backendLibs = ['express', 'fastify', '@nestjs/core', 'koa'];
            if (backendLibs.some(lib => deps[lib])) return true;
        }
        
        return requirements.some(req => 
            req.includes('django') || req.includes('flask') || req.includes('fastapi')
        );
    }

    private async detectDocker(projectPath: string): Promise<boolean> {
        try {
            const dockerPath = path.join(projectPath, 'Dockerfile');
            await vscode.workspace.fs.stat(vscode.Uri.file(dockerPath));
            return true;
        } catch {
            return false;
        }
    }

    private async detectKubernetes(projectPath: string): Promise<boolean> {
        try {
            const k8sPath = path.join(projectPath, 'k8s');
            await vscode.workspace.fs.stat(vscode.Uri.file(k8sPath));
            return true;
        } catch {
            return false;
        }
    }

    private detectTests(packageJson: any, requirements: string[]): boolean {
        if (packageJson) {
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            const testLibs = ['jest', 'mocha', 'chai', 'cypress', 'playwright', '@testing-library'];
            if (testLibs.some(lib => deps[lib] || Object.keys(deps).some(key => key.includes(lib)))) {
                return true;
            }
        }
        
        return requirements.some(req => 
            req.includes('pytest') || req.includes('unittest') || req.includes('nose')
        );
    }

    private async detectCICD(projectPath: string): Promise<boolean> {
        const cicdPaths = [
            '.github/workflows',
            '.gitlab-ci.yml',
            'azure-pipelines.yml',
            'Jenkinsfile'
        ];

        for (const ciPath of cicdPaths) {
            try {
                const fullPath = path.join(projectPath, ciPath);
                await vscode.workspace.fs.stat(vscode.Uri.file(fullPath));
                return true;
            } catch {
                // Continue checking other paths
            }
        }

        return false;
    }

    private calculateComplexity(packageJson: any, requirements: string[], features: any): ComplexityLevel {
        let score = 0;

        // Base complexity from dependencies
        if (packageJson) {
            const totalDeps = Object.keys(packageJson.dependencies || {}).length + 
                            Object.keys(packageJson.devDependencies || {}).length;
            score += Math.min(totalDeps / 10, 3);
        }

        score += requirements.length / 5;

        // Feature complexity
        if (features.hasDatabase) score += 1;
        if (features.hasAuthentication) score += 1;
        if (features.hasFrontend && features.hasBackend) score += 2;
        if (features.hasDocker) score += 1;
        if (features.hasKubernetes) score += 2;
        if (features.hasTests) score += 0.5;
        if (features.hasCICD) score += 1;

        if (score < 2) return 'simple';
        if (score < 5) return 'moderate';
        if (score < 8) return 'complex';
        return 'enterprise';
    }

    private extractDependencies(packageJson: any, requirements: string[]): string[] {
        const deps: string[] = [];
        
        if (packageJson?.dependencies) {
            deps.push(...Object.keys(packageJson.dependencies));
        }
        
        deps.push(...requirements.map(req => req.split('==')[0].split('>=')[0].trim()));
        
        return deps;
    }

    private extractDevDependencies(packageJson: any): string[] {
        return packageJson?.devDependencies ? Object.keys(packageJson.devDependencies) : [];
    }

    private recommendMode(projectType: ProjectType, complexity: ComplexityLevel): BMadMode {
        // Default to documentation mode for most projects
        if (complexity === 'simple' || complexity === 'moderate') {
            return 'documentation';
        }
        
        // Complex projects might benefit from full development mode
        if (complexity === 'complex' || complexity === 'enterprise') {
            return 'fullDevelopment';
        }
        
        return 'documentation';
    }

    private recommendAgents(projectType: ProjectType, features: any): AgentId[] {
        const agents: AgentId[] = ['john', 'fred']; // Always include PM and Architect
        
        if (features.hasFrontend) agents.push('jane');
        if (features.hasAuthentication || features.hasDatabase) agents.push('sage');
        if (features.hasDocker || features.hasKubernetes) agents.push('alex');
        
        return agents;
    }

    private calculateConfidence(projectType: ProjectType, framework: string, language: string): number {
        let confidence = 0.5; // Base confidence

        if (projectType !== 'unknown') confidence += 0.3;
        if (framework !== 'Unknown') confidence += 0.2;
        if (language !== 'Unknown') confidence += 0.1;

        return Math.min(confidence, 1.0);
    }

    // Project Type Detection Methods
    private determineProjectType(packageJson: any, requirements: string[], cargoToml: any, pomXml: any): ProjectType {
        // JavaScript/TypeScript projects
        if (packageJson) {
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

            // React projects
            if (deps.react) {
                return deps.express || deps.fastify || deps['@nestjs/core'] ? 'fullstack-web' : 'react-frontend';
            }

            // Vue projects
            if (deps.vue) {
                return 'vue-frontend';
            }

            // Angular projects
            if (deps['@angular/core']) {
                return 'angular-frontend';
            }

            // Node.js API projects
            if (deps.express || deps.fastify || deps['@nestjs/core']) {
                return 'nodejs-api';
            }

            // Mobile apps
            if (deps['react-native'] || deps['@react-native-community/cli']) {
                return 'mobile-app';
            }

            // Desktop apps
            if (deps.electron || deps['@tauri-apps/api']) {
                return 'desktop-app';
            }
        }

        // Python projects
        if (requirements.length > 0) {
            const reqString = requirements.join(' ').toLowerCase();

            if (reqString.includes('django') || reqString.includes('flask') || reqString.includes('fastapi')) {
                return 'python-api';
            }
        }

        // Rust projects
        if (cargoToml) {
            return 'rust-api';
        }

        // Java projects
        if (pomXml) {
            return 'nodejs-api'; // Simplified for now
        }

        return 'unknown';
    }

    private detectFramework(packageJson: any): string {
        if (!packageJson) return 'Unknown';

        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        if (deps.react) return 'React';
        if (deps.vue) return 'Vue';
        if (deps['@angular/core']) return 'Angular';
        if (deps.svelte) return 'Svelte';
        if (deps.express) return 'Express';
        if (deps.fastify) return 'Fastify';
        if (deps['@nestjs/core']) return 'NestJS';
        if (deps['react-native']) return 'React Native';
        if (deps.electron) return 'Electron';

        return 'Unknown';
    }

    private detectLanguage(packageJson: any, requirements: string[], cargoToml: any, pomXml: any): string {
        if (packageJson) {
            // Check for TypeScript
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            if (deps.typescript || deps['@types/node']) {
                return 'TypeScript';
            }
            return 'JavaScript';
        }

        if (requirements.length > 0) {
            return 'Python';
        }

        if (cargoToml) {
            return 'Rust';
        }

        if (pomXml) {
            return 'Java';
        }

        return 'Unknown';
    }
}
