# STATE MANAGEMENT // ZUSTAND PATTERNS

```text
[ DOCUMENTATION: STATE-MANAGEMENT.MD ]
[ MODE: TECHNICAL DEEP-DIVE ]
```

## 🧠 OVERVIEW

Omni-Grid uses **Zustand** for state management, a lightweight alternative to Redux. This guide explains the state architecture, patterns, and best practices.

---

## 📦 WHY ZUSTAND?

### Advantages Over Alternatives

**vs. Redux:**

- ✅ Less boilerplate (~5x less code)
- ✅ No provider wrapping needed
- ✅ Simpler learning curve
- ✅ Better TypeScript integration
- ✅ Built-in middleware support

**vs. Context API:**

- ✅ Better performance (no unnecessary re-renders)
- ✅ Selective subscriptions
- ✅ Easier debugging
- ✅ More scalable for large apps

**vs. MobX:**

- ✅ Simpler API
- ✅ More predictable
- ✅ Better React integration
- ✅ Smaller bundle size

---

## 🏗️ STORE ARCHITECTURE

### Complete Store Structure

```typescript
// store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  // Widget visibility — string[] to support dynamic/marketplace widgets
  visibleWidgets: string[];

  // Layout (lg breakpoint only)
  layouts: { lg: GridItemData[] };

  // System settings
  settings: {
    geminiApiKey: string;
    e2bApiKey: string;
    scanlines: boolean;
    sound: boolean;
    startupBehavior: 'restore' | 'default' | 'empty';
  };

  // Theme configuration
  theme: AppTheme;

  // UI state
  isLayoutLocked: boolean;
  isCompact: boolean;
  ghostWidget: GhostData | null;
  isCmdPaletteOpen: boolean;
  isSettingsPanelOpen: boolean;

  // Widget-specific data
  scratchpadContent: string;
  tasks: Task[];
  calculatorHistory: string[];
  // ... more widget data

  // Actions
  toggleWidget: (id: WidgetType) => void;
  updateLayout: (layout: GridItemData[], breakpoint?: string) => void;
  // ... more actions
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Initial state
      visibleWidgets: [],
      layouts: DEFAULT_LAYOUTS,
      // ... other initial values

      // Action implementations
      toggleWidget: id =>
        set(state => ({
          visibleWidgets: state.visibleWidgets.includes(id)
            ? state.visibleWidgets.filter(w => w !== id)
            : [...state.visibleWidgets, id],
        })),

      // ... other actions
    }),
    {
      name: 'omni-grid-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

---

## 🎯 USAGE PATTERNS

### Pattern 1: Selective Subscriptions

**❌ Bad: Subscribe to entire store**

```typescript
const MyWidget = () => {
  const state = useAppStore(); // Re-renders on ANY state change!
  return <div>{state.settings.geminiApiKey}</div>;
};
```

**✅ Good: Subscribe to specific properties**

```typescript
const MyWidget = () => {
  const geminiApiKey = useAppStore(s => s.settings.geminiApiKey);
  // Only re-renders when geminiApiKey changes
  return <div>{geminiApiKey}</div>;
};
```

**✅ Better: Multiple selective subscriptions**

```typescript
const MyWidget = () => {
  const geminiApiKey = useAppStore(s => s.settings.geminiApiKey);
  const scanlines = useAppStore(s => s.settings.scanlines);
  const theme = useAppStore(s => s.theme);
  // Re-renders only when these specific values change
  return <div>...</div>;
};
```

---

### Pattern 2: Action-Only Subscriptions

**For components that only call actions:**

```typescript
const ControlButton = () => {
  // No re-renders (actions don't change)
  const toggleWidget = useAppStore(s => s.toggleWidget);

  return (
    <button onClick={() => toggleWidget('SCRATCHPAD')}>
      Toggle
    </button>
  );
};
```

---

### Pattern 3: Imperative State Access

**For event handlers that don't need reactivity:**

```typescript
const handleBackup = () => {
  // Direct state access without subscription
  const currentState = useAppStore.getState();

  const backup = {
    version: 1,
    timestamp: new Date().toISOString(),
    state: currentState,
  };

  downloadJson('backup.json', backup);
};
```

---

### Pattern 4: Computed Values

**Derived state from store:**

```typescript
const MyWidget = () => {
  // Subscribe to base values
  const visibleWidgets = useAppStore(s => s.visibleWidgets);

  // Compute derived value
  const widgetCount = visibleWidgets.length;
  const hasWidgets = widgetCount > 0;

  return <div>Widgets: {widgetCount}</div>;
};
```

**With useMemo for expensive computations:**

```typescript
const MyWidget = () => {
  const layouts = useAppStore(s => s.layouts);

  const totalArea = useMemo(() => {
    return layouts.lg.reduce((sum, item) => sum + (item.w * item.h), 0);
  }, [layouts]);

  return <div>Total area: {totalArea}</div>;
};
```

---

## 🔄 ACTION PATTERNS

### Pattern 1: Simple State Updates

```typescript
// In store definition
setApiKey: (key: string) => set({ settings: { ...get().settings, apiKey: key } });
```

**Usage:**

```typescript
const setApiKey = useAppStore(s => s.setApiKey);
setApiKey('new-key');
```

---

### Pattern 2: Complex State Updates

```typescript
// In store definition
addTask: (text: string) =>
  set(state => ({
    tasks: [
      ...state.tasks,
      {
        id: crypto.randomUUID(),
        text,
        status: 'todo',
      },
    ],
  }));
```

---

### Pattern 3: Conditional Updates

```typescript
// In store definition
toggleWidget: (id: WidgetType) =>
  set(state => {
    const isVisible = state.visibleWidgets.includes(id);

    return {
      visibleWidgets: isVisible
        ? state.visibleWidgets.filter(w => w !== id)
        : [...state.visibleWidgets, id],
    };
  });
```

---

### Pattern 4: Async Actions

```typescript
// Outside store (in widget or service)
const fetchWeatherData = async () => {
  const setWeather = useAppStore.getState().setWeatherData;

  try {
    const data = await fetch('https://api.weather.com/...');
    const json = await data.json();
    setWeather(json);
  } catch (error) {
    console.error('Failed to fetch weather', error);
    setWeather(null);
  }
};
```

**Note:** Zustand doesn't handle async directly. Use standard async/await patterns.

---

## 💾 PERSISTENCE PATTERNS

### Understanding persist Middleware

```typescript
persist(
  (set, get) => ({
    /* state */
  }),
  {
    name: 'omni-grid-storage', // localStorage key
    storage: createJSONStorage(() => localStorage), // Storage adapter
    partialize: state => ({
      /* selective */
    }), // Optional: save subset
  }
);
```

---

### Pattern 1: Full State Persistence (Current)

```typescript
// Everything is saved
persist((set, get) => ({ ...allState }), { name: 'omni-grid-storage' });
```

---

### Pattern 2: Partial Persistence

**Save only specific properties:**

```typescript
persist((set, get) => ({ ...allState }), {
  name: 'omni-grid-storage',
  partialize: state => ({
    visibleWidgets: state.visibleWidgets,
    settings: state.settings,
    theme: state.theme,
    // Exclude UI state (locks, freezes, etc.)
  }),
});
```

---

### Pattern 3: Migration Strategy

**Handle version upgrades:**

```typescript
persist((set, get) => ({ ...allState }), {
  name: 'omni-grid-storage',
  version: 1,
  migrate: (persistedState: any, version: number) => {
    if (version === 0) {
      // Upgrade from v0 to v1
      persistedState.newField = 'default';
      delete persistedState.oldField;
    }
    return persistedState;
  },
});
```

---

## 🧪 TESTING PATTERNS

### Pattern 1: Mock Store for Unit Tests

```typescript
import { create } from 'zustand';

const createMockStore = (initialState = {}) => {
  return create(() => ({
    visibleWidgets: [],
    toggleWidget: vi.fn(),
    ...initialState,
  }));
};

describe('MyWidget', () => {
  it('should toggle widget', () => {
    const mockStore = createMockStore();
    const { result } = renderHook(() => mockStore());

    result.current.toggleWidget('SCRATCHPAD');
    expect(result.current.toggleWidget).toHaveBeenCalled();
  });
});
```

---

### Pattern 2: Integration Testing

```typescript
import { useAppStore } from './store';

describe('Store integration', () => {
  beforeEach(() => {
    // Reset store
    useAppStore.setState({
      visibleWidgets: [],
      tasks: [],
    });
  });

  it('should add task', () => {
    const addTask = useAppStore.getState().addTask;
    addTask('Test task');

    const tasks = useAppStore.getState().tasks;
    expect(tasks).toHaveLength(1);
    expect(tasks[0].text).toBe('Test task');
  });
});
```

---

## 🎨 ADVANCED PATTERNS

### Pattern 1: Store Slices

**Organize large stores into modules:**

```typescript
// slices/widgetSlice.ts
export const createWidgetSlice = (set, get) => ({
  visibleWidgets: [],
  toggleWidget: id =>
    set(state => ({
      visibleWidgets: state.visibleWidgets.includes(id)
        ? state.visibleWidgets.filter(w => w !== id)
        : [...state.visibleWidgets, id],
    })),
});

// slices/settingsSlice.ts
export const createSettingsSlice = (set, get) => ({
  settings: {
    apiKey: '',
    scanlines: false,
  },
  updateSettings: newSettings =>
    set(state => ({
      settings: { ...state.settings, ...newSettings },
    })),
});

// store.ts
export const useAppStore = create(
  persist(
    (...args) => ({
      ...createWidgetSlice(...args),
      ...createSettingsSlice(...args),
    }),
    { name: 'omni-grid-storage' }
  )
);
```

---

### Pattern 2: Middleware Stack

**Combine multiple middlewares:**

```typescript
import { devtools, persist } from 'zustand/middleware';

export const useAppStore = create(
  devtools(
    persist(
      (set, get) => ({
        /* state */
      }),
      { name: 'omni-grid-storage' }
    ),
    { name: 'Omni-Grid Store' }
  )
);
```

---

### Pattern 3: Subscriptions

**Listen to specific state changes:**

```typescript
// Subscribe to state changes outside React
const unsubscribe = useAppStore.subscribe(
  state => state.theme,
  (theme, prevTheme) => {
    console.log('Theme changed:', prevTheme, '→', theme);
    applyThemeToDOM(theme);
  }
);

// Cleanup
unsubscribe();
```

---

### Pattern 4: Transient Updates

**Updates that don't trigger re-renders:**

```typescript
// For frequently changing values (e.g., mouse position)
const useAppStore = create((set, get) => ({
  mouseX: 0,
  mouseY: 0,

  // Non-reactive update
  setMousePosition: (x, y) => {
    get().mouseX = x;
    get().mouseY = y;
  },
}));
```

---

## 🔍 DEBUGGING PATTERNS

### Pattern 1: DevTools Integration

```typescript
import { devtools } from 'zustand/middleware';

export const useAppStore = create(
  devtools(persist(/* ... */), {
    name: 'Omni-Grid',
    enabled: process.env.NODE_ENV === 'development',
  })
);
```

**Then use Redux DevTools extension to:**

- Inspect state
- Track actions
- Time-travel debugging

---

### Pattern 2: Logging Middleware

```typescript
const log = config => (set, get, api) =>
  config(
    (...args) => {
      console.log('Before:', get());
      set(...args);
      console.log('After:', get());
    },
    get,
    api
  );

export const useAppStore = create(log(persist(/* ... */)));
```

---

### Pattern 3: State Snapshots

```typescript
// Take snapshot
const snapshot = useAppStore.getState();
console.log('State snapshot:', snapshot);

// Compare states
const before = useAppStore.getState();
// ... actions
const after = useAppStore.getState();
console.log('Changes:', { before, after });
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### 1. Avoid Over-Subscribing

**❌ Bad:**

```typescript
const MyWidget = () => {
  const state = useAppStore(); // Re-renders on ANY change
  return <div>{state.someValue}</div>;
};
```

**✅ Good:**

```typescript
const MyWidget = () => {
  const someValue = useAppStore(s => s.someValue); // Only this value
  return <div>{someValue}</div>;
};
```

---

### 2. Memoize Selectors

**For complex selections:**

```typescript
import { shallow } from 'zustand/shallow';

const MyWidget = () => {
  const { apiKey, theme } = useAppStore(
    (s) => ({ apiKey: s.settings.apiKey, theme: s.theme }),
    shallow // Shallow comparison
  );

  return <div>...</div>;
};
```

---

### 3. Batch Updates

**Group related updates:**

```typescript
const resetState = () => {
  useAppStore.setState({
    visibleWidgets: [],
    tasks: [],
    scratchpadNotes: [],
    // Multiple updates in one batch
  });
};
```

---

## 📚 FURTHER READING

- **[Architecture](./architecture.md)** - Overall system design
- **[API Reference](./api-reference.md)** - Complete API
- **[Widget Development](./widget-development.md)** - Using state in widgets
- **Zustand Docs:** https://github.com/pmndrs/zustand

---

_State management is not just about storing data—it's about orchestrating change._

**[← Back to Documentation Hub](./README.md)**
