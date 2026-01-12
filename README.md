# OMNI-GRID // THE SUPER APP

```text
   ____  __  __ _   _ ___       ____ ____  ___ ____
  / __ \|  \/  | \ | |_ _|     / ___|  _ \|_ _|  _ \
 | |  | | |\/| |  \| || |_____| |  _| |_) || || | | |
 | |__| | |  | | |\  || |_____| |_| |  _ < | || |_| |
  \____/|_|  |_|_| \_|___|     \____|_| \_\___|____/

  [ SYSTEM STATUS: ONLINE ]
  [ PROTOCOL: LOCAL-FIRST ]
```

<div align="center">

[![CI](https://github.com/GizzZmo/Omni-Grid-2.0/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/GizzZmo/Omni-Grid-2.0/actions/workflows/ci.yml)
[![CodeQL](https://github.com/GizzZmo/Omni-Grid-2.0/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/GizzZmo/Omni-Grid-2.0/actions/workflows/codeql.yml)
[![Dependency Audit](https://github.com/GizzZmo/Omni-Grid-2.0/actions/workflows/audit.yml/badge.svg?branch=main)](https://github.com/GizzZmo/Omni-Grid-2.0/actions/workflows/audit.yml)
[![Performance](https://github.com/GizzZmo/Omni-Grid-2.0/actions/workflows/performance.yml/badge.svg?event=pull_request)](https://github.com/GizzZmo/Omni-Grid-2.0/actions/workflows/performance.yml)

[![Release](https://img.shields.io/github/v/release/GizzZmo/Omni-Grid-2.0?style=flat-square&logo=github&color=00ff88)](https://github.com/GizzZmo/Omni-Grid-2.0/releases)
[![License](https://img.shields.io/github/license/GizzZmo/Omni-Grid-2.0?style=flat-square&color=00ccff)](./LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

[![Stars](https://img.shields.io/github/stars/GizzZmo/Omni-Grid-2.0?style=flat-square&logo=github&color=yellow)](https://github.com/GizzZmo/Omni-Grid-2.0/stargazers)
[![Issues](https://img.shields.io/github/issues/GizzZmo/Omni-Grid-2.0?style=flat-square&logo=github&color=red)](https://github.com/GizzZmo/Omni-Grid-2.0/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](./CONTRIBUTING.md)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=flat-square)](https://github.com/GizzZmo/Omni-Grid-2.0/graphs/commit-activity)

</div>

## 0x01 // OVERVIEW

**Omni-Grid** is a privacy-centric, local-first "Super App" designed to replace fragmented browser tabs with a unified, high-density command center. Built on a modular React grid architecture, it integrates "Smart Grid" financial intelligence, AI-powered drafting, and developer utilities into a single aesthetic interface.

> **Philosophy:** "The net is vast and infinite, but your grid is your own."

**📚 [FULL DOCUMENTATION](./DOCUMENTATION.md) | 🗺️ [ROADMAP](./ROADMAP.md) | 🚀 [QUICK START](./QUICK_REFERENCE.md) | ❓ [FAQ](./docs/faq.md) | 📊 [PERFORMANCE REPORT](./performance-report.html) | 🔄 [CI/CD WORKFLOWS](./.github/WORKFLOWS.md)**

## 0x02 // CORE MODULES

### 🧠 The Neural Suite

- **Neural Scratchpad:** AI-augmented note-taking (Refine, Expand, Summarize).
- **WritePad:** Auto-drafting for emails and formal documents.
- **Polyglot Box:** Instant code translation between 12+ languages.

### 💹 The Smart Grid (Financial)

- **Asset Command:** Programmable logic for portfolio management.
- **Macro Net:** Global M2 Money Supply vs. Asset correlation heatmap.
- **Chain Pulse:** Real-time TPS tracking for L1/L2 networks.
- **Reg Radar:** Sentiment analysis on regulatory news (SEC/MiCA).

### 🛠️ Developer Optic

- **Web Terminal:** Sandboxed JavaScript REPL.
- **Dev Optic:** JWT decoding and Regex testing.
- **Git Pulse:** Pull Request monitoring dashboard.
- **Widget Architect:** AI-driven prototype generation for new widgets.
- **CyberEditor:** Advanced code editor with multi-tab support, templates, and AI-powered code generation/improvement for creating Omni-Grid widgets.
- **Prompt Lab:** Version-controlled prompt workspace with template variables, token/cost telemetry, and side-by-side provider comparisons.

### 🎨 Creative & Utility

- **Aesthetic Engine:** AI-generated UI theming based on text or image vibes.
- **Sonic Architecture:** Circle of Fifths theory tool with brown noise and a local playlist player.
- **Cipher Vault:** Local hashing and UUID/Nanoid generation.

## 0x03 // INITIALIZATION PROTOCOLS

### Prerequisites

- Node.js 18+
- Google Gemini API Key (Required for Neural Link features)

### Installation

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/GizzZmo/Omni-Grid-2.0.git
    cd Omni-Grid-2.0
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:

```env
API_KEY=your_google_gemini_api_key_here
E2B_API_KEY=your_e2b_api_key_here
```

`API_KEY` powers Gemini-based assistants, while `E2B_API_KEY` is used for sandboxed Python execution. You can also inject `window.E2B_API_KEY` at runtime if you prefer not to bake the sandbox key into the client bundle.

4.  **Ignition**
    ```bash
    npm run dev
    # Access via http://localhost:5173 (or pass -- --port 1234 to match the C++ server default)
    ```

### Optional: C++ Static Server

If you prefer a standalone HTTP host, compile the lightweight C++ server and serve the built assets (or the root for dev artifacts):

**Using npm scripts (recommended):**

```bash
npm run build:all    # Build frontend assets and compile C++ server
npm run serve        # Run the compiled server (defaults to port 1234)
# Then open http://localhost:1234
```

**Manual compilation:**

```bash
make server          # or: g++ -std=c++17 -O2 server/omnigrid_server.cpp -o omnigrid_server
./omnigrid_server 1234   # port is optional; defaults to 1234
# Then open http://localhost:1234
```

The server automatically serves from `dist/` (built assets) if it exists, or falls back to the root directory (for dev artifacts).

## 0x04 // ARCHITECTURE

- **State Management:** `Zustand` with `localStorage` persistence.
- **Layout:** `react-grid-layout` for draggable, resizable tiles.
- **AI Core:** `@google/genai` (Gemini 3.5 Flash/Pro).
- **Styling:** TailwindCSS with dynamic CSS variable injection.

## 0x04.1 // CI/CD PIPELINE

Omni-Grid features a comprehensive automated workflow system:

### 🔄 Continuous Integration

- **Automated Testing:** Vitest test suite with coverage reporting
- **Automated Building:** Multi-platform builds (Node.js 18.x, 20.x)
- **Type Safety:** TypeScript strict checking on every commit
- **Code Quality:** ESLint and Prettier validation
- **Performance Monitoring:** Build time and bundle size tracking

### 🔒 Security & Quality

- **CodeQL Analysis:** Automated security vulnerability scanning (JavaScript & C++)
- **Dependency Auditing:** Daily npm security audits with PR alerts
- **Dependabot:** Automated dependency updates with auto-merge for safe updates
- **Test Coverage:** Automatic coverage reports on PRs

### 📦 Release & Deployment

- **Automated Releases:** Tag-triggered release creation with SHA-256 checksums
- **Documentation Deployment:** Auto-deploy docs to GitHub Pages
- **Performance Reports:** PR-specific build performance analysis with warnings

### 🤖 Automation

- **PR Labeling:** Automatic categorization based on changes and size
- **Welcome Bot:** First-time contributor greeting and guidance
- **Stale Management:** Automated cleanup of inactive issues/PRs
- **Status Dashboard:** Real-time workflow health monitoring

**[View Complete Workflow Documentation](./.github/WORKFLOWS.md) | [Testing Guide](./TESTING.md)**

## 0x04.2 // DEVELOPMENT COMMANDS

### Testing

```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once (CI mode)
npm run test:ui       # Launch visual test UI
npm run test:coverage # Generate coverage report
```

### Code Quality

```bash
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
npm run typecheck     # Run TypeScript type checking
```

### Building

```bash
npm run build         # Build frontend (Vite)
npm run build:server  # Build C++ server
npm run build:all     # Build both frontend and server
npm run dev           # Start development server
npm run preview       # Preview production build
```

## 0x05 // KEYBOARD SHORTCUTS

| Key Combo     | Action                                              |
| :------------ | :-------------------------------------------------- |
| `Cmd + K`     | Trigger AI Refine in Scratchpad                     |
| `Drag & Drop` | Transfer data between widgets (Cross-Talk Protocol) |

For complete keyboard shortcuts reference, see [Keyboard Shortcuts Guide](./docs/keyboard-shortcuts.md).

---

## 0x06 // DOCUMENTATION

Comprehensive documentation is available in the `docs/` folder:

### 📚 Quick Links

- **[Documentation Hub](./docs/README.md)** - Complete documentation index
- **[Getting Started Guide](./docs/getting-started.md)** - Installation and setup
- **[Widget Development](./docs/widget-development.md)** - Create custom widgets
- **[Architecture Overview](./docs/architecture.md)** - Technical deep-dive
- **[API Reference](./docs/api-reference.md)** - Complete API documentation
- **[Configuration Guide](./docs/configuration.md)** - Settings and customization
- **[State Management](./docs/state-management.md)** - Zustand patterns
- **[Performance Report](./performance-report.html)** - Interactive performance benchmarks
- **[FAQ](./docs/faq.md)** - Frequently asked questions
- **[Troubleshooting](./docs/troubleshooting.md)** - Common issues and solutions
- **[WIKI](./docs/WIKI.md)** - Core concepts and philosophy
- **[GitHub Wiki (Home)](https://github.com/GizzZmo/Omni-Grid-2.0/wiki)** - Quick navigation map and page links (publish from `docs/wiki/`)
- **[How-To Guide](./docs/HOWTO.md)** - Practical recipes

---

## 0x07 // ROADMAP

Want to know what's coming next? Check out our comprehensive development roadmap:

**🗺️ [DEVELOPMENT ROADMAP](./ROADMAP.md)** - Complete project roadmap with timelines, milestones, and contribution opportunities

### Current Focus (Q1 2025)

- 🚧 Music player widget enhancement
- ✅ Code editor widget (CyberEditor with AI assistance)
- 🚧 AI chat widget (Gemini API)
- 🚧 Settings panel v2
- 🚧 Theme customization system
- 🚧 Widget marketplace foundation

See the [full roadmap](./ROADMAP.md) for detailed timelines, technical milestones, and how you can contribute!

---

_Built by [Jon-Arve Constantine / GizzZmo]. Encrypted. Distributed. Free._
