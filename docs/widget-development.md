# WIDGET DEVELOPMENT // BUILD PROTOCOL

```text
[ DOCUMENTATION: WIDGET-DEVELOPMENT.MD ]
[ MODE: DEVELOPER GUIDE ]
```

## 🎯 OVERVIEW

This guide walks you through creating custom widgets for Omni-Grid. Widgets are self-contained React components that integrate into the grid layout and can optionally persist state.

**Time to create a basic widget:** ~15-30 minutes  
**Time to create a complex AI-powered widget:** ~2-4 hours

---

## 📋 PREREQUISITES

Before building widgets, you should:
- Understand React functional components and hooks
- Be familiar with TypeScript basics
- Have read the [Architecture Overview](./architecture.md)
- Know how to use TailwindCSS utilities

---

## 🛠️ WIDGET CREATION WORKFLOW

### Complete 5-Step Process

```
Step 1: Define Type
   ↓
Step 2: Create Component
   ↓
Step 3: Register in GridContainer
   ↓
Step 4: Add State (Optional)
   ↓
Step 5: Add to Dock (Optional)
```

Let's build an example widget: **Weather Station**

---

## STEP 1: DEFINE THE WIDGET TYPE

Open `types.ts` and add your widget to the `WidgetType` union:

```typescript
// types.ts
export type WidgetType = 
  // ... existing types
  | 'WEATHER_STATION'; // Add this line
```

**Naming Conventions:**
- Use SCREAMING_SNAKE_CASE
- Be descriptive but concise
- Avoid generic names (BAD: `TOOL`, GOOD: `REGEX_TESTER`)

---

## STEP 2: CREATE THE WIDGET COMPONENT

Create a new file: `widgets/WeatherStation.tsx`

### Basic Template

```typescript
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Cloud, Sun, CloudRain } from 'lucide-react';

export const WeatherStation: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // If you need persisted state:
  const apiKey = useAppStore(s => s.settings.weatherApiKey);

  useEffect(() => {
    // Initialization logic
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      // Your logic here
      const response = await fetch('https://api.weather.example/data');
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Weather fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 p-4 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sun size={16} className="text-amber-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Current Conditions
          </span>
        </div>
        <button 
          onClick={fetchWeather}
          disabled={loading}
          className="px-2 py-1 bg-cyan-900/30 border border-cyan-500/50 rounded text-[10px] text-cyan-400 hover:bg-cyan-900/50 transition-all"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        {loading ? (
          <div className="text-slate-500 text-sm">Loading weather data...</div>
        ) : weather ? (
          <div className="text-center">
            <div className="text-6xl font-bold text-cyan-400 mb-2">
              {weather.temperature}°C
            </div>
            <div className="text-sm text-slate-400">
              {weather.condition}
            </div>
          </div>
        ) : (
          <div className="text-slate-500 text-sm">No data available</div>
        )}
      </div>
    </div>
  );
};
```

### Design Guidelines

**Colors (follow existing aesthetic):**
- Background: `bg-slate-950` or `bg-slate-900`
- Text: `text-slate-200` (primary), `text-slate-400` (secondary), `text-slate-500` (tertiary)
- Borders: `border-slate-700` or `border-[color]-500/50`
- Accents: Choose from `cyan`, `fuchsia`, `emerald`, `amber`, `indigo`, `orange`

**Typography:**
- Headers: `text-xs` or `text-[10px]`, `font-bold`, `uppercase`, `tracking-wider`
- Body: `text-sm` or `text-xs`
- Data/Numbers: `text-lg` to `text-6xl`, `font-bold`

**Layout:**
- Use `flex` and `flex-col` for responsive stacking
- Add `overflow-y-auto custom-scrollbar` for scrollable content
- Use `p-4` for padding (consistent with other widgets)

**Icons:**
- Import from `lucide-react`
- Standard size: `size={14}` or `size={16}`
- Color with text color classes

---

## STEP 3: REGISTER IN GRID CONTAINER

Open `components/GridContainer.tsx`.

### Add Import

```typescript
// At the top with other widget imports
import { WeatherStation } from '../widgets/WeatherStation';
```

### Add to widgetComponents Object

```typescript
const widgetComponents: Record<WidgetType, JSX.Element> = {
  // ... existing widgets
  
  WEATHER_STATION: (
    <WidgetShell
      id="WEATHER_STATION"
      title="Weather Station"
      icon={<Cloud size={14} />}
      accentColor="text-blue-400"
      className="h-full"
    >
      <WeatherStation />
    </WidgetShell>
  ),
};
```

**Icon Selection:**
- Use icons from `lucide-react`
- Import at the top: `import { Cloud } from 'lucide-react';`
- Browse icons: https://lucide.dev/icons

**Accent Colors:**
- Choose a color that represents the widget's function
- Examples: `text-cyan-400`, `text-fuchsia-400`, `text-emerald-400`

---

## STEP 4: ADD STATE MANAGEMENT (OPTIONAL)

If your widget needs to persist data across sessions, modify `store.ts`.

### Add State Properties

```typescript
interface AppState {
  // ... existing properties
  
  // Weather widget state
  weatherLocation: string;
  weatherData: any | null;
  
  // Actions
  setWeatherLocation: (location: string) => void;
  setWeatherData: (data: any) => void;
}
```

### Add Default Values

```typescript
create(
  persist(
    (set, get) => ({
      // ... existing defaults
      
      weatherLocation: 'New York',
      weatherData: null,
      
      setWeatherLocation: (location) => set({ weatherLocation: location }),
      setWeatherData: (data) => set({ weatherData: data }),
    }),
    {
      name: 'omni-grid-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

### Add to Default Layout (Optional)

If you want the widget to appear by default for new users:

```typescript
const DEFAULT_LAYOUT: GridItemData[] = [
  // ... existing items
  { i: 'WEATHER_STATION', x: 8, y: 0, w: 4, h: 6 },
];
```

**Layout Coordinates:**
- `i`: Widget ID (must match WidgetType)
- `x`: Column position (0-11 for lg breakpoint)
- `y`: Row position (0-infinity)
- `w`: Width in columns (1-12)
- `h`: Height in rows (units of 30px)

### Use State in Widget

```typescript
export const WeatherStation: React.FC = () => {
  const weatherLocation = useAppStore(s => s.weatherLocation);
  const setWeatherLocation = useAppStore(s => s.setWeatherLocation);
  const weatherData = useAppStore(s => s.weatherData);
  const setWeatherData = useAppStore(s => s.setWeatherData);

  // Use these in your component logic
};
```

---

## STEP 5: ADD TO DOCK (OPTIONAL)

If you want a quick-access button in the dock, modify `App.tsx`.

### Add Icon Import

```typescript
// At the top
import { Cloud } from 'lucide-react';
```

### Add DockItem

```typescript
<DockItem 
  active={visibleWidgets.includes('WEATHER_STATION')} 
  onClick={() => toggleWidget('WEATHER_STATION')}
  icon={<Cloud size={18} />}
  label="Weather"
  color="bg-blue-500"
/>
```

**Dock Placement:**
- Group with similar widgets (use dividers `<div className="w-[1px] h-8 bg-white/10 mx-1"></div>`)
- Consider widget category (Dev, Finance, Utility, Creative)

---

## 🎨 ADVANCED FEATURES

### Cross-Talk Protocol (Drag & Drop)

Allow your widget to receive data from other widgets:

```typescript
export const WeatherStation: React.FC = () => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    
    try {
      const parsed = JSON.parse(data);
      if (parsed.location) {
        setWeatherLocation(parsed.location);
        fetchWeather(parsed.location);
      }
    } catch {
      // Handle plain text
      setWeatherLocation(data);
      fetchWeather(data);
    }
  };

  return (
    <div 
      className="h-full"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* content */}
    </div>
  );
};
```

### AI Integration

Use the Gemini service for AI-powered features:

```typescript
import { callGemini } from '../services/geminiService';

const generateWeatherInsights = async () => {
  const apiKey = useAppStore.getState().settings.apiKey;
  if (!apiKey) {
    alert('Please add your Gemini API key in System Settings');
    return;
  }

  const prompt = `Analyze this weather data and provide insights: ${JSON.stringify(weatherData)}`;
  
  try {
    const response = await callGemini(apiKey, prompt, 'flash');
    setInsights(response);
  } catch (error) {
    console.error('AI analysis failed:', error);
  }
};
```

### Tabs/Multi-View Layout

Implement tabbed interfaces for complex widgets:

```typescript
const [activeTab, setActiveTab] = useState<'current' | 'forecast' | 'settings'>('current');

return (
  <div className="h-full flex flex-col bg-slate-950">
    {/* Tab Bar */}
    <div className="flex border-b border-slate-800">
      <button
        onClick={() => setActiveTab('current')}
        className={`px-4 py-2 text-[10px] font-bold uppercase ${
          activeTab === 'current' 
            ? 'text-cyan-400 border-b-2 border-cyan-400' 
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        Current
      </button>
      <button
        onClick={() => setActiveTab('forecast')}
        className={`px-4 py-2 text-[10px] font-bold uppercase ${
          activeTab === 'forecast' 
            ? 'text-cyan-400 border-b-2 border-cyan-400' 
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        Forecast
      </button>
    </div>

    {/* Tab Content */}
    <div className="flex-1 overflow-y-auto p-4">
      {activeTab === 'current' && <CurrentWeather />}
      {activeTab === 'forecast' && <ForecastView />}
    </div>
  </div>
);
```

### Settings Panel

Add a settings section using similar tab pattern:

```typescript
const [showSettings, setShowSettings] = useState(false);

return (
  <div className="h-full flex flex-col">
    <div className="flex justify-between items-center p-4 border-b border-slate-800">
      <h3 className="text-xs font-bold">Weather Station</h3>
      <button 
        onClick={() => setShowSettings(!showSettings)}
        className="text-slate-400 hover:text-white"
      >
        <Settings size={14} />
      </button>
    </div>

    {showSettings ? (
      <SettingsPanel onClose={() => setShowSettings(false)} />
    ) : (
      <MainContent />
    )}
  </div>
);
```

### Loading States

Provide visual feedback during async operations:

```typescript
import { Loader2 } from 'lucide-react';

{loading ? (
  <div className="flex items-center justify-center h-full">
    <Loader2 size={24} className="animate-spin text-cyan-400" />
  </div>
) : (
  <Content />
)}
```

### Error Handling

Display user-friendly error messages:

```typescript
const [error, setError] = useState<string | null>(null);

{error && (
  <div className="bg-red-900/20 border border-red-500/50 rounded p-3 mb-4">
    <div className="flex items-center gap-2">
      <AlertCircle size={14} className="text-red-400" />
      <span className="text-xs text-red-400">{error}</span>
    </div>
    <button 
      onClick={() => setError(null)}
      className="text-[10px] text-red-500 underline mt-2"
    >
      Dismiss
    </button>
  </div>
)}
```

---

## 🧪 TESTING YOUR WIDGET

### Development Testing

1. **Launch dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:** http://localhost:5173

3. **Add widget:**
   - Click **[ LAUNCHER ]** button
   - Find your widget in the list
   - Click to add to grid

4. **Test interactions:**
   - Drag to reposition
   - Resize using bottom-right corner
   - Test all buttons and inputs
   - Verify state persistence (refresh page)

5. **Test responsive behavior:**
   - Resize browser window
   - Ensure widget adapts to different sizes

### Manual Test Checklist

- [ ] Widget renders without console errors
- [ ] All interactive elements work (buttons, inputs)
- [ ] Data persists after page refresh (if using store)
- [ ] Widget can be resized and repositioned
- [ ] Widget can be closed and reopened
- [ ] Cross-Talk works (if implemented)
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Styling matches Omni-Grid aesthetic
- [ ] Responsive behavior is smooth

---

## 📦 WIDGET EXAMPLES

### Minimal Widget (Display-Only)

```typescript
export const QuoteWidget: React.FC = () => {
  const quotes = [
    "The net is vast and infinite.",
    "Your grid, your rules.",
    "Local-first is freedom.",
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="h-full flex items-center justify-center bg-slate-950 p-4">
      <p className="text-lg text-fuchsia-400 text-center italic">
        "{randomQuote}"
      </p>
    </div>
  );
};
```

### Interactive Widget (With State)

```typescript
export const CounterWidget: React.FC = () => {
  const count = useAppStore(s => s.counterValue);
  const setCount = useAppStore(s => s.setCounterValue);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-950 gap-4">
      <div className="text-6xl font-bold text-cyan-400">{count}</div>
      <div className="flex gap-2">
        <button 
          onClick={() => setCount(count - 1)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-white"
        >
          -
        </button>
        <button 
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-cyan-900/30 border border-cyan-500/50 rounded text-cyan-400"
        >
          +
        </button>
      </div>
    </div>
  );
};
```

### Data Visualization Widget

```typescript
export const ChartWidget: React.FC = () => {
  const data = [65, 59, 80, 81, 56, 55, 40];

  return (
    <div className="h-full flex flex-col bg-slate-950 p-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">
        Weekly Activity
      </h3>
      <div className="flex-1 flex items-end justify-around gap-1">
        {data.map((value, i) => (
          <div 
            key={i}
            className="flex-1 bg-gradient-to-t from-cyan-500 to-fuchsia-500 rounded-t"
            style={{ height: `${value}%` }}
            title={`Day ${i + 1}: ${value}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 mt-2">
        <span>Mon</span>
        <span>Sun</span>
      </div>
    </div>
  );
};
```

---

## 🐛 COMMON ISSUES

### Widget Not Appearing

**Problem:** Added widget to types.ts but it doesn't show in grid.

**Solution:**
1. Verify you registered it in `GridContainer.tsx`
2. Check that `WidgetType` string matches exactly
3. Ensure widget is in `visibleWidgets` array (toggle it on via Launcher)

### State Not Persisting

**Problem:** Data resets on page refresh.

**Solution:**
1. Verify you added state to `store.ts` inside the `persist()` wrapper
2. Check browser console for localStorage errors
3. Ensure you're using `useAppStore` correctly

### Styling Looks Wrong

**Problem:** Colors/spacing don't match other widgets.

**Solution:**
1. Review existing widgets for style patterns
2. Use `bg-slate-950` for backgrounds
3. Use consistent padding (`p-4`)
4. Use small fonts (`text-xs`, `text-[10px]`)

### Widget Too Small

**Problem:** Content is cut off or cramped.

**Solution:**
1. Increase default height in `DEFAULT_LAYOUT` (increase `h` value)
2. Add `overflow-y-auto` for scrollable content
3. Set `minH` in widget config if needed

---

## 📚 FURTHER RESOURCES

- **[API Reference](./api-reference.md)** - Complete API docs
- **[State Management](./state-management.md)** - Zustand patterns
- **[Architecture](./architecture.md)** - System overview
- **Lucide Icons:** https://lucide.dev
- **TailwindCSS Docs:** https://tailwindcss.com/docs

---

## 🎓 NEXT STEPS

After creating your widget:

1. **Test thoroughly** using the checklist above
2. **Document it** - Add description to `WIKI.md` if significant
3. **Share it** - Create a pull request if contributing to the main repo
4. **Iterate** - Gather feedback and refine

---

*Build once. Grid forever.*

**[← Back to Documentation Hub](./README.md)**
