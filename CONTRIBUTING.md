# Contributing to EMAD

Thank you for your interest in contributing to EMAD (Ecosystem for BMad Method AI Development)! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Types of Contributions

We welcome several types of contributions:

- **🐛 Bug Reports**: Help us identify and fix issues
- **✨ Feature Requests**: Suggest new features or improvements
- **📝 Documentation**: Improve our documentation and guides
- **🔧 Code Contributions**: Submit bug fixes, new features, or improvements
- **🤖 AI Agent Development**: Create new AI agents or enhance existing ones
- **🎨 UI/UX Improvements**: Enhance the user interface and experience
- **🧪 Testing**: Add or improve test coverage
- **🌐 Translations**: Help translate EMAD to other languages

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **VS Code** 1.74.0 or higher
- **Git** for version control
- **TypeScript** knowledge for code contributions

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/EMAD.git
   cd EMAD
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up development environment**:
   ```bash
   # Start development mode
   npm run watch
   
   # Open in VS Code
   code .
   ```

5. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards
3. **Add tests** for new functionality
4. **Run tests** and ensure they pass:
   ```bash
   npm test
   npm run lint
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub

## 📋 Coding Standards

### TypeScript Guidelines

- **Use TypeScript** for all source code
- **Follow strict type checking** - no `any` types unless absolutely necessary
- **Use interfaces** for object type definitions
- **Document public APIs** with JSDoc comments
- **Use meaningful variable and function names**

### Code Style

- **Use Prettier** for code formatting (configured in `.prettierrc`)
- **Use ESLint** for code linting (configured in `.eslintrc.json`)
- **Follow consistent naming conventions**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and interfaces
  - `UPPER_SNAKE_CASE` for constants
  - `kebab-case` for file names

### File Organization

```
src/
├── agents/           # AI agent implementations
├── commands/         # VS Code command handlers
├── integration/      # External service integrations
├── types/           # TypeScript type definitions
├── ui/              # User interface components
├── utils/           # Utility functions
└── extension.ts     # Main extension entry point
```

### AI Agent Development

When creating new AI agents:

1. **Create agent class** in `src/agents/`
2. **Add persona file** in `bmad-agent/personas/`
3. **Define tasks** in `bmad-agent/tasks/`
4. **Create templates** in `bmad-agent/templates/`
5. **Add checklists** in `bmad-agent/checklists/`
6. **Update type definitions** in `src/types/BMadTypes.ts`
7. **Register commands** in `src/commands/CommandManager.ts`
8. **Add Augment workflows** in `src/integration/AugmentIntegration.ts`

## 🧪 Testing

### Test Structure

- **Unit tests**: Test individual functions and classes
- **Integration tests**: Test component interactions
- **E2E tests**: Test complete workflows

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "AgentName"
```

### Writing Tests

- **Use descriptive test names** that explain what is being tested
- **Follow AAA pattern**: Arrange, Act, Assert
- **Mock external dependencies** appropriately
- **Test both success and error cases**

Example test structure:
```typescript
describe('SynergyAgent', () => {
  describe('validateDependencies', () => {
    it('should successfully validate dependencies when all are secure', async () => {
      // Arrange
      const agent = new SynergyAgent(mockContext7, mockStatusBar, mockLogger);
      const projectPath = '/test/project';
      
      // Act
      const result = await agent.validateDependenciesFutureProofing(projectPath);
      
      // Assert
      expect(result.isValidationSuccessful).toBe(true);
      expect(result.securityScore).toBeGreaterThan(8);
    });
  });
});
```

## 📝 Documentation

### Documentation Standards

- **Use clear, concise language**
- **Include code examples** where appropriate
- **Keep documentation up-to-date** with code changes
- **Use proper Markdown formatting**
- **Include screenshots** for UI-related documentation

### Documentation Types

- **API Documentation**: Document all public APIs with JSDoc
- **User Guides**: Step-by-step instructions for users
- **Developer Guides**: Technical documentation for contributors
- **Agent Documentation**: Detailed agent capabilities and usage

## 🐛 Bug Reports

### Before Submitting a Bug Report

1. **Check existing issues** to avoid duplicates
2. **Update to the latest version** and test again
3. **Gather relevant information**:
   - VS Code version
   - EMAD extension version
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages or logs

### Bug Report Template

```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- OS: [e.g., Windows 10, macOS 12.0]
- VS Code Version: [e.g., 1.74.0]
- EMAD Version: [e.g., 1.0.0]

**Additional Context**
Any other context about the problem.
```

## ✨ Feature Requests

### Before Submitting a Feature Request

1. **Check existing feature requests** to avoid duplicates
2. **Consider if the feature fits** EMAD's scope and goals
3. **Think about implementation** and potential challenges

### Feature Request Template

```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Use Case**
Describe the problem this feature would solve.

**Proposed Solution**
Describe how you envision this feature working.

**Alternatives Considered**
Any alternative solutions you've considered.

**Additional Context**
Any other context or screenshots about the feature request.
```

## 🔄 Pull Request Process

### Pull Request Guidelines

1. **Follow the coding standards** outlined above
2. **Include tests** for new functionality
3. **Update documentation** as needed
4. **Keep PRs focused** - one feature or fix per PR
5. **Write clear commit messages** following conventional commits
6. **Ensure CI passes** before requesting review

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(agents): add Synergy agent for integrated development
fix(commands): resolve command registration issue
docs(readme): update installation instructions
```

### Pull Request Template

```markdown
**Description**
Brief description of changes.

**Type of Change**
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (please describe)

**Testing**
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Manual testing completed

**Checklist**
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

## 🏷️ Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. **Update version** in `package.json`
2. **Update CHANGELOG.md** with release notes
3. **Create release tag**: `git tag v1.0.0`
4. **Push tag**: `git push origin v1.0.0`
5. **Create GitHub release** with release notes
6. **Publish to VS Code Marketplace** (maintainers only)

## 🤔 Questions and Support

### Getting Help

- **GitHub Discussions**: For general questions and discussions
- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: Check our comprehensive docs first
- **Code Review**: Ask for feedback on your contributions

### Community Guidelines

- **Be respectful** and inclusive
- **Help others** when you can
- **Follow the code of conduct**
- **Stay on topic** in discussions
- **Provide constructive feedback**

## 📄 License

By contributing to EMAD, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- **CONTRIBUTORS.md** file
- **Release notes** for significant contributions
- **GitHub contributors** section

Thank you for contributing to EMAD! 🚀✨
