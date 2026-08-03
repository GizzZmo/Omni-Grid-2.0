# Mobile & PWA Touch Guide

```text
[ DOCUMENTATION: MOBILE-PWA.MD ]
[ PHASE 4 — TOUCH-FIRST GRID ]
```

## Overview

Omni-Grid is a Progressive Web App with a **responsive, touch-optimized widget grid**.

### Responsive breakpoints (react-grid-layout)

| Breakpoint | Min width | Columns |
| ---------- | --------- | ------- |
| `lg`       | 1200px    | 12      |
| `md`       | 996px     | 10      |
| `sm`       | 768px     | 6       |
| `xs`       | 480px     | 4       |
| `xxs`      | 0         | 2       |

On viewports under **768px**:

- Vertical compact mode is forced (no horizontal overflow)
- Widget **resize** is disabled (finger precision); **drag** remains via the header handle
- Larger row height / tighter margins
- Header collapses into a menu; dock respects safe-area insets

### Touch targets

- Drag handle and primary buttons aim for **≥ 44×44 CSS px** (Apple HIG / WCAG 2.5.5)
- Resize handles expand under `(pointer: coarse)`
- `touch-action: manipulation` on `html` to reduce double-tap zoom lag
- `viewport-fit=cover` + `env(safe-area-inset-*)` for notched devices in standalone PWA mode

### Hooks

- `hooks/useMediaQuery.ts` — `useIsMobile`, `useIsTouch`, `useIsTabletOrSmaller`
- `hooks/useContainerWidth.ts` — ResizeObserver width for ResponsiveGridLayout

### Install / offline

See `services/pwaService.ts` and `public/sw.js`. Install prompt is deferred until the user chooses it from Settings / system UI.

---

**[← Back to Documentation Hub](./README.md)**
