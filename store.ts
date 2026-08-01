import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  GridItemData,
  AppTheme,
  GhostData,
  PromptTemplate,
  PromptVersion,
  StartupBehavior,
} from './types';
import { estimateTokens } from './services/promptEngine';
import { MARKETPLACE_CATALOG } from './widgets/marketplaceCatalog';
import {
  saveSecretsToVault,
  loadSecretsFromVault,
  clearSecretsVault,
  setVaultPassphrase as vaultSetPassphrase,
  unlockVault as vaultUnlock,
  lockVault as vaultLock,
  removeVaultPassphrase as vaultRemovePassphrase,
  getVaultStatus,
  hasVaultPassphrase,
  type VaultSecrets,
  type VaultStatus,
} from './services/secureVault';

// Keys are supplied only via Settings (user paste) — never baked into the client bundle.
const resolveEnvGeminiKey = () => '';

const resolveEnvE2BKey = () => {
  if (typeof window !== 'undefined' && (window as any).E2B_API_KEY) {
    return String((window as any).E2B_API_KEY);
  }
  return '';
};

const syncRuntimeKey = (key: 'API_KEY' | 'E2B_API_KEY' | 'GEMINI_API_KEY', value: string) => {
  if (typeof process !== 'undefined') {
    process.env = process.env || {};
    process.env[key] = value || '';
  }
  if (typeof window !== 'undefined') {
    (window as any).process = (window as any).process || { env: {} };
    (window as any).process.env = (window as any).process.env || {};
    (window as any).process.env[key] = value || '';
    if (key === 'E2B_API_KEY') {
      (window as any).E2B_API_KEY = value || '';
    }
  }
};

const clearRuntimeSecrets = () => {
  syncRuntimeKey('API_KEY', '');
  syncRuntimeKey('GEMINI_API_KEY', '');
  syncRuntimeKey('E2B_API_KEY', '');
};

const applySecretsToState = (merged: VaultSecrets) => {
  useAppStore.setState(s => ({
    settings: {
      ...s.settings,
      geminiApiKey: merged.geminiApiKey,
      e2bApiKey: merged.e2bApiKey,
    },
    gitToken: merged.gitToken,
  }));
  syncRuntimeKey('API_KEY', merged.geminiApiKey);
  syncRuntimeKey('GEMINI_API_KEY', merged.geminiApiKey);
  syncRuntimeKey('E2B_API_KEY', merged.e2bApiKey);
};

const wipeSecretsFromState = () => {
  useAppStore.setState(s => ({
    settings: { ...s.settings, geminiApiKey: '', e2bApiKey: '' },
    gitToken: '',
  }));
  clearRuntimeSecrets();
};

const persistSecrets = (state: {
  settings: { geminiApiKey: string; e2bApiKey: string };
  gitToken: string;
}) => {
  const secrets: VaultSecrets = {
    geminiApiKey: state.settings.geminiApiKey || '',
    e2bApiKey: state.settings.e2bApiKey || '',
    gitToken: state.gitToken || '',
  };
  void saveSecretsToVault(secrets);
};

const DEFAULT_SETTINGS = {
  scanlines: true,
  sound: true,
  geminiApiKey: resolveEnvGeminiKey(),
  e2bApiKey: resolveEnvE2BKey(),
  startupBehavior: 'restore' as StartupBehavior,
};
syncRuntimeKey('API_KEY', DEFAULT_SETTINGS.geminiApiKey);
syncRuntimeKey('GEMINI_API_KEY', DEFAULT_SETTINGS.geminiApiKey);
syncRuntimeKey('E2B_API_KEY', DEFAULT_SETTINGS.e2bApiKey);

interface AppState {
  layouts: { lg: GridItemData[] };
  visibleWidgets: string[];
  toggleWidget: (widgetId: string) => void;
  updateLayout: (layout: GridItemData[]) => void;
  setGlobalState: (state: Partial<AppState>) => void;
  resetAll: () => void;

  // Secure vault (session-only status; never trust persisted value)
  vaultStatus: VaultStatus;
  setVaultPassphrase: (passphrase: string) => Promise<{ ok: boolean; error?: string }>;
  unlockVault: (passphrase: string) => Promise<boolean>;
  lockVault: () => void;
  removeVaultPassphrase: (passphrase: string) => Promise<boolean>;

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

  // Settings Panel
  isSettingsPanelOpen: boolean;
  setSettingsPanelOpen: (open: boolean) => void;

  // Settings
  settings: {
    scanlines: boolean;
    sound: boolean;
    geminiApiKey: string;
    e2bApiKey: string;
    startupBehavior: StartupBehavior;
  };
  toggleSetting: (key: 'scanlines' | 'sound') => void;
  setGeminiApiKey: (key: string) => void;
  setE2bApiKey: (key: string) => void;
  setStartupBehavior: (behavior: StartupBehavior) => void;

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

  // Git Pulse
  gitToken: string;
  setGitToken: (token: string) => void;

  // News Feed
  rssFeeds: string[];
  addRssFeed: (url: string) => void;
  removeRssFeed: (url: string) => void;

  // Secure Calendar
  calendarEvents: Array<{ date: string; title: string; encrypted: boolean }>;
  addCalendarEvent: (event: { date: string; title: string; encrypted: boolean }) => void;

  // Cipher Pad
  encryptedNotes: Record<string, string>;
  saveEncryptedNote: (id: string, content: string) => void;

  // Clipboard Stream
  clipboardHistory: string[];
  addToClipboardHistory: (text: string) => void;
  clearClipboardHistory: () => void;

  // CyberEditor
  cyberEditorTabs: Array<{ id: string; name: string; language: string; content: string }>;
  setCyberEditorTabs: (
    tabs: Array<{ id: string; name: string; language: string; content: string }>
  ) => void;
  cyberEditorActiveTab: string;
  setCyberEditorActiveTab: (tabId: string) => void;

  // Prompt Lab
  promptLibrary: PromptTemplate[];
  activePromptId: string | null;
  setActivePrompt: (id: string) => void;
  updatePromptContent: (id: string, content: string) => void;
  savePromptVersion: (id: string, note?: string) => void;
  restorePromptVersion: (id: string, versionId: string) => void;
  updatePromptVariables: (id: string, variables: Record<string, string>) => void;
  tagPrompt: (id: string, tags: string[]) => void;
  addPrompt: (template: PromptTemplate) => void;

  // Marketplace
  installedWidgets: Record<string, string>;
  availableUpdates: string[];
  marketplaceLastChecked: number;
  installWidget: (id: string) => void;
  uninstallWidget: (id: string) => void;
  checkForUpdates: () => void;
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
  { i: 'DOCU_HUB', x: 0, y: 60, w: 6, h: 8 },
  { i: 'GIT_PULSE', x: 6, y: 60, w: 6, h: 8 },
  { i: 'PROJECT_TRACKER', x: 0, y: 68, w: 8, h: 8 },
  { i: 'WEB_TERMINAL', x: 8, y: 68, w: 4, h: 8 },
  { i: 'CYBER_EDITOR', x: 0, y: 76, w: 12, h: 12 },
  { i: 'NEWS_FEED', x: 0, y: 88, w: 4, h: 8 },
  { i: 'CIPHER_PAD', x: 4, y: 88, w: 4, h: 8 },
  { i: 'PDF_VIEWER', x: 8, y: 88, w: 4, h: 8 },
  { i: 'RESEARCH_BROWSER', x: 0, y: 96, w: 6, h: 8 },
  { i: 'SECURE_CALENDAR', x: 6, y: 96, w: 6, h: 8 },
  { i: 'MACRO_NET', x: 0, y: 104, w: 4, h: 8 },
  { i: 'CHAIN_PULSE', x: 4, y: 104, w: 4, h: 8 },
  { i: 'REG_RADAR', x: 8, y: 104, w: 4, h: 8 },
  { i: 'MARKET', x: 0, y: 112, w: 4, h: 8 },
  { i: 'STRATEGIC', x: 6, y: 112, w: 6, h: 8 },
  { i: 'CLIPBOARD', x: 0, y: 120, w: 4, h: 8 },
  { i: 'PROMPT_LAB', x: 4, y: 120, w: 8, h: 12 },
  { i: 'NEURAL_CHAT', x: 0, y: 132, w: 6, h: 12 },
  { i: 'SUNO_PLAYER', x: 6, y: 132, w: 6, h: 12 },
  { i: 'MARKETPLACE', x: 0, y: 144, w: 12, h: 16 },
  { i: 'MULTI_AGENT_HUB', x: 0, y: 160, w: 8, h: 14 },
  { i: 'BROWSER_WIDGET', x: 8, y: 160, w: 4, h: 14 },
  { i: 'COMMUNITY_PORTAL', x: 0, y: 174, w: 12, h: 16 },
];

const DEFAULT_THEME: AppTheme = {
  name: 'Midnight Cyberpunk',
  colors: {
    background: '#020617',
    surface: '#0f172a',
    primary: '#06b6d4',
    secondary: '#d946ef',
    text: '#e2e8f0',
    accent: '#10b981',
  },
  font: 'Share Tech Mono',
  radius: '0.5rem',
};

const getCleanLayout = () => JSON.parse(JSON.stringify(DEFAULT_LAYOUT));

const buildVersion = (content: string, note?: string): PromptVersion => ({
  id: crypto.randomUUID(),
  content,
  createdAt: new Date().toISOString(),
  note,
  tokens: estimateTokens(content),
});

const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: 'prompt-bug',
    name: 'Concise Bug Report',
    tags: ['coding', 'diagnostics'],
    content:
      'You are a senior engineer. Summarize the defect, steps to reproduce, expected vs actual, logs, and risk. Use bullet points and keep under 120 words.',
    variables: {},
    versions: [buildVersion('Concise bug report template v1')],
  },
  {
    id: 'prompt-story',
    name: 'Narrative Storyboard',
    tags: ['creative', 'writing'],
    content:
      'Draft a storyboard for {{customer_name}} with 5 beats: hook, conflict, mentor, transformation, and closing CTA. Tone: optimistic cyberpunk. Max 8 sentences.',
    variables: { customer_name: 'Omni Grid Explorer' },
    versions: [buildVersion('Storyboard template baseline')],
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      layouts: { lg: getCleanLayout() },
      visibleWidgets: [
        'SYSTEM',
        'HELP',
        'SCRATCHPAD',
        'TRANSFORMER',
        'ASSET',
        'STRATEGIC',
        'PROMPT_LAB',
      ],

      vaultStatus: (typeof window !== 'undefined' ? getVaultStatus() : 'unprotected') as VaultStatus,

      setVaultPassphrase: async (passphrase: string) => {
        try {
          await vaultSetPassphrase(passphrase);
          set({ vaultStatus: 'unlocked' });
          get().addLog('Vault passphrase enabled — secrets protected');
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : 'Failed to set passphrase' };
        }
      },

      unlockVault: async (passphrase: string) => {
        const ok = await vaultUnlock(passphrase);
        if (!ok) {
          set({ vaultStatus: 'locked' });
          return false;
        }
        const secrets = await loadSecretsFromVault();
        applySecretsToState(secrets);
        set({ vaultStatus: 'unlocked' });
        get().addLog('Vault unlocked');
        return true;
      },

      lockVault: () => {
        vaultLock();
        wipeSecretsFromState();
        set({ vaultStatus: hasVaultPassphrase() ? 'locked' : 'unprotected' });
        get().addLog('Vault locked — secrets cleared from memory');
      },

      removeVaultPassphrase: async (passphrase: string) => {
        const ok = await vaultRemovePassphrase(passphrase);
        if (!ok) return false;
        const secrets = await loadSecretsFromVault();
        applySecretsToState(secrets);
        set({ vaultStatus: 'unprotected' });
        get().addLog('Vault passphrase removed — auto-unlock enabled');
        return true;
      },

      toggleWidget: (widgetId: string) =>
        set(state => {
          const isVisible = state.visibleWidgets.includes(widgetId);
          const newVisibleWidgets = isVisible
            ? state.visibleWidgets.filter(id => id !== widgetId)
            : [...state.visibleWidgets, widgetId];

          let currentLayouts = [...state.layouts.lg];
          if (!isVisible) {
            const exists = currentLayouts.find(item => item.i === widgetId);
            if (!exists) {
              const defaultItem = DEFAULT_LAYOUT.find(d => d.i === widgetId);
              currentLayouts.push(
                defaultItem ? { ...defaultItem } : { i: widgetId, x: 0, y: 0, w: 4, h: 6 }
              );
            }
          }
          state.addLog(
            isVisible ? `Terminated widget: ${widgetId}` : `Initialized widget: ${widgetId}`
          );
          return {
            visibleWidgets: newVisibleWidgets,
            layouts: { lg: currentLayouts },
          };
        }),

      updateLayout: (newLayout: GridItemData[]) =>
        set(state => {
          const newLayoutMap = new Map(newLayout.map(item => [item.i, item]));
          const mergedLayout = state.layouts.lg.map(existingItem => {
            const updatedItem = newLayoutMap.get(existingItem.i);
            return updatedItem || existingItem;
          });
          return { layouts: { lg: mergedLayout } };
        }),

      setGlobalState: newState => {
        set(state => ({ ...state, ...newState }));
        persistSecrets(get());
      },

      resetAll: () =>
        set(() => {
          clearRuntimeSecrets();
          clearSecretsVault();
          return {
            layouts: { lg: getCleanLayout() },
            visibleWidgets: ['SYSTEM', 'HELP'],
            vaultStatus: 'unprotected' as VaultStatus,
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
            settings: { ...DEFAULT_SETTINGS },
            cyberEditorTabs: [
              {
                id: '1',
                name: 'untitled.tsx',
                language: 'typescript',
                content: '// Start coding...\n',
              },
            ],
            cyberEditorActiveTab: '1',
            promptLibrary: DEFAULT_PROMPTS,
            activePromptId: DEFAULT_PROMPTS[0]?.id ?? null,
            installedWidgets: (() => {
              const pre: Record<string, string> = {};
              MARKETPLACE_CATALOG.filter(e => e.isCore).forEach(e => {
                pre[e.id] = e.version;
              });
              return pre;
            })(),
            availableUpdates: [],
            marketplaceLastChecked: 0,
          };
        }),

      ghostWidget: null,
      setGhostWidget: ghost => set({ ghostWidget: ghost }),
      solidifyGhostWidget: () => {
        const { ghostWidget, toggleWidget } = get();
        if (ghostWidget) {
          toggleWidget(ghostWidget.suggestedWidgetId);
          set({ ghostWidget: null });
        }
      },

      isLayoutLocked: false,
      toggleLayoutLock: () => set(state => ({ isLayoutLocked: !state.isLayoutLocked })),

      isCompact: false,
      toggleCompact: () => set(state => ({ isCompact: !state.isCompact })),

      isCmdPaletteOpen: false,
      setCmdPaletteOpen: open => set({ isCmdPaletteOpen: open }),

      isSettingsPanelOpen: false,
      setSettingsPanelOpen: open => set({ isSettingsPanelOpen: open }),

      settings: { ...DEFAULT_SETTINGS },
      toggleSetting: key =>
        set(state => ({
          settings: { ...state.settings, [key]: !state.settings[key] },
        })),
      setGeminiApiKey: key => {
        if (get().vaultStatus === 'locked') return;
        syncRuntimeKey('API_KEY', key);
        syncRuntimeKey('GEMINI_API_KEY', key);
        set(state => ({
          settings: { ...state.settings, geminiApiKey: key },
        }));
        persistSecrets(get());
      },
      setE2bApiKey: key => {
        if (get().vaultStatus === 'locked') return;
        syncRuntimeKey('E2B_API_KEY', key);
        set(state => ({
          settings: { ...state.settings, e2bApiKey: key },
        }));
        persistSecrets(get());
      },
      setStartupBehavior: behavior => {
        set(state => ({
          settings: { ...state.settings, startupBehavior: behavior },
        }));
      },

      theme: DEFAULT_THEME,
      setTheme: theme => set({ theme }),

      logs: [
        'Omni-Grid System initialized...',
        'User: Jon Constantine confirmed.',
        'Secure connection established.',
      ],
      addLog: msg =>
        set(state => ({
          logs: [`[${new Date().toLocaleTimeString()}] ${msg}`, ...state.logs].slice(0, 50),
        })),

      scratchpadContent:
        '# Neural Scratchpad\n\nHighlight text here and use the AI tools to refine, expand, or translate.',
      setScratchpadContent: (content: string) => set({ scratchpadContent: content }),

      tasks: [
        { id: '1', text: 'Define project scope', status: 'done' },
        { id: '2', text: 'Build widgets', status: 'todo' },
      ],
      addTask: (text: string) =>
        set(state => ({
          tasks: [...state.tasks, { id: Date.now().toString(), text, status: 'todo' }],
        })),
      toggleTask: (id: string) =>
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id ? { ...t, status: t.status === 'todo' ? 'done' : 'todo' } : t
          ),
        })),
      deleteTask: (id: string) =>
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== id),
        })),
      setTasks: tasks => set({ tasks }),

      tickers: ['BTC', 'ETH', 'SOL', 'USDT', 'NOK'],
      addTicker: t => set(state => ({ tickers: [...state.tickers, t] })),
      removeTicker: t => set(state => ({ tickers: state.tickers.filter(ticker => ticker !== t) })),
      setTickers: tickers => set({ tickers }),

      writePadContent: '',
      setWritePadContent: content => set({ writePadContent: content }),

      weatherLocation: '',
      setWeatherLocation: loc => set({ weatherLocation: loc }),

      gitToken: '',
      setGitToken: token => {
        if (get().vaultStatus === 'locked') return;
        set({ gitToken: token });
        persistSecrets(get());
      },

      rssFeeds: ['https://news.ycombinator.com/rss'],
      addRssFeed: url => set(state => ({ rssFeeds: [...state.rssFeeds, url] })),
      removeRssFeed: url => set(state => ({ rssFeeds: state.rssFeeds.filter(f => f !== url) })),

      calendarEvents: [],
      addCalendarEvent: event =>
        set(state => ({ calendarEvents: [...state.calendarEvents, event] })),

      encryptedNotes: {},
      saveEncryptedNote: (id, content) =>
        set(state => ({ encryptedNotes: { ...state.encryptedNotes, [id]: content } })),

      clipboardHistory: [],
      addToClipboardHistory: text =>
        set(state => {
          const newHistory = [text, ...state.clipboardHistory.filter(t => t !== text)].slice(0, 20);
          return { clipboardHistory: newHistory };
        }),
      clearClipboardHistory: () => set({ clipboardHistory: [] }),

      cyberEditorTabs: [
        { id: '1', name: 'untitled.tsx', language: 'typescript', content: '// Start coding...\n' },
      ],
      setCyberEditorTabs: tabs => set({ cyberEditorTabs: tabs }),
      cyberEditorActiveTab: '1',
      setCyberEditorActiveTab: tabId => set({ cyberEditorActiveTab: tabId }),

      promptLibrary: DEFAULT_PROMPTS,
      activePromptId: DEFAULT_PROMPTS[0]?.id ?? null,
      setActivePrompt: id => set({ activePromptId: id }),
      updatePromptContent: (id, content) =>
        set(state => ({
          promptLibrary: state.promptLibrary.map(p => (p.id === id ? { ...p, content } : p)),
        })),
      savePromptVersion: (id, note) =>
        set(state => ({
          promptLibrary: state.promptLibrary.map(p =>
            p.id === id ? { ...p, versions: [buildVersion(p.content, note), ...p.versions] } : p
          ),
        })),
      restorePromptVersion: (id, versionId) =>
        set(state => {
          const template = state.promptLibrary.find(p => p.id === id);
          const version = template?.versions.find(v => v.id === versionId);
          if (!template || !version) return {};
          return {
            promptLibrary: state.promptLibrary.map(p =>
              p.id === id ? { ...p, content: version.content } : p
            ),
          };
        }),
      updatePromptVariables: (id, variables) =>
        set(state => ({
          promptLibrary: state.promptLibrary.map(p => (p.id === id ? { ...p, variables } : p)),
        })),
      tagPrompt: (id, tags) =>
        set(state => ({
          promptLibrary: state.promptLibrary.map(p => (p.id === id ? { ...p, tags } : p)),
        })),
      addPrompt: template =>
        set(state => ({
          promptLibrary: [template, ...state.promptLibrary],
          activePromptId: template.id,
        })),

      installedWidgets: (() => {
        const preInstalled: Record<string, string> = {};
        MARKETPLACE_CATALOG.filter(e => e.isCore).forEach(e => {
          preInstalled[e.id] = e.version;
        });
        return preInstalled;
      })(),
      availableUpdates: [],
      marketplaceLastChecked: 0,

      installWidget: (id: string) =>
        set(state => {
          const entry = MARKETPLACE_CATALOG.find(e => e.id === id);
          if (!entry) return {};
          state.addLog(`Installed widget: ${entry.name} v${entry.version}`);
          return {
            installedWidgets: { ...state.installedWidgets, [id]: entry.version },
            availableUpdates: state.availableUpdates.filter(uid => uid !== id),
          };
        }),

      uninstallWidget: (id: string) =>
        set(state => {
          const entry = MARKETPLACE_CATALOG.find(e => e.id === id);
          const { [id]: _removed, ...rest } = state.installedWidgets;
          if (entry) state.addLog(`Uninstalled widget: ${entry.name}`);
          const newVisible = state.visibleWidgets.filter(wid => wid !== id);
          return {
            installedWidgets: rest,
            visibleWidgets: newVisible,
          };
        }),

      checkForUpdates: () =>
        set(state => {
          const updates = MARKETPLACE_CATALOG.filter(entry => {
            const installed = state.installedWidgets[entry.id];
            if (!installed) return false;
            const toTuple = (v: string) => v.split('.').map(Number);
            const [im, ip, ip2] = toTuple(installed);
            const [cm, cp, cp2] = toTuple(entry.version);
            if (cm !== im) return cm > im;
            if (cp !== ip) return cp > ip;
            return cp2 > ip2;
          }).map(e => e.id);
          return {
            availableUpdates: updates,
            marketplaceLastChecked: Date.now(),
          };
        }),
    }),
    {
      name: 'omni-grid-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => {
        const { geminiApiKey: _g, e2bApiKey: _e, ...safeSettings } = state.settings;
        const { gitToken: _t, vaultStatus: _v, ...rest } = state;
        return {
          ...rest,
          settings: safeSettings,
        };
      },
      onRehydrateStorage: () => _state => {
        void (async () => {
          const status = getVaultStatus();
          useAppStore.setState({ vaultStatus: status });

          // Passphrase-protected vault starts locked until user unlocks
          if (status === 'locked') {
            wipeSecretsFromState();
            return;
          }

          const secrets = await loadSecretsFromVault();
          const legacyGemini =
            (_state?.settings as { geminiApiKey?: string } | undefined)?.geminiApiKey || '';
          const legacyE2b =
            (_state?.settings as { e2bApiKey?: string } | undefined)?.e2bApiKey || '';
          const legacyGit = (_state as { gitToken?: string } | undefined)?.gitToken || '';

          const merged: VaultSecrets = {
            geminiApiKey: secrets.geminiApiKey || legacyGemini || '',
            e2bApiKey: secrets.e2bApiKey || legacyE2b || '',
            gitToken: secrets.gitToken || legacyGit || '',
          };

          if (merged.geminiApiKey || merged.e2bApiKey || merged.gitToken) {
            applySecretsToState(merged);
            await saveSecretsToVault(merged);
          }

          useAppStore.setState({ vaultStatus: getVaultStatus() });
        })();
      },
    }
  )
);
