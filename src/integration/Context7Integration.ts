import * as vscode from 'vscode';

/**
 * Context7 Integration Module for Dakota Agent
 * Provides seamless integration with Upstash Context7 system for dependency research
 * Automatically activates for dependency-related tasks without manual user prompts
 */

export interface Context7Config {
    apiKey?: string;
    baseUrl: string;
    autoActivate: boolean;
    maxRetries: number;
    timeoutMs: number;
    cacheEnabled: boolean;
    cacheTtlMs: number;
}

export interface Context7Query {
    query: string;
    sources?: string[];
    dateContext?: string;
    focus?: string[];
    packageName?: string;
    version?: string;
    ecosystem?: string;
}

export interface Context7Response {
    success: boolean;
    data?: any;
    insights?: string[];
    recommendations?: string[];
    sources?: string[];
    confidence?: number;
    error?: string;
    cached?: boolean;
}

export interface Context7ResearchResult {
    query: Context7Query;
    response: Context7Response;
    timestamp: Date;
    duration: number;
    quality: number;
}

/**
 * Context7 Integration Service
 * Handles automatic research activation and intelligent caching
 */
export class Context7Integration {
    private config: Context7Config;
    private cache: Map<string, { result: Context7Response; timestamp: Date }>;
    private isAvailable: boolean = false;
    private lastHealthCheck: Date | null = null;
    private healthCheckInterval: number = 300000; // 5 minutes

    constructor(config?: Partial<Context7Config>) {
        this.config = {
            baseUrl: 'https://api.context7.dev',
            autoActivate: true,
            maxRetries: 3,
            timeoutMs: 30000,
            cacheEnabled: true,
            cacheTtlMs: 3600000, // 1 hour
            ...config
        };
        
        this.cache = new Map();
        this.initializeIntegration();
    }

    /**
     * Initialize Context7 integration and check availability
     */
    private async initializeIntegration(): Promise<void> {
        try {
            // Check if Context7 is available
            await this.healthCheck();
            
            // Load configuration from VS Code settings
            await this.loadConfiguration();
            
            console.log('Context7 integration initialized successfully');
        } catch (error) {
            console.warn('Context7 integration initialization failed:', error);
            this.isAvailable = false;
        }
    }

    /**
     * Load configuration from VS Code settings
     */
    private async loadConfiguration(): Promise<void> {
        const config = vscode.workspace.getConfiguration('bmad.context7');
        
        this.config.apiKey = config.get('apiKey') || process.env.CONTEXT7_API_KEY;
        this.config.baseUrl = config.get('baseUrl') || this.config.baseUrl;
        this.config.autoActivate = config.get('autoActivate', true);
        this.config.maxRetries = config.get('maxRetries', 3);
        this.config.timeoutMs = config.get('timeoutMs', 30000);
        this.config.cacheEnabled = config.get('cacheEnabled', true);
        this.config.cacheTtlMs = config.get('cacheTtlMs', 3600000);
    }

    /**
     * Check Context7 service health and availability
     */
    private async healthCheck(): Promise<boolean> {
        try {
            const now = new Date();
            
            // Skip if recently checked
            if (this.lastHealthCheck && 
                (now.getTime() - this.lastHealthCheck.getTime()) < this.healthCheckInterval) {
                return this.isAvailable;
            }

            // Simple health check - attempt to reach the service
            const response = await this.makeRequest('/health', 'GET', null, 5000);
            this.isAvailable = response.success;
            this.lastHealthCheck = now;
            
            return this.isAvailable;
        } catch (error) {
            this.isAvailable = false;
            this.lastHealthCheck = new Date();
            return false;
        }
    }

    /**
     * Automatic research activation for dependency tasks
     */
    async autoResearch(query: Context7Query): Promise<Context7ResearchResult | null> {
        if (!this.config.autoActivate || !await this.healthCheck()) {
            return null;
        }

        const startTime = Date.now();
        
        try {
            // Check cache first
            const cacheKey = this.generateCacheKey(query);
            const cached = this.getCachedResult(cacheKey);
            
            if (cached) {
                return {
                    query,
                    response: { ...cached, cached: true },
                    timestamp: new Date(),
                    duration: Date.now() - startTime,
                    quality: this.assessResponseQuality(cached)
                };
            }

            // Perform research
            const response = await this.performResearch(query);
            
            // Cache successful results
            if (response.success && this.config.cacheEnabled) {
                this.setCachedResult(cacheKey, response);
            }

            return {
                query,
                response,
                timestamp: new Date(),
                duration: Date.now() - startTime,
                quality: this.assessResponseQuality(response)
            };

        } catch (error) {
            console.error('Context7 auto-research failed:', error);
            return {
                query,
                response: {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                },
                timestamp: new Date(),
                duration: Date.now() - startTime,
                quality: 0
            };
        }
    }

    /**
     * Perform dependency security research
     */
    async securityResearch(packageName: string, version?: string, ecosystem?: string): Promise<Context7ResearchResult | null> {
        const query: Context7Query = {
            query: `security vulnerabilities ${packageName} ${version || 'latest'} ${new Date().toISOString().split('T')[0]}`,
            sources: ['nvd', 'github_advisories', 'snyk', 'osv'],
            focus: ['security_vulnerabilities', 'cve_details', 'patch_availability', 'exploit_status'],
            packageName,
            version,
            ecosystem,
            dateContext: new Date().toISOString().split('T')[0]
        };

        return await this.autoResearch(query);
    }

    /**
     * Perform dependency update research
     */
    async updateResearch(packageName: string, currentVersion: string, targetVersion: string, ecosystem?: string): Promise<Context7ResearchResult | null> {
        const query: Context7Query = {
            query: `breaking changes migration guide ${packageName} ${currentVersion} to ${targetVersion}`,
            sources: ['official_docs', 'github_releases', 'community_discussions', 'migration_guides'],
            focus: ['breaking_changes', 'migration_steps', 'compatibility_issues', 'rollback_procedures'],
            packageName,
            version: `${currentVersion} -> ${targetVersion}`,
            ecosystem,
            dateContext: new Date().toISOString().split('T')[0]
        };

        return await this.autoResearch(query);
    }

    /**
     * Perform alternative package research
     */
    async alternativeResearch(packageName: string, reason: string, ecosystem?: string): Promise<Context7ResearchResult | null> {
        const query: Context7Query = {
            query: `modern alternatives to ${packageName} ${reason} ${new Date().getFullYear()}`,
            sources: ['community_recommendations', 'benchmark_comparisons', 'adoption_trends', 'expert_opinions'],
            focus: ['alternative_packages', 'migration_complexity', 'performance_comparison', 'community_support'],
            packageName,
            ecosystem,
            dateContext: new Date().toISOString().split('T')[0]
        };

        return await this.autoResearch(query);
    }

    /**
     * Perform actual research request to Context7
     */
    private async performResearch(query: Context7Query): Promise<Context7Response> {
        const payload = {
            query: query.query,
            sources: query.sources || [],
            context: {
                date: query.dateContext || new Date().toISOString().split('T')[0],
                focus: query.focus || [],
                package: query.packageName,
                version: query.version,
                ecosystem: query.ecosystem
            }
        };

        const response = await this.makeRequest('/research', 'POST', payload);
        return response;
    }

    /**
     * Make HTTP request to Context7 API
     */
    private async makeRequest(endpoint: string, method: string, data?: any, timeoutMs?: number): Promise<Context7Response> {
        const url = `${this.config.baseUrl}${endpoint}`;
        const timeout = timeoutMs || this.config.timeoutMs;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'User-Agent': 'BMAD-Dakota-Agent/1.0'
            };

            if (this.config.apiKey) {
                headers['Authorization'] = `Bearer ${this.config.apiKey}`;
            }

            const response = await fetch(url, {
                method,
                headers,
                body: data ? JSON.stringify(data) : undefined,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result: any = await response.json();
            return {
                success: true,
                data: result.data,
                insights: result.insights || [],
                recommendations: result.recommendations || [],
                sources: result.sources || [],
                confidence: result.confidence || 0.5
            };

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            throw error;
        }
    }

    /**
     * Generate cache key for query
     */
    private generateCacheKey(query: Context7Query): string {
        const key = `${query.query}|${query.sources?.join(',')}|${query.focus?.join(',')}|${query.packageName}|${query.version}`;
        return Buffer.from(key).toString('base64');
    }

    /**
     * Get cached result if available and not expired
     */
    private getCachedResult(cacheKey: string): Context7Response | null {
        if (!this.config.cacheEnabled) {
            return null;
        }

        const cached = this.cache.get(cacheKey);
        if (!cached) {
            return null;
        }

        const now = new Date();
        const age = now.getTime() - cached.timestamp.getTime();
        
        if (age > this.config.cacheTtlMs) {
            this.cache.delete(cacheKey);
            return null;
        }

        return cached.result;
    }

    /**
     * Cache research result
     */
    private setCachedResult(cacheKey: string, result: Context7Response): void {
        if (!this.config.cacheEnabled) {
            return;
        }

        this.cache.set(cacheKey, {
            result,
            timestamp: new Date()
        });

        // Clean up old cache entries periodically
        if (this.cache.size > 1000) {
            this.cleanupCache();
        }
    }

    /**
     * Clean up expired cache entries
     */
    private cleanupCache(): void {
        const now = new Date();
        const expiredKeys: string[] = [];

        for (const [key, value] of this.cache.entries()) {
            const age = now.getTime() - value.timestamp.getTime();
            if (age > this.config.cacheTtlMs) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => this.cache.delete(key));
    }

    /**
     * Assess the quality of a Context7 response
     */
    private assessResponseQuality(response: Context7Response): number {
        if (!response.success) {
            return 0;
        }

        let quality = 0.5; // Base quality

        // Confidence score from Context7
        if (response.confidence) {
            quality = Math.max(quality, response.confidence);
        }

        // Number of sources
        if (response.sources && response.sources.length > 0) {
            quality += Math.min(0.2, response.sources.length * 0.05);
        }

        // Quality of insights
        if (response.insights && response.insights.length > 0) {
            quality += Math.min(0.2, response.insights.length * 0.04);
        }

        // Quality of recommendations
        if (response.recommendations && response.recommendations.length > 0) {
            quality += Math.min(0.1, response.recommendations.length * 0.02);
        }

        return Math.min(1.0, quality);
    }

    /**
     * Check if Context7 integration is available
     */
    isIntegrationAvailable(): boolean {
        return this.isAvailable;
    }

    /**
     * Get integration status and statistics
     */
    getIntegrationStatus(): {
        available: boolean;
        cacheSize: number;
        lastHealthCheck: Date | null;
        config: Context7Config;
    } {
        return {
            available: this.isAvailable,
            cacheSize: this.cache.size,
            lastHealthCheck: this.lastHealthCheck,
            config: { ...this.config, apiKey: this.config.apiKey ? '***' : undefined }
        };
    }

    /**
     * Clear cache and reset integration
     */
    reset(): void {
        this.cache.clear();
        this.lastHealthCheck = null;
        this.isAvailable = false;
    }

    /**
     * Dispose of integration resources
     */
    dispose(): void {
        this.cache.clear();
    }
}
