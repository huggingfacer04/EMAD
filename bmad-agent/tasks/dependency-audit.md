# Dependency Audit Task - Dakota

## Task Overview
**Task ID**: dependency-audit  
**Agent**: Dakota (Dependency Modernization Specialist)  
**Purpose**: Comprehensive analysis of project dependencies during initialization phase  
**Trigger**: Project setup, new team member onboarding, or manual audit request  
**Context7 Integration**: Automatic activation for dependency research and validation  

## Execution Workflow

### Phase 1: Project Discovery & Analysis
**Duration**: 5-10 minutes  
**Automation Level**: Fully Automated  

#### 1.1 Project Structure Detection
```bash
# Detect project type and package managers
- Scan for package.json (Node.js/npm/yarn)
- Check for requirements.txt, pyproject.toml, Pipfile (Python)
- Look for Cargo.toml (Rust)
- Find go.mod (Go)
- Detect pom.xml, build.gradle (Java)
- Check for *.csproj, packages.config (C#/.NET)
- Scan for composer.json (PHP)
- Look for Gemfile (Ruby)
```

#### 1.2 Dependency Inventory
```yaml
# Create comprehensive dependency map
Current Dependencies:
  - Production dependencies with versions
  - Development dependencies with versions
  - Peer dependencies and optional dependencies
  - Transitive dependency tree (up to 3 levels deep)
  
Metadata Collection:
  - Last update dates
  - License information
  - Maintainer status
  - Download statistics
  - Security advisory history
```

#### 1.3 Context7 Research Activation
```javascript
// Automatic Context7 invocation for each dependency
Context7.research({
  query: "latest stable version security advisories {package_name}",
  sources: ["npm", "github", "security-advisories", "changelog"],
  date_context: "July 13, 2025",
  focus: ["version_updates", "security_issues", "breaking_changes"]
});
```

### Phase 2: Vulnerability & Security Assessment
**Duration**: 3-5 minutes  
**Automation Level**: Fully Automated with Context7  

#### 2.1 Security Vulnerability Scan
```bash
# Multi-source security analysis
npm audit --audit-level=moderate
yarn audit --level moderate
pip-audit --desc
cargo audit
go list -json -m all | nancy sleuth
```

#### 2.2 License Compliance Check
```yaml
License Analysis:
  - Identify all dependency licenses
  - Flag potential license conflicts
  - Check for copyleft license implications
  - Verify commercial use compatibility
  - Generate license compliance report
```

#### 2.3 Maintenance Status Assessment
```javascript
// Context7-powered maintenance analysis
for (dependency in project_dependencies) {
  Context7.analyze({
    package: dependency,
    metrics: [
      "last_commit_date",
      "issue_response_time", 
      "maintainer_activity",
      "community_health",
      "deprecation_status"
    ]
  });
}
```

### Phase 3: Modernization Opportunity Analysis
**Duration**: 5-8 minutes  
**Automation Level**: Automated with Human Review Points  

#### 3.1 Version Gap Analysis
```yaml
Version Assessment:
  - Current vs Latest Stable versions
  - Major version gaps (>1 major version behind)
  - Security patch availability
  - LTS vs Current release considerations
  - Breaking change impact analysis
```

#### 3.2 Alternative Package Evaluation
```javascript
// Context7 research for better alternatives
Context7.research({
  query: "modern alternatives to {deprecated_package} 2025",
  criteria: [
    "active_maintenance",
    "performance_improvements", 
    "security_enhancements",
    "community_adoption",
    "migration_complexity"
  ]
});
```

#### 3.3 Dependency Optimization Opportunities
```yaml
Optimization Analysis:
  - Duplicate functionality detection
  - Bundle size impact assessment
  - Tree-shaking compatibility
  - Unused dependency identification
  - Peer dependency optimization
```

### Phase 4: Risk Assessment & Prioritization
**Duration**: 3-5 minutes  
**Automation Level**: Automated Scoring with Manual Review  

#### 4.1 Risk Scoring Matrix
```yaml
Risk Categories:
  Security Risk:
    - Critical: Known exploits (Score: 10)
    - High: Security advisories (Score: 7-9)
    - Medium: Outdated security patches (Score: 4-6)
    - Low: No known issues (Score: 1-3)
  
  Maintenance Risk:
    - Critical: Abandoned packages (Score: 10)
    - High: No updates >2 years (Score: 7-9)
    - Medium: Slow update cycle (Score: 4-6)
    - Low: Active maintenance (Score: 1-3)
  
  Compatibility Risk:
    - Critical: Breaking changes required (Score: 10)
    - High: Major version gaps (Score: 7-9)
    - Medium: Minor compatibility issues (Score: 4-6)
    - Low: Seamless updates (Score: 1-3)
```

#### 4.2 Update Priority Queue
```yaml
Priority Levels:
  Immediate (Score 8-10):
    - Security vulnerabilities
    - Abandoned critical dependencies
    - License compliance issues
  
  High (Score 6-7):
    - Major version gaps
    - Performance improvements
    - Maintenance concerns
  
  Medium (Score 4-5):
    - Minor updates available
    - Feature enhancements
    - Developer experience improvements
  
  Low (Score 1-3):
    - Patch updates
    - Documentation improvements
    - Non-critical optimizations
```

### Phase 5: Recommendation Generation
**Duration**: 2-3 minutes  
**Automation Level**: Automated with Template Generation  

#### 5.1 Executive Summary Generation
```markdown
# Dependency Audit Report
**Project**: {project_name}
**Audit Date**: {current_date}
**Agent**: Dakota (Dependency Modernization Specialist)

## Key Findings
- Total Dependencies: {count}
- Security Issues: {security_count}
- Outdated Packages: {outdated_count}
- Recommended Actions: {action_count}

## Priority Actions Required
{priority_actions_list}

## Modernization Opportunities
{modernization_opportunities}
```

#### 5.2 Actionable Recommendations
```yaml
Recommendation Format:
  Package: {package_name}
  Current Version: {current_version}
  Recommended Version: {recommended_version}
  Risk Level: {risk_assessment}
  Action Required: {automatic|manual|review}
  Justification: {context7_research_summary}
  Migration Notes: {breaking_changes_summary}
  Timeline: {recommended_timeline}
```

## Integration Points

### BMAD Agent Collaboration
```yaml
Handoff to Other Agents:
  - John (PM): Timeline and priority alignment
  - Fred (Architect): Architecture impact assessment
  - Sage (Security): Security-critical updates
  - Alex (Platform): Infrastructure dependency impacts
```

### Context7 Integration Checkpoints
```javascript
// Automatic Context7 activation points
1. Initial dependency discovery
2. Security vulnerability research
3. Alternative package evaluation
4. Breaking change analysis
5. Migration strategy development
```

### Output Deliverables
```yaml
Generated Files:
  - dependency-audit-report.md
  - security-vulnerabilities.json
  - update-recommendations.yaml
  - migration-roadmap.md
  - license-compliance-report.md
```

## Success Criteria
- ✅ Complete dependency inventory generated
- ✅ All security vulnerabilities identified and prioritized
- ✅ Modernization roadmap created with timelines
- ✅ Risk assessment completed for all recommendations
- ✅ Context7 research integrated into all recommendations
- ✅ Actionable next steps provided to development team

## Error Handling & Fallbacks
```yaml
Common Issues:
  - Package manager not found: Provide installation guidance
  - Network connectivity issues: Use cached data with warnings
  - Context7 unavailable: Fall back to local analysis tools
  - Large dependency trees: Implement progressive analysis
  - Private packages: Skip analysis with documentation
```

This audit task ensures comprehensive dependency analysis while leveraging Context7 for the most current information and maintaining seamless integration with the BMAD ecosystem.
