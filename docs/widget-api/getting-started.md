# 🚀 Getting Started: Build Your First Widget

## Prerequisites

- Node.js 18+
- Repository cloned and `npm install` run
- Basic React + TypeScript knowledge

## Step 1 — Create the Component

Create `widgets/MyWidget.tsx`:

```tsx
import React, { useState } from 'react';
import { Zap } from 'lucide-react';

export const MyWidget: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 bg-slate-950 p-4">
      <Zap size={32} className="text-cyan-400" />
      <span className="text-4xl font-mono text-white">{count}</span>
      <button
        onClick={() => setCount(c => c + 1)}
        className="px-4 py-2 bg-cyan-900/40 border border-cyan-500/50 rounded text-cyan-400 text-sm hover:bg-cyan-900/60 transition-colors"
      >
        Increment
      </button>
    </div>
  );
};
```

## Step 2 — Register the Widget Type

In `types.ts`, add your widget type to the `WidgetType` union:

```typescript
export type WidgetType =
  // ... existing types ...
  | 'MY_WIDGET';
```

## Step 3 — Add Default Layout Position

In `store.ts`, add a default grid position inside `DEFAULT_LAYOUT`:

```typescript
const DEFAULT_LAYOUT: GridItemData[] = [
  // ... existing items ...
  { i: 'MY_WIDGET', x: 0, y: 0, w: 4, h: 6 },
];
```

The grid uses a **12-column layout** with a **30px row height**.
Recommended minimum sizes: `minW: 3, minH: 4`.

## Step 4 — Add to GridContainer

In `components/GridContainer.tsx`:

```tsx
// 1. Import your component
import { MyWidget } from '../widgets/MyWidget';

// 2. Add to widgetComponents map (inside the useMemo)
MY_WIDGET: (
  <WidgetShell
    id="MY_WIDGET"
    title="My Widget"
    icon={<Zap size={14} />}
    accentColor="text-cyan-400"
    className="h-full"
  >
    <MyWidget />
  </WidgetShell>
),
```

## Step 5 — Register in Widget Launcher

In `components/WidgetLauncher.tsx`, add to `WIDGET_REGISTRY`:

```typescript
{
  id: 'MY_WIDGET',
  name: 'My Widget',
  icon: Zap,
  color: 'text-cyan-400',
  bg: 'bg-cyan-900/20',
  border: 'border-cyan-500/50',
},
```

## Step 6 — Test Your Widget

```bash
npm run dev
```

Open the Widget Launcher (`[ LAUNCHER ]` button) and find your widget. Click it to toggle it on the grid.

## Using the Zustand Store

For persistent state, extend the store in `store.ts`:

```typescript
// In AppState interface
myWidgetData: string[];
addMyWidgetData: (item: string) => void;

// In useAppStore implementation
myWidgetData: [],
addMyWidgetData: item =>
  set(state => ({ myWidgetData: [...state.myWidgetData, item] })),
```

Then use it in your widget:

```tsx
import { useAppStore } from '../store';

export const MyWidget: React.FC = () => {
  const data = useAppStore(s => s.myWidgetData);
  const addData = useAppStore(s => s.addMyWidgetData);
  // ...
};
```

## Using the Gemini AI API

```tsx
import { getGenAIClient } from '../services/geminiService';

const ai = getGenAIClient(); // returns null if no API key
if (ai) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Your prompt here',
  });
  console.log(response.text);
}
```

## WidgetShell Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique widget ID matching `WidgetType` |
| `title` | `string` | ✅ | Displayed in the widget header |
| `icon` | `ReactNode` | ✅ | Lucide icon for the header |
| `accentColor` | `string` | ✅ | Tailwind text color class |
| `className` | `string` | ✗ | Additional CSS classes |
| `onExport` | `() => void` | ✗ | Enables export button in header |
| `onImport` | `() => void` | ✗ | Enables import button in header |

## Styling Conventions

- Use `bg-slate-950` for widget background
- Use `bg-slate-900` for card/section backgrounds
- Use `border-slate-800` for internal borders
- Use `text-slate-400` for secondary text
- Use `text-cyan-400`, `text-fuchsia-400`, `text-emerald-400` for accents
- All custom scrollbars: add class `custom-scrollbar`
- Font: `font-mono` for technical content, `font-bold uppercase tracking-widest` for labels

## Example Widgets

- [Counter](./examples/counter.tsx) — Minimal stateful widget
- [Weather API](./examples/weather.tsx) — External API integration example
