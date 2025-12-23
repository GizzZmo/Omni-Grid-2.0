# OMNI-GRID QUICK REFERENCE

```text
[ CHEAT SHEET // RAPID REFERENCE ]
```

## 🚀 ONE-MINUTE QUICKSTART

```bash
git clone https://github.com/GizzZmo/Omni-Grid-2.0.git
cd Omni-Grid-2.0
npm install
npm run dev
# Open http://localhost:5173
```

---

## ⌨️ KEYBOARD SHORTCUTS

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | AI operations |
| `Esc` | Close modal |
| `Tab` | Navigate |
| `Drag` | Move/resize widgets |

---

## 🎨 COMMON TASKS

### Add a Widget
1. Click **LAUNCHER** button (top-left)
2. Select widget from list
3. Widget appears in grid

### Move a Widget
- Drag the widget header

### Resize a Widget
- Drag bottom-right corner

### Lock Layout
- Click **UNLOCKED** button (top-right)

### Backup Data
- Click **Backup** button (top-right)
- Save JSON file

### Restore Data
- Click **Restore** button (top-right)
- Select backup JSON file

---

## 🤖 AI SETUP

1. Get API key: https://makersuite.google.com/app/apikey
2. Open **System Core** widget
3. Settings tab → Enter API key
4. Click Save

---

## 🎯 WIDGET CATEGORIES

**Neural Suite (AI):** Scratchpad, WritePad, Polyglot Box  
**Smart Grid (Finance):** Asset Command, Macro Net, Chain Pulse, Market  
**Developer:** Web Terminal, Dev Optic, Git Pulse, Docu Hub  
**Creative:** Aesthetic Engine, Sonic Architecture, Cipher Vault  
**Productivity:** Focus HUD, Temporal Nexus, Secure Calendar  
**Research:** News Feed, PDF Viewer, Research Browser  

---

## 🔧 TROUBLESHOOTING

**Blank screen?**
- Check browser console (F12)
- Clear cache and localStorage

**Widget not showing?**
- Toggle it via Launcher or Dock

**AI not working?**
- Verify API key in System Core → Settings

**Data not saving?**
- Check localStorage is enabled
- Not in incognito mode

**Performance issues?**
- Close unused widgets
- Disable scanlines/matrix rain

---

## 📦 PROJECT STRUCTURE

```
Omni-Grid-2.0/
├── App.tsx              # Root component
├── store.ts             # Zustand state
├── types.ts             # TypeScript types
├── components/          # Shared components
│   ├── GridContainer.tsx
│   ├── WidgetShell.tsx
│   └── ...
├── widgets/             # Widget components
│   ├── NeuralScratchpad.tsx
│   ├── FocusHUD.tsx
│   └── ...
├── services/            # API services
│   ├── geminiService.ts
│   └── gridIntelligence.ts
├── docs/                # Documentation
└── package.json
```

---

## 🛠️ COMMON COMMANDS

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 📚 DOCUMENTATION LINKS

- **Full Docs:** [DOCUMENTATION.md](./DOCUMENTATION.md)
- **Getting Started:** [docs/getting-started.md](./docs/getting-started.md)
- **Widget Development:** [docs/widget-development.md](./docs/widget-development.md)
- **FAQ:** [docs/faq.md](./docs/faq.md)
- **API Reference:** [docs/api-reference.md](./docs/api-reference.md)

---

## 🎓 LEARNING PATH

**Beginner:** Getting Started → FAQ → Keyboard Shortcuts  
**Developer:** Architecture → Widget Development → API Reference  
**Contributor:** CONTRIBUTING.md → Architecture → How-To Guide

---

## 🔗 QUICK LINKS

- **GitHub:** [GizzZmo/Omni-Grid-2.0](https://github.com/GizzZmo/Omni-Grid-2.0)
- **Issues:** [Report a bug](https://github.com/GizzZmo/Omni-Grid-2.0/issues)
- **License:** See LICENSE file

---

*Print this page for desk reference*

**[← Back to README](./README.md)** | **[Full Documentation →](./DOCUMENTATION.md)**
