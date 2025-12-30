# CONTRIBUTING PROTOCOLS

## 1. Code Style

- **Aesthetic:** We prioritize "Cyberpunk/High-Density" UI. Use small fonts (`text-xs`, `text-[10px]`) and mono-spaced typefaces where appropriate.
- **Icons:** Use `lucide-react` exclusively.
- **Colors:** Adhere to the `slate-950` background palette. Use vivid accent colors (`cyan`, `emerald`, `fuchsia`, `amber`) for data points.

## 1.1 Local Setup

- Install dependencies: `npm install`
- Run the UI tests: `npm run test:run`
- Type safety: `npm run typecheck` (tsconfig is strict)
- Linting: `npm run lint`

## 2. Widget Guidelines

- **Isolation:** Widgets should be self-contained. They should not rely on the internal state of other widgets unless communicating via the global Store or Cross-Talk.
- **Responsiveness:** Widgets must handle resizing gracefully. Use `flex` and `min-h-0` patterns to ensure scrollbars appear correctly within the grid item.

## 3. Pull Requests

1.  Fork the repository.
2.  Create a feature branch (`feat/new-sensor`).
3.  Commit changes.
4.  Open a Pull Request.
5.  **Requirement:** All new widgets must include a corresponding update to `types.ts` and `GridContainer.tsx` to be testable.

## 4. AI Usage

This project uses `@google/genai`. If your feature uses AI, ensure you handle errors gracefully (e.g., if the user has no API key) and provide visual feedback (spinners/loaders).
