# ▓▓ OMNI-GRID PLUGIN SECURITY PROTOCOL ▓▓

> _"In the neon-lit grid, every widget is a potential attack surface. Code with vigilance, operator."_

This document defines the security requirements and guidelines for all Omni-Grid widgets and plugins. All widget submissions must comply with these protocols before being accepted into the marketplace.

---

## 1. Content Security Policy (CSP)

Omni-Grid enforces a strict Content Security Policy. All widgets must operate within these constraints:

### Allowed Sources
- `default-src 'self'` — resources from the same origin only
- `script-src 'self' 'unsafe-inline'` — required for React/Vite inline scripts (minimize `unsafe-inline` usage in new code)
- `connect-src 'self' https://*.googleapis.com https://*.gemini.google.com` — approved AI API endpoints
- `img-src 'self' data: https:` — images from HTTPS sources and data URIs

### Prohibited
- Loading remote scripts with `<script src="...">` from untrusted origins
- `eval()`, `new Function()`, or dynamic code execution
- Inline event handlers (`onclick="..."`) in rendered HTML
- `javascript:` URI schemes in any context

### Widget iframe sandbox
Widgets that render external content (e.g., PDF Viewer, Research Browser) **must** use `<iframe sandbox="allow-scripts allow-same-origin">` with the minimum necessary permissions.

---

## 2. Input Sanitization Requirements

All user input that is rendered to the DOM must be sanitized to prevent Cross-Site Scripting (XSS).

### Rules
1. **Never use `dangerouslySetInnerHTML`** with unsanitized input. If you must render HTML, pass content through a sanitizer first (e.g., DOMPurify).
2. **Validate types before parsing** — always use `try/catch` around `JSON.parse()` and validate the schema of the result.
3. **URL validation** — before navigating to or fetching a user-supplied URL, verify it starts with `https://` or a known safe scheme.
4. **File uploads** — validate MIME types and file extensions; do not execute uploaded content.
5. **LocalStorage values** — treat any data read from `localStorage` as untrusted; parse defensively.

### Example: Safe localStorage read
```typescript
const loadData = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};
```

---

## 3. Allowed vs. Disallowed APIs

### ✅ Allowed APIs
| API | Notes |
|-----|-------|
| `localStorage` | Widget-specific keys only (see §5) |
| `navigator.clipboard` | Read requires explicit user gesture |
| `fetch` | HTTPS endpoints only; no mixed content |
| `crypto.randomUUID()` | ID generation |
| `URL`, `URLSearchParams` | URL parsing |
| Gemini API (`getGenAIClient`) | Via approved service wrapper |
| E2B Sandbox (`executePythonInSandbox`) | Code execution, approved service only |
| Web Workers | For CPU-intensive tasks; no DOM access |

### ❌ Disallowed APIs
| API | Reason |
|-----|--------|
| `eval()` / `Function()` | Arbitrary code execution |
| `document.write()` | DOM injection |
| `XMLHttpRequest` | Use `fetch` instead |
| `window.open()` with `noreferrer` missing | Information leakage |
| `navigator.sendBeacon` to external hosts | Data exfiltration risk |
| Modifying `document.cookie` | Use localStorage only |
| `postMessage` without origin check | Cross-origin message injection |
| Node.js `fs`, `child_process`, `os` | Not available in browser context |

---

## 4. Safe Store Usage

Widgets interact with the global Zustand store (`useAppStore`). Follow these protocols:

### Read-Only Access
Always prefer reading only the state slices your widget needs:
```typescript
// ✅ Good - targeted selector
const theme = useAppStore(s => s.theme);

// ❌ Bad - subscribes to entire store, exposes unnecessary state
const store = useAppStore();
```

### Mutations
- Only call store actions exported by the store interface — never mutate state directly.
- Do not store API keys, tokens, or credentials in widget-local state that could be logged or serialized.
- Avoid calling `useAppStore.getState()` inside render functions — use selectors.

### Sensitive Data
- API keys (`geminiApiKey`, `e2bApiKey`, `githubToken`) are available in the store for legitimate use.
- **Never log, copy to clipboard without user consent, or transmit these keys.**
- Do not store sensitive data in widget-scoped `localStorage` keys without explicit user opt-in.

---

## 5. Network Request Guidelines

### General Rules
1. **HTTPS only** — all network requests must use `https://`. HTTP is prohibited.
2. **No CORS bypass proxies** — do not route requests through unauthenticated proxy services to bypass CORS.
3. **Rate limiting** — widgets that poll external APIs must implement exponential backoff and respect rate-limit headers.
4. **No tracking pixels** — widgets must not load third-party tracking pixels, analytics beacons, or telemetry endpoints.
5. **User consent** — widgets that transmit user-generated content to external services must display a clear notice.

### Approved External Endpoints
The following external services are pre-approved for use in widgets:
- `https://generativelanguage.googleapis.com` — Google Gemini AI
- `https://api.e2b.dev` — E2B Python sandbox
- `https://api.github.com` — GitHub API (Git Pulse widget)
- `https://api.coingecko.com` — Cryptocurrency data
- `https://openweathermap.org/api` — Weather data
- `https://api.exchangerate-api.com` — Currency exchange

Any other external endpoint requires review and explicit approval before use in production.

---

## 6. Third-Party Dependency Review Process

Before adding a new npm dependency to the repository, follow this process:

### Step 1: Security Audit
Run the GitHub Advisory Database check:
```bash
npm audit --audit-level=moderate
```

Check the package on [npmjs.com](https://npmjs.com) for:
- Weekly downloads (prefer high-traffic, well-maintained packages)
- Last publish date (avoid abandoned packages)
- Known CVEs via [Snyk Vulnerability DB](https://security.snyk.io)

### Step 2: License Compliance
Verify the package license is compatible with Omni-Grid's license. Approved licenses:
- MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0

Prohibited: GPL, AGPL, LGPL (without explicit review).

### Step 3: Minimal Surface Area
- Prefer packages with minimal dependencies (check `node_modules` tree depth).
- Avoid packages that include native binaries unless strictly necessary.
- For browser-only widgets, ensure the package is tree-shakeable.

### Step 4: Pinned Versions
All dependencies must be pinned to exact versions in `package.json` using `--save-exact`:
```bash
npm install package-name --save-exact
```

### Step 5: Review Checklist
Submit a pull request with:
- [ ] `npm audit` output showing no high/critical vulnerabilities
- [ ] License verification
- [ ] Justification for why an existing dependency cannot fulfill the need
- [ ] A note on what widget(s) require this dependency

---

## 7. Security Checklist for Widget Submissions

Before submitting a widget to the marketplace, verify every item on this checklist:

### Code Quality
- [ ] No `eval()`, `new Function()`, or dynamic code execution
- [ ] No `dangerouslySetInnerHTML` with unsanitized content
- [ ] All `JSON.parse()` calls wrapped in `try/catch`
- [ ] All user inputs validated and sanitized before use
- [ ] No hardcoded API keys, tokens, or credentials

### Network & Data
- [ ] All external requests use HTTPS
- [ ] API calls use approved endpoints or have been reviewed
- [ ] Rate limiting implemented for polling widgets
- [ ] localStorage keys prefixed with `omni-` to avoid collisions
- [ ] No data transmitted to unapproved third-party services

### Store & State
- [ ] Minimal store selectors (no full-store subscriptions)
- [ ] No direct state mutations (store actions only)
- [ ] Sensitive store values (API keys) handled responsibly
- [ ] Widget state properly cleaned up on unmount

### UI/UX Security
- [ ] No iframes without `sandbox` attribute
- [ ] External links use `rel="noopener noreferrer"`
- [ ] File upload inputs validate MIME type and extension
- [ ] URL inputs validated before navigation or fetch

### Dependencies
- [ ] No new dependencies without review approval
- [ ] All existing dependencies up-to-date with no known CVEs
- [ ] License compatibility verified

---

## 8. Incident Response

If you discover a security vulnerability in Omni-Grid or a widget:

1. **Do not** create a public GitHub issue.
2. Open a **private security advisory** via the repository's Security tab.
3. Include: affected widget/component, reproduction steps, potential impact.
4. The core team will acknowledge within 48 hours and aim to patch within 7 days for critical issues.

---

_Last updated: Phase 3 Security Hardening — Stay ghost, stay safe, operator._
