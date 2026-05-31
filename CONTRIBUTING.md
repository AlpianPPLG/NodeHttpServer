# Contributing to Velocity

Thank you for your interest in contributing to Velocity! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/velocity.git
   cd velocity
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development services**
   ```bash
   # Start PostgreSQL and Redis with Docker
   docker-compose -f docker-compose.dev.yml up -d postgres redis
   
   # Or start everything including API
   docker-compose -f docker-compose.dev.yml up -d
   ```

5. **Setup database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Verify setup**
   - API: http://localhost:3000/health
   - API Docs: http://localhost:3000/api-docs
   - Database UI: http://localhost:8080 (Adminer)

## 📁 Project Structure

```
velocity/
├── src/
│   ├── controllers/      # API request handlers
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic
│   ├── repositories/     # Data access layer
│   ├── middleware/       # Express middleware
│   ├── schemas/          # Zod validation schemas
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration
│   └── database/         # Database setup
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── fixtures/         # Test data
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── docs/                 # Documentation
```

## 🔄 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Feature development
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes

### Workflow Steps

1. **Create feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Write code following our standards
   - Add/update tests
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run test:coverage
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add user authentication"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create Pull Request on GitHub
   ```

## 📝 Coding Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer `interface` over `type` for object shapes
- Use explicit return types for functions
- Avoid `any` type, use `unknown` instead
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### Code Style

- Use Prettier for formatting (configured)
- Use ESLint rules (configured)
- Use meaningful variable and function names
- Write self-documenting code
- Add JSDoc comments for public APIs

### Example Code Style

```typescript
/**
 * Creates a new user account
 * @param userData - User registration data
 * @returns Promise resolving to created user
 */
export async function createUser(userData: CreateUserInput): Promise<User> {
  const existingUser = await userRepository.findByEmail(userData.email);
  
  if (existingUser) {
    throw new ConflictError('Email already exists');
  }

  const hashedPassword = await hashPassword(userData.password);
  
  return userRepository.create({
    ...userData,
    password: hashedPassword,
  });
}
```

### File Naming

- Use kebab-case for files: `user-controller.ts`
- Use PascalCase for classes: `UserController`
- Use camelCase for functions and variables: `createUser`
- Use UPPER_CASE for constants: `JWT_SECRET`

## 🧪 Testing Guidelines

### Test Structure

- **Unit tests**: Test individual functions/methods
- **Integration tests**: Test API endpoints
- **Test coverage**: Maintain >80% coverage

### Writing Tests

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const user = await userService.createUser(userData);

      // Assert
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });

    it('should throw error for duplicate email', async () => {
      // Arrange
      const userData = { /* ... */ };
      await userService.createUser(userData);

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects
        .toThrow(ConflictError);
    });
  });
});
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- user.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create user"
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat: add user authentication
fix: resolve database connection issue
docs: update API documentation
test: add unit tests for user service
refactor: improve error handling
chore: update dependencies
```

### Scope Examples

```bash
feat(auth): add JWT token validation
fix(db): resolve connection pool issue
docs(api): update endpoint documentation
```

## 🔄 Pull Request Process

### Before Creating PR

1. **Ensure your branch is up to date**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-feature-branch
   git rebase develop
   ```

2. **Run all checks**
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

3. **Update documentation** if needed

### PR Requirements

- [ ] Code follows project standards
- [ ] Tests are added/updated
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] No merge conflicts
- [ ] PR description is clear

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by maintainers
3. **Address feedback** if any
4. **Approval** from maintainers
5. **Merge** to develop branch

## 🐛 Bug Reports

### Before Reporting

1. Check existing issues
2. Reproduce the bug
3. Gather system information

### Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Ubuntu 22.04]
- Node.js: [e.g., 20.10.0]
- npm: [e.g., 10.2.3]
- Velocity version: [e.g., 1.0.0]

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this be implemented?

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Any other relevant information
```

## 📞 Getting Help

- **Documentation**: Check the [docs](./docs/) folder
- **Issues**: Search existing [GitHub Issues](https://github.com/velocity/velocity/issues)
- **Discussions**: Join [GitHub Discussions](https://github.com/velocity/velocity/discussions)
- **Discord**: Join our [Discord server](https://discord.gg/velocity)

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor highlights

Thank you for contributing to Velocity! 🚀