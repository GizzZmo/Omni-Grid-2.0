# API REFERENCE // FUNCTION INDEX

```text
[ DOCUMENTATION: API-REFERENCE.MD ]
[ ACCESS LEVEL: DEVELOPER ]
```

## 🔧 OVERVIEW

This document provides complete API reference for Omni-Grid's hooks, services, utilities, and types.

---

## 📦 STATE MANAGEMENT

### useAppStore Hook

**Import:**

```typescript
import { useAppStore } from './store';
```

**Basic Usage:**

```typescript
// Subscribe to specific state
const geminiApiKey = useAppStore(s => s.settings.geminiApiKey);
const visibleWidgets = useAppStore(s => s.visibleWidgets);

// Subscribe to actions
const toggleWidget = useAppStore(s => s.toggleWidget);
const updateLayout = useAppStore(s => s.updateLayout);
```

**Direct State Access (Non-Reactive):**

```typescript
// For imperative operations
const currentState = useAppStore.getState();
const geminiApiKey = currentState.settings.geminiApiKey;

// Set state directly
useAppStore.getState().toggleWidget('SCRATCHPAD');
```

---

## 📊 STATE INTERFACE

### AppState

Complete state shape:

```typescript
interface AppState {
  // Widget Visibility — plain strings to support dynamic/marketplace widgets
  visibleWidgets: string[];

  // Layout (lg breakpoint only)
  layouts: { lg: GridItemData[] };

  // System Settings
  settings: {
    geminiApiKey: string;
    e2bApiKey: string;
    scanlines: boolean;
    sound: boolean;
    startupBehavior: 'restore' | 'default' | 'empty';
  };

  // Theme
  theme: AppTheme;

  // UI State
  isLayoutLocked: boolean;
  isCompact: boolean;
  ghostWidget: GhostData | null;
  isCmdPaletteOpen: boolean;
  isSettingsPanelOpen: boolean;

  // Widget-Specific Data
  scratchpadContent: string;
  tasks: Task[];
  tickers: string[];
  writePadContent: string;
  weatherLocation: string;
  clipboardHistory: string[];
  cyberEditorTabs: CyberEditorTab[];
  promptLibrary: PromptTemplate[];

  // Marketplace
  installedWidgets: Record<string, string>;
  availableUpdates: string[];

  // Actions (see below)
}
```

---

## 🎬 ACTIONS

### Widget Management

#### toggleWidget

```typescript
toggleWidget: (widgetId: string) => void
```

**Purpose:** Show/hide a widget. Accepts any string ID — if the widget has no existing layout entry, a default one is created automatically.  
**Example:**

```typescript
const toggleWidget = useAppStore(s => s.toggleWidget);
toggleWidget('SCRATCHPAD');
```

---

### Layout Management

#### updateLayout

```typescript
updateLayout: (newLayout: GridItemData[], breakpoint?: string) => void
```

**Purpose:** Update grid layout for specific breakpoint  
**Parameters:**

- `newLayout`: Array of grid item positions
- `breakpoint`: 'lg' | 'md' | 'sm' | 'xs' | 'xxs' (defaults to 'lg')

**Example:**

```typescript
const updateLayout = useAppStore(s => s.updateLayout);
updateLayout([
  { i: 'SCRATCHPAD', x: 0, y: 0, w: 6, h: 12 },
  { i: 'FOCUS_HUD', x: 6, y: 0, w: 6, h: 6 },
]);
```

#### toggleLayoutLock

```typescript
toggleLayoutLock: () => void
```

**Purpose:** Lock/unlock layout (prevents drag/resize)  
**Example:**

```typescript
const toggleLayoutLock = useAppStore(s => s.toggleLayoutLock);
toggleLayoutLock();
```

#### toggleCompact

```typescript
toggleCompact: () => void
```

**Purpose:** Toggle auto-fit mode  
**Example:**

```typescript
const toggleCompact = useAppStore(s => s.toggleCompact);
toggleCompact();
```

---

### Settings Management

#### setGeminiApiKey

```typescript
setGeminiApiKey: (key: string) => void
```

**Purpose:** Update the Gemini API key and sync it to the runtime environment  
**Example:**

```typescript
useAppStore.getState().setGeminiApiKey('AIza...');
```

#### setE2bApiKey

```typescript
setE2bApiKey: (key: string) => void
```

**Purpose:** Update the E2B sandbox API key  
**Example:**

```typescript
useAppStore.getState().setE2bApiKey('e2b_...');
```

#### toggleSetting

```typescript
toggleSetting: (key: 'scanlines' | 'sound') => void
```

**Purpose:** Toggle a boolean setting  
**Example:**

```typescript
useAppStore.getState().toggleSetting('scanlines');
```

#### setTheme

```typescript
setTheme: (theme: AppTheme) => void
```

**Purpose:** Apply a new theme  
**Example:**

```typescript
const newTheme: AppTheme = {
  name: 'Custom',
  colors: {
    background: '#000000',
    surface: '#1a1a1a',
    primary: '#00ff00',
    secondary: '#ff00ff',
    text: '#ffffff',
    accent: '#00ffff',
  },
  font: 'Inter',
  radius: '8px',
};
useAppStore.getState().setTheme(newTheme);
```

---

### Content Management

#### setScratchpadContent

```typescript
setScratchpadContent: (content: string) => void
```

**Purpose:** Update Neural Scratchpad plain-text content  
**Example:**

```typescript
useAppStore.getState().setScratchpadContent('My note content');
```

#### setTasks

```typescript
setTasks: (tasks: Task[]) => void
```

**Purpose:** Update Focus HUD tasks  
**Example:**

```typescript
const tasks: Task[] = [
  { id: '1', text: 'Complete documentation', status: 'done' },
  { id: '2', text: 'Review PRs', status: 'todo' },
];
useAppStore.getState().setTasks(tasks);
```

---

### Ghost Widget

#### setGhostWidget

```typescript
setGhostWidget: (data: GhostData | null) => void
```

**Purpose:** Set/clear Ghost Widget data  
**Example:**

```typescript
const ghostData: GhostData = {
  id: 'ghost-1',
  reason: 'Suggested based on your workflow',
  suggestedWidgetId: 'WEATHER_STATION',
  previewContent: 'Weather data would be useful here',
};
useAppStore.getState().setGhostWidget(ghostData);
```

---

### Global State

#### setGlobalState

```typescript
setGlobalState: (state: AppState) => void
```

**Purpose:** Replace entire state (for restore operations)  
**Example:**

```typescript
const backupState = /* loaded from file */;
useAppStore.getState().setGlobalState(backupState);
```

---

## 🤖 AI SERVICES

### geminiService.ts

#### callGemini

```typescript
callGemini(
  apiKey: string,
  prompt: string,
  model?: 'flash' | 'pro'
): Promise<string>
```

**Purpose:** Send prompt to Google Gemini API  
**Parameters:**

- `apiKey`: Your Gemini API key
- `prompt`: Text prompt for AI
- `model`: 'flash' (fast) or 'pro' (advanced), defaults to 'flash'

**Returns:** Promise resolving to AI response text

**Example:**

```typescript
import { callGemini } from '../services/geminiService';

const response = await callGemini(apiKey, 'Summarize this text: ...', 'flash');
console.log(response);
```

**Error Handling:**

```typescript
try {
  const response = await callGemini(apiKey, prompt);
} catch (error) {
  if (error.message.includes('API key')) {
    alert('Invalid API key');
  } else if (error.message.includes('quota')) {
    alert('API quota exceeded');
  } else {
    alert('AI service unavailable');
  }
}
```

---

### gridIntelligence.ts

#### optimizeLayout

```typescript
optimizeLayout(
  currentLayout: GridItemData[],
  visibleWidgets: WidgetType[]
): Promise<{ layout: GridItemData[], ghost: GhostData | null }>
```

**Purpose:** AI-powered layout optimization  
**Parameters:**

- `currentLayout`: Current grid positions
- `visibleWidgets`: List of visible widget IDs

**Returns:** Promise with optimized layout and optional ghost suggestion

**Example:**

```typescript
import { optimizeLayout } from '../services/gridIntelligence';

const result = await optimizeLayout(layouts.lg, visibleWidgets);
if (result.layout) {
  updateLayout(result.layout);
}
if (result.ghost) {
  setGhostWidget(result.ghost);
}
```

---

## 🛠️ UTILITIES

### utils.ts

#### downloadJson

```typescript
downloadJson(filename: string, data: any): void
```

**Purpose:** Trigger browser download of JSON file  
**Example:**

```typescript
import { downloadJson } from './utils';

const data = { foo: 'bar' };
downloadJson('my-data.json', data);
```

#### uploadJson

```typescript
uploadJson(callback: (data: any) => void): void
```

**Purpose:** Trigger file picker and parse JSON  
**Example:**

```typescript
import { uploadJson } from './utils';

uploadJson(data => {
  console.log('Loaded data:', data);
  useAppStore.getState().setGlobalState(data.state);
});
```

---

## 📋 TYPES

### WidgetType

```typescript
export type WidgetType =
  // Marketplace
  | 'MARKETPLACE'
  // Original / Utility
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
  | 'SYSTEM'
  | 'HELP'
  | 'ARCHITECT'
  | 'THEME_ENGINE'
  | 'GHOST'
  | 'RADIO'
  | 'SUDOKU'
  // Developer
  | 'DOCU_HUB'
  | 'GIT_PULSE'
  | 'PROJECT_TRACKER'
  | 'WEB_TERMINAL'
  | 'CYBER_EDITOR'
  // Researcher
  | 'NEWS_FEED'
  | 'CIPHER_PAD'
  | 'PDF_VIEWER'
  | 'RESEARCH_BROWSER'
  // Financial / Smart Grid
  | 'SECURE_CALENDAR'
  | 'MACRO_NET'
  | 'CHAIN_PULSE'
  | 'REG_RADAR'
  | 'MARKET'
  // Productivity
  | 'STRATEGIC'
  | 'CLIPBOARD'
  // Prompt Workspace
  | 'PROMPT_LAB'
  // AI Chat
  | 'NEURAL_CHAT'
  // Music
  | 'SUNO_PLAYER'
  // Multi-Agent Orchestration
  | 'MULTI_AGENT_HUB'
  // Browser
  | 'BROWSER_WIDGET'
  // Community
  | 'COMMUNITY_PORTAL';
```

### GridItemData

```typescript
export interface GridItemData {
  i: string; // Widget ID (matches WidgetType)
  x: number; // Column position (0-11 for lg)
  y: number; // Row position
  w: number; // Width in columns
  h: number; // Height in rows (1 row = 30px)
  minW?: number; // Minimum width
  minH?: number; // Minimum height
  maxW?: number; // Maximum width
  maxH?: number; // Maximum height
  static?: boolean; // If true, cannot be moved/resized
}
```

### Note

```typescript
export interface Note {
  id: string;
  content: string;
  lastUpdated: number; // Unix timestamp
}
```

### Task

```typescript
export interface Task {
  id: string;
  text: string;
  status: 'todo' | 'done';
}
```

### AppTheme

```typescript
export interface AppTheme {
  name: string;
  colors: {
    background: string; // Hex color
    surface: string; // Hex color
    primary: string; // Hex color
    secondary: string; // Hex color
    text: string; // Hex color
    accent: string; // Hex color
  };
  font: string; // Font family name
  radius: string; // CSS border-radius value
}
```

### GhostData

```typescript
export interface GhostData {
  id: string;
  reason: string; // Why this widget is suggested
  suggestedWidgetId: string; // Widget to add
  previewContent?: string; // Optional preview text
}
```

---

## 🎨 COMPONENT PROPS

### WidgetShell

```typescript
interface WidgetShellProps {
  id: string; // Widget ID
  title: string; // Display title
  icon: React.ReactNode; // Icon element (from lucide-react)
  accentColor: string; // Tailwind color class (e.g., 'text-cyan-400')
  children: React.ReactNode; // Widget content
  className?: string; // Additional CSS classes
}
```

**Example:**

```typescript
<WidgetShell
  id="MY_WIDGET"
  title="My Custom Widget"
  icon={<Star size={14} />}
  accentColor="text-amber-400"
  className="h-full"
>
  <MyWidgetContent />
</WidgetShell>
```

---

## 🔄 CROSS-TALK PROTOCOL

### Drag & Drop API

#### Source Widget (Sender)

```typescript
const handleDragStart = (e: React.DragEvent, data: any) => {
  e.dataTransfer.setData('text/plain', JSON.stringify(data));
  e.dataTransfer.effectAllowed = 'copy';
};

<div
  draggable
  onDragStart={(e) => handleDragStart(e, myData)}
>
  Draggable content
</div>
```

#### Target Widget (Receiver)

```typescript
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const rawData = e.dataTransfer.getData('text/plain');

  try {
    const data = JSON.parse(rawData);
    // Process structured data
    processData(data);
  } catch {
    // Handle plain text
    processText(rawData);
  }
};

<div
  onDrop={handleDrop}
  onDragOver={(e) => e.preventDefault()}
>
  Drop zone
</div>
```

---

## 📡 EVENTS

### Layout Change Events

Handled automatically by GridContainer, but you can listen:

```typescript
const handleLayoutChange = (newLayout: GridItemData[]) => {
  console.log('Layout changed:', newLayout);
  // Custom logic here
};
```

### Widget Lifecycle

Widgets mount/unmount based on `visibleWidgets` array.

**Initialization:**

```typescript
useEffect(() => {
  // Widget mounted
  console.log('Widget initialized');

  return () => {
    // Widget unmounted
    console.log('Widget destroyed');
  };
}, []);
```

---

## 🔒 STORAGE API

### localStorage Keys

```typescript
'omni-grid-storage'; // Main Zustand state
```

### Direct Access (Advanced)

```typescript
// Read
const rawData = localStorage.getItem('omni-grid-storage');
const state = rawData ? JSON.parse(rawData) : null;

// Write
const newState = useAppStore.getState();
localStorage.setItem('omni-grid-storage', JSON.stringify(newState));

// Clear
localStorage.removeItem('omni-grid-storage');
```

---

## 🧪 TESTING UTILITIES

### Mock Store for Tests

```typescript
import { create } from 'zustand';

const mockStore = create(() => ({
  visibleWidgets: ['SCRATCHPAD'],
  settings: { apiKey: 'test-key' },
  toggleWidget: vi.fn(),
  // ... other mocks
}));

// Use in tests
const { result } = renderHook(() => mockStore());
```

---

## 📚 FURTHER RESOURCES

- **[Widget Development](./widget-development.md)** - Build custom widgets
- **[Architecture](./architecture.md)** - System design
- **[State Management](./state-management.md)** - Zustand patterns

---

_APIs are contracts. Honor them._

**[← Back to Documentation Hub](./README.md)**
