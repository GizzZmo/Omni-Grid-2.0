# Testing Guide

This document provides information about testing in the Omni-Grid project.

## 🧪 Testing Framework

Omni-Grid uses **Vitest** as its testing framework, providing:
- ⚡ Fast execution with Vite's transformation pipeline
- 🔄 Watch mode for development
- 📊 Built-in coverage reporting
- 🎯 Jest-compatible API
- 🖥️ Optional UI for test visualization

## 📁 Test Structure

```
test/
├── setup.ts          # Global test setup and configuration
├── App.test.tsx      # App component tests
└── utils.test.ts     # Utility function tests
```

## 🚀 Running Tests

### Basic Commands

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI/CD)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Coverage Reports

Coverage reports are generated in the `coverage/` directory:
- `coverage/index.html` - Visual coverage report
- `coverage/coverage-summary.json` - JSON summary for CI/CD

## ✍️ Writing Tests

### Basic Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myModule';

describe('MyModule', () => {
  describe('myFunction', () => {
    it('should return expected value', () => {
      const result = myFunction('input');
      expect(result).toBe('expected');
    });
  });
});
```

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render without crashing', () => {
    const { container } = render(<MyComponent />);
    expect(container).toBeTruthy();
  });

  it('should display correct text', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Hello World')).toBeInTheDocument();
  });
});
```

## 🎯 Test Organization

### Naming Conventions

- Test files: `*.test.ts` or `*.test.tsx`
- Test descriptions: Use clear, descriptive names
- Group related tests with `describe` blocks

### Best Practices

1. **Keep tests focused**: Each test should verify one behavior
2. **Use descriptive names**: Test names should explain what they verify
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Avoid test interdependence**: Each test should run independently
5. **Mock external dependencies**: Use Vitest mocks for API calls, etc.

## 📊 Coverage Thresholds

Current coverage goals:
- **Statements**: > 70%
- **Branches**: > 60%
- **Functions**: > 70%
- **Lines**: > 70%

View coverage in CI/CD:
- Coverage reports are posted as PR comments
- Coverage artifacts are uploaded to GitHub Actions

## 🔧 Configuration

Test configuration is in `vite.config.ts`:

```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './test/setup.ts',
  css: true,
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: [
      'node_modules/',
      'dist/',
      'test/',
      '**/*.config.ts',
      '**/*.config.js'
    ]
  }
}
```

## 🐛 Debugging Tests

### Run specific test file

```bash
npm test -- test/utils.test.ts
```

### Run tests matching pattern

```bash
npm test -- -t "should render"
```

### Debug in VSCode

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test"],
  "console": "integratedTerminal"
}
```

## 📚 Testing Libraries

Installed libraries:
- **vitest**: Test runner and framework
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM
- **jsdom**: DOM implementation for Node.js
- **@vitest/ui**: Optional UI for test visualization

## 🔄 CI/CD Integration

Tests run automatically in GitHub Actions:

1. **On every push and PR**: All tests must pass
2. **Coverage reporting**: Automatic PR comments with coverage data
3. **Artifacts**: Coverage reports saved for 7 days

See `.github/workflows/ci.yml` for CI configuration.

## 🎨 Test UI

Launch the visual test UI:

```bash
npm run test:ui
```

This opens a browser interface where you can:
- ✅ See all tests and their status
- 🔍 Filter and search tests
- 📊 View coverage visually
- 🐛 Debug failing tests

## 📝 Adding New Tests

### For New Widgets

When adding a new widget, create a test file:

```typescript
// test/widgets/MyWidget.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MyWidget from '../../widgets/MyWidget';

describe('MyWidget', () => {
  it('should render without crashing', () => {
    const { container } = render(<MyWidget />);
    expect(container).toBeTruthy();
  });

  // Add more specific tests
});
```

### For Utility Functions

```typescript
// test/myUtils.test.ts
import { describe, it, expect } from 'vitest';
import { myUtilFunction } from '../myUtils';

describe('myUtils', () => {
  describe('myUtilFunction', () => {
    it('should handle normal case', () => {
      expect(myUtilFunction('input')).toBe('expected');
    });

    it('should handle edge case', () => {
      expect(myUtilFunction('')).toBe('default');
    });
  });
});
```

## 🚨 Common Issues

### Issue: Tests fail with "document is not defined"

**Solution**: Make sure your test file uses the jsdom environment (configured globally in vite.config.ts)

### Issue: Coverage not generating

**Solution**: Run `npm run test:coverage` instead of `npm test`

### Issue: Tests pass locally but fail in CI

**Solution**: 
- Check for environment-specific code
- Ensure all dependencies are in package.json
- Check for timing issues (add proper waits)

## 📖 Further Reading

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

*Last Updated: 2025-12-27*  
*For questions about testing, please open an issue with the `testing` label.*
