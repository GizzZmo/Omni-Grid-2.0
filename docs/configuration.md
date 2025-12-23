# CONFIGURATION // SYSTEM SETTINGS

```text
[ DOCUMENTATION: CONFIGURATION.MD ]
[ ACCESS LEVEL: OPERATOR ]
```

## 🎛️ OVERVIEW

Omni-Grid offers multiple configuration layers to customize your experience. This guide covers all configurable aspects from environment variables to in-app settings.

---

## 🔑 ENVIRONMENT VARIABLES

### Setup Location

Create a `.env` file in the project root directory:

```
Omni-Grid-2.0/
├── .env              ← Create this file
├── package.json
├── vite.config.ts
└── ...
```

### Available Variables

#### API_KEY (Optional)

**Purpose:** Google Gemini API key for AI-powered features

**Format:**
```env
API_KEY=AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX
```

**How to obtain:**
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create or select a project
4. Generate API key
5. Copy to `.env` file

**Features requiring API key:**
- Neural Scratchpad (Refine, Expand, Summarize)
- WritePad (Document drafting)
- Polyglot Box (Code translation)
- Widget Architect (Prototype generation)
- Aesthetic Engine (AI theme generation)

**Note:** If not set in `.env`, you can add it later via System Core widget settings.

### Security Best Practices

```bash
# .gitignore (already configured)
.env
.env.local
.env.production

# NEVER commit .env files to version control
# Share .env.example instead (template without actual keys)
```

**Create `.env.example` for team sharing:**
```env
# .env.example
API_KEY=your_google_gemini_api_key_here
```

---

## ⚙️ IN-APP SETTINGS

Access via **System Core** widget → **Settings** tab

### API Configuration

**Google Gemini API Key**
- Location: System Core → Settings → API Key
- Storage: Browser localStorage
- Scope: Current browser/profile only
- Security: Stored in plain text (use strong device password)

### Visual Settings

#### Scanlines Effect
- **Toggle:** ON/OFF
- **Effect:** CRT monitor aesthetic with horizontal scanlines
- **Performance Impact:** Minimal
- **Recommended:** ON for cyberpunk vibe, OFF for clean UI

#### Matrix Rain
- **Toggle:** ON/OFF
- **Effect:** Animated background rain effect
- **Performance Impact:** Low (CSS animation)
- **Recommended:** ON for atmosphere, OFF for minimal distraction

---

## 🎨 THEME CONFIGURATION

### Accessing Theme Engine

Open **Aesthetic Engine** widget (Dock: Wand icon)

### Color Customization

**Modifiable Properties:**
- **Background:** Main app background color
- **Surface:** Widget background color
- **Primary:** Primary accent (borders, highlights)
- **Secondary:** Secondary accent (alternate highlights)
- **Text:** Primary text color
- **Accent:** Additional accent color

**Methods:**
1. **Presets:** Choose from built-in themes
2. **Manual:** Use color pickers for each property
3. **AI Generation:** Describe a vibe or upload an image

### Built-in Presets

#### Cyberpunk (Default)
```json
{
  "background": "#020617",
  "surface": "#0f172a",
  "primary": "#06b6d4",
  "secondary": "#d946ef",
  "text": "#e2e8f0",
  "accent": "#10b981"
}
```

#### Neon Night
```json
{
  "background": "#0a0a0f",
  "surface": "#1a1a2e",
  "primary": "#ff00ff",
  "secondary": "#00ffff",
  "text": "#ffffff",
  "accent": "#ff00aa"
}
```

#### Minimal Light
```json
{
  "background": "#ffffff",
  "surface": "#f5f5f5",
  "primary": "#3b82f6",
  "secondary": "#6366f1",
  "text": "#1f2937",
  "accent": "#10b981"
}
```

#### Matrix Green
```json
{
  "background": "#000000",
  "surface": "#0d1b0d",
  "primary": "#00ff41",
  "secondary": "#39ff14",
  "text": "#00ff41",
  "accent": "#00cc33"
}
```

### AI Theme Generation

**From Text Prompt:**
1. Open Aesthetic Engine
2. Enter description (e.g., "sunset over ocean")
3. Click "Generate"
4. AI analyzes and creates color palette
5. Preview and apply

**From Image Upload:**
1. Open Aesthetic Engine
2. Upload image file
3. AI extracts dominant colors
4. Preview and apply

### Custom Theme Export/Import

**Export Theme:**
```typescript
// Access via browser console
const theme = useAppStore.getState().theme;
console.log(JSON.stringify(theme, null, 2));
// Copy output and save to file
```

**Import Theme:**
```typescript
// Paste in browser console
const customTheme = {
  name: "My Theme",
  colors: { /* your colors */ },
  font: "Inter",
  radius: "4px"
};
useAppStore.getState().setTheme(customTheme);
```

---

## 🖥️ LAYOUT CONFIGURATION

### Grid Settings

#### Compact Mode (Auto-Fit)
- **Toggle:** AUTOFIT button (top-right)
- **Effect:** Automatically arranges widgets vertically with no gaps
- **Use Case:** Maximize space utilization
- **Disable:** For free-form layout with gaps

#### Layout Lock
- **Toggle:** LOCKED/UNLOCKED button (top-right)
- **Effect:** Prevents drag/resize operations
- **Use Case:** Lock final layout to prevent accidental changes

#### Responsive Breakpoints

Layouts automatically adjust at these breakpoints:

| Breakpoint | Width | Columns | Use Case |
|------------|-------|---------|----------|
| xxs | 0-479px | 2 | Mobile portrait |
| xs | 480-767px | 4 | Mobile landscape |
| sm | 768-995px | 6 | Small tablets |
| md | 996-1199px | 10 | Tablets, small laptops |
| lg | 1200px+ | 12 | Desktops, large laptops |

### Default Widget Sizes

Modify in `store.ts` → `DEFAULT_LAYOUT`:

```typescript
// Example sizes
{ i: 'SCRATCHPAD', x: 0, y: 0, w: 6, h: 12 },  // Large
{ i: 'FOCUS_HUD', x: 6, y: 0, w: 3, h: 6 },    // Medium
{ i: 'CALC', x: 9, y: 0, w: 3, h: 4 },         // Small
```

**Grid Units:**
- `w`: Width in columns (1-12)
- `h`: Height in rows (1 row = 30px)
- `x`, `y`: Position coordinates

### Manual Layout Reset

**Via UI:**
1. Open System Core widget
2. Navigate to Settings tab
3. Click "Factory Reset" (Skull icon)
4. Confirm action

**Via Console:**
```javascript
// Clear all localStorage
localStorage.clear();
// Refresh page
location.reload();
```

---

## 💾 DATA MANAGEMENT

### Backup Configuration

**Automatic Backup:**
- Not implemented (manual only)
- Future: Schedule periodic auto-backups

**Manual Backup:**
1. Click **Backup** button (top-right)
2. Downloads: `omni-grid-backup-YYYY-MM-DD.json`
3. Contains:
   - All widget data (notes, tasks, etc.)
   - Layout configurations
   - Settings and theme
   - Timestamps for version tracking

**Backup Frequency Recommendations:**
- Daily: If actively using for work
- Weekly: For casual use
- Before major changes: Always

### Restore Configuration

**From Backup File:**
1. Click **Restore** button (top-right)
2. Select backup JSON file
3. Review prompt (current data will be overwritten)
4. Confirm restoration
5. App reloads with restored state

**Selective Restore (Advanced):**
```javascript
// In browser console
const backup = /* paste your backup JSON */;

// Restore only specific parts
useAppStore.getState().setTheme(backup.state.theme);
// OR
useAppStore.getState().setScratchpadNotes(backup.state.scratchpadNotes);
```

### Storage Limits

**Browser localStorage Limits:**
- Chrome: ~10MB
- Firefox: ~10MB
- Safari: ~5MB
- Edge: ~10MB

**Current Usage Check:**
```javascript
// Browser console
const used = new Blob(Object.values(localStorage)).size;
console.log(`localStorage: ${(used / 1024).toFixed(2)} KB`);
```

**When Approaching Limits:**
1. Export and archive old backups
2. Clear unused widget data
3. Consider IndexedDB migration (future feature)

---

## 🔊 AUDIO CONFIGURATION

### Sonic Architecture Widget

**Brown Noise Generator:**
- Volume: 0-100%
- Start/Stop controls
- Runs in background tab

**Audio File Playback:**
- Upload local audio files
- Playlist management
- Loop controls

**Settings:**
- Located within Sonic Architecture widget
- Browser-based audio API
- No external dependencies

---

## 🌐 NETWORK CONFIGURATION

### API Endpoints

**Gemini API:**
- Endpoint: `https://generativelanguage.googleapis.com`
- Protocol: HTTPS
- Authentication: API key in request header

**Future Integrations:**
- Weather APIs (configure in Weather Station widget)
- Financial APIs (configure in Market widgets)
- Custom backends (add to `services/`)

### Proxy Configuration (Advanced)

For corporate networks with restrictions:

**Vite Proxy (Development):**
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

**Production Proxy:**
- Deploy a serverless function (Netlify/Vercel)
- Forward requests to Gemini API
- Update `services/geminiService.ts` with new endpoint

---

## 🔐 PRIVACY CONFIGURATION

### Data Collection

**What Omni-Grid Collects:**
- Nothing. Zero telemetry.

**What's Stored Locally:**
- All widget data
- Settings and preferences
- API keys (your responsibility)
- Layout configurations

**Third-Party Services:**
- Google Gemini (only when AI features are used)
- See Google's privacy policy for Gemini data handling

### Clearing All Data

**Complete Wipe:**
1. System Core → Settings → Factory Reset
2. Or browser console: `localStorage.clear()`

**Per-Widget Clear:**
```javascript
// Clear specific widget data
const state = useAppStore.getState();
state.setScratchpadNotes([]);
state.setTasks([]);
// etc.
```

---

## 🚀 PERFORMANCE CONFIGURATION

### Optimization Settings

**Disable Visual Effects:**
- Turn off Scanlines (System Core)
- Turn off Matrix Rain (System Core)
- Reduces GPU usage on low-end devices

**Limit Active Widgets:**
- Fewer widgets = better performance
- Recommended max: 20 widgets visible
- Use Dock to toggle frequently

**Browser Settings:**
- Enable hardware acceleration
- Close unused tabs
- Clear browser cache periodically

### Developer Mode

**Enable React DevTools:**
```bash
# Install browser extension
# Chrome: React Developer Tools
# Firefox: React Developer Tools
```

**Zustand DevTools:**
```typescript
// Add to store.ts (development only)
import { devtools } from 'zustand/middleware';

export const useAppStore = create(
  devtools(
    persist(
      (set, get) => ({ /* state */ }),
      { name: 'omni-grid-storage' }
    ),
    { name: 'Omni-Grid Store' }
  )
);
```

---

## 📱 RESPONSIVE CONFIGURATION

### Mobile Optimization

**Recommended Settings:**
- Compact Mode: ON
- Fewer visible widgets (5-8)
- Larger widget sizes (w: 2-4, h: 8-12)

**Touch Support:**
- Drag gestures supported
- Pinch-to-zoom disabled (intentional)
- Long-press for context menus

---

## 🛠️ DEVELOPMENT CONFIGURATION

### TypeScript Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // Auto-open browser
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // Enable for debugging
  },
});
```

### Linting (Future)

```bash
# Install ESLint
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Create .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ]
}
```

---

## 📚 FURTHER READING

- **[Getting Started](./getting-started.md)** - Setup and installation
- **[Architecture](./architecture.md)** - System design
- **[Widget Development](./widget-development.md)** - Custom widgets
- **[Troubleshooting](./troubleshooting.md)** - Common issues

---

*Configuration is power. Own your grid.*

**[← Back to Documentation Hub](./README.md)**
