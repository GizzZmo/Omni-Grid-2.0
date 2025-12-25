
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

## 0x01 // OVERVIEW

**Omni-Grid** is a privacy-centric, local-first "Super App" designed to replace fragmented browser tabs with a unified, high-density command center. Built on a modular React grid architecture, it integrates "Smart Grid" financial intelligence, AI-powered drafting, and developer utilities into a single aesthetic interface.

> **Philosophy:** "The net is vast and infinite, but your grid is your own."

**📚 [FULL DOCUMENTATION](./DOCUMENTATION.md) | 🚀 [QUICK START](./QUICK_REFERENCE.md) | ❓ [FAQ](./docs/faq.md)**

## 0x02 // CORE MODULES

### 🧠 The Neural Suite
*   **Neural Scratchpad:** AI-augmented note-taking (Refine, Expand, Summarize).
*   **WritePad:** Auto-drafting for emails and formal documents.
*   **Polyglot Box:** Instant code translation between 12+ languages.

### 💹 The Smart Grid (Financial)
*   **Asset Command:** Programmable logic for portfolio management.
*   **Macro Net:** Global M2 Money Supply vs. Asset correlation heatmap.
*   **Chain Pulse:** Real-time TPS tracking for L1/L2 networks.
*   **Reg Radar:** Sentiment analysis on regulatory news (SEC/MiCA).

### 🛠️ Developer Optic
*   **Web Terminal:** Sandboxed JavaScript REPL.
*   **Dev Optic:** JWT decoding and Regex testing.
*   **Git Pulse:** Pull Request monitoring dashboard.
*   **Widget Architect:** AI-driven prototype generation for new widgets.

### 🎨 Creative & Utility
*   **Aesthetic Engine:** AI-generated UI theming based on text or image vibes.
*   **Sonic Architecture:** Circle of Fifths theory tool and brown noise generator.
*   **Cipher Vault:** Local hashing and UUID/Nanoid generation.

## 0x03 // INITIALIZATION PROTOCOLS

### Prerequisites
*   Node.js 18+
*   Google Gemini API Key (Required for Neural Link features)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/omni-grid.git
    cd omni-grid
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```

4.  **Ignition**
    ```bash
    npm run dev -- --port 1234
    # Access via http://localhost:1234
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

*   **State Management:** `Zustand` with `localStorage` persistence.
*   **Layout:** `react-grid-layout` for draggable, resizable tiles.
*   **AI Core:** `@google/genai` (Gemini 3.5 Flash/Pro).
*   **Styling:** TailwindCSS with dynamic CSS variable injection.

## 0x05 // KEYBOARD SHORTCUTS

| Key Combo | Action |
| :--- | :--- |
| `Cmd + K` | Trigger AI Refine in Scratchpad |
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
- **[FAQ](./docs/faq.md)** - Frequently asked questions
- **[Troubleshooting](./docs/troubleshooting.md)** - Common issues and solutions
- **[WIKI](./docs/WIKI.md)** - Core concepts and philosophy
- **[How-To Guide](./docs/HOWTO.md)** - Practical recipes

---
*Built by [Jon-Arve Constantine / GizzZmo]. Encrypted. Distributed. Free.*
