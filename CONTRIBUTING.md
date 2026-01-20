# Contributing to DIAG Video Call UI Kit

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Development Setup

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Getting Started

```bash
# Clone the repository
git clone https://github.com/YOUR_ORG/diag-video-call-ui-kit.git
cd diag-video-call-ui-kit

# Install dependencies
pnpm install

# Start the playground
pnpm dev

# Run tests
pnpm test

# Build all packages
pnpm build
```

## Project Structure

```
├── packages/
│   ├── core/              # Headless state management
│   ├── ui-kit/            # Vue 3 components
│   └── adapters/
│       └── agora-web/     # Agora SDK adapter
└── apps/
    └── playground/        # Demo application
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/my-fix
```

### 2. Make Changes

- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run tests
pnpm test

# Run linting
pnpm lint

# Type check
pnpm typecheck

# Build all packages
pnpm build
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat(ui-kit): add new component"
git commit -m "fix(core): resolve state sync issue"
git commit -m "docs: update README"
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### 5. Submit a Pull Request

1. Push your branch to GitHub
2. Open a Pull Request against `main`
3. Fill out the PR template
4. Wait for review

## Code Style

- TypeScript for all code
- Vue 3 Composition API with `<script setup>`
- CSS scoped to components using `scoped` attribute
- BEM naming convention for CSS classes (`.vc-component__element--modifier`)

## Testing

- Write unit tests for core logic
- Write component tests for Vue components
- Use Vitest and Vue Test Utils

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Run specific test file
pnpm test packages/core/src/__tests__/store.spec.ts
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update CHANGELOG.md for notable changes

## i18n

When adding or modifying user-facing text:

1. Add keys to both `vi` and `en` in `packages/ui-kit/src/i18n/messages.ts`
2. Use the `vc.` prefix for all keys
3. Follow the existing key structure

## Releasing

Releases are automated via GitHub Actions:

1. Update version in all package.json files
2. Update CHANGELOG.md
3. Create a git tag: `git tag v1.0.1`
4. Push the tag: `git push origin v1.0.1`

The CI will automatically build and publish to GitHub Packages.

## Questions?

Open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
