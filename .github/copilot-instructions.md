# Copilot Instructions for Omni-Grid 2.0

## Project Overview

Omni-Grid is a privacy-centric, local-first "Super App" built with **React 19 + TypeScript (strict) + Vite 8**. It replaces browser tabs with a unified, widget-based grid dashboard. State is managed with **Zustand 5** (persisted via `zustand/middleware`); the UI follows a **Cyberpunk/High-Density** aesthetic using Tailwind utility classes on a `slate-950` dark background with vivid accents (`cyan`, `emerald`, `fuchsia`, `amber`). Icons come exclusively from `lucide-react`.

---

## Repository Layout

```
/
├── App.tsx                    # App root (theme application, layout shell)
├── index.tsx                  # Entry point
├── store.ts                   # Global Zustand store (all state slices)
├── types.ts                   # Shared TypeScript types (WidgetType enum, interfaces)
├── utils.ts                   # Shared utility functions
├── components/                # Core UI shells
│   ├── GridContainer.tsx      # Renders all widgets; MUST be updated for new widgets
│   ├── WidgetLauncher.tsx     # WIDGET_REGISTRY; MUST be updated for new widgets
│   ├── WidgetShell.tsx        # Per-widget resize/title chrome
│   ├── CommandPalette.tsx
│   ├── MatrixRain.tsx
│   └── SettingsPanel/
├── widgets/                   # Individual widget implementations (PascalCase.tsx)
│   ├── marketplaceCatalog.ts  # Static catalog; MUST be updated for new widgets
│   └── ...
├── services/                  # AI providers, sandbox, plugin API, PWA
│   ├── aiProviders.ts
│   ├── geminiService.ts
│   ├── e2bSandbox.ts
│   ├── gridIntelligence.ts
│   ├── multiAgentOrchestrator.ts
│   ├── pluginApiV2.ts
│   ├── promptEngine.ts
│   └── pwaService.ts
├── test/                      # Vitest + React Testing Library (one file per widget)
│   └── setup.ts
├── types/                     # Additional TypeScript declaration files
├── themes/                    # Theme definitions
├── docs/                      # Extended documentation
└── server/                    # Optional C++ server component (built via Makefile)
```

---

## Setup

```bash
# Node.js >= 20.0.0 is required (see .nvmrc)
npm install
```

For AI and sandboxed-execution features, create a `.env` file (see `.env.example`):

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
E2B_API_KEY=your_e2b_api_key_here
```

---

## Key Commands — Run Before Every PR

```bash
npm run typecheck      # tsc --noEmit, strict mode — MUST pass
npm run lint           # eslint . --ext .ts,.tsx — MUST pass
npm run test:run       # vitest run (all tests once) — MUST pass
npm run build          # production Vite build — MUST pass
```

Other useful commands:

```bash
npm run dev            # Vite dev server (port 3000)
npm run lint:fix       # eslint --fix
npm run format         # prettier --write .
npm run format:check   # prettier --check .
npm run test:coverage  # vitest run --coverage
npm run build:server   # optional C++ server (make server)
```

---

## Naming Conventions

| Item              | Convention               | Example                  |
| ----------------- | ------------------------ | ------------------------ |
| Widget files      | PascalCase               | `MyWidget.tsx`           |
| WidgetType values | SCREAMING_SNAKE_CASE     | `MY_WIDGET`              |
| Store slices      | camelCase                | `myWidgetData`           |
| Test files        | camelCase matching widget| `test/myWidget.test.tsx` |
| Catalog ID        | Must match WidgetType    | `'MY_WIDGET'`            |

---

## Adding a New Widget — 7 Required File Changes

Every new widget requires coordinated edits across these files (in order):

1. **`widgets/MyWidget.tsx`** — The component. Export a named React function component; use `useAppStore` only for cross-widget or persisted state.

2. **`types.ts`** — Add the new `WidgetType` literal to the union type and any new interfaces or enums.

3. **`components/GridContainer.tsx`** — Import the component and add a `case 'MY_WIDGET':` branch in the widget renderer switch.

4. **`components/WidgetLauncher.tsx`** — Add an entry to `WIDGET_REGISTRY` with `id`, `name`, `icon` (lucide-react), `color`, `bg`, `border`.

5. **`widgets/marketplaceCatalog.ts`** — Append a `MarketplaceEntry` to `MARKETPLACE_CATALOG`. Use `isCore: false` for community widgets, `isCore: true` for platform widgets. The `id` field **must** match the `WidgetType` string exactly.

6. **`store.ts`** — If the widget needs persisted state, add a state slice (interface, initial values, and actions). All store state is persisted via `zustand/middleware` `persist`.

7. **`test/myWidget.test.tsx`** — Required for all widgets. Include at minimum: a render test (`render(<MyWidget />)` does not throw) and one key interaction test.

---

## Widget Guidelines

- **Self-contained:** Widgets communicate with others only via the global Zustand store or Cross-Talk, never by importing each other's internals.
- **Responsive:** Use `flex` and `min-h-0` patterns so scroll areas work correctly within grid items.
- **Error handling:** All external/API calls must gracefully handle missing API keys and network failures without crashing.
- **Performance:** Use `useMemo`/`useCallback` for expensive computations; move CPU-intensive work to Web Workers.
- **Styling:** Tailwind utility classes only. No inline styles or CSS modules. Vivid accent colors for data; `slate-950` backgrounds.

---

## Testing Patterns

Test stack: **Vitest + `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event`**

Every test file must mock the Zustand store using only the slices the widget under test actually uses:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyWidget } from '../widgets/MyWidget';

vi.mock('../store', () => ({
  useAppStore: () => ({
    // include only the slices MyWidget uses
    mySlice: 'value',
    setMySlice: vi.fn(),
  }),
}));

describe('MyWidget', () => {
  it('renders without crashing', () => {
    render(<MyWidget />);
    expect(screen.getByText(/expected text/i)).toBeTruthy();
  });

  it('handles a key interaction', () => {
    render(<MyWidget />);
    fireEvent.click(screen.getByRole('button', { name: /action/i }));
    expect(screen.getByText(/result/i)).toBeTruthy();
  });
});
```

Reference tests: `test/gitPulse.test.tsx`, `test/projectTracker.test.tsx`, `test/promptEngine.test.ts`.

---

## State Management

`store.ts` exports a single `useAppStore` Zustand hook with persisted state. Slices include:

- **Layout:** `layouts`, `visibleWidgets`, `updateLayout`, `toggleWidget`
- **Settings:** `settings` (geminiApiKey, e2bApiKey, scanlines, sound, startupBehavior)
- **UI State:** `ghostWidget`, `isLayoutLocked`, `isCompact`, `isCmdPaletteOpen`, `isSettingsPanelOpen`
- **Per-widget slices:** one slice per widget that needs persisted state (e.g., `gitToken`, `promptTemplates`, `calendarEvents`)

`store.ts` automatically syncs `GEMINI_API_KEY`/`E2B_API_KEY` to `process.env` and `window.process.env` at runtime for libraries that read them.

---

## AI Features

The project uses `@google/genai` for AI features. All AI-backed features must:

- Check for the API key before making calls; show a helpful prompt when missing.
- Show visual feedback (spinners/loaders) during API calls.
- Display error messages on failure without crashing.
- Be tested both with and without API keys configured.

The Gemini key is read from `VITE_API_KEY` or `GEMINI_API_KEY` environment variables and stored in the Zustand `settings` slice. Services access it via `useAppStore.getState().settings.geminiApiKey`.

---

## Commit and PR Conventions

- Use **Conventional Commits**: `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`, `refactor: ...`, `chore: ...`.
- PRs must: pass all tests, pass TypeScript strict typecheck, pass lint, and (for new widgets) include tests and a marketplace catalog entry.
- Use the PR template at `.github/PULL_REQUEST_TEMPLATE.md`.

---

## Common Errors and Workarounds

### TypeScript strict errors with implicit `any`

All function parameters and return types must be explicitly typed. If upgrading a JS file, add types rather than using `// @ts-ignore`.

### `process.env` not defined in browser

The Vite config defines `process.env.API_KEY` and `process.env.GEMINI_API_KEY` at build time. For runtime key updates (user sets key in Settings), `store.ts` syncs to `window.process.env`. Services should read keys via `useAppStore.getState().settings.geminiApiKey` instead of accessing `process.env` directly at module load time.

### `react-grid-layout` CSS not loading in tests

CSS imports are ignored in the Vitest jsdom environment by default — this is expected. The `vite.config.ts` `test.css: true` option handles this in the test runner without any workaround needed.

### Widget not rendering in the grid

Check that all 7 required files have been updated (see "Adding a New Widget" above). The most commonly missed file is `components/GridContainer.tsx` — the `case 'MY_WIDGET':` branch in the widget switch statement.

### `lucide-react` icon not found

Check the exact icon name at https://lucide.dev/icons/ — names are CamelCase in import but may differ from the icon page slug. Always import from `lucide-react`.
