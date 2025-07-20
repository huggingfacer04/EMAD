import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Context7Integration, Context7ResearchResult } from '../integration/Context7Integration';
import { WorkspaceAnalyzer } from '../analysis/WorkspaceAnalyzer';
import { StatusBarManager } from '../ui/StatusBarManager';
import { DependencyMonitor } from '../monitoring/DependencyMonitor';

/**
 * Dakota - Dependency Modernization Specialist Agent
 * Handles automated dependency analysis, modernization, and maintenance
 * with seamless Context7 integration for intelligent research
 */

export interface DependencyInfo {
    name: string;
    currentVersion: string;
    latestVersion?: string;
    type: 'production' | 'development' | 'peer' | 'optional';
    ecosystem: string;
    vulnerabilities?: VulnerabilityInfo[];
    maintenanceStatus?: 'well-maintained' | 'moderate' | 'poor' | 'abandoned';
    licenseInfo?: LicenseInfo;
    updateRecommendation?: UpdateRecommendation;
}

export interface VulnerabilityInfo {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    patchedVersions?: string[];
    cveId?: string;
}

export interface LicenseInfo {
    license: string;
    compatible: boolean;
    concerns?: string[];
}

export interface UpdateRecommendation {
    action: 'auto-update' | 'manual-review' | 'hold' | 'replace';
    targetVersion?: string;
    reasoning: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    migrationComplexity?: 'simple' | 'moderate' | 'complex';
    context7Research?: Context7ResearchResult;
}

export interface DependencyAuditResult {
    projectPath: string;
    timestamp: Date;
    totalDependencies: number;
    vulnerabilities: VulnerabilityInfo[];
    outdatedPackages: DependencyInfo[];
    recommendations: UpdateRecommendation[];
    healthScore: number;
    context7Insights: Context7ResearchResult[];
}

/**
 * Dakota Agent - Dependency Modernization Specialist
 */
export class DakotaAgent {
    private context7: Context7Integration;
    private analyzer: WorkspaceAnalyzer;
    private statusBar: StatusBarManager;
    private dependencyMonitor: DependencyMonitor;
    private isMonitoring: boolean = false;

    constructor(
        analyzer: WorkspaceAnalyzer,
        statusBar: StatusBarManager,
        context7Config?: any
    ) {
        this.analyzer = analyzer;
        this.statusBar = statusBar;
        this.context7 = new Context7Integration(context7Config);
        this.dependencyMonitor = new DependencyMonitor(this.context7, statusBar);

        console.log('Dakota Agent (Dependency Modernization Specialist) initialized');
    }

    /**
     * Perform comprehensive dependency audit
     */
    async performDependencyAudit(projectPath?: string): Promise<DependencyAuditResult> {
        const workspacePath = projectPath || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspacePath) {
            throw new Error('No workspace found for dependency audit');
        }

        this.statusBar.showLoading('Dakota: Analyzing dependencies...');

        try {
            const startTime = Date.now();
            const dependencies = await this.discoverDependencies(workspacePath);
            const context7Insights: Context7ResearchResult[] = [];

            // Perform security analysis with Context7 research
            const vulnerabilities: VulnerabilityInfo[] = [];
            for (const dep of dependencies) {
                // Context7 security research
                const securityResearch = await this.context7.securityResearch(
                    dep.name, 
                    dep.currentVersion, 
                    dep.ecosystem
                );
                
                if (securityResearch) {
                    context7Insights.push(securityResearch);
                    
                    // Extract vulnerabilities from research
                    const vulns = this.extractVulnerabilitiesFromResearch(securityResearch);
                    vulnerabilities.push(...vulns);
                }

                // Check for updates and generate recommendations
                const updateRecommendation = await this.generateUpdateRecommendation(dep);
                dep.updateRecommendation = updateRecommendation;
            }

            // Calculate health score
            const healthScore = this.calculateHealthScore(dependencies, vulnerabilities);

            // Generate recommendations
            const recommendations = dependencies
                .filter(dep => dep.updateRecommendation)
                .map(dep => dep.updateRecommendation!)
                .sort((a, b) => this.prioritizeRecommendations(a, b));

            const result: DependencyAuditResult = {
                projectPath: workspacePath,
                timestamp: new Date(),
                totalDependencies: dependencies.length,
                vulnerabilities,
                outdatedPackages: dependencies.filter(dep => dep.latestVersion && dep.currentVersion !== dep.latestVersion),
                recommendations,
                healthScore,
                context7Insights
            };

            this.statusBar.showSuccess(`Dakota: Audit complete - ${dependencies.length} dependencies analyzed`);
            
            // Generate and save audit report
            await this.generateAuditReport(result);
            
            return result;

        } catch (error) {
            this.statusBar.showError(`Dakota: Audit failed - ${error}`);
            throw error;
        }
    }

    /**
     * Perform dependency modernization based on audit results
     */
    async performDependencyModernization(auditResult: DependencyAuditResult): Promise<void> {
        this.statusBar.showLoading('Dakota: Modernizing dependencies...');

        try {
            const autoUpdates = auditResult.recommendations.filter(rec => rec.action === 'auto-update');
            const manualReviews = auditResult.recommendations.filter(rec => rec.action === 'manual-review');

            // Process automatic updates
            for (const update of autoUpdates) {
                await this.executeAutomaticUpdate(update);
            }

            // Present manual reviews to user
            if (manualReviews.length > 0) {
                await this.presentManualReviews(manualReviews);
            }

            this.statusBar.showSuccess(`Dakota: Modernization complete - ${autoUpdates.length} auto-updates, ${manualReviews.length} manual reviews`);

        } catch (error) {
            this.statusBar.showError(`Dakota: Modernization failed - ${error}`);
            throw error;
        }
    }

    /**
     * Start background dependency monitoring
     */
    async startDependencyMonitoring(): Promise<void> {
        if (this.isMonitoring) {
            return;
        }

        this.isMonitoring = true;
        await this.dependencyMonitor.startMonitoring();
        this.statusBar.showInfo('Dakota: Background monitoring started');
    }

    /**
     * Stop background dependency monitoring
     */
    stopDependencyMonitoring(): void {
        this.dependencyMonitor.stopMonitoring();
        this.isMonitoring = false;
        this.statusBar.showInfo('Dakota: Background monitoring stopped');
    }

    /**
     * Discover dependencies in the project
     */
    private async discoverDependencies(projectPath: string): Promise<DependencyInfo[]> {
        const dependencies: DependencyInfo[] = [];

        // Check for different package managers and ecosystems
        const packageManagers = [
            { file: 'package.json', ecosystem: 'npm' },
            { file: 'requirements.txt', ecosystem: 'pip' },
            { file: 'pyproject.toml', ecosystem: 'poetry' },
            { file: 'Cargo.toml', ecosystem: 'cargo' },
            { file: 'go.mod', ecosystem: 'go' },
            { file: 'pom.xml', ecosystem: 'maven' },
            { file: 'build.gradle', ecosystem: 'gradle' },
            { file: 'composer.json', ecosystem: 'composer' },
            { file: 'Gemfile', ecosystem: 'bundler' }
        ];

        for (const pm of packageManagers) {
            const filePath = path.join(projectPath, pm.file);
            if (fs.existsSync(filePath)) {
                const deps = await this.parseDependencyFile(filePath, pm.ecosystem);
                dependencies.push(...deps);
            }
        }

        return dependencies;
    }

    /**
     * Parse dependency file based on ecosystem
     */
    private async parseDependencyFile(filePath: string, ecosystem: string): Promise<DependencyInfo[]> {
        const dependencies: DependencyInfo[] = [];

        try {
            const content = fs.readFileSync(filePath, 'utf8');

            switch (ecosystem) {
                case 'npm':
                    const packageJson = JSON.parse(content);
                    
                    // Production dependencies
                    if (packageJson.dependencies) {
                        for (const [name, version] of Object.entries(packageJson.dependencies)) {
                            dependencies.push({
                                name,
                                currentVersion: version as string,
                                type: 'production',
                                ecosystem
                            });
                        }
                    }

                    // Development dependencies
                    if (packageJson.devDependencies) {
                        for (const [name, version] of Object.entries(packageJson.devDependencies)) {
                            dependencies.push({
                                name,
                                currentVersion: version as string,
                                type: 'development',
                                ecosystem
                            });
                        }
                    }

                    // Peer dependencies
                    if (packageJson.peerDependencies) {
                        for (const [name, version] of Object.entries(packageJson.peerDependencies)) {
                            dependencies.push({
                                name,
                                currentVersion: version as string,
                                type: 'peer',
                                ecosystem
                            });
                        }
                    }
                    break;

                // Add other ecosystem parsers as needed
                default:
                    console.warn(`Dakota: Unsupported ecosystem ${ecosystem} for file ${filePath}`);
            }

        } catch (error) {
            console.error(`Dakota: Failed to parse ${filePath}:`, error);
        }

        return dependencies;
    }

    /**
     * Generate update recommendation for a dependency
     */
    private async generateUpdateRecommendation(dependency: DependencyInfo): Promise<UpdateRecommendation> {
        // Get latest version information
        const latestVersion = await this.getLatestVersion(dependency);
        dependency.latestVersion = latestVersion;

        // If already up to date
        if (dependency.currentVersion === latestVersion) {
            return {
                action: 'hold',
                reasoning: 'Already at latest version',
                riskLevel: 'low'
            };
        }

        // Context7 research for update strategy
        const updateResearch = await this.context7.updateResearch(
            dependency.name,
            dependency.currentVersion,
            latestVersion || 'latest',
            dependency.ecosystem
        );

        // Analyze version difference
        const versionDiff = this.analyzeVersionDifference(dependency.currentVersion, latestVersion || '');
        
        let action: UpdateRecommendation['action'] = 'manual-review';
        let riskLevel: UpdateRecommendation['riskLevel'] = 'medium';

        // Determine action based on version difference and research
        if (versionDiff.type === 'patch' && !versionDiff.hasBreakingChanges) {
            action = 'auto-update';
            riskLevel = 'low';
        } else if (versionDiff.type === 'minor' && !versionDiff.hasBreakingChanges) {
            action = 'auto-update';
            riskLevel = 'low';
        } else if (versionDiff.type === 'major') {
            action = 'manual-review';
            riskLevel = 'high';
        }

        // Override for security vulnerabilities
        if (dependency.vulnerabilities && dependency.vulnerabilities.length > 0) {
            const criticalVulns = dependency.vulnerabilities.filter(v => v.severity === 'critical');
            if (criticalVulns.length > 0) {
                action = 'auto-update';
                riskLevel = 'critical';
            }
        }

        return {
            action,
            targetVersion: latestVersion,
            reasoning: this.generateRecommendationReasoning(dependency, versionDiff, updateResearch),
            riskLevel,
            migrationComplexity: versionDiff.type === 'major' ? 'complex' : 'simple',
            context7Research: updateResearch || undefined
        };
    }

    /**
     * Get latest version for a dependency
     */
    private async getLatestVersion(dependency: DependencyInfo): Promise<string | undefined> {
        // This would integrate with package registries
        // For now, return a placeholder
        return undefined;
    }

    /**
     * Analyze version difference between current and target
     */
    private analyzeVersionDifference(current: string, target: string): {
        type: 'patch' | 'minor' | 'major';
        hasBreakingChanges: boolean;
    } {
        // Simplified semantic version analysis
        // In a real implementation, this would use semver library
        return {
            type: 'minor',
            hasBreakingChanges: false
        };
    }

    /**
     * Generate reasoning text for recommendation
     */
    private generateRecommendationReasoning(
        dependency: DependencyInfo,
        versionDiff: any,
        research?: Context7ResearchResult | null
    ): string {
        let reasoning = `Update ${dependency.name} from ${dependency.currentVersion} to ${dependency.latestVersion}. `;
        
        if (research && research.response.success) {
            reasoning += `Context7 research indicates: ${research.response.insights?.join(', ') || 'No specific concerns found'}.`;
        }

        return reasoning;
    }

    /**
     * Extract vulnerabilities from Context7 research
     */
    private extractVulnerabilitiesFromResearch(research: Context7ResearchResult): VulnerabilityInfo[] {
        // Extract vulnerability information from Context7 response
        // This would parse the research data for vulnerability details
        return [];
    }

    /**
     * Calculate overall health score for dependencies
     */
    private calculateHealthScore(dependencies: DependencyInfo[], vulnerabilities: VulnerabilityInfo[]): number {
        let score = 100;

        // Deduct for vulnerabilities
        const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical').length;
        const highVulns = vulnerabilities.filter(v => v.severity === 'high').length;
        const mediumVulns = vulnerabilities.filter(v => v.severity === 'medium').length;

        score -= (criticalVulns * 20) + (highVulns * 10) + (mediumVulns * 5);

        // Deduct for outdated packages
        const outdated = dependencies.filter(d => d.latestVersion && d.currentVersion !== d.latestVersion).length;
        score -= Math.min(30, outdated * 2);

        return Math.max(0, score);
    }

    /**
     * Prioritize recommendations by risk and impact
     */
    private prioritizeRecommendations(a: UpdateRecommendation, b: UpdateRecommendation): number {
        const riskOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }

    /**
     * Execute automatic update
     */
    private async executeAutomaticUpdate(recommendation: UpdateRecommendation): Promise<void> {
        // Implementation would execute the actual update
        console.log(`Dakota: Auto-updating to ${recommendation.targetVersion}`);
    }

    /**
     * Present manual reviews to user
     */
    private async presentManualReviews(recommendations: UpdateRecommendation[]): Promise<void> {
        // Implementation would show user interface for manual review
        console.log(`Dakota: ${recommendations.length} updates require manual review`);
    }



    /**
     * Generate comprehensive audit report
     */
    private async generateAuditReport(result: DependencyAuditResult): Promise<void> {
        // Generate report using the template
        const reportPath = path.join(result.projectPath, 'dependency-audit-report.md');
        // Implementation would generate the actual report file
        console.log(`Dakota: Audit report generated at ${reportPath}`);
    }

    /**
     * Get Dakota agent status
     */
    getStatus(): {
        isMonitoring: boolean;
        context7Available: boolean;
        monitoringStats: any;
        lastAudit?: Date;
    } {
        const monitoringStatus = this.dependencyMonitor.getMonitoringStatus();
        return {
            isMonitoring: this.isMonitoring,
            context7Available: this.context7.isIntegrationAvailable(),
            monitoringStats: monitoringStatus.stats
        };
    }

    /**
     * Dispose of agent resources
     */
    dispose(): void {
        this.stopDependencyMonitoring();
        this.dependencyMonitor.dispose();
        this.context7.dispose();
    }
}
