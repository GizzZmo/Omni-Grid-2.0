# FAQ // KNOWLEDGE QUERIES

```text
[ DOCUMENTATION: FAQ.MD ]
[ MODE: RAPID RESPONSE ]
```

## 📌 GENERAL QUESTIONS

### What is Omni-Grid?

Omni-Grid is a **local-first "Super App"** built with React that combines multiple productivity tools into a single, unified interface. It features a draggable grid layout where each tool (called a "widget") can be positioned and resized according to your preferences.

**Key Features:**

- 30+ built-in widgets (AI notes, dev tools, finance trackers, etc.)
- Complete privacy (all data stored locally in browser)
- Customizable themes and layouts
- AI integration via Google Gemini
- Cross-widget data communication

---

### Is Omni-Grid free?

**Yes, completely free and open source.**

**Costs:**

- Omni-Grid itself: **$0** (MIT or similar license)
- Google Gemini API: **Free tier available** (60 requests/min)
- Hosting: **$0** (static files, host anywhere)

---

### Do I need an internet connection?

**Mostly no, with exceptions:**

**Works Offline:**

- Core app functionality
- All widgets (except AI and external data)
- Layout management
- Local data storage

**Requires Internet:**

- AI features (Neural Scratchpad, WritePad, etc.)
- Market/Weather widgets (external APIs)
- Initial download of app

**Future:** PWA (Progressive Web App) mode for full offline capability.

---

### Is my data private?

**Yes. Omni-Grid is designed with privacy as a core principle:**

**What stays local:**

- All widget data (notes, tasks, settings)
- Layouts and preferences
- API keys (stored in browser only)

**What gets sent externally:**

- AI prompts (sent directly to Google Gemini, not through our servers)
- External widget data requests (weather, markets, etc.)

**No analytics, no tracking, no servers.** Your data never touches our infrastructure because we don't have any.

---

### Can I use Omni-Grid on mobile?

**Yes, but with limitations:**

**Supported:**

- Mobile browsers (Chrome, Safari, Firefox)
- Responsive grid layout
- Touch gestures (drag, tap)

**Limitations:**

- Smaller screen = fewer visible widgets
- Some widgets better suited for desktop
- Performance may vary on older devices

**Recommendation:** Best experience on tablets (iPad, Android tablets) or desktop.

---

## 🔧 TECHNICAL QUESTIONS

### What technologies does Omni-Grid use?

**Frontend:**

- React 18.2.0
- TypeScript 5.8.2
- TailwindCSS (utility-first CSS)

**State Management:**

- Zustand 4.5.0 (with localStorage persistence)

**Grid System:**

- react-grid-layout 1.4.4 (drag/resize)

**Build Tool:**

- Vite 6.2.0 (fast dev server and builds)

**AI Integration:**

- @google/genai (Gemini API client)

**Icons:**

- lucide-react (SVG icon library)

---

### Can I self-host Omni-Grid?

**Yes! It's designed for self-hosting.**

**Steps:**

1. Build: `npm run build`
2. Deploy `dist/` folder to any static host:
   - GitHub Pages
   - Netlify
   - Vercel
   - Your own server (nginx, Apache)
   - AWS S3 + CloudFront
   - Any CDN

**Requirements:**

- HTTPS recommended (for localStorage security)
- No backend server needed
- No database required

---

### How much storage does Omni-Grid use?

**Disk Space:**

- Install: ~200MB (node_modules)
- Build output: ~2MB (production dist/)
- Browser runtime: ~500KB - 2MB (cached assets)

**Browser Storage:**

- localStorage: ~10-500KB (depends on data)
- Maximum: ~5-10MB (browser limit)

---

### Does it work in all browsers?

**Supported Browsers:**

- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Brave, Arc, Opera (Chromium-based)

**Not Supported:**

- ❌ Internet Explorer (deprecated)
- ❌ Very old browser versions

**Feature Requirements:**

- ES2020+ JavaScript support
- localStorage API
- CSS Grid and Flexbox
- Drag & Drop API

---

## 🎨 CUSTOMIZATION QUESTIONS

### Can I create my own widgets?

**Yes! Widget creation is designed to be straightforward.**

**Time Investment:**

- Simple widget: ~30 minutes
- Complex widget: ~2-4 hours

**Skills Needed:**

- React basics (functional components, hooks)
- TypeScript (basic understanding)
- TailwindCSS (optional, but helpful)

**Resources:**

- [Widget Development Guide](./widget-development.md)
- [API Reference](./api-reference.md)
- Existing widgets as examples

---

### Can I customize the appearance?

**Yes, extensively:**

**Theme System:**

- Built-in presets (Cyberpunk, Neon, Minimal, Matrix)
- Custom color picker (6 color properties)
- AI-generated themes (text or image input)
- Font family selection
- Border radius customization

**Visual Effects:**

- Scanlines (CRT aesthetic)
- Matrix rain background
- Custom gradients

**Layout:**

- Drag and drop widgets
- Resize to any size
- Responsive breakpoints
- Auto-organize with AI

See [Configuration Guide](./configuration.md) for details.

---

### Can I share my theme/layout?

**Yes, via backup files:**

**Export:**

1. Click Backup button
2. Downloads JSON file with full state
3. Share file with others

**Import:**

1. Receive backup JSON file
2. Click Restore button
3. Select file
4. System loads with same layout/theme

**Selective Sharing:**

- Can extract just `theme` object from backup
- Manually apply via browser console
- See [API Reference](./api-reference.md) for details

---

## 🤖 AI QUESTIONS

### Do I need an API key for AI features?

**Yes, for AI-powered widgets:**

**Requires Key:**

- Neural Scratchpad (Refine, Expand, Summarize)
- WritePad (Document generation)
- Polyglot Box (Code translation)
- Widget Architect (Prototyping)
- Aesthetic Engine (AI themes)

**No Key Needed:**

- All other widgets work without AI
- Layout, grid, storage functions
- Manual theme customization

**How to Get Key:**

- Visit https://makersuite.google.com/app/apikey
- Free tier: 60 requests/minute
- See [Getting Started](./getting-started.md) for setup

---

### Is the AI safe to use?

**Safety Considerations:**

**Privacy:**

- Prompts sent directly to Google (not through Omni-Grid servers)
- No logging by Omni-Grid (Google's privacy policy applies)
- API key stored locally in your browser

**Data Handling:**

- Don't send sensitive/personal data in prompts
- Google may use data to improve models (check their terms)
- Consider using generic examples instead of real data

**Security:**

- API key stored in plain text in localStorage
- Use strong device/browser password
- Don't share screenshots with visible API key

---

### What AI model is used?

**Google Gemini Models:**

**Flash (Default for most operations):**

- Model: `gemini-1.5-flash-latest`
- Speed: Very fast (~1-2 seconds)
- Use Cases: Summarize, translate, quick edits

**Pro (Complex operations):**

- Model: `gemini-1.5-pro-latest`
- Speed: Slower (~3-5 seconds)
- Use Cases: Code generation, complex analysis

**Selection:**

- Automatically chosen based on task
- Can be customized in widget code
- See [API Reference](./api-reference.md)

---

## 📊 DATA QUESTIONS

### Where is my data stored?

**Browser localStorage:**

- Key: `omni-grid-storage`
- Format: JSON
- Location: Browser profile directory

**Not Stored:**

- No cloud storage
- No remote databases
- No cookies (localStorage only)

**Access:**

```javascript
// Browser console
localStorage.getItem('omni-grid-storage');
```

---

### What happens if I clear browser data?

**If you clear localStorage:**

- ❌ All layouts lost
- ❌ All widget data lost (notes, tasks, etc.)
- ❌ All settings lost (theme, API key, etc.)
- ✅ App still works (starts fresh)

**Prevention:**

- Regular backups (click Backup button)
- Store backup files externally (Google Drive, Dropbox, etc.)
- Set backup reminders

---

### Can I export my data?

**Yes, easily:**

**Full Export:**

1. Click Backup button (top-right)
2. Downloads JSON with everything
3. File name: `omni-grid-backup-YYYY-MM-DD.json`

**Selective Export:**

```javascript
// Browser console - export just notes
const notes = useAppStore.getState().scratchpadNotes;
console.log(JSON.stringify(notes, null, 2));
```

**Data Portability:**

- JSON format (standard, readable)
- Can be parsed by other tools
- Easy to migrate to other systems

---

### How do I backup automatically?

**Currently: Manual only**

**Workaround:**

1. Set calendar reminder (daily/weekly)
2. Click Backup button
3. Save to cloud storage automatically

**Future Feature:**

- Scheduled auto-backups
- Export to Google Drive/Dropbox
- Sync across devices

---

## 🔌 INTEGRATION QUESTIONS

### Can Omni-Grid integrate with other apps?

**Current Integrations:**

**Direct:**

- Google Gemini (AI)
- Any public API (via widget code)

**Indirect (via browser):**

- Copy/paste between apps
- Cross-Talk drag & drop (within Omni-Grid)
- Export/import files

**Future Possibilities:**

- Browser extensions for data capture
- Zapier/IFTTT webhooks
- Native app wrappers (Electron)

---

### Can I access Omni-Grid from multiple devices?

**Not natively (local-only storage)**

**Workarounds:**

**Option 1: Manual Sync**

1. Backup on Device A
2. Upload to cloud storage
3. Download on Device B
4. Restore backup

**Option 2: Self-Host**

1. Deploy to public URL (Netlify, Vercel)
2. Access same URL from all devices
3. Still local storage (per browser/device)

**Future:**

- Optional cloud sync service
- Conflict resolution for multi-device
- End-to-end encryption

---

### Can widgets talk to each other?

**Yes, via Cross-Talk Protocol:**

**Method: Drag & Drop**

1. Drag data from Widget A
2. Drop on Widget B
3. Widget B receives and processes data

**Example:**

- Universal Transformer: Convert CSV to JSON
- Drag JSON output
- Drop on Neural Scratchpad
- Scratchpad analyzes data with AI

**Implementation:**

- Standard HTML5 Drag & Drop API
- JSON or plain text transfer
- See [API Reference](./api-reference.md) for code

---

## 🛠️ DEVELOPMENT QUESTIONS

### How do I contribute to Omni-Grid?

**Steps:**

1. Fork repository on GitHub
2. Create feature branch (`feat/my-widget`)
3. Make changes
4. Test thoroughly
5. Open Pull Request
6. Wait for review

**Contribution Types:**

- New widgets
- Bug fixes
- Documentation improvements
- Performance optimizations

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

### Can I use Omni-Grid as a starting point for my own app?

**Yes! It's open source.**

**License:**

- Check LICENSE file in repository
- Likely MIT or similar permissive license
- Attribution appreciated

**Recommended Modifications:**

1. Fork repository
2. Rename project
3. Customize widgets
4. Add your own branding
5. Deploy under your domain

**Credit:**

- Include original author attribution
- Link back to source repository
- Follow license terms

---

### How do I report bugs?

**Via GitHub Issues:**

1. Check existing issues first
2. Create new issue if not found
3. Include:
   - OS and browser version
   - Steps to reproduce
   - Expected vs. actual behavior
   - Console errors (if any)
   - Screenshots (if visual)

**Via Email (if preferred):**

- Contact project maintainer
- Include same information as above

See [Troubleshooting](./troubleshooting.md) for common fixes first.

---

## 🎯 USAGE QUESTIONS

### What's the recommended workflow?

**Suggested Setup:**

**For Developers:**

- Web Terminal (code REPL)
- Dev Optic (JWT, regex)
- Git Pulse (PR monitoring)
- Neural Scratchpad (AI notes)
- Focus HUD (Pomodoro timer)

**For Finance/Crypto:**

- Asset Command (portfolio)
- Market Widget (price feeds)
- Macro Net (M2 correlation)
- Chain Pulse (blockchain data)
- News Feed (market news)

**For Writers:**

- Neural Scratchpad (brainstorming)
- WritePad (drafting)
- Focus HUD (time management)
- Universal Transformer (formatting)

**For General Productivity:**

- Focus HUD (tasks + timer)
- Secure Calendar (events)
- Neural Scratchpad (notes)
- Cipher Vault (passwords/hashes)

---

### How many widgets can I have open?

**Technical Limits:**

- Maximum supported: ~50 widgets
- Recommended: ~20 widgets for performance
- Practical: 10-15 widgets for usability

**Factors:**

- Device performance (CPU, RAM)
- Widget complexity (data-heavy vs. simple)
- Browser efficiency

**Optimization:**

- Toggle off unused widgets
- Use Dock for quick access
- Organize with Ghost AI suggestions

---

### Can I reset everything?

**Yes, multiple ways:**

**Via UI (Recommended):**

1. Open System Core widget
2. Navigate to Settings tab
3. Click "Factory Reset" (Skull icon)
4. Confirm action
5. App reloads with defaults

**Via Console:**

```javascript
localStorage.clear();
location.reload();
```

**Note:** Factory reset is **irreversible**. Backup first!

---

## 📚 LEARNING RESOURCES

### Where can I learn more?

**Documentation:**

- [Getting Started](./getting-started.md) - Setup and basics
- [Architecture](./architecture.md) - How it works
- [Widget Development](./widget-development.md) - Build widgets
- [API Reference](./api-reference.md) - Complete API
- [Configuration](./configuration.md) - Settings guide

**Code:**

- Browse `widgets/` folder for examples
- Read `store.ts` to understand state
- Check `App.tsx` for app structure

**Community:**

- GitHub Issues (questions welcome)
- GitHub Discussions (coming soon)

---

### What should I read first?

**For Users:**

1. [Getting Started](./getting-started.md)
2. [Configuration](./configuration.md)
3. This FAQ

**For Developers:**

1. [Architecture](./architecture.md)
2. [Widget Development](./widget-development.md)
3. [API Reference](./api-reference.md)

**For Contributors:**

1. [CONTRIBUTING.md](../CONTRIBUTING.md)
2. [Architecture](./architecture.md)
3. [Widget Development](./widget-development.md)

---

## ❓ STILL HAVE QUESTIONS?

**Didn't find your answer?**

1. **Search Documentation:**
   - Use Cmd+F or Ctrl+F
   - Check all docs in `docs/` folder

2. **Check GitHub Issues:**
   - Someone may have asked already
   - Search closed issues too

3. **Ask the Community:**
   - Open a GitHub Discussion
   - Tag your question appropriately

4. **Contact Maintainer:**
   - Open an issue on GitHub
   - Include "Question:" in title

---

_Questions are the seeds of understanding._

**[← Back to Documentation Hub](./README.md)**
