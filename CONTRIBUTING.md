# CONTRIBUTING PROTOCOLS

## 1. Code Style

- **Aesthetic:** We prioritize "Cyberpunk/High-Density" UI. Use small fonts (`text-xs`, `text-[10px]`) and mono-spaced typefaces where appropriate.
- **Icons:** Use `lucide-react` exclusively.
- **Colors:** Adhere to the `slate-950` background palette. Use vivid accent colors (`cyan`, `emerald`, `fuchsia`, `amber`) for data points.
- **TypeScript:** Strict mode enabled. All code must be properly typed.
- **Formatting:** Use Prettier with the project's configuration (`npm run format`).

## 1.1 Local Setup

- Install dependencies: `npm install`
- Run the UI tests: `npm run test:run`
- Type safety: `npm run typecheck` (tsconfig is strict)
- Linting: `npm run lint`
- Format code: `npm run format`

## 1.2 Environment Configuration

For AI features and sandboxed execution, create a `.env` file:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
E2B_API_KEY=your_e2b_api_key_here
```

See [Configuration Guide](./docs/configuration.md) for details.

## 2. Widget Guidelines

- **Isolation:** Widgets should be self-contained. They should not rely on the internal state of other widgets unless communicating via the global Store or Cross-Talk.
- **Responsiveness:** Widgets must handle resizing gracefully. Use `flex` and `min-h-0` patterns to ensure scrollbars appear correctly within the grid item.
- **Documentation:** Add a clear description comment at the top of your widget file explaining its purpose and key features.
- **Naming:** Widget files should be in PascalCase (e.g., `MyNewWidget.tsx`).

## 3. Pull Requests

1.  Fork the repository.
2.  Create a feature branch (`feat/new-sensor` or `fix/bug-description`).
3.  Make your changes following the code style guidelines.
4.  Test your changes: `npm run test:run`
5.  Lint your code: `npm run lint:fix`
6.  Format your code: `npm run format`
7.  Commit changes with clear, descriptive messages.
8.  Open a Pull Request with a detailed description.
9.  **Requirement:** All new widgets must include a corresponding update to `types.ts` and `GridContainer.tsx` to be testable.

## 4. AI Usage

This project uses `@google/genai` for AI features. If your feature uses AI:

- Ensure you handle errors gracefully (e.g., if the user has no API key)
- Provide visual feedback (spinners/loaders) during API calls
- Display helpful error messages when API calls fail
- Consider rate limiting and cost implications
- Test with and without API keys to ensure graceful degradation

## 5. Documentation

When contributing new features:

- Update relevant documentation in `docs/` folder
- Add your widget to the widget list in `docs/README.md`
- Update `README.md` if adding a major feature
- Include code comments for complex logic
- Add JSDoc comments for public APIs and utility functions

## 6. Testing

- Write tests for new features when appropriate
- Ensure existing tests pass: `npm run test:run`
- Test your widget in different screen sizes
- Test with and without API keys (if using AI features)
- Test layout changes when resizing widgets

## 7. Questions?

- Check the [FAQ](./docs/faq.md) for common questions
- Review [Architecture](./docs/architecture.md) for technical details
- Read [Widget Development](./docs/widget-development.md) for widget creation guide
- Open an issue if you need help
