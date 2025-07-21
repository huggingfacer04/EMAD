# Container Registries Data Source

## Data Source Overview
**Data ID**: container-registries  
**Agent**: Phoenix (System Deployment & Containerization Specialist)  
**Purpose**: Comprehensive catalog of container registries, image repositories, and artifact management platforms  
**Last Updated**: July 13, 2025  
**Context7 Integration**: Primary source for registry selection, security configuration, and optimization strategies  

## Public Container Registries

### 🐳 **Docker Hub**
```yaml
Docker_Hub:
  url: "https://hub.docker.com"
  registry_endpoint: "docker.io"
  type: "Public/Private"
  
  features:
    - Official images from vendors
    - Community-contributed images
    - Automated builds from GitHub/Bitbucket
    - Vulnerability scanning (paid plans)
    - Team collaboration tools
    - Webhooks and API integration
  
  pricing:
    free_tier:
      - Unlimited public repositories
      - 1 private repository
      - 200 container pulls per 6 hours
    
    paid_plans:
      - Pro: $5/month (unlimited private repos)
      - Team: $7/user/month (team features)
      - Business: $21/user/month (enterprise features)
  
  limitations:
    - Rate limiting for anonymous pulls
    - Limited vulnerability scanning on free tier
    - No geo-replication on free tier
  
  security_features:
    - Two-factor authentication
    - Access tokens
    - Team permissions
    - Vulnerability scanning
    - Content trust (Docker Notary)
  
  api_endpoints:
    - Registry API v2
    - Docker Hub API
    - Webhook notifications
  
  best_practices:
    - Use official base images
    - Enable vulnerability scanning
    - Implement proper tagging strategy
    - Use multi-stage builds
    - Regular security updates
```

### 📦 **GitHub Container Registry (GHCR)**
```yaml
GitHub_Container_Registry:
  url: "https://ghcr.io"
  registry_endpoint: "ghcr.io"
  type: "Public/Private"
  
  features:
    - Integrated with GitHub repositories
    - Fine-grained permissions
    - Package linking to repositories
    - Vulnerability scanning
    - Dependency insights
    - GitHub Actions integration
  
  pricing:
    - Free for public repositories
    - Included with GitHub plans for private
    - Pay-per-use for additional storage/bandwidth
  
  authentication:
    - GitHub personal access tokens
    - GitHub App tokens
    - OIDC tokens for GitHub Actions
  
  security_features:
    - Repository-based permissions
    - Vulnerability scanning
    - Dependency graph
    - Security advisories
    - Package signing
  
  integration:
    - GitHub Actions workflows
    - GitHub Packages ecosystem
    - Dependabot integration
    - Code scanning integration
```

### 🔴 **Red Hat Quay.io**
```yaml
Quay_io:
  url: "https://quay.io"
  registry_endpoint: "quay.io"
  type: "Public/Private"
  
  features:
    - Enterprise-grade security
    - Vulnerability scanning with Clair
    - Robot accounts for automation
    - Time machine (image history)
    - Geo-replication
    - Build triggers
  
  pricing:
    free_tier:
      - Unlimited public repositories
      - 1 private repository
      - Basic vulnerability scanning
    
    paid_plans:
      - Starts at $10/month for additional private repos
      - Enterprise plans available
  
  security_features:
    - Advanced vulnerability scanning
    - Security notifications
    - Image signing
    - Access controls
    - Audit logging
  
  enterprise_features:
    - LDAP/OIDC integration
    - High availability
    - Geo-replication
    - Advanced analytics
    - SLA guarantees
```

## Cloud Provider Registries

### ☁️ **Amazon Elastic Container Registry (ECR)**
```yaml
AWS_ECR:
  service_name: "Amazon ECR"
  registry_endpoint: "{account-id}.dkr.ecr.{region}.amazonaws.com"
  type: "Private/Public"
  
  features:
    - Fully managed by AWS
    - Integrated with ECS, EKS, Fargate
    - Vulnerability scanning
    - Image lifecycle policies
    - Cross-region replication
    - Encryption at rest and in transit
  
  pricing:
    - Pay for storage used
    - Pay for data transfer
    - No additional charges for pushes/pulls within AWS
  
  security_features:
    - IAM integration
    - VPC endpoints
    - Encryption with KMS
    - Vulnerability scanning
    - Image signing with AWS Signer
  
  integration:
    - AWS CodeBuild/CodePipeline
    - AWS Lambda
    - Amazon ECS/EKS
    - AWS Fargate
    - AWS App Runner
  
  regions: "Available in all AWS regions"
  
  best_practices:
    - Use lifecycle policies for cost optimization
    - Enable vulnerability scanning
    - Implement least privilege IAM policies
    - Use VPC endpoints for private access
    - Enable encryption at rest
```

### 🔷 **Azure Container Registry (ACR)**
```yaml
Azure_ACR:
  service_name: "Azure Container Registry"
  registry_endpoint: "{registry-name}.azurecr.io"
  type: "Private"
  
  features:
    - Fully managed by Microsoft
    - Integrated with AKS, Container Instances
    - Vulnerability scanning with Defender
    - Geo-replication
    - Content trust
    - Helm chart support
  
  pricing_tiers:
    basic: "Entry-level, 10 GB storage"
    standard: "Enhanced throughput, 100 GB storage"
    premium: "Geo-replication, 500 GB storage"
  
  security_features:
    - Azure AD integration
    - RBAC (Role-Based Access Control)
    - Private endpoints
    - Customer-managed keys
    - Content trust
    - Vulnerability scanning
  
  integration:
    - Azure DevOps
    - Azure Kubernetes Service
    - Azure Container Instances
    - Azure App Service
    - GitHub Actions
  
  advanced_features:
    - Tasks (automated builds)
    - Geo-replication
    - Webhook notifications
    - Artifact streaming
    - OCI artifact support
```

### 🌐 **Google Container Registry (GCR) / Artifact Registry**
```yaml
Google_Artifact_Registry:
  service_name: "Google Artifact Registry"
  registry_endpoint: "{region}-docker.pkg.dev"
  type: "Private"
  legacy_gcr: "gcr.io (being deprecated)"
  
  features:
    - Successor to Google Container Registry
    - Multi-format artifact support
    - Vulnerability scanning
    - Binary Authorization integration
    - Regional and multi-regional repositories
    - Fine-grained access control
  
  pricing:
    - Pay for storage used
    - Pay for egress traffic
    - Free tier: 0.5 GB storage per month
  
  security_features:
    - IAM integration
    - VPC Service Controls
    - Customer-managed encryption keys
    - Vulnerability scanning
    - Binary Authorization
    - Audit logging
  
  integration:
    - Google Kubernetes Engine (GKE)
    - Cloud Build
    - Cloud Run
    - Cloud Functions
    - Anthos
  
  supported_formats:
    - Docker images
    - Helm charts
    - Java packages (Maven)
    - Node.js packages (npm)
    - Python packages (PyPI)
```

## Enterprise & Self-Hosted Registries

### 🏢 **Harbor**
```yaml
Harbor_Registry:
  type: "Self-hosted, Open Source"
  url: "https://goharbor.io"
  
  features:
    - Multi-tenant registry
    - Role-based access control
    - Vulnerability scanning with Trivy
    - Content trust and image signing
    - Replication across registries
    - Helm chart repository
  
  deployment_options:
    - Docker Compose
    - Kubernetes (Helm charts)
    - Cloud marketplace deployments
    - Managed Harbor services
  
  security_features:
    - LDAP/OIDC integration
    - Vulnerability scanning
    - Content trust
    - Image quarantine
    - Audit logging
    - Network policies
  
  enterprise_features:
    - Multi-registry replication
    - Quota management
    - Garbage collection
    - Webhook notifications
    - API integration
    - High availability
  
  compliance:
    - GDPR compliant
    - SOC 2 Type II (managed versions)
    - FIPS 140-2 support
```

### 🔧 **JFrog Artifactory**
```yaml
JFrog_Artifactory:
  type: "Enterprise, SaaS/Self-hosted"
  url: "https://jfrog.com/artifactory"
  
  features:
    - Universal artifact repository
    - Docker registry capabilities
    - Advanced security scanning
    - Build integration
    - Metadata management
    - Global replication
  
  pricing_tiers:
    oss: "Open source, basic features"
    pro: "Professional features, support"
    enterprise: "Enterprise features, HA"
    enterprise_plus: "Advanced security, compliance"
  
  security_features:
    - Xray security scanning
    - Access control
    - Audit trails
    - Vulnerability alerts
    - License compliance
    - SIEM integration
  
  integration:
    - CI/CD pipelines
    - IDE plugins
    - Package managers
    - Cloud platforms
    - DevOps tools
  
  supported_formats:
    - Docker images
    - Helm charts
    - Maven, Gradle, npm, PyPI
    - NuGet, Conan, Go modules
    - Generic artifacts
```

### 📦 **Sonatype Nexus Repository**
```yaml
Sonatype_Nexus:
  type: "Enterprise, Self-hosted/Cloud"
  url: "https://www.sonatype.com/nexus"
  
  features:
    - Universal repository manager
    - Docker registry support
    - Component intelligence
    - Vulnerability scanning
    - Policy enforcement
    - Repository health check
  
  editions:
    oss: "Open source version"
    pro: "Professional features"
    iq: "Advanced security and compliance"
  
  security_features:
    - Vulnerability scanning
    - License analysis
    - Policy enforcement
    - Supply chain analysis
    - SBOM generation
    - Risk scoring
  
  integration:
    - CI/CD pipelines
    - IDE integration
    - SIEM systems
    - Ticketing systems
    - Cloud platforms
  
  repository_formats:
    - Docker
    - Maven, Gradle
    - npm, PyPI, NuGet
    - Helm, Conan
    - Raw artifacts
```

## Registry Selection Criteria

### 📊 **Evaluation Matrix**
```yaml
Selection_Criteria:
  technical_requirements:
    - Supported image formats
    - Storage capacity and scalability
    - Geographic distribution needs
    - Integration requirements
    - API capabilities
    - Performance requirements
  
  security_requirements:
    - Vulnerability scanning capabilities
    - Access control granularity
    - Compliance certifications
    - Encryption support
    - Audit logging
    - Content trust/signing
  
  operational_requirements:
    - Availability SLA
    - Backup and disaster recovery
    - Monitoring and alerting
    - Support quality
    - Documentation quality
    - Community/ecosystem
  
  cost_considerations:
    - Storage costs
    - Bandwidth costs
    - Feature licensing
    - Support costs
    - Hidden costs
    - ROI analysis
```

## Registry Security Best Practices

### 🔒 **Security Configuration**
```yaml
Security_Best_Practices:
  access_control:
    - Implement least privilege access
    - Use service accounts for automation
    - Enable multi-factor authentication
    - Regular access reviews
    - Role-based permissions
  
  image_security:
    - Scan images for vulnerabilities
    - Use minimal base images
    - Sign images for integrity
    - Implement content trust
    - Regular security updates
  
  network_security:
    - Use private registries for sensitive images
    - Implement network segmentation
    - Use VPN or private endpoints
    - Enable TLS encryption
    - Monitor network traffic
  
  compliance:
    - Maintain audit logs
    - Implement data retention policies
    - Regular security assessments
    - Compliance reporting
    - Incident response procedures
```

## Context7 Research Integration

### 🔬 **Registry Research Queries**
```yaml
Registry_Optimization_Research:
  query_template: "{registry_type} container registry optimization best practices 2025"
  sources: ["vendor_documentation", "security_guides", "performance_studies"]
  focus: ["security", "performance", "cost_optimization", "compliance"]

Registry_Comparison_Research:
  query_template: "compare {registry1} vs {registry2} for {use_case} deployment"
  sources: ["comparison_studies", "user_reviews", "benchmark_reports"]
  focus: ["features", "pricing", "security", "performance"]

Security_Configuration_Research:
  query_template: "{registry_name} security hardening configuration guide"
  sources: ["security_documentation", "compliance_guides", "best_practices"]
  focus: ["access_control", "vulnerability_scanning", "compliance", "monitoring"]
```

This comprehensive container registries data source provides Phoenix with detailed information about all major registry options, enabling intelligent registry selection, security configuration, and optimization strategies based on specific project requirements and organizational constraints.
