# Version Changelog Template

## Template Overview
**Template ID**: version-changelog  
**Agent**: Chronos (Version Control & Token Management Specialist)  
**Purpose**: Comprehensive version change documentation with temporal tracking  
**Generated Date**: {current_date}  
**Version Format**: YYYY.MM.DD.XXX (e.g., 2025.07.13.001)  
**Temporal Intelligence**: Automatic date adaptation using `new Date().toISOString().split('T')[0]`  

## Changelog Header Template

### 📋 **Project Information**
```markdown
# {project_name} - Version Changelog

**Project**: {project_name}  
**Current Version**: {current_version}  
**Last Updated**: {current_date}  
**Maintained By**: Chronos (Version Control & Token Management Specialist)  
**Repository**: {repository_url}  
**Documentation**: {documentation_url}  

## Version History Overview

**Total Versions**: {total_versions}  
**First Release**: {first_release_date}  
**Latest Release**: {latest_release_date}  
**Release Frequency**: {average_release_frequency}  
**Active Development**: {development_status}  
```

## Version Entry Template

### 🚀 **Major Release Template (X.0.0)**
```markdown
## [{version_number}] - {release_date}

### 🎯 **Release Summary**
- **Release Type**: Major Release
- **Impact Level**: Breaking Changes
- **Migration Required**: {migration_required}
- **Backward Compatibility**: {backward_compatibility}
- **Release Notes**: {release_notes_url}

### 🔥 **Major Features & Changes**
#### **New Capabilities**
- **{feature_name}**: {feature_description}
  - **Implementation**: {implementation_details}
  - **Benefits**: {feature_benefits}
  - **Usage**: {usage_instructions}
  - **Documentation**: {feature_documentation_url}

#### **Breaking Changes**
- **{breaking_change_name}**: {change_description}
  - **Reason**: {change_rationale}
  - **Impact**: {impact_assessment}
  - **Migration**: {migration_instructions}
  - **Timeline**: {deprecation_timeline}

#### **Architecture Updates**
- **{architecture_change}**: {change_description}
  - **Components Affected**: {affected_components}
  - **Performance Impact**: {performance_impact}
  - **Security Implications**: {security_implications}
  - **Testing**: {testing_coverage}

### 🛠️ **Technical Changes**
#### **API Changes**
- **{api_change}**: {change_description}
  - **Endpoints Modified**: {modified_endpoints}
  - **Parameters Changed**: {parameter_changes}
  - **Response Format**: {response_format_changes}
  - **Deprecation Notice**: {deprecation_notice}

#### **Database Changes**
- **{database_change}**: {change_description}
  - **Schema Updates**: {schema_changes}
  - **Migration Scripts**: {migration_scripts}
  - **Data Impact**: {data_impact}
  - **Rollback Plan**: {rollback_procedures}

### 🔒 **Security & Compliance**
- **{security_update}**: {security_description}
  - **Vulnerability Fixed**: {vulnerability_details}
  - **Security Level**: {security_level}
  - **Compliance Impact**: {compliance_impact}
  - **Audit Trail**: {audit_requirements}

### 📊 **Performance & Optimization**
- **{performance_improvement}**: {improvement_description}
  - **Metrics Improved**: {performance_metrics}
  - **Benchmark Results**: {benchmark_data}
  - **Resource Usage**: {resource_impact}
  - **Scalability**: {scalability_improvements}

### 🐛 **Bug Fixes**
- **{bug_fix}**: {fix_description}
  - **Issue**: {issue_description}
  - **Root Cause**: {root_cause_analysis}
  - **Solution**: {solution_implemented}
  - **Testing**: {testing_performed}

### 📚 **Documentation Updates**
- **{documentation_update}**: {update_description}
  - **Sections Updated**: {updated_sections}
  - **New Documentation**: {new_documentation}
  - **Examples Added**: {new_examples}
  - **Tutorials**: {tutorial_updates}

### ⚠️ **Known Issues**
- **{known_issue}**: {issue_description}
  - **Impact**: {issue_impact}
  - **Workaround**: {workaround_instructions}
  - **Timeline**: {fix_timeline}
  - **Tracking**: {issue_tracking_url}

### 🔄 **Migration Guide**
#### **Pre-Migration Steps**
1. **Backup**: {backup_instructions}
2. **Dependencies**: {dependency_updates}
3. **Configuration**: {configuration_changes}
4. **Testing**: {testing_requirements}

#### **Migration Process**
1. **Step 1**: {migration_step_1}
2. **Step 2**: {migration_step_2}
3. **Step 3**: {migration_step_3}
4. **Validation**: {validation_steps}

#### **Post-Migration Verification**
- **Functionality**: {functionality_checks}
- **Performance**: {performance_validation}
- **Integration**: {integration_testing}
- **Rollback**: {rollback_procedures}

### 👥 **Contributors**
- **{contributor_name}** - {contribution_description}
- **{contributor_name}** - {contribution_description}
- **{contributor_name}** - {contribution_description}

### 📅 **Timeline**
- **Development Started**: {development_start_date}
- **Feature Freeze**: {feature_freeze_date}
- **Testing Phase**: {testing_phase_dates}
- **Release Date**: {release_date}
- **Support Timeline**: {support_timeline}
```

### 🔄 **Minor Release Template (0.X.0)**
```markdown
## [{version_number}] - {release_date}

### 🎯 **Release Summary**
- **Release Type**: Minor Release
- **Impact Level**: New Features
- **Backward Compatibility**: Maintained
- **Migration Required**: No

### ✨ **New Features**
- **{feature_name}**: {feature_description}
  - **Usage**: {usage_instructions}
  - **Benefits**: {feature_benefits}
  - **Documentation**: {documentation_link}

### 🔧 **Enhancements**
- **{enhancement_name}**: {enhancement_description}
  - **Improvement**: {improvement_details}
  - **Impact**: {impact_assessment}
  - **Configuration**: {configuration_changes}

### 🐛 **Bug Fixes**
- **{bug_fix}**: {fix_description}
  - **Issue**: {issue_reference}
  - **Solution**: {solution_summary}
  - **Testing**: {testing_coverage}

### 📊 **Performance Improvements**
- **{performance_improvement}**: {improvement_description}
  - **Metrics**: {performance_metrics}
  - **Impact**: {performance_impact}

### 📚 **Documentation**
- **{documentation_update}**: {update_description}
  - **Sections**: {updated_sections}
  - **Examples**: {new_examples}

### 👥 **Contributors**
- **{contributor_name}** - {contribution_type}

### 📅 **Release Timeline**
- **Development**: {development_period}
- **Testing**: {testing_period}
- **Release**: {release_date}
```

### 🔧 **Patch Release Template (0.0.X)**
```markdown
## [{version_number}] - {release_date}

### 🎯 **Release Summary**
- **Release Type**: Patch Release
- **Impact Level**: Bug Fixes & Minor Improvements
- **Backward Compatibility**: Maintained
- **Migration Required**: No

### 🐛 **Bug Fixes**
- **{bug_fix}**: {fix_description}
  - **Issue**: {issue_reference}
  - **Severity**: {bug_severity}
  - **Solution**: {solution_summary}

### 🔒 **Security Fixes**
- **{security_fix}**: {fix_description}
  - **Vulnerability**: {vulnerability_type}
  - **Severity**: {security_severity}
  - **Impact**: {security_impact}

### 🔧 **Minor Improvements**
- **{improvement}**: {improvement_description}
  - **Benefit**: {improvement_benefit}
  - **Impact**: {impact_level}

### 📚 **Documentation Fixes**
- **{documentation_fix}**: {fix_description}
  - **Section**: {documentation_section}
  - **Correction**: {correction_details}

### 👥 **Contributors**
- **{contributor_name}** - {contribution_type}

### 📅 **Release Info**
- **Release Date**: {release_date}
- **Hotfix**: {hotfix_status}
```

## Date-Based Version Template (YYYY.MM.DD.XXX)

### 📅 **Daily Release Template**
```markdown
## [{version_number}] - {current_date}

### 🎯 **Daily Release Summary**
- **Release Type**: Daily Update
- **Date**: {current_date} (Auto-generated: ${new Date().toISOString().split('T')[0]})
- **Build Number**: {build_number}
- **Commit Hash**: {commit_hash}

### 📝 **Changes Today**
#### **Files Modified**
- **{file_name}**: {modification_description}
  - **Change Type**: {change_type}
  - **Impact**: {change_impact}
  - **Version**: {file_version}

#### **New Files Added**
- **{new_file}**: {file_description}
  - **Purpose**: {file_purpose}
  - **Location**: {file_location}
  - **Version**: {initial_version}

#### **Files Removed**
- **{removed_file}**: {removal_reason}
  - **Replacement**: {replacement_file}
  - **Migration**: {migration_notes}

### 🔄 **Version Synchronization**
- **Agent Versions Updated**: {updated_agents}
- **Configuration Versions**: {config_versions}
- **Documentation Versions**: {doc_versions}
- **Template Versions**: {template_versions}

### 📊 **Daily Metrics**
- **Total Files Tracked**: {total_files}
- **Files Modified Today**: {modified_today}
- **Version Consistency Score**: {consistency_score}
- **Temporal Accuracy**: {temporal_accuracy}

### 🤖 **Automated Updates**
- **Chronos Agent**: {chronos_updates}
- **Token Monitoring**: {token_monitoring_updates}
- **Version Tracking**: {version_tracking_updates}
- **Model Specifications**: {model_spec_updates}

### 📅 **Temporal Context**
- **Current Date**: {current_date}
- **Day of Week**: {day_of_week}
- **Week Number**: {week_number}
- **Month Progress**: {month_progress}
- **Year Progress**: {year_progress}
```

## Automated Generation Variables

### 🔧 **Template Variables**
```yaml
Template_Variables:
  project_info:
    - {project_name}: Name of the project or component
    - {current_version}: Current version number
    - {current_date}: Current date in YYYY-MM-DD format
    - {repository_url}: Git repository URL
    - {documentation_url}: Documentation website URL
  
  version_info:
    - {version_number}: Semantic version number
    - {release_date}: Release date
    - {version_type}: major/minor/patch/daily
    - {impact_level}: breaking/feature/fix/maintenance
    - {migration_required}: yes/no/optional
  
  change_details:
    - {feature_name}: Name of new feature
    - {feature_description}: Detailed feature description
    - {bug_fix}: Bug fix description
    - {performance_improvement}: Performance enhancement details
    - {security_update}: Security-related changes
  
  temporal_variables:
    - {current_date}: Auto-generated current date
    - {day_of_week}: Current day of the week
    - {week_number}: Current week number
    - {month_progress}: Progress through current month
    - {year_progress}: Progress through current year
  
  automation_variables:
    - {build_number}: Automated build number
    - {commit_hash}: Git commit hash
    - {file_modifications}: List of modified files
    - {version_synchronization}: Cross-file version updates
```

### ⚡ **Automatic Date Integration**
```javascript
// Automatic date generation for changelog entries
const currentDate = new Date().toISOString().split('T')[0]; // 2025-07-13
const versionNumber = `${currentDate}.001`; // 2025.07.13.001
const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
const weekNumber = Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
```

This comprehensive version changelog template provides Chronos with a structured, automated approach to documenting version changes with precise temporal tracking, ensuring complete traceability of all modifications across the BMAD ecosystem.
