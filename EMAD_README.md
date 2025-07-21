# EMAD - Ecosystem for BMad Method AI Development

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue.svg)](https://marketplace.visualstudio.com/vscode)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

**EMAD** is a comprehensive VS Code extension that implements the **BMad Method** - a revolutionary approach to AI-assisted software development through specialized AI agents that collaborate to deliver enterprise-grade solutions.

## 🚀 Overview

EMAD provides a complete ecosystem of AI agents, each specialized in different aspects of software development, working together to transform your development workflow. From project planning to deployment, our AI agents provide intelligent assistance, automation, and optimization.

## 🤖 AI Agent Ecosystem

### Core Development Agents
- **🎯 John (Product Manager)** - Product requirements, planning, and stakeholder management
- **🏗️ Fred (Architect)** - System architecture, technical design, and integration planning
- **🎨 Jane (Design Architect)** - UI/UX design, design systems, and user experience optimization
- **🔒 Sage (Security Engineer)** - Security assessment, vulnerability management, and compliance
- **⚙️ Alex (Platform Engineer)** - DevOps, infrastructure, and deployment automation

### Specialized Enhancement Agents
- **🔄 Synergy (Integrated Development & AI Enhancement)** - Holistic project enhancement, dependency management, code refinement, and AI integration
- **📦 Dakota (Dependency Modernization)** - Dependency analysis, updates, and modernization strategies
- **⚡ Phoenix (Performance Optimization)** - Performance analysis, optimization, and scalability enhancement
- **⏰ Chronos (Temporal Coordination)** - Timeline management, scheduling, and project coordination
- **✅ Sentinel (Quality Assurance)** - Task completion validation, quality control, and compliance monitoring

### Automation & Orchestration Agents
- **🤖 Agent Creator** - AI agent generation and customization
- **🌐 Web Agent Creator** - Web-based AI interface creation and deployment
- **📚 DocQA** - Document analysis, Q&A, and knowledge management
- **🎯 Chunky** - Task execution, resource orchestration, and workflow automation
- **🎭 Meta-Orchestrator** - Strategic coordination and multi-agent orchestration

## ✨ Key Features

### 🔧 **Comprehensive Development Support**
- **Multi-language support** for all major programming languages
- **Intelligent code analysis** with automated suggestions and improvements
- **Real-time collaboration** between AI agents for complex problem-solving
- **Context-aware assistance** that understands your project's unique requirements

### 🎯 **Specialized Workflows**
- **Documentation Mode** - Generate complete project documentation
- **Full Development Mode** - End-to-end application development
- **Enhancement Mode** - Comprehensive project improvement and optimization
- **AI Integration Mode** - Intelligent AI capability integration

### 🔍 **Advanced Capabilities**
- **Context7 Research Integration** - Automatic research for latest technologies and best practices
- **Augment Code Integration** - Seamless integration with Augment Code workflows
- **Cross-platform deployment** support for web, mobile, and desktop applications
- **Enterprise-grade security** with comprehensive vulnerability assessment

## 🛠️ Installation

### Prerequisites
- **VS Code** 1.74.0 or higher
- **Node.js** 18.0.0 or higher
- **TypeScript** 4.9.0 or higher

### Quick Install
1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/EMAD.git
   cd EMAD
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run compile
   ```

4. **Install the extension**:
   ```bash
   code --install-extension ./emad-*.vsix
   ```

### Development Setup
```bash
# Clone and setup for development
git clone https://github.com/YOUR_USERNAME/EMAD.git
cd EMAD
npm install

# Start development mode
npm run watch

# Run tests
npm test

# Package extension
npm run package
```

## 🚀 Quick Start

### 1. **Activate EMAD**
- Open VS Code
- Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
- Type "EMAD: Activate" and select the command

### 2. **Choose Your Mode**
- **Documentation Mode**: Generate comprehensive project documentation
- **Full Development Mode**: Complete application development workflow
- **Enhancement Mode**: Improve existing projects with AI assistance

### 3. **Select AI Agents**
- Choose from our specialized AI agents based on your project needs
- Agents will collaborate automatically to deliver optimal results

### 4. **Start Development**
- Follow the guided workflow provided by your selected agents
- Receive real-time assistance, suggestions, and automated improvements

## 📋 Usage Examples

### Generate Project Documentation
```bash
# Activate Documentation Mode
Ctrl+Shift+P → "EMAD: Documentation Mode"

# Select agents: John, Fred, Tyler
# Agents will generate:
# - Product Requirements Document (PRD)
# - Technical Architecture Document
# - Implementation Checklist
```

### Enhance Existing Project
```bash
# Activate Enhancement Mode
Ctrl+Shift+P → "EMAD: Enhancement Mode"

# Select Synergy agent for comprehensive enhancement
# Includes:
# - Dependency validation and modernization
# - Code quality improvement and refactoring
# - AI integration opportunities
# - Performance optimization
```

### Create New Application
```bash
# Activate Full Development Mode
Ctrl+Shift+P → "EMAD: Full Development Mode"

# Select development stack and agents
# Receive end-to-end development assistance
```

## 🏗️ Architecture

### Agent Communication
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  Orchestrator   │───▶│   AI Agents     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Results      │◀───│  Integration    │◀───│   Context7      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: TypeScript, VS Code Extension API
- **Backend**: Node.js, Express.js
- **AI Integration**: Context7, Augment Code
- **Build System**: Webpack, ESBuild
- **Testing**: Mocha, Jest
- **Documentation**: Markdown, TypeDoc

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run tests**: `npm test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Standards
- **TypeScript** for all source code
- **ESLint** for code linting
- **Prettier** for code formatting
- **Jest/Mocha** for testing
- **Comprehensive documentation** for all features

## 📚 Documentation

- **[Installation Guide](docs/INSTALLATION.md)** - Detailed installation instructions
- **[User Guide](docs/USER_GUIDE.md)** - Comprehensive usage documentation
- **[Agent Reference](docs/AGENT_REFERENCE.md)** - Complete agent capabilities and APIs
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** - Development and contribution guidelines
- **[API Documentation](docs/API.md)** - Complete API reference

## 🔧 Configuration

### Extension Settings
```json
{
  "emad.enableAutoCompletion": true,
  "emad.defaultMode": "documentation",
  "emad.agentCollaboration": true,
  "emad.context7Integration": true,
  "emad.augmentIntegration": true
}
```

### Agent Configuration
Customize agent behavior through the `bmad-agent/` configuration files:
- **Personas**: Define agent personalities and capabilities
- **Tasks**: Configure agent workflows and processes
- **Templates**: Customize output formats and structures
- **Checklists**: Define quality assurance and validation criteria

## 🐛 Troubleshooting

### Common Issues
1. **Extension not loading**: Check VS Code version compatibility
2. **Agent not responding**: Verify network connectivity for Context7
3. **Build errors**: Ensure all dependencies are installed
4. **Performance issues**: Check system resources and close unnecessary applications

### Support
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check our comprehensive docs
- **Community**: Join our developer community discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Augment Code** for integration platform support
- **Context7** for research and knowledge capabilities
- **VS Code Team** for the excellent extension platform
- **Open Source Community** for inspiration and contributions

## 🔗 Links

- **[GitHub Repository](https://github.com/YOUR_USERNAME/EMAD)**
- **[VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=emad)**
- **[Documentation](https://emad-docs.github.io)**
- **[Community Discord](https://discord.gg/emad)**

---

**EMAD** - Transforming software development through intelligent AI collaboration. 🚀✨
