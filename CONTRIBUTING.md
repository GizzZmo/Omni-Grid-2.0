# CONTRIBUTING PROTOCOLS

## 1. Code Style

- **Aesthetic:** We prioritize "Cyberpunk/High-Density" UI. Use small fonts (`text-xs`, `text-[10px]`) and mono-spaced typefaces where appropriate.
- **Icons:** Use `lucide-react` exclusively.
- **Colors:** Adhere to the `slate-950` background palette. Use vivid accent colors (`cyan`, `emerald`, `fuchsia`, `amber`) for data points.
- **TypeScript:** Strict mode enabled. All code must be properly typed.
- **Formatting:** Use Prettier with the project's configuration (`npm run format`).
- **Comments:** Match the existing comment style. Block comments for file-level JSDoc; inline comments only for non-obvious logic.

## 1.1 Local Setup

```bash
# Install dependencies
npm install

# Run all UI tests
npm run test:run

# Type safety check (strict mode)
npm run typecheck

# Linting
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format code
npm run format

# Check formatting without writing
npm run format:check
```

## 1.2 Environment Configuration

For AI features and sandboxed execution, create a `.env` file:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
E2B_API_KEY=your_e2b_api_key_here
```

See [Configuration Guide](./docs/configuration.md) for details.

## 1.3 Conventions

### Naming

| Item                | Convention                | Example                  |
| ------------------- | ------------------------- | ------------------------ |
| Widget files        | PascalCase                | `MyWidget.tsx`           |
| WidgetType values   | SCREAMING_SNAKE_CASE      | `MY_WIDGET`              |
| Store slices        | camelCase                 | `myWidgetData`           |
| CSS utility classes | Tailwind utilities only   | `text-xs font-bold`      |
| Test files          | camelCase matching widget | `test/myWidget.test.tsx` |
| Catalog ID          | Must match WidgetType     | `'MY_WIDGET'`            |

### File structure

```
widgets/
  MyWidget.tsx          # component
  marketplaceCatalog.ts # add your entry here

components/
  GridContainer.tsx     # register widget shell here
  WidgetLauncher.tsx    # add to WIDGET_REGISTRY here

test/
  myWidget.test.tsx     # required for all new widgets

types.ts                # add WidgetType and any new interfaces
store.ts                # add state slice if your widget needs persistence
```

---

## 2. Widget Guidelines

- **Isolation:** Widgets should be self-contained. They should not rely on the internal state of other widgets unless communicating via the global Store or Cross-Talk.
- **Responsiveness:** Widgets must handle resizing gracefully. Use `flex` and `min-h-0` patterns to ensure scrollbars appear correctly within the grid item.
- **Documentation:** Add a clear description comment at the top of your widget file explaining its purpose and key features.
- **Naming:** Widget files should be in PascalCase (e.g., `MyNewWidget.tsx`).
- **Performance:** Use `useMemo` and `useCallback` for expensive computations. CPU-intensive work must use Web Workers.
- **Graceful degradation:** All external API calls must handle errors, missing API keys, and network failure without crashing.

---

## 3. Marketplace Submission

To submit a new widget to the Widget Marketplace:

1. **Build** the widget following the [Widget Development Guide](./docs/widget-development.md).
2. **Security review** — verify every item in [Plugin Security Protocol §7](./docs/plugin-security.md#7-security-checklist-for-widget-submissions).
3. **Add catalog entry** — append to `widgets/marketplaceCatalog.ts` with `isCore: false`.
4. **Write tests** — create `test/myWidget.test.tsx` (see §6 Testing below).
5. **Open PR** using the [Developer Portal submission workflow](./docs/developer-portal.md).

---

## 4. Pull Requests

1. Fork the repository.
2. Create a feature branch (`feat/my-widget-name` or `fix/bug-description`).
3. Make your changes following the code style guidelines.
4. Run tests: `npm run test:run` — all tests must pass.
5. Lint your code: `npm run lint:fix`
6. Format your code: `npm run format`
7. Commit changes with clear, descriptive messages using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add MyWidget with X feature`
   - `fix: resolve state reset bug in WeatherStation`
   - `docs: update API reference with marketplace section`
   - `test: add tests for MyWidget`
8. Open a Pull Request with a detailed description.
9. **Requirement:** All new widgets must include:
   - Update to `types.ts` (WidgetType)
   - Update to `GridContainer.tsx` (widget shell)
   - Update to `WidgetLauncher.tsx` (WIDGET_REGISTRY)
   - Entry in `widgets/marketplaceCatalog.ts`
   - Test file in `test/`

### PR Review Criteria

PRs are reviewed against these criteria:

| Criterion                    | Required            |
| ---------------------------- | ------------------- |
| All existing tests pass      | ✅ Hard requirement |
| New widget has tests         | ✅ Hard requirement |
| Security checklist passed    | ✅ Hard requirement |
| TypeScript strict compliance | ✅ Hard requirement |
| Follows design guidelines    | ✅ Hard requirement |
| Catalog entry included       | ✅ For widget PRs   |
| Performance acceptable       | Reviewer judgment   |
| Documentation updated        | Reviewer judgment   |

---

## 5. AI Usage

This project uses `@google/genai` for AI features. If your feature uses AI:

- Ensure you handle errors gracefully (e.g., if the user has no API key)
- Provide visual feedback (spinners/loaders) during API calls
- Display helpful error messages when API calls fail
- Consider rate limiting and cost implications
- Test with and without API keys to ensure graceful degradation

---

## 6. Testing

### Requirements

| Test type               | Required?               | Notes                                   |
| ----------------------- | ----------------------- | --------------------------------------- |
| Render test (no errors) | ✅ All widgets          | `render(<MyWidget />)` without throwing |
| Key interaction         | ✅ All widgets          | Test at least one button/input          |
| State integration       | ✅ If store state added | Test the action and selector            |
| Error state             | Recommended             | Test behavior when API call fails       |
| Loading state           | Recommended             | Test loading indicator display          |
| Responsive resize       | Manual only             | Verify in dev server                    |

### Test stack

- **Test runner:** Vitest
- **Renderer:** @testing-library/react
- **Assertions:** @testing-library/jest-dom
- **Interactions:** @testing-library/user-event

### Running tests

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm test

# Run with coverage report
npm run test:coverage

# Run with UI
npm run test:ui
```

### Test file template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyWidget } from '../widgets/MyWidget';

// Mock store — only include the slices your widget uses
vi.mock('../store', () => ({
  useAppStore: vi.fn((selector) =>
    selector({
      myWidgetData: null,
      setMyWidgetData: vi.fn(),
    })
  ),
}));

describe('MyWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    render(<MyWidget />);
    expect(screen.getByText(/my widget/i)).toBeTruthy();
  });

  it('handles primary action', async () => {
    const user = userEvent.setup();
    render(<MyWidget />);
    await user.click(screen.getByRole('button', { name: /action/i }));
    // assert expected result
  });

  it('shows error state when data is unavailable', () => {
    render(<MyWidget />);
    // assert error UI is shown when appropriate
  });
});
```

### Pre-existing test patterns

Study these tests as templates:

| Widget         | Test file                      | Covers                          |
| -------------- | ------------------------------ | ------------------------------- |
| WeatherStation | `test/weatherStation.test.tsx` | Render, location input, refresh |
| GitPulse       | `test/gitPulse.test.tsx`       | Token input, repo fetch mock    |
| ProjectTracker | `test/projectTracker.test.tsx` | Task CRUD, status toggle        |
| PromptEngine   | `test/promptEngine.test.ts`    | Pure function unit tests        |

---

## 7. Documentation

When contributing new features:

- Update relevant documentation in `docs/` folder
- Add your widget to the widget list in `docs/README.md` if you add a significant widget
- Add a catalog entry in `widgets/marketplaceCatalog.ts`
- Update `README.md` if adding a major platform feature
- Include code comments for complex logic
- Add JSDoc comments for public APIs and utility functions

---

## 8. Questions?

- Check the [FAQ](./docs/faq.md) for common questions
- Review [Architecture](./docs/architecture.md) for technical details
- Read [Widget Development](./docs/widget-development.md) for widget creation guide
- Read the [Developer Portal](./docs/developer-portal.md) for submission workflow
- Open an issue if you need help
