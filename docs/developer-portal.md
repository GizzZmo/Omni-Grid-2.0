# DEVELOPER PORTAL // WIDGET SUBMISSION GUIDE

```text
[ DOCUMENTATION: DEVELOPER-PORTAL.MD ]
[ MODE: COMMUNITY CONTRIBUTION ]
```

## Overview

The Omni-Grid Developer Portal is your gateway to building and publishing widgets to the marketplace. This guide covers everything from setting up your development environment to getting your widget reviewed and merged into the official catalog.

All widgets — from one-person utilities to complex AI-powered tools — go through the same transparent review process. Community widgets are equal citizens alongside core widgets.

---

## Quick Start

```bash
# 1. Fork and clone the repo
git clone https://github.com/your-username/Omni-Grid-2.0.git
cd Omni-Grid-2.0

# 2. Install dependencies
npm install

# 3. Create your feature branch
git checkout -b feat/my-widget-name

# 4. Start the dev server
npm run dev
```

Open http://localhost:5173, open the Widget Launcher, and your new widget will appear once registered.

---

## Submission Workflow

```
Step 1: Build & test locally
   ↓
Step 2: Pass the security checklist  (docs/plugin-security.md §7)
   ↓
Step 3: Add catalog entry  (widgets/marketplaceCatalog.ts)
   ↓
Step 4: Write tests  (test/myWidget.test.tsx)
   ↓
Step 5: Open pull request  (target: main)
   ↓
Step 6: Review  (core team · 7-day SLA)
   ↓
Step 7: Merge & publish
```

---

## Step-by-Step Guide

### 1. Build Your Widget

Follow the [Widget Development Guide](./widget-development.md) to create your component. At minimum your widget needs:

- A `WidgetType` entry in `types.ts`
- A React component file in `widgets/`
- Registration in `components/GridContainer.tsx`
- An entry in `components/WidgetLauncher.tsx` (WIDGET_REGISTRY)

### 2. Pass the Security Checklist

Every submission is reviewed against the [Plugin Security Protocol](./plugin-security.md). Before opening a PR, self-verify every item in §7 of that document.

Critical requirements:

- No `eval()`, `new Function()`, or dynamic code execution
- No `dangerouslySetInnerHTML` with unsanitized input
- HTTPS-only network requests to approved endpoints
- No hardcoded secrets or API keys
- `localStorage` keys prefixed with `omni-`

If your widget needs network access to a new endpoint not in the approved list, include a justification in your PR description and the core team will review it.

### 3. Add a Catalog Entry

Open `widgets/marketplaceCatalog.ts` and append your entry to the `MARKETPLACE_CATALOG` array:

```typescript
{
  id: 'MY_WIDGET',          // must match your WidgetType
  name: 'My Widget',
  description: 'A short, clear description of what this widget does and who it is for.',
  version: '1.0.0',         // semver — start at 1.0.0
  author: 'your-github-username',
  category: 'utility',      // see MarketplaceCategory in types.ts
  tags: ['tag1', 'tag2'],   // 2–6 descriptive tags
  downloads: 0,             // start at 0
  rating: 0,                // start at 0 — system will accrue ratings post-launch
  updatedAt: '2025-MM-DD',  // ISO date of this version
  changelog: 'Initial release.',
  isCore: false,            // MUST be false for community submissions
  minGridW: 4,              // minimum grid columns required
  minGridH: 6,              // minimum grid rows required
},
```

**Category options:**

| Value | Use for |
|---|---|
| `utility` | General tools (calculators, converters, formatters) |
| `developer` | Coding and dev-ops tools |
| `finance` | Market data, trading, economics |
| `creative` | Design, art, media, music |
| `ai` | AI/ML-powered features |
| `productivity` | Task management, writing, planning |
| `community` | Widgets that don't fit the above categories |

### 4. Write Tests

Create a test file at `test/myWidget.test.tsx`. Use the existing tests as templates (e.g., `test/weatherStation.test.tsx`).

Your test file must cover:

- **Render test:** the widget renders without throwing
- **Key interaction:** at least one user interaction is exercised
- **State integration:** if you added store state, test the action

Minimum test structure:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MyWidget } from '../widgets/MyWidget';

// Mock the store
vi.mock('../store', () => ({
  useAppStore: vi.fn((selector) =>
    selector({
      myWidgetSetting: 'default',
      setMyWidgetSetting: vi.fn(),
    })
  ),
}));

describe('MyWidget', () => {
  it('renders without errors', () => {
    render(<MyWidget />);
    expect(screen.getByText(/my widget/i)).toBeTruthy();
  });

  it('responds to user interaction', async () => {
    const user = userEvent.setup();
    render(<MyWidget />);
    await user.click(screen.getByRole('button', { name: /action/i }));
    expect(screen.getByText(/result/i)).toBeTruthy();
  });
});
```

Run your tests before submitting:

```bash
npm run test:run
```

All 132 existing tests must still pass, and your new tests must pass.

### 5. Open a Pull Request

Push your branch and open a PR targeting `main`. Use this PR template:

```markdown
## Widget: [Widget Name]

### Summary
<!-- One paragraph describing what the widget does and why it's useful -->

### Catalog Entry
<!-- Paste the MarketplaceEntry you added to marketplaceCatalog.ts -->

### Security Checklist
- [ ] No eval() / new Function()
- [ ] No dangerouslySetInnerHTML with unsanitized input
- [ ] All JSON.parse() calls wrapped in try/catch
- [ ] All user inputs validated and sanitized
- [ ] No hardcoded credentials or API keys
- [ ] All external requests use HTTPS
- [ ] API calls use approved endpoints or justification provided
- [ ] localStorage keys prefixed with omni-
- [ ] No iframes without sandbox attribute
- [ ] External links use rel="noopener noreferrer"

### Tests
- [ ] New test file added at test/myWidget.test.tsx
- [ ] All 132+ existing tests still pass (npm run test:run)
- [ ] Widget renders without console errors

### Screenshots
<!-- Add at least one screenshot showing the widget in action -->
```

### 6. Review Process

The core team aims to review PRs within **7 days**. During review:

1. **Automated checks** run linting, TypeScript type-checking, and all tests.
2. **Security review** manually checks the security checklist items.
3. **UX review** checks that the widget follows the design guidelines.
4. **Code review** checks code quality, patterns, and store usage.

You may be asked to make changes before merge. Address feedback commits to the same PR branch and the review will continue.

---

## Widget Versioning

Omni-Grid uses **semver** (MAJOR.MINOR.PATCH) for widget versions.

| Increment | When to use |
|---|---|
| `PATCH` (1.0.**1**) | Bug fix, no behavior change |
| `MINOR` (1.**1**.0) | New feature, backward-compatible |
| `MAJOR` (**2**.0.0) | Breaking change to widget behavior or state schema |

When releasing an update, bump the `version` field in your `MARKETPLACE_CATALOG` entry and add an entry to `changelog`. The marketplace update notification system will surface the new version to users who have the widget installed.

---

## Community Standards

### Code of Conduct

All contributors are expected to be respectful and constructive. Harassment, spam, or malicious submissions will result in permanent bans from contributing.

### Widget Quality Standards

- **Purpose:** widgets must have a clear, useful purpose. Duplicates of existing widgets will be rejected unless they offer significant new value.
- **Performance:** widgets must not block the main thread. Use `useEffect`, `useMemo`, and `useCallback` appropriately. CPU-heavy work goes in Web Workers.
- **Privacy:** widgets must not exfiltrate user data to unapproved servers. This is a hard requirement and violations result in permanent removal.
- **Design:** follow the [design guidelines in the dev guide](./widget-development.md) for the cyberpunk/high-density aesthetic.

### Licensing

By submitting a widget, you agree to release it under the project's license (MIT). Third-party dependencies must be MIT, ISC, BSD-2-Clause, BSD-3-Clause, or Apache-2.0 licensed.

---

## FAQ

**Q: My widget uses a third-party npm package. Is that allowed?**

A: Yes, but new packages must go through the dependency review in `docs/plugin-security.md §6`. Include `npm audit` output in your PR.

**Q: Can I submit multiple widgets in one PR?**

A: One widget per PR makes reviews faster and cleaner. Exceptions for tightly related widget families (e.g., a suite of three finance widgets) may be considered.

**Q: How do I report a bug in a community widget?**

A: Open a GitHub issue and tag the widget author. For security issues, use a private security advisory (not a public issue).

**Q: Can I update a widget I've already submitted?**

A: Yes — open a new PR with the updated component, bumped version in the catalog entry, and an updated `changelog` field.

**Q: Can I remove a widget from the marketplace?**

A: Contact the core team. We may keep the source available for historical reasons but will mark the widget as deprecated in the catalog.

---

## Resources

| Resource | Path |
|---|---|
| Widget Development Guide | `docs/widget-development.md` |
| Plugin API Reference | `docs/widget-api/api-reference.md` |
| Security Guidelines | `docs/plugin-security.md` |
| Architecture Overview | `docs/architecture.md` |
| State Management | `docs/state-management.md` |
| Existing test examples | `test/*.test.tsx` |
| Catalog source | `widgets/marketplaceCatalog.ts` |

---

_Welcome to the grid. Build something remarkable._

**[← Back to Documentation Hub](./README.md)**
