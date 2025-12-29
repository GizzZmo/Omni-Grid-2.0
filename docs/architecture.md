# ARCHITECTURE // SYSTEM BLUEPRINT

```text
[ DOCUMENTATION: ARCHITECTURE.MD ]
[ STATUS: TECHNICAL DEEP-DIVE ACTIVE ]
```

## 🏗️ OVERVIEW

Omni-Grid is a **local-first, modular Super App** built on React with a focus on privacy, extensibility, and high-density information display. The architecture follows a **hub-and-spoke model** where widgets are independent modules coordinated by a central state manager.

### Core Principles

1. **Local-First:** All data persists in browser localStorage. No cloud dependencies.
2. **Widget Isolation:** Each widget is self-contained with minimal coupling.
3. **Cross-Talk Protocol:** Widgets communicate via drag-and-drop events.
4. **AI Integration:** Direct client-to-API calls (no proxy server).
5. **Responsive Grid:** Dynamic layout with drag/resize capabilities.

---

## 📐 SYSTEM ARCHITECTURE

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Environment                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │              App.tsx (Root)                      │   │
│  │  - Global Controls                               │   │
│  │  - Dock                                          │   │
│  │  - Background Effects                            │   │
│  └───────────────┬─────────────────────────────────┘   │
│                  │                                       │
│  ┌───────────────▼─────────────────────────────────┐   │
│  │       GridContainer (Layout Engine)              │   │
│  │  - react-grid-layout wrapper                     │   │
│  │  - Widget instantiation                          │   │
│  │  - Drag & Drop handlers                          │   │
│  └───┬──────────────────────────────────────────┬──┘   │
│      │                                           │       │
│  ┌───▼─────────┐  ┌──────────────┐  ┌──────────▼───┐  │
│  │  Widget 1   │  │   Widget 2   │  │   Widget N   │  │
│  │ (WidgetShell│  │ (WidgetShell │  │ (WidgetShell │  │
│  │  + Content) │  │  + Content)  │  │  + Content)  │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
│         ▲                  ▲                  ▲         │
│         │                  │                  │         │
│  ┌──────┴──────────────────┴──────────────────┴─────┐  │
│  │           Zustand Store (store.ts)               │  │
│  │  - Global state                                  │  │
│  │  - Widget visibility                             │  │
│  │  - Layouts (responsive breakpoints)              │  │
│  │  - Settings, theme, content                      │  │
│  │  - localStorage sync                             │  │
│  └──────────────────────────────────────────────────┘  │
│         ▲                                               │
│         │                                               │
│  ┌──────┴───────────────────────────────────────────┐  │
│  │          Browser localStorage                     │  │
│  │  Key: "omni-grid-storage"                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 CORE COMPONENTS

### 1. App.tsx (Root Component)

**Responsibilities:**

- Render global header with controls
- Manage system-level state (freeze, lock, compact mode)
- Handle backup/restore operations
- Render dock with widget toggles
- Coordinate background effects (Matrix Rain, gradients)

**Key Features:**

- **Freeze System:** Suspends all interactions for safe backups
- **Auto-Organize:** Calls AI service to optimize layout
- **Theme Application:** Injects CSS variables dynamically

**State Subscriptions:**

```typescript
const visibleWidgets = useAppStore(s => s.visibleWidgets);
const settings = useAppStore(s => s.settings);
const theme = useAppStore(s => s.theme);
const layouts = useAppStore(s => s.layouts);
```

### 2. GridContainer.tsx (Layout Manager)

**Responsibilities:**

- Wrap `react-grid-layout` with responsive breakpoints
- Instantiate visible widgets based on `visibleWidgets` array
- Handle layout change events
- Implement drag-and-drop Cross-Talk protocol

**Grid Configuration:**

```typescript
breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
rowHeight={30}
compactType={isCompact ? 'vertical' : null}
```

**Widget Registry:**
All widgets are registered in `widgetComponents` object:

```typescript
const widgetComponents: Record<WidgetType, JSX.Element> = {
  SCRATCHPAD: <WidgetShell id="SCRATCHPAD" title="Neural Scratchpad" ...>
    <NeuralScratchpad />
  </WidgetShell>,
  // ... other widgets
};
```

### 3. WidgetShell.tsx (Widget Wrapper)

**Responsibilities:**

- Provide consistent header with icon, title, accent color
- Handle minimize/maximize states
- Provide close button
- Apply consistent styling

**Props Interface:**

```typescript
interface WidgetShellProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  children: React.ReactNode;
  className?: string;
}
```

### 4. store.ts (State Management)

**Technology:** Zustand with localStorage middleware

**State Structure:**

```typescript
interface AppState {
  // Visibility
  visibleWidgets: WidgetType[];

  // Layout (responsive)
  layouts: { lg: GridItemData[], md: ..., sm: ..., xs: ..., xxs: ... };

  // Widget-specific data
  scratchpadNotes: Note[];
  tasks: Task[];
  calculatorHistory: string[];

  // System settings
  settings: {
    apiKey: string;
    scanlines: boolean;
    matrixRain: boolean;
  };

  // Theme
  theme: AppTheme;

  // UI state
  isLayoutLocked: boolean;
  isCompact: boolean;
  ghostWidget: GhostData | null;

  // Actions
  toggleWidget: (id: WidgetType) => void;
  updateLayout: (newLayout: GridItemData[]) => void;
  setGlobalState: (state: AppState) => void;
  // ... other actions
}
```

**Persistence:**

```typescript
persist(
  (set, get) => ({
    /* state */
  }),
  {
    name: 'omni-grid-storage',
    storage: createJSONStorage(() => localStorage),
  }
);
```

---

## 🔄 DATA FLOW

### Typical User Interaction Flow

```
User Action (e.g., toggle widget)
    ↓
Dock Button onClick
    ↓
toggleWidget(widgetId) called
    ↓
Zustand updates visibleWidgets array
    ↓
GridContainer re-renders
    ↓
New widget appears in grid
    ↓
State persisted to localStorage
```

### Cross-Talk Protocol Flow

```
User drags data from Widget A
    ↓
onDragStart captures data
    ↓
User drops on Widget B
    ↓
onDrop in Widget B receives data
    ↓
Widget B processes/displays data
    ↓
No central state mutation (decoupled)
```

---

## 🧠 AI INTEGRATION ARCHITECTURE

### Neural Link (Gemini API)

**Service Layer:** `services/geminiService.ts`

**Flow:**

```
Widget (e.g., NeuralScratchpad)
    ↓
User clicks "Refine" button
    ↓
callGemini(prompt, content) invoked
    ↓
Direct HTTPS request to api.generativeai.google.com
    ↓
Response streamed back
    ↓
Widget updates with AI output
    ↓
Saved to localStorage via Zustand
```

**Privacy Model:**

- API key stored in localStorage (user-controlled)
- No intermediate server (direct client ↔ Google)
- No prompt logging by Omni-Grid (Google's privacy policy applies)

**Models Used:**

- `gemini-1.5-flash-latest` - Fast operations (summarize, translate)
- `gemini-1.5-pro-latest` - Complex operations (code generation, analysis)

---

## 🎨 STYLING ARCHITECTURE

### Technology Stack

- **TailwindCSS** - Utility-first CSS framework
- **CSS Variables** - Dynamic theming
- **Custom Classes** - Special effects (scanlines, scrollbars)

### Theme System

**Dynamic CSS Injection:**

```typescript
useEffect(() => {
  const root = document.documentElement;
  root.style.setProperty('--color-bg', theme.colors.background);
  root.style.setProperty('--color-primary', theme.colors.primary);
  // ... other properties
}, [theme]);
```

**Aesthetic Engine Integration:**

- User can generate themes via AI (text/image input)
- Presets available (Cyberpunk, Neon, Minimal, etc.)
- Custom color pickers for manual tweaking
- Themes persist in Zustand store

---

## 📦 BUILD & DEPLOYMENT

### Development Setup

```bash
npm run dev          # Vite dev server (port 5173)
npm run build        # Production build → dist/
npm run preview      # Preview production build
```

### Vite Configuration

**Key Settings:**

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### Production Build Output

```
dist/
├── index.html           # Entry point
├── assets/
│   ├── index.[hash].js  # Bundled JavaScript
│   ├── index.[hash].css # Bundled CSS
│   └── ...              # Fonts, images
```

**Deployment:**

- Static files only
- No server required
- Can be hosted on: GitHub Pages, Netlify, Vercel, S3, etc.
- HTTPS recommended (for API calls and localStorage security)

---

## 🔐 SECURITY ARCHITECTURE

### Data Privacy

1. **Local-First:** No data leaves the browser except AI API calls
2. **No Analytics:** No tracking, telemetry, or third-party scripts
3. **API Key Management:** User-controlled, stored in localStorage only
4. **No Cookies:** State management via localStorage only

### Content Security Policy (Recommended)

For production deployment:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
               connect-src 'self' https://generativelanguage.googleapis.com;
               style-src 'self' 'unsafe-inline';
               script-src 'self';"
/>
```

### localStorage Security

- Sensitive data (API keys) stored in plain text in localStorage
- Recommendation: Use a strong device/browser password
- Future enhancement: Add optional password protection layer

---

## 📊 PERFORMANCE CONSIDERATIONS

### Optimization Strategies

1. **Selective Re-renders:**

   ```typescript
   // Individual selectors to prevent unnecessary re-renders
   const visibleWidgets = useAppStore(s => s.visibleWidgets);
   // Instead of: const state = useAppStore();
   ```

2. **Lazy Loading:**
   - Widgets only render when visible
   - Heavy components (PDFViewer, ResearchBrowser) load on-demand

3. **Virtualization:**
   - Grid layout handles large numbers of widgets efficiently
   - Widgets outside viewport still consume memory (trade-off for instant visibility)

4. **localStorage Throttling:**
   - Zustand middleware batches updates
   - Prevents excessive writes on rapid state changes

### Browser Compatibility

**Minimum Requirements:**

- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- localStorage support (required)
- ES2020+ support
- CSS Grid and Flexbox

---

## 🧪 TESTING ARCHITECTURE

### Current State

- No formal test suite (minimal-change approach)
- Manual testing via development server
- Widget isolation makes unit testing feasible

### Future Testing Strategy

**Unit Tests:**

- Widget components (React Testing Library)
- Utility functions (Jest)
- Zustand store actions

**Integration Tests:**

- Widget communication (Cross-Talk)
- Layout persistence
- Backup/restore functionality

**E2E Tests:**

- Playwright or Cypress
- Critical user journeys

---

## 🔌 EXTENSIBILITY

### Adding New Widgets

See [Widget Development Guide](./widget-development.md) for details.

**Key Extension Points:**

1. `types.ts` - Add new `WidgetType`
2. `widgets/` - Create component
3. `GridContainer.tsx` - Register widget
4. `App.tsx` - Add dock item (optional)
5. `store.ts` - Add widget-specific state (optional)

### Custom Services

Create new files in `services/`:

```typescript
// services/myService.ts
export const myFunction = async (param: string) => {
  // Implementation
};
```

Import and use in widgets:

```typescript
import { myFunction } from '../services/myService';
```

### Styling Extensions

Add custom Tailwind classes in `index.css`:

```css
@layer utilities {
  .my-custom-class {
    /* styles */
  }
}
```

---

## 📈 SCALABILITY

### Widget Limits

**Practical Limits:**

- ~20-30 widgets per grid (browser performance)
- ~50-100 items in a single widget (e.g., task list)
- localStorage limit: ~5-10MB (browser-dependent)

**Optimization for Scale:**

- Implement virtual scrolling for large lists
- Paginate data-heavy widgets
- Consider IndexedDB for very large datasets

### Multi-User Considerations

Current architecture is **single-user, single-device**.

**For Multi-User:**

- Add backend API for state sync
- Implement authentication layer
- Replace localStorage with API calls
- Add conflict resolution for concurrent edits

---

## 🗺️ TECHNOLOGY ROADMAP

### Current Stack (v2.0)

- React 18.2.0
- Zustand 4.5.0
- react-grid-layout 1.4.4
- Vite 6.2.0
- TailwindCSS (via CDN in index.html)

### Future Considerations

- TypeScript strict mode enforcement
- Component library (shadcn/ui)
- Testing framework (Vitest + RTL)
- PWA capabilities (offline mode)
- Electron wrapper (desktop app)

---

## 📚 FURTHER READING

- **[State Management Guide](./state-management.md)** - Deep dive into Zustand patterns
- **[Widget Development](./widget-development.md)** - Build custom widgets
- **[API Reference](./api-reference.md)** - Complete API docs
- **[Configuration](./configuration.md)** - Advanced settings

---

_Architecture is not just about structure—it's about philosophy._

**[← Back to Documentation Hub](./README.md)**
