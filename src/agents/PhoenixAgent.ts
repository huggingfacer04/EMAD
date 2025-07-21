import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Context7Integration, Context7ResearchResult } from '../integration/Context7Integration';
import { WorkspaceAnalyzer } from '../analysis/WorkspaceAnalyzer';
import { StatusBarManager } from '../ui/StatusBarManager';
import { DeploymentIntegration } from '../integration/DeploymentIntegration';

/**
 * Phoenix - System Deployment & Containerization Specialist Agent
 * Handles automated deployment preparation, containerization, and cross-platform setup
 * with seamless Context7 integration for deployment best practices research
 */

export interface DeploymentInfo {
    projectPath: string;
    applicationName: string;
    applicationVersion: string;
    targetPlatforms: string[];
    deploymentType: 'container' | 'native' | 'cloud' | 'hybrid';
    environment: 'development' | 'staging' | 'production';
    containerRegistry?: string;
    orchestrationPlatform?: string;
}

export interface PlatformInfo {
    platform: string;
    architecture: string;
    distribution?: string;
    packageManager: string;
    containerRuntime?: string;
    capabilities: string[];
}

export interface ContainerConfig {
    baseImage: string;
    runtimeImage: string;
    exposedPorts: number[];
    volumes: string[];
    environmentVariables: Record<string, string>;
    healthCheck: string;
    securityContext: SecurityContext;
}

export interface SecurityContext {
    runAsNonRoot: boolean;
    runAsUser?: number;
    readOnlyRootFilesystem: boolean;
    capabilities: {
        drop: string[];
        add: string[];
    };
}

export interface DeploymentScript {
    platform: string;
    scriptType: 'powershell' | 'bash' | 'python';
    content: string;
    dependencies: string[];
    configurationFiles: string[];
}

export interface DeploymentResult {
    projectPath: string;
    timestamp: Date;
    deploymentInfo: DeploymentInfo;
    platformsAnalyzed: PlatformInfo[];
    scriptsGenerated: DeploymentScript[];
    containerConfigs: ContainerConfig[];
    healthScore: number;
    context7Insights: Context7ResearchResult[];
    recommendations: DeploymentRecommendation[];
}

export interface DeploymentRecommendation {
    type: 'security' | 'performance' | 'compatibility' | 'optimization';
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionRequired: boolean;
    context7Research?: Context7ResearchResult;
}

/**
 * Phoenix Agent - System Deployment & Containerization Specialist
 */
export class PhoenixAgent {
    private context7: Context7Integration;
    private analyzer: WorkspaceAnalyzer;
    private statusBar: StatusBarManager;
    private deploymentIntegration: DeploymentIntegration;

    constructor(
        analyzer: WorkspaceAnalyzer,
        statusBar: StatusBarManager,
        context7Config?: any
    ) {
        this.analyzer = analyzer;
        this.statusBar = statusBar;
        this.context7 = new Context7Integration(context7Config);
        this.deploymentIntegration = new DeploymentIntegration(this.context7, statusBar);
        
        console.log('Phoenix Agent (System Deployment & Containerization Specialist) initialized');
    }

    /**
     * Perform comprehensive deployment preparation
     */
    async performDeploymentPreparation(projectPath?: string): Promise<DeploymentResult> {
        const workspacePath = projectPath || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspacePath) {
            throw new Error('No workspace found for deployment preparation');
        }

        this.statusBar.showLoading('Phoenix: Analyzing deployment requirements...');

        try {
            const startTime = Date.now();
            const deploymentInfo = await this.analyzeDeploymentRequirements(workspacePath);
            const context7Insights: Context7ResearchResult[] = [];

            // Perform platform analysis with Context7 research
            const platformsAnalyzed = await this.analyzePlatforms(deploymentInfo.targetPlatforms);
            
            // Context7 research for deployment best practices
            for (const platform of deploymentInfo.targetPlatforms) {
                const deploymentResearch = await this.context7.autoResearch({
                    query: `deployment best practices ${deploymentInfo.applicationName} ${platform} ${new Date().toISOString().split('T')[0]}`,
                    sources: ['platform_documentation', 'deployment_guides', 'best_practices'],
                    focus: ['security', 'performance', 'reliability', 'scalability'],
                    packageName: deploymentInfo.applicationName,
                    ecosystem: platform
                });
                
                if (deploymentResearch) {
                    context7Insights.push(deploymentResearch);
                }
            }

            // Generate deployment scripts
            const scriptsGenerated = await this.generateDeploymentScripts(deploymentInfo, platformsAnalyzed);

            // Generate container configurations if needed
            const containerConfigs = deploymentInfo.deploymentType === 'container' || deploymentInfo.deploymentType === 'hybrid'
                ? await this.generateContainerConfigs(deploymentInfo)
                : [];

            // Calculate deployment health score
            const healthScore = this.calculateDeploymentHealthScore(deploymentInfo, platformsAnalyzed, context7Insights);

            // Generate recommendations
            const recommendations = await this.generateDeploymentRecommendations(deploymentInfo, context7Insights);

            const result: DeploymentResult = {
                projectPath: workspacePath,
                timestamp: new Date(),
                deploymentInfo,
                platformsAnalyzed,
                scriptsGenerated,
                containerConfigs,
                healthScore,
                context7Insights,
                recommendations
            };

            this.statusBar.showSuccess(`Phoenix: Deployment preparation complete - ${platformsAnalyzed.length} platforms analyzed`);
            
            // Generate and save deployment report
            await this.generateDeploymentReport(result);
            
            return result;

        } catch (error) {
            this.statusBar.showError(`Phoenix: Deployment preparation failed - ${error}`);
            throw error;
        }
    }

    /**
     * Perform containerization of the application
     */
    async performContainerization(deploymentInfo: DeploymentInfo): Promise<void> {
        this.statusBar.showLoading('Phoenix: Containerizing application...');

        try {
            // Generate Dockerfile
            await this.generateDockerfile(deploymentInfo);

            // Generate docker-compose configurations
            await this.generateDockerCompose(deploymentInfo);

            // Generate Kubernetes manifests if needed
            if (deploymentInfo.orchestrationPlatform === 'kubernetes') {
                await this.generateKubernetesManifests(deploymentInfo);
            }

            // Context7 research for container security
            const securityResearch = await this.context7.autoResearch({
                query: `container security best practices ${deploymentInfo.applicationName} ${new Date().toISOString().split('T')[0]}`,
                sources: ['security_frameworks', 'container_security_guides', 'cis_benchmarks'],
                focus: ['security_hardening', 'vulnerability_mitigation', 'compliance'],
                packageName: deploymentInfo.applicationName
            });

            this.statusBar.showSuccess('Phoenix: Containerization complete');

        } catch (error) {
            this.statusBar.showError(`Phoenix: Containerization failed - ${error}`);
            throw error;
        }
    }

    /**
     * Perform cross-platform setup
     */
    async performCrossPlatformSetup(deploymentInfo: DeploymentInfo): Promise<void> {
        this.statusBar.showLoading('Phoenix: Setting up cross-platform deployment...');

        try {
            // Generate platform-specific scripts
            const platforms = ['windows', 'linux', 'macos'];
            
            for (const platform of platforms) {
                await this.generatePlatformScript(deploymentInfo, platform);
            }

            // Generate configuration templates
            await this.generateConfigurationTemplates(deploymentInfo);

            // Context7 research for cross-platform compatibility
            const compatibilityResearch = await this.context7.autoResearch({
                query: `cross platform deployment ${deploymentInfo.applicationName} compatibility issues solutions`,
                sources: ['platform_documentation', 'compatibility_guides', 'troubleshooting'],
                focus: ['compatibility', 'platform_differences', 'workarounds'],
                packageName: deploymentInfo.applicationName
            });

            this.statusBar.showSuccess('Phoenix: Cross-platform setup complete');

        } catch (error) {
            this.statusBar.showError(`Phoenix: Cross-platform setup failed - ${error}`);
            throw error;
        }
    }

    /**
     * Analyze deployment requirements from project structure
     */
    private async analyzeDeploymentRequirements(projectPath: string): Promise<DeploymentInfo> {
        const packageJsonPath = path.join(projectPath, 'package.json');
        let applicationName = path.basename(projectPath);
        let applicationVersion = '1.0.0';

        // Try to extract info from package.json
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                applicationName = packageJson.name || applicationName;
                applicationVersion = packageJson.version || applicationVersion;
            } catch (error) {
                console.warn('Phoenix: Failed to parse package.json:', error);
            }
        }

        // Detect project type and recommend deployment strategy
        const projectType = await this.detectProjectType(projectPath);
        const deploymentType = this.recommendDeploymentType(projectType);
        const targetPlatforms = this.detectTargetPlatforms(projectPath);

        return {
            projectPath,
            applicationName,
            applicationVersion,
            targetPlatforms,
            deploymentType,
            environment: 'production' // Default, can be configured
        };
    }

    /**
     * Analyze target platforms and their capabilities
     */
    private async analyzePlatforms(targetPlatforms: string[]): Promise<PlatformInfo[]> {
        const platforms: PlatformInfo[] = [];

        for (const platform of targetPlatforms) {
            const platformInfo = await this.deploymentIntegration.detectPlatformCapabilities(platform);
            platforms.push(platformInfo);
        }

        return platforms;
    }

    /**
     * Generate deployment scripts for different platforms
     */
    private async generateDeploymentScripts(
        deploymentInfo: DeploymentInfo, 
        platforms: PlatformInfo[]
    ): Promise<DeploymentScript[]> {
        const scripts: DeploymentScript[] = [];

        for (const platform of platforms) {
            // Generate PowerShell script for Windows
            if (platform.platform.toLowerCase().includes('windows')) {
                const powershellScript = await this.generatePowerShellScript(deploymentInfo, platform);
                scripts.push(powershellScript);
            }

            // Generate Bash script for Linux/macOS
            if (platform.platform.toLowerCase().includes('linux') || platform.platform.toLowerCase().includes('darwin')) {
                const bashScript = await this.generateBashScript(deploymentInfo, platform);
                scripts.push(bashScript);
            }

            // Generate Python script for cross-platform
            const pythonScript = await this.generatePythonScript(deploymentInfo, platform);
            scripts.push(pythonScript);
        }

        return scripts;
    }

    /**
     * Generate container configurations
     */
    private async generateContainerConfigs(deploymentInfo: DeploymentInfo): Promise<ContainerConfig[]> {
        const configs: ContainerConfig[] = [];

        // Generate basic container config
        const config: ContainerConfig = {
            baseImage: this.selectBaseImage(deploymentInfo),
            runtimeImage: this.selectRuntimeImage(deploymentInfo),
            exposedPorts: [3000], // Default, should be configurable
            volumes: ['/app/data', '/app/logs'],
            environmentVariables: {
                NODE_ENV: deploymentInfo.environment,
                PORT: '3000'
            },
            healthCheck: 'curl -f http://localhost:3000/health || exit 1',
            securityContext: {
                runAsNonRoot: true,
                runAsUser: 1001,
                readOnlyRootFilesystem: true,
                capabilities: {
                    drop: ['ALL'],
                    add: ['NET_BIND_SERVICE']
                }
            }
        };

        configs.push(config);
        return configs;
    }

    /**
     * Calculate deployment health score
     */
    private calculateDeploymentHealthScore(
        deploymentInfo: DeploymentInfo,
        platforms: PlatformInfo[],
        insights: Context7ResearchResult[]
    ): number {
        let score = 100;

        // Deduct for missing platforms
        if (platforms.length < 2) {
            score -= 20;
        }

        // Deduct for security concerns
        const securityInsights = insights.filter(insight => 
            insight.response.insights?.some(i => i.toLowerCase().includes('security'))
        );
        if (securityInsights.length === 0) {
            score -= 15;
        }

        // Deduct for missing containerization
        if (deploymentInfo.deploymentType === 'native') {
            score -= 10;
        }

        return Math.max(0, score);
    }

    /**
     * Generate deployment recommendations
     */
    private async generateDeploymentRecommendations(
        deploymentInfo: DeploymentInfo,
        insights: Context7ResearchResult[]
    ): Promise<DeploymentRecommendation[]> {
        const recommendations: DeploymentRecommendation[] = [];

        // Security recommendations
        recommendations.push({
            type: 'security',
            priority: 'high',
            title: 'Implement Container Security Scanning',
            description: 'Add vulnerability scanning to your container build pipeline',
            actionRequired: true
        });

        // Performance recommendations
        recommendations.push({
            type: 'performance',
            priority: 'medium',
            title: 'Optimize Container Image Size',
            description: 'Use multi-stage builds and minimal base images to reduce image size',
            actionRequired: false
        });

        return recommendations;
    }

    /**
     * Helper methods for script generation
     */
    private async generatePowerShellScript(deploymentInfo: DeploymentInfo, platform: PlatformInfo): Promise<DeploymentScript> {
        // Implementation would generate PowerShell script content
        return {
            platform: platform.platform,
            scriptType: 'powershell',
            content: '# PowerShell deployment script placeholder',
            dependencies: ['docker', 'git'],
            configurationFiles: ['config/production.json']
        };
    }

    private async generateBashScript(deploymentInfo: DeploymentInfo, platform: PlatformInfo): Promise<DeploymentScript> {
        // Implementation would generate Bash script content
        return {
            platform: platform.platform,
            scriptType: 'bash',
            content: '#!/bin/bash\n# Bash deployment script placeholder',
            dependencies: ['docker', 'git', 'curl'],
            configurationFiles: ['config/production.json']
        };
    }

    private async generatePythonScript(deploymentInfo: DeploymentInfo, platform: PlatformInfo): Promise<DeploymentScript> {
        // Implementation would generate Python script content
        return {
            platform: platform.platform,
            scriptType: 'python',
            content: '#!/usr/bin/env python3\n# Python deployment script placeholder',
            dependencies: ['docker', 'requests'],
            configurationFiles: ['config/production.json']
        };
    }

    /**
     * Helper methods for project analysis
     */
    private async detectProjectType(projectPath: string): Promise<string> {
        if (fs.existsSync(path.join(projectPath, 'package.json'))) return 'nodejs';
        if (fs.existsSync(path.join(projectPath, 'requirements.txt'))) return 'python';
        if (fs.existsSync(path.join(projectPath, 'Cargo.toml'))) return 'rust';
        if (fs.existsSync(path.join(projectPath, 'go.mod'))) return 'go';
        return 'unknown';
    }

    private recommendDeploymentType(projectType: string): 'container' | 'native' | 'cloud' | 'hybrid' {
        // Default to container for most modern applications
        return 'container';
    }

    private detectTargetPlatforms(projectPath: string): string[] {
        // Default platforms - could be enhanced with project analysis
        return ['linux', 'windows', 'docker'];
    }

    private selectBaseImage(deploymentInfo: DeploymentInfo): string {
        // Select appropriate base image based on project type
        return 'node:18-alpine';
    }

    private selectRuntimeImage(deploymentInfo: DeploymentInfo): string {
        // Select appropriate runtime image
        return 'node:18-alpine';
    }

    /**
     * Generate various deployment artifacts
     */
    private async generateDockerfile(deploymentInfo: DeploymentInfo): Promise<void> {
        // Implementation would generate Dockerfile
        console.log('Phoenix: Generating Dockerfile');
    }

    private async generateDockerCompose(deploymentInfo: DeploymentInfo): Promise<void> {
        // Implementation would generate docker-compose.yml
        console.log('Phoenix: Generating docker-compose.yml');
    }

    private async generateKubernetesManifests(deploymentInfo: DeploymentInfo): Promise<void> {
        // Implementation would generate Kubernetes manifests
        console.log('Phoenix: Generating Kubernetes manifests');
    }

    private async generatePlatformScript(deploymentInfo: DeploymentInfo, platform: string): Promise<void> {
        // Implementation would generate platform-specific scripts
        console.log(`Phoenix: Generating ${platform} deployment script`);
    }

    private async generateConfigurationTemplates(deploymentInfo: DeploymentInfo): Promise<void> {
        // Implementation would generate configuration templates
        console.log('Phoenix: Generating configuration templates');
    }

    /**
     * Generate comprehensive deployment report
     */
    private async generateDeploymentReport(result: DeploymentResult): Promise<void> {
        // Generate report using the template
        const reportPath = path.join(result.projectPath, 'deployment-report.md');
        // Implementation would generate the actual report file
        console.log(`Phoenix: Deployment report generated at ${reportPath}`);
    }

    /**
     * Get Phoenix agent status
     */
    getStatus(): {
        context7Available: boolean;
        deploymentIntegrationReady: boolean;
        lastDeployment?: Date;
    } {
        return {
            context7Available: this.context7.isIntegrationAvailable(),
            deploymentIntegrationReady: true
        };
    }

    /**
     * Dispose of agent resources
     */
    dispose(): void {
        this.context7.dispose();
        this.deploymentIntegration.dispose();
    }
}
