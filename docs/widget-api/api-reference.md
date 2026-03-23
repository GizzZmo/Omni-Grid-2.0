# Widget API Reference

## TypeScript Interfaces

### `WidgetType`

```typescript
// types.ts
export type WidgetType =
  | 'SYSTEM' | 'HELP' | 'TRANSFORMER' | 'SCRATCHPAD' | 'FOCUS_HUD'
  | 'DEV_OPTIC' | 'CIPHER_VAULT' | 'CHROMA_LAB' | 'TEMPORAL' | 'SONIC'
  | 'CALC' | 'ASSET' | 'POLYGLOT' | 'WRITEPAD' | 'WEATHER' | 'VALUTA'
  | 'ARCHITECT' | 'THEME_ENGINE' | 'GHOST' | 'RADIO' | 'SUDOKU'
  | 'DOCU_HUB' | 'GIT_PULSE' | 'PROJECT_TRACKER' | 'WEB_TERMINAL'
  | 'CYBER_EDITOR' | 'NEWS_FEED' | 'CIPHER_PAD' | 'PDF_VIEWER'
  | 'RESEARCH_BROWSER' | 'SECURE_CALENDAR' | 'MACRO_NET' | 'CHAIN_PULSE'
  | 'REG_RADAR' | 'MARKET' | 'STRATEGIC' | 'CLIPBOARD' | 'PROMPT_LAB'
  | 'NEURAL_CHAT'
  // Add your widget type here
  ;
```

### `GridItemData`

```typescript
interface GridItemData {
  i: string;   // widget ID (must match WidgetType)
  x: number;   // column start (0–11)
  y: number;   // row start
  w: number;   // width in columns (1–12)
  h: number;   // height in row units (1 unit = 30px)
}
```

### `AppTheme`

```typescript
interface AppTheme {
  name: string;
  colors: {
    background: string;  // hex color
    surface: string;     // hex color
    primary: string;     // hex color
    secondary: string;   // hex color
    text: string;        // hex color
    accent: string;      // hex color
  };
  font: string;    // CSS font-family
  radius: string;  // CSS border-radius value
}
```

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

## Grid Layout

The grid uses **12 columns** with a **30px row height** and **16px gutters**.

| Widget Size | w | h |
|---|---|---|
| Small | 3–4 | 4–6 |
| Medium | 4–6 | 6–8 |
| Large | 6–8 | 8–12 |
| Full width | 12 | 8+ |

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

## CSS Variables

The active theme injects these CSS custom properties:

| Variable | Description |
|---|---|
| `--color-bg` | Background color |
| `--color-surface` | Surface/card color |
| `--color-primary` | Primary accent |
| `--color-secondary` | Secondary accent |
| `--color-text` | Text color |
| `--color-accent` | Success/highlight |
| `--radius` | Border radius |
