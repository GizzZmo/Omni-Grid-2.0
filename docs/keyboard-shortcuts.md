# KEYBOARD SHORTCUTS // COMMAND REFERENCE

```text
[ DOCUMENTATION: KEYBOARD-SHORTCUTS.MD ]
[ MODE: RAPID INPUT PROTOCOL ]
```

## ⌨️ OVERVIEW

Omni-Grid supports keyboard shortcuts for efficient navigation and control. This guide covers all available shortcuts and power-user tips.

---

## 🎯 GLOBAL SHORTCUTS

### System Controls

| Shortcut | Action | Context |
|----------|--------|---------|
| `Cmd + K` / `Ctrl + K` | Trigger AI operations | Neural widgets (Scratchpad, WritePad) |
| `Esc` | Close modal/overlay | Any modal, Command Palette, Launcher |
| `Cmd + S` / `Ctrl + S` | Save/Backup state | Anywhere (triggers backup download) |

---

## 🖱️ MOUSE & GESTURE CONTROLS

### Grid Manipulation

| Action | Result |
|--------|--------|
| **Drag** widget header | Move widget to new position |
| **Drag** bottom-right corner | Resize widget |
| **Click** X icon | Close/hide widget |
| **Double-click** widget header | Minimize/maximize (if implemented) |

### Cross-Talk Protocol

| Action | Result |
|--------|--------|
| **Drag** content from widget | Copy data to clipboard |
| **Drop** on target widget | Transfer data between widgets |

---

## 🧠 WIDGET-SPECIFIC SHORTCUTS

### Neural Scratchpad

| Shortcut | Action |
|----------|--------|
| `Cmd + K` / `Ctrl + K` | Open AI command menu |
| `Cmd + Enter` / `Ctrl + Enter` | Quick refine with AI |
| `Tab` | Navigate between notes |
| `Cmd + N` / `Ctrl + N` | Create new note |

### Focus HUD

| Shortcut | Action |
|----------|--------|
| `Space` | Start/pause timer |
| `Enter` | Add new task |
| `Cmd + D` / `Ctrl + D` | Mark task as done |
| `Delete` / `Backspace` | Delete selected task |

### Web Terminal

| Shortcut | Action |
|----------|--------|
| `Enter` | Execute command |
| `Arrow Up` | Previous command in history |
| `Arrow Down` | Next command in history |
| `Cmd + L` / `Ctrl + L` | Clear terminal |
| `Tab` | Auto-complete (if implemented) |

### Dev Optic

| Shortcut | Action |
|----------|--------|
| `Cmd + V` / `Ctrl + V` | Paste JWT or text |
| `Cmd + C` / `Ctrl + C` | Copy decoded result |
| `Tab` | Switch between JWT/Regex tabs |

### Universal Transformer

| Shortcut | Action |
|----------|--------|
| `Cmd + V` / `Ctrl + V` | Paste data for conversion |
| `Cmd + C` / `Ctrl + C` | Copy converted output |
| `Cmd + T` / `Ctrl + T` | Toggle format selector |

---

## 🎮 DOCK SHORTCUTS (NOT IMPLEMENTED YET)

### Future Shortcuts

**Planned for future releases:**

| Shortcut | Action |
|----------|--------|
| `Cmd + 1-9` / `Ctrl + 1-9` | Toggle dock widget 1-9 |
| `Cmd + 0` / `Ctrl + 0` | Open widget launcher |
| `Cmd + ,` / `Ctrl + ,` | Open settings |
| `Cmd + /` / `Ctrl + /` | Open help |
| `Cmd + P` / `Ctrl + P` | Command palette |

---

## 🔧 BROWSER SHORTCUTS

### Standard Browser Controls

These work in Omni-Grid because it's a web app:

| Shortcut | Action |
|----------|--------|
| `Cmd + R` / `Ctrl + R` / `F5` | Refresh page |
| `Cmd + Shift + R` / `Ctrl + Shift + F5` | Hard refresh (clear cache) |
| `Cmd + +` / `Ctrl + +` | Zoom in |
| `Cmd + -` / `Ctrl + -` | Zoom out |
| `Cmd + 0` / `Ctrl + 0` | Reset zoom |
| `F12` / `Cmd + Option + I` | Open DevTools |
| `Cmd + W` / `Ctrl + W` | Close tab |

---

## 🎨 TEXT EDITING SHORTCUTS

### Standard Text Operations

Within any input field or textarea:

| Shortcut | Action |
|----------|--------|
| `Cmd + A` / `Ctrl + A` | Select all |
| `Cmd + C` / `Ctrl + C` | Copy |
| `Cmd + X` / `Ctrl + X` | Cut |
| `Cmd + V` / `Ctrl + V` | Paste |
| `Cmd + Z` / `Ctrl + Z` | Undo |
| `Cmd + Shift + Z` / `Ctrl + Y` | Redo |
| `Cmd + B` / `Ctrl + B` | Bold (in rich editors) |
| `Cmd + I` / `Ctrl + I` | Italic (in rich editors) |

---

## 💡 POWER USER TIPS

### Browser Console Shortcuts

**Quick State Access:**
```javascript
// View current state
useAppStore.getState()

// Toggle widget
useAppStore.getState().toggleWidget('SCRATCHPAD')

// Update settings
useAppStore.getState().updateSettings({ scanlines: true })
```

**Keyboard Macro:**
```javascript
// Create custom keyboard shortcut
document.addEventListener('keydown', (e) => {
  if (e.metaKey && e.key === 'b') {
    e.preventDefault();
    // Trigger backup
    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      state: useAppStore.getState()
    };
    // Download logic here
  }
});
```

---

## 🚀 ACCESSIBILITY SHORTCUTS

### Screen Reader Support

| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate to next interactive element |
| `Shift + Tab` | Navigate to previous element |
| `Enter` / `Space` | Activate button/link |
| `Arrow keys` | Navigate within lists/menus |

**ARIA Labels:**
- All buttons have descriptive labels
- Grid items are properly labeled
- Keyboard navigation follows logical order

---

## 📝 CUSTOM SHORTCUTS (ADVANCED)

### Add Your Own Shortcuts

Create custom shortcuts by modifying `App.tsx`:

```typescript
// Add to App.tsx inside component
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Custom shortcut: Cmd+Shift+L to open launcher
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'l') {
      e.preventDefault();
      setShowLauncher(true);
    }
    
    // Custom shortcut: Cmd+Shift+F to freeze system
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
      e.preventDefault();
      setIsFrozen(!isFrozen);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Widget-Level Custom Shortcuts

Add to specific widgets:

```typescript
// In your widget component
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
      e.preventDefault();
      refreshData(); // Your custom function
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## 🎯 SHORTCUT CHEAT SHEET

### Quick Reference Card

**Print this section for desk reference:**

```
┌─────────────────────────────────────────────────┐
│         OMNI-GRID KEYBOARD SHORTCUTS            │
├─────────────────────────────────────────────────┤
│                                                 │
│  GLOBAL                                         │
│  • Cmd/Ctrl + K      →  AI Operations          │
│  • Esc               →  Close Modal            │
│  • Cmd/Ctrl + S      →  Backup State           │
│                                                 │
│  NAVIGATION                                     │
│  • Tab               →  Next Element           │
│  • Shift + Tab       →  Previous Element       │
│                                                 │
│  GRID                                           │
│  • Drag Header       →  Move Widget            │
│  • Drag Corner       →  Resize Widget          │
│  • Click X           →  Close Widget           │
│                                                 │
│  TERMINAL                                       │
│  • Enter             →  Execute                │
│  • Arrow Up/Down     →  History                │
│  • Cmd/Ctrl + L      →  Clear                  │
│                                                 │
│  FOCUS HUD                                      │
│  • Space             →  Start/Pause Timer      │
│  • Enter             →  Add Task               │
│  • Cmd/Ctrl + D      →  Mark Done              │
│                                                 │
│  DEVTOOLS                                       │
│  • F12               →  Open Inspector         │
│  • Cmd/Ctrl + R      →  Refresh                │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔮 FUTURE ENHANCEMENTS

### Planned Shortcuts

**Coming Soon:**
- Global search across all widgets (`Cmd/Ctrl + F`)
- Quick widget switcher (`Cmd/Ctrl + Tab`)
- Workspace presets (`Cmd/Ctrl + 1-9`)
- Command palette (`Cmd/Ctrl + P`)
- Undo/redo layout changes (`Cmd/Ctrl + Z/Y`)

**Under Consideration:**
- Vim-style navigation mode
- Emacs-style key bindings
- Custom shortcut manager UI
- Per-widget shortcut customization
- Import/export shortcut configs

---

## 🎓 LEARNING PATH

### Beginner Level
1. Learn basic navigation (Tab, Enter, Esc)
2. Master grid manipulation (drag, resize)
3. Use Cross-Talk drag & drop

### Intermediate Level
1. Memorize Cmd/Ctrl + K for AI
2. Use widget-specific shortcuts
3. Leverage browser console for quick actions

### Advanced Level
1. Create custom shortcuts
2. Use browser console macros
3. Automate workflows with scripts

---

## 📚 FURTHER READING

- **[Getting Started](./getting-started.md)** - Basic operations
- **[Configuration](./configuration.md)** - Customize shortcuts
- **[Widget Development](./widget-development.md)** - Add shortcuts to custom widgets

---

*Speed comes from muscle memory. Practice makes perfect.*

**[← Back to Documentation Hub](./README.md)**
