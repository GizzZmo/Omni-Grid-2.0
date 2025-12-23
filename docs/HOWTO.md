
# OMNI-GRID // OPERATOR MANUAL

## How to Add a New Widget

Extending the grid requires updating four specific sectors of the codebase. Follow this protocol to inject a new module.

### Step 1: Define the Type
Open `types.ts` and add a unique identifier to the `WidgetType` union.

```typescript
export type WidgetType = 
  // ... existing types
  | 'MY_NEW_WIDGET'; 
```

### Step 2: Initialize State (Optional)
If your widget needs to save data (like settings or content), open `store.ts`.

1.  Add properties to `AppState` interface.
2.  Add setters/actions.
3.  Add default values in `create()`.
4.  Add the widget to `DEFAULT_LAYOUT`.

```typescript
// store.ts
{ i: 'MY_NEW_WIDGET', x: 0, y: 0, w: 4, h: 6 },
```

### Step 3: Build the Component
Create `widgets/MyNewWidget.tsx`.

*   Use standard Tailwind classes.
*   Use `useAppStore` for state.
*   **Design Tip:** Use `bg-slate-900` for panels and `text-[10px]` for labels to match the aesthetic.

```tsx
import React from 'react';
export const MyNewWidget: React.FC = () => {
  return <div className="h-full bg-slate-950 p-4">Hello World</div>;
};
```

### Step 4: Register in Grid Container
Open `components/GridContainer.tsx`.

1.  Import your component.
2.  Add it to the `widgetComponents` object.
3.  Assign it an icon from `lucide-react` and an accent color.

```tsx
// GridContainer.tsx
MY_NEW_WIDGET: (
  <WidgetShell 
    id="MY_NEW_WIDGET" 
    title="My Widget" 
    icon={<Icon size={14}/>} 
    accentColor="text-lime-400" 
    className="h-full"
  >
    <MyNewWidget />
  </WidgetShell>
),
```

### Step 5: Add to Dock (Optional)
Open `App.tsx` and add a `DockItem` if you want it to be toggleable from the bottom menu.

## How to Reset the System
If the grid becomes corrupted or layouts overlap incorrectly:
1.  Open the **System Core** widget.
2.  Navigate to the **Settings** tab.
3.  Click **Factory Reset** (The Skull Icon).
