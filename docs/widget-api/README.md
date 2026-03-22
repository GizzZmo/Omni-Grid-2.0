# 🧩 Widget API Documentation

```text
   ____  __  __ _   _ ___       ____ ____  ___ ____
  / __ \|  \/  | \ | |_ _|     / ___|  _ \|_ _|  _ \
 | |  | | |\/| |  \| || |_____| |  _| |_) || || | | |
 | |__| | |  | | |\  || |_____| |_| |  _ < | || |_| |
  \____/|_|  |_|_| \_|___|     \____|_| \_\___|____/

  [ WIDGET API - DEVELOPER REFERENCE ]
```

## Overview

Omni-Grid widgets are self-contained React components rendered inside a **WidgetShell** on a drag-and-drop bento grid. Any valid React component can become a widget.

## Contents

| Document | Description |
|---|---|
| [Getting Started](./getting-started.md) | Create your first widget in under 10 minutes |
| [API Reference](./api-reference.md) | Full TypeScript interfaces and store API |
| [Examples](./examples/) | Working widget examples |

## Quick Start

```tsx
// widgets/HelloWorld.tsx
import React from 'react';

export const HelloWorld: React.FC = () => (
  <div className="h-full flex items-center justify-center text-cyan-400">
    Hello, Omni-Grid!
  </div>
);
```

Then register it in 4 files:

1. **`types.ts`** — add `'HELLO_WORLD'` to `WidgetType`
2. **`store.ts`** — add `{ i: 'HELLO_WORLD', x: 0, y: 0, w: 4, h: 6 }` to `DEFAULT_LAYOUT`
3. **`components/GridContainer.tsx`** — import and add to `widgetComponents`
4. **`components/WidgetLauncher.tsx`** — add to `WIDGET_REGISTRY`

## Design Principles

- **Self-contained**: widgets own their own state
- **Cyberpunk aesthetic**: use existing Tailwind utility classes
- **Accessible**: include ARIA labels and keyboard navigation
- **Persistent**: use Zustand store for any state that should survive refresh
