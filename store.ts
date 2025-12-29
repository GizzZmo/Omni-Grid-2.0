
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GridItemData, WidgetType, AppTheme, GhostData } from './types';

interface AppState {
  layouts: { lg: GridItemData[] };
  visibleWidgets: string[];
  toggleWidget: (widgetId: string) => void;
  updateLayout: (layout: GridItemData[]) => void;
  setGlobalState: (state: Partial<AppState>) => void;
  resetAll: () => void;
  
  // Grid Intelligence
  ghostWidget: GhostData | null;
  setGhostWidget: (ghost: GhostData | null) => void;
  solidifyGhostWidget: () => void;
  
  // Layout Lock
  isLayoutLocked: boolean;
  toggleLayoutLock: () => void;
  
  // Layout Compaction (Autofit)
  isCompact: boolean;
  toggleCompact: () => void;

  // Command Palette
  isCmdPaletteOpen: boolean;
  setCmdPaletteOpen: (open: boolean) => void;
  
  // Settings
  settings: {
    scanlines: boolean;
    sound: boolean;
  };
  toggleSetting: (key: 'scanlines' | 'sound') => void;
  
  // Theme
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;

  // System State
  logs: string[];
  addLog: (msg: string) => void;
  
  // Scratchpad State
  scratchpadContent: string;
  setScratchpadContent: (content: string) => void;
  
  // Focus State
  tasks: Array<{ id: string; text: string; status: 'todo' | 'done' }>;
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setTasks: (tasks: Array<{ id: string; text: string; status: 'todo' | 'done' }>) => void;

  // Asset State
  tickers: string[];
  addTicker: (ticker: string) => void;
  removeTicker: (ticker: string) => void;
  setTickers: (tickers: string[]) => void;

  // WritePad State
  writePadContent: string;
  setWritePadContent: (content: string) => void;

  // Weather State
  weatherLocation: string;
  setWeatherLocation: (loc: string) => void;

  // -- New Widget States --
  
  // Git Pulse
  gitToken: string;
  setGitToken: (token: string) => void;

  // News Feed
  rssFeeds: string[];
  addRssFeed: (url: string) => void;
  removeRssFeed: (url: string) => void;

  // Secure Calendar
  calendarEvents: Array<{ date: string, title: string, encrypted: boolean }>;
  addCalendarEvent: (event: { date: string, title: string, encrypted: boolean }) => void;
  
  // Cipher Pad
  encryptedNotes: Record<string, string>; // ID -> Encrypted Content
  saveEncryptedNote: (id: string, content: string) => void;

  // Clipboard Stream
  clipboardHistory: string[];
  addToClipboardHistory: (text: string) => void;
  clearClipboardHistory: () => void;

  // CyberEditor
  cyberEditorTabs: Array<{ id: string; name: string; language: string; content: string }>;
  setCyberEditorTabs: (tabs: Array<{ id: string; name: string; language: string; content: string }>) => void;
  cyberEditorActiveTab: string;
  setCyberEditorActiveTab: (tabId: string) => void;
}

const DEFAULT_LAYOUT: GridItemData[] = [
  { i: 'SYSTEM', x: 0, y: 0, w: 4, h: 6 },
  { i: 'HELP', x: 4, y: 0, w: 4, h: 6 },
  { i: 'TRANSFORMER', x: 8, y: 0, w: 4, h: 8 },
  { i: 'SCRATCHPAD', x: 0, y: 6, w: 4, h: 8 },
  { i: 'FOCUS_HUD', x: 4, y: 6, w: 4, h: 6 },
  { i: 'DEV_OPTIC', x: 8, y: 8, w: 4, h: 6 },
  { i: 'CIPHER_VAULT', x: 0, y: 14, w: 4, h: 6 },
  { i: 'CHROMA_LAB', x: 4, y: 12, w: 4, h: 6 },
  { i: 'TEMPORAL', x: 8, y: 14, w: 4, h: 6 },
  { i: 'SONIC', x: 0, y: 20, w: 6, h: 8 },
  { i: 'CALC', x: 6, y: 20, w: 3, h: 8 },
  { i: 'ASSET', x: 9, y: 20, w: 3, h: 8 },
  { i: 'POLYGLOT', x: 0, y: 28, w: 6, h: 8 },
  { i: 'WRITEPAD', x: 6, y: 28, w: 6, h: 8 },
  { i: 'WEATHER', x: 0, y: 36, w: 4, h: 6 },
  { i: 'VALUTA', x: 4, y: 36, w: 4, h: 6 },
  { i: 'ARCHITECT', x: 0, y: 42, w: 6, h: 10 },
  { i: 'THEME_ENGINE', x: 6, y: 42, w: 6, h: 10 },
  { i: 'RADIO', x: 0, y: 52, w: 6, h: 8 },
  { i: 'SUDOKU', x: 6, y: 52, w: 6, h: 8 },
  // Developer
  { i: 'DOCU_HUB', x: 0, y: 60, w: 6, h: 8 },
  { i: 'GIT_PULSE', x: 6, y: 60, w: 6, h: 8 },
  { i: 'PROJECT_TRACKER', x: 0, y: 68, w: 8, h: 8 },
  { i: 'WEB_TERMINAL', x: 8, y: 68, w: 4, h: 8 },
  { i: 'CYBER_EDITOR', x: 0, y: 76, w: 12, h: 12 },
  // Researcher
  { i: 'NEWS_FEED', x: 0, y: 88, w: 4, h: 8 },
  { i: 'CIPHER_PAD', x: 4, y: 88, w: 4, h: 8 },
  { i: 'PDF_VIEWER', x: 8, y: 88, w: 4, h: 8 },
  { i: 'RESEARCH_BROWSER', x: 0, y: 96, w: 6, h: 8 },
  // Smart Grid
  { i: 'SECURE_CALENDAR', x: 6, y: 96, w: 6, h: 8 },
  { i: 'MACRO_NET', x: 0, y: 104, w: 4, h: 8 },
  { i: 'CHAIN_PULSE', x: 4, y: 104, w: 4, h: 8 },
  { i: 'REG_RADAR', x: 8, y: 104, w: 4, h: 8 },
  { i: 'MARKET', x: 0, y: 112, w: 4, h: 8 },
  // New
  { i: 'STRATEGIC', x: 6, y: 112, w: 6, h: 8 },
  { i: 'CLIPBOARD', x: 0, y: 120, w: 4, h: 8 },
];

const DEFAULT_THEME: AppTheme = {
  name: 'Midnight Cyberpunk',
  colors: {
    background: '#020617', // slate-950
    surface: '#0f172a', // slate-900
    primary: '#06b6d4', // cyan-500
    secondary: '#d946ef', // fuchsia-500
    text: '#e2e8f0', // slate-200
    accent: '#10b981', // emerald-500
  },
  font: 'Share Tech Mono',
  radius: '0.5rem',
};

// Helper to deep copy layout to avoid mutation issues
const getCleanLayout = () => JSON.parse(JSON.stringify(DEFAULT_LAYOUT));

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      layouts: { lg: getCleanLayout() },
      visibleWidgets: ['SYSTEM', 'HELP', 'SCRATCHPAD', 'TRANSFORMER', 'ASSET', 'STRATEGIC'],
      
      toggleWidget: (widgetId: string) =>
        set((state) => {
          const isVisible = state.visibleWidgets.includes(widgetId);
          const newVisibleWidgets = isVisible
            ? state.visibleWidgets.filter((id) => id !== widgetId)
            : [...state.visibleWidgets, widgetId];

          let currentLayouts = [...state.layouts.lg];
          if (!isVisible) {
            const exists = currentLayouts.find(item => item.i === widgetId);
            if (!exists) {
               const defaultItem = DEFAULT_LAYOUT.find(d => d.i === widgetId);
               currentLayouts.push(defaultItem ? { ...defaultItem } : { i: widgetId, x: 0, y: 0, w: 4, h: 6 });
            }
          }
          state.addLog(isVisible ? `Terminated widget: ${widgetId}` : `Initialized widget: ${widgetId}`);
          return {
            visibleWidgets: newVisibleWidgets,
            layouts: { lg: currentLayouts }
          };
        }),

      updateLayout: (newLayout: GridItemData[]) =>
        set((state) => {
          const newLayoutMap = new Map(newLayout.map(item => [item.i, item]));
          const mergedLayout = state.layouts.lg.map(existingItem => {
            const updatedItem = newLayoutMap.get(existingItem.i);
            return updatedItem || existingItem;
          });

          return {
            layouts: { lg: mergedLayout },
          };
        }),

      setGlobalState: (newState) => set((state) => ({ ...state, ...newState })),
      resetAll: () => set({ 
          layouts: { lg: getCleanLayout() }, 
          visibleWidgets: ['SYSTEM', 'HELP'],
          scratchpadContent: '',
          tasks: [],
          tickers: ['BTC', 'ETH', 'SOL', 'USDT', 'NOK'],
          writePadContent: '',
          weatherLocation: '',
          isLayoutLocked: false,
          isCompact: false,
          theme: DEFAULT_THEME,
          ghostWidget: null,
          gitToken: '',
          rssFeeds: ['https://news.ycombinator.com/rss'],
          calendarEvents: [],
          encryptedNotes: {},
          clipboardHistory: [],
          cyberEditorTabs: [{ id: '1', name: 'untitled.tsx', language: 'typescript', content: '// Start coding...\n' }],
          cyberEditorActiveTab: '1'
      }),

      // Grid Intelligence
      ghostWidget: null,
      setGhostWidget: (ghost) => set({ ghostWidget: ghost }),
      solidifyGhostWidget: () => {
          const { ghostWidget, toggleWidget } = get();
          if (ghostWidget) {
              toggleWidget(ghostWidget.suggestedWidgetId);
              set({ ghostWidget: null });
          }
      },

      // Layout Lock
      isLayoutLocked: false,
      toggleLayoutLock: () => set((state) => ({ isLayoutLocked: !state.isLayoutLocked })),

      // Layout Compaction
      isCompact: false,
      toggleCompact: () => set((state) => ({ isCompact: !state.isCompact })),

      // Command Palette
      isCmdPaletteOpen: false,
      setCmdPaletteOpen: (open) => set({ isCmdPaletteOpen: open }),

      // Settings
      settings: {
        scanlines: true,
        sound: true,
      },
      toggleSetting: (key) => set((state) => ({
        settings: { ...state.settings, [key]: !state.settings[key] }
      })),

      // Theme
      theme: DEFAULT_THEME,
      setTheme: (theme) => set({ theme }),

      // Logs
      logs: ['Omni-Grid System initialized...', 'User: Jon Constantine confirmed.', 'Secure connection established.'],
      addLog: (msg) => set(state => ({ logs: [ `[${new Date().toLocaleTimeString()}] ${msg}`, ...state.logs].slice(0, 50) })),

      // Scratchpad
      scratchpadContent: "# Neural Scratchpad\n\nHighlight text here and use the AI tools to refine, expand, or translate.",
      setScratchpadContent: (content: string) => set({ scratchpadContent: content }),

      // Focus
      tasks: [
        { id: '1', text: 'Define project scope', status: 'done' },
        { id: '2', text: 'Build widgets', status: 'todo' },
      ],
      addTask: (text: string) =>
        set((state) => ({
          tasks: [...state.tasks, { id: Date.now().toString(), text, status: 'todo' }],
        })),
      toggleTask: (id: string) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: t.status === 'todo' ? 'done' : 'todo' } : t
          ),
        })),
      deleteTask: (id: string) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      setTasks: (tasks) => set({ tasks }),

      // Asset
      tickers: ['BTC', 'ETH', 'SOL', 'USDT', 'NOK'],
      addTicker: (t) => set((state) => ({ tickers: [...state.tickers, t] })),
      removeTicker: (t) => set((state) => ({ tickers: state.tickers.filter(ticker => ticker !== t) })),
      setTickers: (tickers) => set({ tickers }),

      // WritePad
      writePadContent: '',
      setWritePadContent: (content) => set({ writePadContent: content }),

      // Weather
      weatherLocation: '',
      setWeatherLocation: (loc) => set({ weatherLocation: loc }),

      // -- New Widget States --
      
      gitToken: '',
      setGitToken: (token) => set({ gitToken: token }),

      rssFeeds: ['https://news.ycombinator.com/rss'],
      addRssFeed: (url) => set(state => ({ rssFeeds: [...state.rssFeeds, url] })),
      removeRssFeed: (url) => set(state => ({ rssFeeds: state.rssFeeds.filter(f => f !== url) })),

      calendarEvents: [],
      addCalendarEvent: (event) => set(state => ({ calendarEvents: [...state.calendarEvents, event] })),

      encryptedNotes: {},
      saveEncryptedNote: (id, content) => set(state => ({ encryptedNotes: { ...state.encryptedNotes, [id]: content } })),

      clipboardHistory: [],
      addToClipboardHistory: (text) => set(state => {
          const newHistory = [text, ...state.clipboardHistory.filter(t => t !== text)].slice(0, 20);
          return { clipboardHistory: newHistory };
      }),
      clearClipboardHistory: () => set({ clipboardHistory: [] }),

      cyberEditorTabs: [{ id: '1', name: 'untitled.tsx', language: 'typescript', content: '// Start coding...\n' }],
      setCyberEditorTabs: (tabs) => set({ cyberEditorTabs: tabs }),
      cyberEditorActiveTab: '1',
      setCyberEditorActiveTab: (tabId) => set({ cyberEditorActiveTab: tabId })
    }),
    {
      name: 'omni-grid-storage',
    }
  )
);
