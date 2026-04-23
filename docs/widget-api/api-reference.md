# Widget API Reference

## TypeScript Interfaces

### `WidgetType`

```typescript
// types.ts
export type WidgetType =
  | 'MARKETPLACE'
  | 'SYSTEM'
  | 'HELP'
  | 'TRANSFORMER'
  | 'SCRATCHPAD'
  | 'FOCUS_HUD'
  | 'DEV_OPTIC'
  | 'CIPHER_VAULT'
  | 'CHROMA_LAB'
  | 'TEMPORAL'
  | 'SONIC'
  | 'CALC'
  | 'ASSET'
  | 'POLYGLOT'
  | 'WRITEPAD'
  | 'WEATHER'
  | 'VALUTA'
  | 'ARCHITECT'
  | 'THEME_ENGINE'
  | 'GHOST'
  | 'RADIO'
  | 'SUDOKU'
  | 'DOCU_HUB'
  | 'GIT_PULSE'
  | 'PROJECT_TRACKER'
  | 'WEB_TERMINAL'
  | 'CYBER_EDITOR'
  | 'NEWS_FEED'
  | 'CIPHER_PAD'
  | 'PDF_VIEWER'
  | 'RESEARCH_BROWSER'
  | 'SECURE_CALENDAR'
  | 'MACRO_NET'
  | 'CHAIN_PULSE'
  | 'REG_RADAR'
  | 'MARKET'
  | 'STRATEGIC'
  | 'CLIPBOARD'
  | 'PROMPT_LAB'
  | 'NEURAL_CHAT'
  | 'SUNO_PLAYER';
// Add your widget type here
```

### `GridItemData`

```typescript
interface GridItemData {
  i: string; // widget ID (must match WidgetType)
  x: number; // column start (0–11)
  y: number; // row start
  w: number; // width in columns (1–12)
  h: number; // height in row units (1 unit = 30px)
}
```

### `AppTheme`

```typescript
interface AppTheme {
  name: string;
  colors: {
    background: string; // hex color
    surface: string; // hex color
    primary: string; // hex color
    secondary: string; // hex color
    text: string; // hex color
    accent: string; // hex color
  };
  font: string; // CSS font-family
  radius: string; // CSS border-radius value
}
```

### `MarketplaceEntry`

Describes a widget in the marketplace catalog (`widgets/marketplaceCatalog.ts`).

```typescript
type MarketplaceCategory =
  | 'all'
  | 'utility'
  | 'developer'
  | 'finance'
  | 'creative'
  | 'ai'
  | 'productivity'
  | 'community';

interface MarketplaceEntry {
  id: string;               // must match a WidgetType string
  name: string;             // display name in the marketplace
  description: string;      // short description (1–3 sentences)
  version: string;          // semver: "1.0.0"
  author: string;           // GitHub username or team name
  category: MarketplaceCategory;
  tags: string[];           // 2–6 lowercase tags
  downloads: number;        // install count (0 for new submissions)
  rating: number;           // 0.0–5.0 (0 for new submissions)
  updatedAt: string;        // ISO date "YYYY-MM-DD"
  changelog?: string;       // human-readable release notes
  isCore: boolean;          // false for community submissions
  minGridW: number;         // minimum grid width (columns)
  minGridH: number;         // minimum grid height (rows)
}
```

---

## Store API

### Reading State

```typescript
import { useAppStore } from '../store';

// Always use individual selectors (not the whole store)
const theme = useAppStore(s => s.theme);
const settings = useAppStore(s => s.settings);
const visibleWidgets = useAppStore(s => s.visibleWidgets);
```

### Writing State

```typescript
const setTheme = useAppStore(s => s.setTheme);
const toggleWidget = useAppStore(s => s.toggleWidget);
const addLog = useAppStore(s => s.addLog);
```

### Settings

```typescript
const settings = useAppStore(s => s.settings);
// settings.geminiApiKey  — Gemini API key
// settings.e2bApiKey     — E2B sandbox API key
// settings.scanlines     — boolean: CRT scanline effect
// settings.sound         — boolean: ambient sound enabled
// settings.startupBehavior — 'restore' | 'default' | 'empty'
```

### Marketplace API

```typescript
// Read installed widgets (widgetId → semver string)
const installedWidgets = useAppStore(s => s.installedWidgets);
// e.g. { SYSTEM: '2.1.0', TRANSFORMER: '2.3.0', ... }

// Check if a specific widget is installed
const isInstalled = installedWidgets['MY_WIDGET'] !== undefined;

// Widget IDs that have a newer version available
const availableUpdates = useAppStore(s => s.availableUpdates);

// Install a widget (also adds it to the grid)
const installWidget = useAppStore(s => s.installWidget);
installWidget('MY_WIDGET'); // records version from catalog, toggles onto grid

// Uninstall a widget (removes from grid and installed map)
const uninstallWidget = useAppStore(s => s.uninstallWidget);
uninstallWidget('MY_WIDGET');

// Trigger update detection (compares installed vs catalog versions)
const checkForUpdates = useAppStore(s => s.checkForUpdates);
checkForUpdates(); // updates availableUpdates in store

// Timestamp of last update check (0 if never checked)
const marketplaceLastChecked = useAppStore(s => s.marketplaceLastChecked);
```

### Marketplace Catalog Utilities

```typescript
import { MARKETPLACE_CATALOG, getCatalogEntry } from '../widgets/marketplaceCatalog';

// Full catalog array
const allWidgets = MARKETPLACE_CATALOG;

// Lookup a single entry by ID
const entry = getCatalogEntry('TRANSFORMER');
// entry is MarketplaceEntry | undefined

// Filter by category
const devWidgets = MARKETPLACE_CATALOG.filter(e => e.category === 'developer');

// Filter community-only widgets
const communityWidgets = MARKETPLACE_CATALOG.filter(e => !e.isCore);
```

---

## Gemini AI Service

```typescript
import { getGenAIClient } from '../services/geminiService';
import { refineText } from '../services/geminiService';

// Low-level client access
const ai = getGenAIClient(); // null if no API key configured
if (ai) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Your prompt',
    config: {
      systemInstruction: 'You are a helpful assistant.',
      responseMimeType: 'application/json', // for structured output
    },
  });
}

// High-level text refinement
const refined = await refineText(text, 'REFINE'); // REFINE | EXPAND | TRANSLATE | ANALYZE | SUMMARY | TONE
```

---

## Grid Layout

The grid uses **12 columns** with a **30px row height** and **16px gutters**.

| Widget Size | w   | h    |
| ----------- | --- | ---- |
| Small       | 3–4 | 4–6  |
| Medium      | 4–6 | 6–8  |
| Large       | 6–8 | 8–12 |
| Full width  | 12  | 8+   |

---

## File Utilities

```typescript
import { downloadJson, uploadJson } from '../utils';

// Download state as JSON
downloadJson('filename.json', { data: 'value' });

// Upload and parse JSON
uploadJson(data => {
  if (data.myField) {
    setMyField(data.myField);
  }
});
```

---

## CSS Variables

The active theme injects these CSS custom properties:

| Variable            | Description        |
| ------------------- | ------------------ |
| `--color-bg`        | Background color   |
| `--color-surface`   | Surface/card color |
| `--color-primary`   | Primary accent     |
| `--color-secondary` | Secondary accent   |
| `--color-text`      | Text color         |
| `--color-accent`    | Success/highlight  |
| `--radius`          | Border radius      |

---

## Worked Examples

### Example 1: Reading catalog metadata inside a widget

```typescript
import { getCatalogEntry } from '../widgets/marketplaceCatalog';
import { useAppStore } from '../store';

export const MyWidget: React.FC = () => {
  const installedWidgets = useAppStore(s => s.installedWidgets);
  const entry = getCatalogEntry('MY_WIDGET');

  return (
    <div className="p-4">
      <p className="text-xs text-slate-400">
        Version {entry?.version ?? 'unknown'}{' '}
        {installedWidgets['MY_WIDGET'] ? '(installed)' : '(not installed)'}
      </p>
    </div>
  );
};
```

### Example 2: Checking for an update badge in a custom launcher button

```typescript
const availableUpdates = useAppStore(s => s.availableUpdates);
const hasUpdate = availableUpdates.includes('MY_WIDGET');

return (
  <button className="relative ...">
    <MyIcon size={18} />
    {hasUpdate && (
      <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-amber-400" />
    )}
  </button>
);
```

### Example 3: Programmatic install from another widget

```typescript
const installWidget = useAppStore(s => s.installWidget);
const toggleWidget = useAppStore(s => s.toggleWidget);

const openMarketplace = () => {
  // Install the marketplace widget if not already installed
  const { installedWidgets } = useAppStore.getState();
  if (!installedWidgets['MARKETPLACE']) {
    installWidget('MARKETPLACE');
  } else {
    toggleWidget('MARKETPLACE');
  }
};
```

### Example 4: Adding a community widget to the catalog

In `widgets/marketplaceCatalog.ts`, append to `MARKETPLACE_CATALOG`:

```typescript
{
  id: 'POMODORO_TIMER',        // must match WidgetType
  name: 'Pomodoro Timer',
  description: 'Focus timer with 25/5 Pomodoro cycles, sound alerts, and session stats.',
  version: '1.0.0',
  author: 'your-github-username',
  category: 'productivity',
  tags: ['pomodoro', 'timer', 'focus', 'productivity'],
  downloads: 0,
  rating: 0,
  updatedAt: '2025-04-01',
  changelog: 'Initial community release.',
  isCore: false,               // required for community submissions
  minGridW: 3,
  minGridH: 4,
},
```

