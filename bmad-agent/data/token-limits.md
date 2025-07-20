# Token Limits Database

## Data Source Overview
**Data ID**: token-limits  
**Agent**: Chronos (Version Control & Token Management Specialist)  
**Purpose**: Comprehensive database of token limits, thresholds, and optimization strategies  
**Last Updated**: July 13, 2025  
**Context7 Integration**: Real-time token limit research and monitoring  
**Update Frequency**: Real-time monitoring with hourly validation checks  

## Current Token Limits by Provider

### 🤖 **OpenAI Token Limits**
```yaml
GPT-4_Turbo:
  model_id: "gpt-4-turbo"
  context_window: 128000
  max_output_tokens: 4096
  effective_input_limit: 123904
  
  rate_limits:
    tier_1:
      requests_per_minute: 500
      tokens_per_minute: 30000
      requests_per_day: 10000
    tier_2:
      requests_per_minute: 5000
      tokens_per_minute: 450000
      requests_per_day: 10000
    tier_3:
      requests_per_minute: 5000
      tokens_per_minute: 800000
      requests_per_day: 10000
  
  optimization_thresholds:
    warning_threshold: 102400  # 80% of context window
    alert_threshold: 115200    # 90% of context window
    critical_threshold: 121600 # 95% of context window
    emergency_threshold: 126976 # 99% of context window

GPT-4:
  model_id: "gpt-4"
  context_window: 8192
  max_output_tokens: 4096
  effective_input_limit: 4096
  
  rate_limits:
    tier_1:
      requests_per_minute: 200
      tokens_per_minute: 10000
      requests_per_day: 200
    tier_2:
      requests_per_minute: 300
      tokens_per_minute: 40000
      requests_per_day: 10000
    tier_3:
      requests_per_minute: 5000
      tokens_per_minute: 300000
      requests_per_day: 10000
  
  optimization_thresholds:
    warning_threshold: 6554   # 80% of context window
    alert_threshold: 7373     # 90% of context window
    critical_threshold: 7782  # 95% of context window
    emergency_threshold: 8110 # 99% of context window

GPT-3.5_Turbo:
  model_id: "gpt-3.5-turbo"
  context_window: 16385
  max_output_tokens: 4096
  effective_input_limit: 12289
  
  rate_limits:
    tier_1:
      requests_per_minute: 3500
      tokens_per_minute: 90000
      requests_per_day: 10000
    tier_2:
      requests_per_minute: 3500
      tokens_per_minute: 90000
      requests_per_day: 10000
    tier_3:
      requests_per_minute: 10000
      tokens_per_minute: 1000000
      requests_per_day: 10000
  
  optimization_thresholds:
    warning_threshold: 13108  # 80% of context window
    alert_threshold: 14747    # 90% of context window
    critical_threshold: 15566 # 95% of context window
    emergency_threshold: 16221 # 99% of context window
```

### 🧠 **Anthropic Token Limits**
```yaml
Claude-3_Opus:
  model_id: "claude-3-opus-20240229"
  context_window: 200000
  max_output_tokens: 4096
  effective_input_limit: 195904
  
  rate_limits:
    tier_1:
      requests_per_minute: 1000
      tokens_per_minute: 80000
      requests_per_day: 1000
    tier_2:
      requests_per_minute: 1000
      tokens_per_minute: 80000
      requests_per_day: 1000
    tier_3:
      requests_per_minute: 1000
      tokens_per_minute: 80000
      requests_per_day: 1000
  
  optimization_thresholds:
    warning_threshold: 160000  # 80% of context window
    alert_threshold: 180000    # 90% of context window
    critical_threshold: 190000 # 95% of context window
    emergency_threshold: 198000 # 99% of context window

Claude-3_Sonnet:
  model_id: "claude-3-sonnet-20240229"
  context_window: 200000
  max_output_tokens: 4096
  effective_input_limit: 195904
  
  rate_limits:
    tier_1:
      requests_per_minute: 1000
      tokens_per_minute: 80000
      requests_per_day: 1000
    tier_2:
      requests_per_minute: 1000
      tokens_per_minute: 80000
      requests_per_day: 1000
    tier_3:
      requests_per_minute: 1000
      tokens_per_minute: 80000
      requests_per_day: 1000
  
  optimization_thresholds:
    warning_threshold: 160000  # 80% of context window
    alert_threshold: 180000    # 90% of context window
    critical_threshold: 190000 # 95% of context window
    emergency_threshold: 198000 # 99% of context window

Claude-3_Haiku:
  model_id: "claude-3-haiku-20240307"
  context_window: 200000
  max_output_tokens: 4096
  effective_input_limit: 195904
  
  rate_limits:
    tier_1:
      requests_per_minute: 1000
      tokens_per_minute: 100000
      requests_per_day: 1000
    tier_2:
      requests_per_minute: 1000
      tokens_per_minute: 100000
      requests_per_day: 1000
    tier_3:
      requests_per_minute: 1000
      tokens_per_minute: 100000
      requests_per_day: 1000
  
  optimization_thresholds:
    warning_threshold: 160000  # 80% of context window
    alert_threshold: 180000    # 90% of context window
    critical_threshold: 190000 # 95% of context window
    emergency_threshold: 198000 # 99% of context window
```

### 🌟 **Google Token Limits**
```yaml
Gemini-Pro:
  model_id: "gemini-pro"
  context_window: 32768
  max_output_tokens: 8192
  effective_input_limit: 24576
  
  rate_limits:
    free_tier:
      requests_per_minute: 60
      tokens_per_minute: 32000
      requests_per_day: 1500
    paid_tier:
      requests_per_minute: 1000
      tokens_per_minute: 128000
      requests_per_day: 50000
  
  optimization_thresholds:
    warning_threshold: 26214   # 80% of context window
    alert_threshold: 29491     # 90% of context window
    critical_threshold: 31130  # 95% of context window
    emergency_threshold: 32440 # 99% of context window

Gemini-Ultra:
  model_id: "gemini-ultra"
  context_window: 32768
  max_output_tokens: 8192
  effective_input_limit: 24576
  
  rate_limits:
    paid_tier:
      requests_per_minute: 60
      tokens_per_minute: 32000
      requests_per_day: 1500
  
  optimization_thresholds:
    warning_threshold: 26214   # 80% of context window
    alert_threshold: 29491     # 90% of context window
    critical_threshold: 31130  # 95% of context window
    emergency_threshold: 32440 # 99% of context window
```

## Token Optimization Strategies

### 🎯 **Threshold-Based Optimization**
```yaml
Optimization_Levels:
  Level_1_Warning_80_Percent:
    triggers:
      - Token usage reaches 80% of context window
      - Conversation velocity indicates approaching limits
    actions:
      - Display warning notification to user
      - Begin identifying optimization opportunities
      - Suggest conversation summarization
      - Monitor token consumption more frequently
    
  Level_2_Alert_90_Percent:
    triggers:
      - Token usage reaches 90% of context window
      - Projected usage will exceed limits within 5 exchanges
    actions:
      - Display urgent alert to user
      - Automatically identify redundant content
      - Suggest immediate optimization strategies
      - Prepare emergency summarization
    
  Level_3_Critical_95_Percent:
    triggers:
      - Token usage reaches 95% of context window
      - Immediate action required to prevent overflow
    actions:
      - Display critical alert with immediate action required
      - Automatically begin conversation optimization
      - Implement emergency summarization protocols
      - Preserve only essential context
    
  Level_4_Emergency_99_Percent:
    triggers:
      - Token usage reaches 99% of context window
      - Conversation will exceed limits in next exchange
    actions:
      - Immediately implement emergency summarization
      - Preserve critical context only
      - Notify user of emergency optimization
      - Prepare for conversation restart if necessary
```

### 🔄 **Optimization Techniques by Content Type**
```yaml
Content_Optimization:
  Code_Blocks:
    techniques:
      - Remove verbose comments
      - Compress variable names
      - Eliminate redundant examples
      - Use code snippets instead of full files
    token_savings: "20-40%"
    quality_impact: "Minimal"
  
  Documentation:
    techniques:
      - Remove redundant explanations
      - Compress verbose descriptions
      - Use bullet points instead of paragraphs
      - Eliminate repetitive examples
    token_savings: "15-30%"
    quality_impact: "Low"
  
  Conversation_History:
    techniques:
      - Summarize completed topics
      - Remove circular discussions
      - Compress question-answer pairs
      - Preserve decision points only
    token_savings: "30-60%"
    quality_impact: "Medium"
  
  Technical_Specifications:
    techniques:
      - Use abbreviated formats
      - Remove redundant details
      - Compress configuration examples
      - Use references instead of full content
    token_savings: "25-45%"
    quality_impact: "Low"
```

## Real-time Monitoring Configuration

### 📊 **Monitoring Parameters**
```yaml
Monitoring_Configuration:
  update_frequency:
    real_time_tracking: "Every message exchange"
    threshold_checking: "Every 30 seconds"
    rate_limit_monitoring: "Every 60 seconds"
    specification_updates: "Every 24 hours"
  
  accuracy_requirements:
    token_counting_accuracy: "99% or better"
    threshold_detection_accuracy: "100%"
    rate_limit_tracking_accuracy: "95% or better"
    model_detection_accuracy: "100%"
  
  performance_requirements:
    monitoring_overhead: "<1% CPU usage"
    memory_footprint: "<10MB"
    response_latency: "<100ms"
    update_frequency: "Real-time"
  
  alert_configuration:
    warning_notifications: "Non-intrusive status bar updates"
    alert_notifications: "Modal dialog with options"
    critical_notifications: "Immediate action required dialog"
    emergency_notifications: "Automatic optimization with notification"
```

### ⚡ **Dynamic Threshold Adjustment**
```yaml
Adaptive_Thresholds:
  conversation_type_adjustments:
    code_heavy_conversations:
      warning_threshold: "75%"  # Code is more compressible
      alert_threshold: "85%"
      critical_threshold: "92%"
    
    documentation_conversations:
      warning_threshold: "80%"  # Standard thresholds
      alert_threshold: "90%"
      critical_threshold: "95%"
    
    analysis_conversations:
      warning_threshold: "85%"  # Preserve more context
      alert_threshold: "92%"
      critical_threshold: "97%"
  
  user_preference_adjustments:
    conservative_users:
      warning_threshold: "70%"
      alert_threshold: "80%"
      critical_threshold: "90%"
    
    aggressive_users:
      warning_threshold: "85%"
      alert_threshold: "93%"
      critical_threshold: "97%"
```

## Cost Optimization Matrix

### 💰 **Cost-Aware Token Management**
```yaml
Cost_Optimization:
  model_selection_by_cost:
    ultra_low_cost:
      models: ["gpt-3.5-turbo", "claude-3-haiku"]
      cost_per_1k_tokens: "$0.0005 - $0.0015"
      use_cases: ["Simple tasks", "High volume", "Cost-sensitive"]
    
    low_cost:
      models: ["gemini-pro", "claude-3-sonnet"]
      cost_per_1k_tokens: "$0.003 - $0.015"
      use_cases: ["General purpose", "Balanced quality/cost"]
    
    premium_cost:
      models: ["gpt-4-turbo", "claude-3-opus"]
      cost_per_1k_tokens: "$0.01 - $0.075"
      use_cases: ["Complex reasoning", "High quality required"]
  
  token_efficiency_strategies:
    high_volume_scenarios:
      - Aggressive conversation summarization
      - Minimal context preservation
      - Batch processing optimization
      - Template-based responses
    
    quality_focused_scenarios:
      - Conservative optimization
      - Maximum context preservation
      - Quality-aware summarization
      - Detailed conversation history
```

## Context7 Research Integration

### 🔬 **Automated Token Limit Research**
```yaml
Token_Limit_Research:
  query_template: "{model_provider} {model_name} token limits context window updates July 2025"
  sources: ["api_documentation", "provider_announcements", "rate_limit_pages"]
  focus: ["token_limits", "rate_limits", "pricing_changes", "context_windows"]

Rate_Limit_Research:
  query_template: "{model_provider} API rate limits tier pricing token quotas 2025"
  sources: ["pricing_documentation", "api_specifications", "usage_guidelines"]
  focus: ["rate_limits", "tier_structures", "quota_management", "optimization"]

Optimization_Research:
  query_template: "AI token optimization strategies conversation efficiency {model_name}"
  sources: ["optimization_guides", "best_practices", "efficiency_studies"]
  focus: ["token_efficiency", "conversation_optimization", "cost_reduction"]
```

This comprehensive token limits database provides Chronos with precise, real-time information about token limits, optimization thresholds, and cost-effective strategies for managing token consumption across all major AI models and providers.
