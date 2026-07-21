# AGENTS.md

Guidance for AI coding agents (and humans) working in the Omni-Grid repository.

## Project Overview

Omni-Grid is a privacy-centric, local-first "Super App" built with React + TypeScript + Vite. It replaces browser tabs with a unified, widget-based grid dashboard (Neural, Smart Grid finance, developer, and creative tools). State is managed with Zustand; the UI follows a "Cyberpunk/High-Density" aesthetic built on Tailwind utility classes.

Key entry points:

- `App.tsx`, `index.tsx` — app bootstrap.
- `store.ts` — global Zustand store (state slices for all widgets).
- `types.ts` — shared TypeScript types, including `WidgetType`.
- `components/` — core UI shells (`GridContainer.tsx`, `WidgetLauncher.tsx`, `CommandPalette.tsx`, etc.).
- `widgets/` — individual widget implementations (one file per widget, PascalCase).
- `services/` — AI providers, sandboxed execution, plugin API, PWA, etc.
- `server/omnigrid_server.cpp` — optional C++ server component, built via `Makefile`.
- `test/` — Vitest + React Testing Library tests (one file per widget/module).
- `docs/` — extended documentation (architecture, widget development, plugin security, etc.).

## Setup Commands

```bash
npm install
```

Node.js `>=20.0.0` is required (see `.nvmrc` / `package.json` engines).

## Build, Lint, and Test Commands

Run these from the repository root:

```bash
npm run dev            # start Vite dev server
npm run build          # production build (frontend)
npm run build:server   # build the optional C++ server (make server)
npm run typecheck      # tsc --noEmit, strict mode must pass
npm run lint           # eslint . --ext .ts,.tsx
npm run lint:fix       # eslint --fix
npm run format         # prettier --write .
npm run format:check   # prettier --check .
npm run test:run       # run all Vitest tests once (use before finishing any task)
npm test               # vitest watch mode
npm run test:coverage  # vitest run --coverage
```

Always run `npm run typecheck`, `npm run lint`, and `npm run test:run` before considering a change complete. All must pass.

## Code Style & Conventions

- **TypeScript strict mode** is enabled; all code must be properly typed.
- **Icons:** use `lucide-react` exclusively.
- **Styling:** Tailwind utility classes only, following the `slate-950` dark background palette with vivid accents (`cyan`, `emerald`, `fuchsia`, `amber`).
- **Formatting:** Prettier config in `.prettierrc.json`; run `npm run format` before committing.
- **Comments:** match existing style — block/JSDoc comments at file level, inline comments only for non-obvious logic.

### Naming conventions

| Item              | Convention                | Example                  |
| ----------------- | ------------------------- | ------------------------ |
| Widget files      | PascalCase                | `MyWidget.tsx`           |
| WidgetType values | SCREAMING_SNAKE_CASE      | `MY_WIDGET`              |
| Store slices      | camelCase                 | `myWidgetData`           |
| Test files        | camelCase matching widget | `test/myWidget.test.tsx` |
| Catalog ID        | Must match WidgetType     | `'MY_WIDGET'`            |

## Adding or Modifying a Widget

Widgets require coordinated updates across several files:

1. `widgets/MyWidget.tsx` — the component itself.
2. `types.ts` — add the `WidgetType` and any new interfaces.
3. `components/GridContainer.tsx` — register the widget shell.
4. `components/WidgetLauncher.tsx` — add to `WIDGET_REGISTRY`.
5. `widgets/marketplaceCatalog.ts` — add a catalog entry (`isCore: false` for non-core/community widgets).
6. `store.ts` — add a state slice if the widget needs persisted state.
7. `test/myWidget.test.tsx` — required for all new widgets (render test + at least one interaction test).

Widget guidelines:

- Widgets must be self-contained; communicate with other widgets only via the global store or Cross-Talk, not by relying on other widgets' internals.
- Handle resizing gracefully (`flex`, `min-h-0` patterns for scroll areas).
- All external/API calls must handle errors, missing API keys, and network failures without crashing (graceful degradation).
- Use `useMemo`/`useCallback` for expensive computations; move CPU-intensive work to Web Workers.

## Testing Requirements

- Test stack: Vitest + `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event`.
- Every widget needs, at minimum: a render test (no throw) and a key interaction test.
- If the widget adds store state, test the action and selector.
- Study existing tests as templates, e.g. `test/gitPulse.test.tsx`, `test/projectTracker.test.tsx`, `test/promptEngine.test.ts`.
- Mock the Zustand store per-test (`vi.mock('../store', ...)`), including only the slices used by the widget under test.

## AI Feature Guidelines

The project uses `@google/genai` for AI features. Any AI-backed feature must:

- Handle errors gracefully when no API key is present.
- Show visual feedback (spinners/loaders) during API calls.
- Display helpful error messages on failure.
- Be tested both with and without API keys configured.

## Environment Configuration

AI and sandboxed-execution features read keys from a `.env` file (see `.env.example`):

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
E2B_API_KEY=your_e2b_api_key_here
```

Never commit real API keys or secrets.

## Documentation

When making user-facing or architectural changes, update relevant docs:

- `docs/` folder for detailed guides (architecture, widget-development, plugin-security, etc.).
- `README.md` for major platform features.
- `widgets/marketplaceCatalog.ts` catalog entries for new widgets.

## Commit / PR Conventions

- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`.
- PRs must pass: all existing tests, TypeScript strict typecheck, lint, and (for widgets) include tests and a marketplace catalog entry.
- See `CONTRIBUTING.md` for the full contribution protocol and PR review criteria.
