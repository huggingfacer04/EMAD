# Dependency Data Sources - Dakota

## Data Source Overview
**Data ID**: dependency-sources  
**Agent**: Dakota (Dependency Modernization Specialist)  
**Purpose**: Comprehensive catalog of reliable data sources for dependency information, security advisories, and ecosystem intelligence  
**Last Updated**: July 13, 2025  
**Context7 Integration**: Primary sources for automated research and validation  

## Primary Package Registries

### 📦 **JavaScript/Node.js Ecosystem**
```yaml
npm Registry:
  url: "https://registry.npmjs.org/"
  api: "https://registry.npmjs.org/{package}"
  security_advisories: "https://github.com/advisories"
  rate_limit: "Unlimited for metadata"
  reliability: "99.9%"
  update_frequency: "Real-time"
  
Yarn Registry:
  url: "https://registry.yarnpkg.com/"
  api: "https://registry.yarnpkg.com/{package}"
  mirror_of: "npm"
  reliability: "99.9%"
  
GitHub Package Registry:
  url: "https://npm.pkg.github.com/"
  scope: "Private/Enterprise packages"
  authentication: "Required"
```

### 🐍 **Python Ecosystem**
```yaml
PyPI (Python Package Index):
  url: "https://pypi.org/"
  api: "https://pypi.org/pypi/{package}/json"
  security_advisories: "https://github.com/pypa/advisory-database"
  rate_limit: "10 requests/second"
  reliability: "99.8%"
  
Conda Forge:
  url: "https://conda-forge.org/"
  api: "https://api.anaconda.org/package/conda-forge/{package}"
  focus: "Scientific computing packages"
  reliability: "99.7%"
  
Python Security Advisory Database:
  url: "https://github.com/pypa/advisory-database"
  format: "OSV (Open Source Vulnerability)"
  update_frequency: "Daily"
```

### 🦀 **Rust Ecosystem**
```yaml
Crates.io:
  url: "https://crates.io/"
  api: "https://crates.io/api/v1/crates/{crate}"
  security_advisories: "https://rustsec.org/"
  rate_limit: "1 request/second"
  reliability: "99.9%"
  
RustSec Advisory Database:
  url: "https://rustsec.org/"
  api: "https://github.com/RustSec/advisory-db"
  format: "TOML-based advisories"
  update_frequency: "Real-time"
```

### 🐹 **Go Ecosystem**
```yaml
Go Module Proxy:
  url: "https://proxy.golang.org/"
  api: "https://proxy.golang.org/{module}/@v/list"
  security_advisories: "https://pkg.go.dev/vuln/"
  rate_limit: "Reasonable use"
  reliability: "99.9%"
  
Go Vulnerability Database:
  url: "https://pkg.go.dev/vuln/"
  api: "https://api.osv.dev/v1/query"
  format: "OSV format"
  update_frequency: "Daily"
```

### ☕ **Java Ecosystem**
```yaml
Maven Central:
  url: "https://central.sonatype.com/"
  api: "https://search.maven.org/solrsearch/select"
  security_advisories: "https://github.com/advisories"
  rate_limit: "20 requests/second"
  reliability: "99.8%"
  
Sonatype OSS Index:
  url: "https://ossindex.sonatype.org/"
  api: "https://ossindex.sonatype.org/api/v3/component-report"
  focus: "Security vulnerability data"
  rate_limit: "128 requests/minute"
```

### 🔷 **C#/.NET Ecosystem**
```yaml
NuGet Gallery:
  url: "https://www.nuget.org/"
  api: "https://api.nuget.org/v3-flatcontainer/{package}/index.json"
  security_advisories: "https://github.com/advisories"
  rate_limit: "Unlimited for metadata"
  reliability: "99.9%"
  
.NET Security Advisories:
  url: "https://github.com/dotnet/announcements"
  format: "GitHub issues"
  update_frequency: "As needed"
```

## Security Intelligence Sources

### 🛡️ **Vulnerability Databases**
```yaml
National Vulnerability Database (NVD):
  url: "https://nvd.nist.gov/"
  api: "https://services.nvd.nist.gov/rest/json/cves/2.0"
  coverage: "All CVEs"
  update_frequency: "Real-time"
  reliability: "99.9%"
  
GitHub Security Advisories:
  url: "https://github.com/advisories"
  api: "https://api.github.com/advisories"
  coverage: "Open source packages"
  update_frequency: "Real-time"
  
OSV (Open Source Vulnerabilities):
  url: "https://osv.dev/"
  api: "https://api.osv.dev/v1/query"
  coverage: "Multiple ecosystems"
  format: "Standardized OSV format"
  
Snyk Vulnerability Database:
  url: "https://security.snyk.io/"
  api: "https://api.snyk.io/v1/vuln"
  coverage: "Comprehensive"
  authentication: "API key required"
```

### 🔍 **Security Research Sources**
```yaml
CVE Details:
  url: "https://www.cvedetails.com/"
  focus: "CVE analysis and statistics"
  update_frequency: "Daily"
  
Exploit Database:
  url: "https://www.exploit-db.com/"
  focus: "Proof-of-concept exploits"
  api: "https://www.exploit-db.com/api"
  
VulnDB:
  url: "https://vulndb.cyberriskanalytics.com/"
  focus: "Commercial vulnerability intelligence"
  authentication: "Subscription required"
```

## Package Intelligence Sources

### 📊 **Package Analytics**
```yaml
npm Trends:
  url: "https://npmtrends.com/"
  focus: "Download statistics and trends"
  api: "https://api.npmjs.org/downloads/range/{period}/{package}"
  
Libraries.io:
  url: "https://libraries.io/"
  api: "https://libraries.io/api/{platform}/{package}"
  coverage: "Multi-ecosystem package data"
  features: "Dependencies, releases, statistics"
  
Package Phobia:
  url: "https://packagephobia.com/"
  focus: "Package size analysis"
  api: "https://packagephobia.com/api.json?p={package}"
  
Bundlephobia:
  url: "https://bundlephobia.com/"
  focus: "Bundle size impact analysis"
  api: "https://bundlephobia.com/api/size?package={package}"
```

### 🏆 **Quality Metrics**
```yaml
npms.io:
  url: "https://npms.io/"
  api: "https://api.npms.io/v2/package/{package}"
  focus: "Package quality scoring"
  metrics: "Quality, popularity, maintenance"
  
Snyk Advisor:
  url: "https://snyk.io/advisor/"
  focus: "Package health and security"
  metrics: "Security, maintenance, popularity"
  
Socket.dev:
  url: "https://socket.dev/"
  focus: "Supply chain security analysis"
  api: "https://api.socket.dev/v0/npm/{package}"
```

## Ecosystem Intelligence Sources

### 📈 **Trend Analysis**
```yaml
GitHub Trending:
  url: "https://github.com/trending"
  api: "https://api.github.com/search/repositories"
  focus: "Popular and trending repositories"
  
Stack Overflow Trends:
  url: "https://insights.stackoverflow.com/trends"
  focus: "Technology adoption trends"
  
Google Trends:
  url: "https://trends.google.com/"
  focus: "Search interest over time"
  api: "https://trends.google.com/trends/api"
```

### 🌐 **Community Sources**
```yaml
Reddit Communities:
  javascript: "https://www.reddit.com/r/javascript/"
  python: "https://www.reddit.com/r/Python/"
  rust: "https://www.reddit.com/r/rust/"
  golang: "https://www.reddit.com/r/golang/"
  
Hacker News:
  url: "https://news.ycombinator.com/"
  api: "https://github.com/HackerNews/API"
  focus: "Technology discussions"
  
Dev.to:
  url: "https://dev.to/"
  api: "https://dev.to/api/articles"
  focus: "Developer articles and tutorials"
```

## Official Documentation Sources

### 📚 **Language & Framework Documentation**
```yaml
Node.js:
  docs: "https://nodejs.org/docs/"
  releases: "https://nodejs.org/en/about/releases/"
  security: "https://nodejs.org/en/security/"
  
Python:
  docs: "https://docs.python.org/"
  peps: "https://peps.python.org/"
  security: "https://www.python.org/news/security/"
  
Rust:
  docs: "https://doc.rust-lang.org/"
  releases: "https://forge.rust-lang.org/infra/channel-releases.html"
  security: "https://www.rust-lang.org/policies/security"
```

### 🔧 **Package Manager Documentation**
```yaml
npm:
  docs: "https://docs.npmjs.com/"
  cli: "https://docs.npmjs.com/cli/"
  security: "https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities"
  
Yarn:
  docs: "https://yarnpkg.com/getting-started"
  migration: "https://yarnpkg.com/migration/guide"
  
pip:
  docs: "https://pip.pypa.io/en/stable/"
  security: "https://pip.pypa.io/en/stable/topics/secure-installs/"
```

## Context7 Integration Patterns

### 🔬 **Automated Research Queries**
```yaml
Security Research:
  query_template: "security vulnerabilities {package_name} {version} {current_date}"
  sources: ["nvd", "github_advisories", "snyk", "osv"]
  frequency: "Real-time for critical, daily for others"
  
Update Research:
  query_template: "breaking changes migration guide {package_name} {old_version} to {new_version}"
  sources: ["official_docs", "github_releases", "community_discussions"]
  frequency: "On-demand during updates"
  
Alternative Research:
  query_template: "modern alternatives to {deprecated_package} 2025"
  sources: ["community_recommendations", "benchmark_comparisons", "adoption_trends"]
  frequency: "Weekly for deprecated packages"
```

### 📊 **Data Quality Validation**
```yaml
Source Reliability Scoring:
  primary_sources: 10  # Official registries, NVD
  verified_sources: 8  # GitHub, Snyk, Libraries.io
  community_sources: 6  # Reddit, Stack Overflow
  unverified_sources: 3  # Individual blogs, forums
  
Freshness Requirements:
  security_data: "< 1 hour"
  version_data: "< 6 hours"
  trend_data: "< 24 hours"
  historical_data: "< 7 days"
```

## Data Source Monitoring

### 🔍 **Source Health Monitoring**
```yaml
Availability Monitoring:
  check_frequency: "Every 5 minutes"
  timeout_threshold: "30 seconds"
  retry_attempts: 3
  fallback_sources: "Configured per source type"
  
Rate Limit Monitoring:
  tracking: "Requests per minute/hour"
  alerting: "80% of limit reached"
  backoff_strategy: "Exponential with jitter"
  
Data Quality Monitoring:
  schema_validation: "Continuous"
  freshness_checks: "Hourly"
  consistency_validation: "Cross-source comparison"
```

### 📈 **Usage Analytics**
```yaml
Source Utilization:
  most_used_sources: "Track for optimization"
  response_times: "Monitor for performance"
  success_rates: "Track for reliability"
  cost_analysis: "For paid sources"
  
Context7 Integration Metrics:
  research_quality_score: "User feedback based"
  source_contribution: "Per research query"
  accuracy_validation: "Community verification"
```

This comprehensive data source catalog ensures Dakota has access to the most reliable, current, and comprehensive dependency intelligence while maintaining optimal Context7 integration for automated research and validation.
