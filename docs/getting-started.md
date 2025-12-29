# GETTING STARTED // INITIALIZATION PROTOCOL

```text
[ SYSTEM CHECK: INITIATING ]
[ DOCUMENTATION: GETTING-STARTED.MD ]
```

## 📋 PREREQUISITES

Before launching Omni-Grid, ensure your system meets these requirements:

### Required

- **Node.js:** Version 18.0.0 or higher
- **npm:** Version 8.0.0 or higher (comes with Node.js)
- **Modern Browser:** Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+
- **Screen Resolution:** Minimum 1280x720 (1920x1080 recommended)

### Optional (For AI Features)

- **Google Gemini API Key:** Required for Neural Link features (Scratchpad, WritePad, Polyglot, Widget Architect)
  - Get your API key at: https://makersuite.google.com/app/apikey
  - Free tier available for personal use

---

## 🚀 INSTALLATION

### Step 1: Clone the Repository

```bash
git clone https://github.com/GizzZmo/Omni-Grid-2.0.git
cd Omni-Grid-2.0
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:

- **React 18.2.0** - UI framework
- **Zustand 4.5.0** - State management
- **react-grid-layout 1.4.4** - Draggable grid system
- **@google/genai** - AI integration
- **lucide-react** - Icon library
- **Vite** - Build tool and dev server

### Step 3: Configure Environment (Optional)

If you want to use AI-powered features, create a `.env` file in the root directory:

```bash
# .env
API_KEY=your_google_gemini_api_key_here
```

**Important:** Never commit your `.env` file to version control. It's already in `.gitignore`.

### Step 4: Launch the Application

```bash
npm run dev
```

The development server will start at: **http://localhost:5173**

---

## 🎮 FIRST LAUNCH

### Initial Interface

Upon first launch, you'll see:

1. **OMNI-GRID Header** - Top-left with brand logo
2. **Launcher Button** - Opens widget catalog
3. **Control Panel** - Top-right with system controls
4. **Grid Area** - Main workspace (initially empty or with default widgets)
5. **Dock** - Bottom Mac-style widget shortcuts

### Adding Your First Widget

**Method 1: Using the Launcher**

1. Click **[ LAUNCHER ]** button (top-left)
2. Browse categories or search
3. Click a widget card to add it to the grid

**Method 2: Using the Dock**

1. Click any icon in the bottom dock
2. Widget toggles on/off instantly

### Recommended First Setup

For new users, we recommend starting with:

1. **System Core** (Dock: Terminal icon) - Settings and system info
2. **Neural Scratchpad** (Dock: Brain icon) - AI note-taking
3. **Focus HUD** (Dock: Activity icon) - Pomodoro timer
4. **Universal Transformer** (Dock: FileJson icon) - Data conversion

---

## 🎯 ESSENTIAL OPERATIONS

### Moving Widgets

- **Drag** the widget header to reposition
- Widgets auto-arrange to fit

### Resizing Widgets

- **Drag** the bottom-right corner of any widget
- Minimum sizes are enforced per widget type

### Removing Widgets

- Click the **X** icon in the widget header
- Or toggle off via Dock/Launcher

### Locking Layout

- Click **LOCKED/UNLOCKED** button (top-right)
- Prevents accidental repositioning

### Auto-Organize

- Click **GHOST** button (top-right)
- AI analyzes usage and suggests optimal layout
- Ghost widget appears with recommendations

---

## 💾 DATA PERSISTENCE

### Automatic Saving

- **All changes are saved automatically** to browser `localStorage`
- Layout, widget positions, content, and settings persist between sessions
- No server required - everything is local

### Manual Backup

1. Click **Backup** button (top-right)
2. Downloads a JSON file: `omni-grid-backup-YYYY-MM-DD.json`
3. Store this file safely

### Restoring from Backup

1. Click **Restore** button (top-right)
2. Select your backup JSON file
3. Confirm the restoration
4. System reloads with saved state

### Freeze System

- Click **FREEZE** button (top-right)
- Suspends all interactions
- Useful before major changes or backups
- Click **RESUME** to continue

---

## 🔧 CONFIGURATION

### API Key Setup (Post-Installation)

If you skipped adding an API key during setup:

1. Open **System Core** widget
2. Navigate to **Settings** tab
3. Enter your Gemini API key
4. Click **Save**

The key is stored in browser localStorage (never sent to any server except Google's API).

### Theme Customization

1. Open **Aesthetic Engine** widget (Dock: Wand icon)
2. Choose from presets or customize colors
3. Adjust:
   - Background/Surface colors
   - Primary/Secondary accents
   - Border radius
   - Font family

### Settings Panel

Access via **System Core** widget:

- **Scanlines Effect** - Enable/disable CRT aesthetic
- **Matrix Rain** - Toggle background animation
- **Compact Mode** - Auto-fit widgets (AUTOFIT toggle)
- **Factory Reset** - Clear all data and reset to defaults

---

## ⌨️ KEYBOARD SHORTCUTS

| Shortcut       | Action                                     |
| -------------- | ------------------------------------------ |
| `Cmd/Ctrl + K` | Trigger AI operations in Neural widgets    |
| `Drag & Drop`  | Transfer data between widgets (Cross-Talk) |
| `Esc`          | Close modals/overlays                      |

For complete list, see [Keyboard Shortcuts Guide](./keyboard-shortcuts.md).

---

## 🆘 GETTING HELP

### In-App Help

- Open **Help Desk** widget (Dock: Question mark icon)
- Browse widget documentation
- View quick tips

### Documentation

- See [FAQ](./faq.md) for common questions
- Check [Troubleshooting](./troubleshooting.md) for issues
- Read [Architecture](./architecture.md) for technical details

### Community

- GitHub Issues: Report bugs or request features
- GitHub Discussions: Ask questions and share ideas

---

## 🎓 NEXT STEPS

Now that you're set up, explore:

1. **[Configuration Guide](./configuration.md)** - Deep dive into settings
2. **[Widget Development](./widget-development.md)** - Build custom widgets
3. **[Architecture Overview](./architecture.md)** - Understand the system
4. **[Keyboard Shortcuts](./keyboard-shortcuts.md)** - Boost productivity

---

## 📊 SYSTEM REQUIREMENTS VERIFIED

To verify your installation:

```bash
# Check Node.js version
node --version  # Should be v18+

# Check npm version
npm --version   # Should be v8+

# Verify dependencies installed
npm list --depth=0

# Run tests (if available)
npm test

# Build for production
npm run build
```

---

## 🚨 COMMON FIRST-LAUNCH ISSUES

**Port 5173 already in use?**

```bash
# Kill the process using the port
lsof -ti:5173 | xargs kill -9  # macOS/Linux
# Or specify a different port
npm run dev -- --port 3000
```

**Dependencies won't install?**

```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

**Blank screen on launch?**

- Check browser console (F12) for errors
- Ensure you're using a modern browser
- Try clearing browser cache and localStorage

For more troubleshooting, see [Troubleshooting Guide](./troubleshooting.md).

---

_System Initialized. Welcome to the Grid._

**[← Back to Documentation Hub](./README.md)**
