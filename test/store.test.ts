import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store';
import { MARKETPLACE_CATALOG } from '../widgets/marketplaceCatalog';

// Helper to reset store to a clean state before each test
const resetStore = () => {
  useAppStore.getState().resetAll();
};

describe('useAppStore', () => {
  beforeEach(() => {
    resetStore();
  });

  // ── Widgets ──────────────────────────────────────────────────────────────

  describe('toggleWidget', () => {
    it('adds a widget to visibleWidgets when not visible', () => {
      const store = useAppStore.getState();
      const initialVisible = store.visibleWidgets;
      expect(initialVisible).not.toContain('CALC');

      store.toggleWidget('CALC');
      expect(useAppStore.getState().visibleWidgets).toContain('CALC');
    });

    it('removes a widget from visibleWidgets when visible', () => {
      const store = useAppStore.getState();
      // SYSTEM is visible by default after reset
      expect(store.visibleWidgets).toContain('SYSTEM');

      store.toggleWidget('SYSTEM');
      expect(useAppStore.getState().visibleWidgets).not.toContain('SYSTEM');
    });

    it('adds a layout entry when toggling on a widget that has no layout', () => {
      // Remove layout entry for FOCUS_HUD first
      const state = useAppStore.getState();
      const layoutWithoutFocus = state.layouts.lg.filter(i => i.i !== 'FOCUS_HUD');
      useAppStore.setState({ layouts: { lg: layoutWithoutFocus } });

      // Also remove from visibleWidgets
      useAppStore.setState({ visibleWidgets: state.visibleWidgets.filter(v => v !== 'FOCUS_HUD') });

      // Toggle it on
      useAppStore.getState().toggleWidget('FOCUS_HUD');

      const layout = useAppStore.getState().layouts.lg;
      expect(layout.some(item => item.i === 'FOCUS_HUD')).toBe(true);
    });
  });

  // ── Layout ────────────────────────────────────────────────────────────────

  describe('updateLayout', () => {
    it('updates layout items that already exist', () => {
      const store = useAppStore.getState();
      const systemItem = store.layouts.lg.find(i => i.i === 'SYSTEM');
      expect(systemItem).toBeDefined();

      store.updateLayout([{ i: 'SYSTEM', x: 5, y: 5, w: 6, h: 6 }]);

      const updated = useAppStore.getState().layouts.lg.find(i => i.i === 'SYSTEM');
      expect(updated?.x).toBe(5);
      expect(updated?.y).toBe(5);
    });

    it('preserves items not in the updated layout array', () => {
      const store = useAppStore.getState();
      const originalHelp = store.layouts.lg.find(i => i.i === 'HELP');

      // Update only SYSTEM
      store.updateLayout([{ i: 'SYSTEM', x: 1, y: 1, w: 4, h: 4 }]);

      const help = useAppStore.getState().layouts.lg.find(i => i.i === 'HELP');
      expect(help).toEqual(originalHelp);
    });
  });

  // ── Reset ─────────────────────────────────────────────────────────────────

  describe('resetAll', () => {
    it('resets visibleWidgets to defaults', () => {
      useAppStore.getState().toggleWidget('CALC');
      useAppStore.getState().resetAll();
      const { visibleWidgets } = useAppStore.getState();
      expect(visibleWidgets).toContain('SYSTEM');
      expect(visibleWidgets).toContain('HELP');
      expect(visibleWidgets).not.toContain('CALC');
    });

    it('resets tasks, tickers, and scratchpad content', () => {
      useAppStore.getState().addTask('My custom task');
      useAppStore.getState().addTicker('DOGE');
      useAppStore.getState().setScratchpadContent('custom content');

      useAppStore.getState().resetAll();

      const { tasks, tickers, scratchpadContent } = useAppStore.getState();
      expect(tasks).toHaveLength(0);
      expect(tickers).toContain('BTC'); // back to default
      expect(tickers).not.toContain('DOGE');
      expect(scratchpadContent).toBe('');
    });

    it('resets isLayoutLocked to false', () => {
      useAppStore.getState().toggleLayoutLock();
      expect(useAppStore.getState().isLayoutLocked).toBe(true);

      useAppStore.getState().resetAll();
      expect(useAppStore.getState().isLayoutLocked).toBe(false);
    });
  });

  // ── Ghost Widget ──────────────────────────────────────────────────────────

  describe('ghostWidget', () => {
    it('starts as null', () => {
      expect(useAppStore.getState().ghostWidget).toBeNull();
    });

    it('sets and clears the ghost widget', () => {
      const ghost = { id: 'ghost-1', suggestedWidgetId: 'CALC', reason: 'You use math' };
      useAppStore.getState().setGhostWidget(ghost);
      expect(useAppStore.getState().ghostWidget).toEqual(ghost);

      useAppStore.getState().setGhostWidget(null);
      expect(useAppStore.getState().ghostWidget).toBeNull();
    });

    it('solidifyGhostWidget activates the suggested widget and clears the ghost', () => {
      const ghost = {
        id: 'ghost-1',
        suggestedWidgetId: 'CALC',
        reason: 'You use math',
      };
      useAppStore.getState().setGhostWidget(ghost);
      useAppStore.getState().solidifyGhostWidget();

      const { ghostWidget, visibleWidgets } = useAppStore.getState();
      expect(ghostWidget).toBeNull();
      expect(visibleWidgets).toContain('CALC');
    });

    it('solidifyGhostWidget does nothing when ghost is null', () => {
      const before = useAppStore.getState().visibleWidgets.slice();
      useAppStore.getState().solidifyGhostWidget();
      expect(useAppStore.getState().visibleWidgets).toEqual(before);
    });
  });

  // ── Layout Lock / Compact ─────────────────────────────────────────────────

  describe('toggleLayoutLock', () => {
    it('toggles isLayoutLocked', () => {
      expect(useAppStore.getState().isLayoutLocked).toBe(false);
      useAppStore.getState().toggleLayoutLock();
      expect(useAppStore.getState().isLayoutLocked).toBe(true);
      useAppStore.getState().toggleLayoutLock();
      expect(useAppStore.getState().isLayoutLocked).toBe(false);
    });
  });

  describe('toggleCompact', () => {
    it('toggles isCompact', () => {
      expect(useAppStore.getState().isCompact).toBe(false);
      useAppStore.getState().toggleCompact();
      expect(useAppStore.getState().isCompact).toBe(true);
      useAppStore.getState().toggleCompact();
      expect(useAppStore.getState().isCompact).toBe(false);
    });
  });

  // ── Command Palette / Settings Panel ─────────────────────────────────────

  describe('setCmdPaletteOpen', () => {
    it('opens and closes the command palette', () => {
      useAppStore.getState().setCmdPaletteOpen(true);
      expect(useAppStore.getState().isCmdPaletteOpen).toBe(true);
      useAppStore.getState().setCmdPaletteOpen(false);
      expect(useAppStore.getState().isCmdPaletteOpen).toBe(false);
    });
  });

  describe('setSettingsPanelOpen', () => {
    it('opens and closes the settings panel', () => {
      useAppStore.getState().setSettingsPanelOpen(true);
      expect(useAppStore.getState().isSettingsPanelOpen).toBe(true);
      useAppStore.getState().setSettingsPanelOpen(false);
      expect(useAppStore.getState().isSettingsPanelOpen).toBe(false);
    });
  });

  // ── Settings ──────────────────────────────────────────────────────────────

  describe('toggleSetting', () => {
    it('toggles scanlines', () => {
      const initial = useAppStore.getState().settings.scanlines;
      useAppStore.getState().toggleSetting('scanlines');
      expect(useAppStore.getState().settings.scanlines).toBe(!initial);
    });

    it('toggles sound', () => {
      const initial = useAppStore.getState().settings.sound;
      useAppStore.getState().toggleSetting('sound');
      expect(useAppStore.getState().settings.sound).toBe(!initial);
    });
  });

  describe('setGeminiApiKey', () => {
    it('updates geminiApiKey in settings', () => {
      useAppStore.getState().setGeminiApiKey('my-test-key');
      expect(useAppStore.getState().settings.geminiApiKey).toBe('my-test-key');
    });
  });

  describe('setE2bApiKey', () => {
    it('updates e2bApiKey in settings', () => {
      useAppStore.getState().setE2bApiKey('e2b-test-key');
      expect(useAppStore.getState().settings.e2bApiKey).toBe('e2b-test-key');
    });
  });

  describe('setStartupBehavior', () => {
    it('updates startupBehavior', () => {
      useAppStore.getState().setStartupBehavior('empty');
      expect(useAppStore.getState().settings.startupBehavior).toBe('empty');
      useAppStore.getState().setStartupBehavior('default');
      expect(useAppStore.getState().settings.startupBehavior).toBe('default');
    });
  });

  // ── Theme ─────────────────────────────────────────────────────────────────

  describe('setTheme', () => {
    it('sets the theme', () => {
      const newTheme = {
        name: 'Test Theme',
        colors: {
          background: '#000',
          surface: '#111',
          primary: '#0ff',
          secondary: '#f0f',
          text: '#fff',
          accent: '#0f0',
        },
        font: 'monospace',
        radius: '0px',
      };
      useAppStore.getState().setTheme(newTheme);
      expect(useAppStore.getState().theme).toEqual(newTheme);
    });
  });

  // ── Logs ──────────────────────────────────────────────────────────────────

  describe('addLog', () => {
    it('prepends a new log entry', () => {
      const before = useAppStore.getState().logs.length;
      useAppStore.getState().addLog('test message');
      const after = useAppStore.getState().logs.length;
      expect(after).toBe(before + 1);
      expect(useAppStore.getState().logs[0]).toContain('test message');
    });

    it('keeps at most 50 log entries', () => {
      for (let i = 0; i < 60; i++) {
        useAppStore.getState().addLog(`log ${i}`);
      }
      expect(useAppStore.getState().logs.length).toBeLessThanOrEqual(50);
    });
  });

  // ── Tasks ─────────────────────────────────────────────────────────────────

  describe('tasks', () => {
    it('addTask creates a new todo task', () => {
      useAppStore.getState().addTask('Write tests');
      const tasks = useAppStore.getState().tasks;
      const added = tasks.find(t => t.text === 'Write tests');
      expect(added).toBeDefined();
      expect(added?.status).toBe('todo');
    });

    it('toggleTask flips status between todo and done', () => {
      useAppStore.getState().addTask('Toggle me');
      const task = useAppStore.getState().tasks.find(t => t.text === 'Toggle me')!;

      useAppStore.getState().toggleTask(task.id);
      expect(useAppStore.getState().tasks.find(t => t.id === task.id)?.status).toBe('done');

      useAppStore.getState().toggleTask(task.id);
      expect(useAppStore.getState().tasks.find(t => t.id === task.id)?.status).toBe('todo');
    });

    it('deleteTask removes the task', () => {
      useAppStore.getState().addTask('Delete me');
      const task = useAppStore.getState().tasks.find(t => t.text === 'Delete me')!;

      useAppStore.getState().deleteTask(task.id);
      expect(useAppStore.getState().tasks.find(t => t.id === task.id)).toBeUndefined();
    });

    it('setTasks replaces all tasks', () => {
      const newTasks = [{ id: 'x1', text: 'Only task', status: 'todo' as const }];
      useAppStore.getState().setTasks(newTasks);
      expect(useAppStore.getState().tasks).toEqual(newTasks);
    });
  });

  // ── Tickers ───────────────────────────────────────────────────────────────

  describe('tickers', () => {
    it('addTicker appends a new ticker', () => {
      useAppStore.getState().addTicker('LINK');
      expect(useAppStore.getState().tickers).toContain('LINK');
    });

    it('removeTicker removes the ticker', () => {
      useAppStore.getState().addTicker('LINK');
      useAppStore.getState().removeTicker('LINK');
      expect(useAppStore.getState().tickers).not.toContain('LINK');
    });

    it('setTickers replaces all tickers', () => {
      useAppStore.getState().setTickers(['XRP', 'DOT']);
      expect(useAppStore.getState().tickers).toEqual(['XRP', 'DOT']);
    });
  });

  // ── Clipboard ─────────────────────────────────────────────────────────────

  describe('clipboardHistory', () => {
    it('addToClipboardHistory prepends new entry', () => {
      useAppStore.getState().addToClipboardHistory('entry one');
      expect(useAppStore.getState().clipboardHistory[0]).toBe('entry one');
    });

    it('deduplicates clipboard entries (most recent on top)', () => {
      useAppStore.getState().addToClipboardHistory('dup');
      useAppStore.getState().addToClipboardHistory('other');
      useAppStore.getState().addToClipboardHistory('dup');

      const history = useAppStore.getState().clipboardHistory;
      expect(history[0]).toBe('dup');
      expect(history.filter(h => h === 'dup')).toHaveLength(1);
    });

    it('caps clipboard history at 20 entries', () => {
      for (let i = 0; i < 25; i++) {
        useAppStore.getState().addToClipboardHistory(`item-${i}`);
      }
      expect(useAppStore.getState().clipboardHistory.length).toBeLessThanOrEqual(20);
    });

    it('clearClipboardHistory empties the list', () => {
      useAppStore.getState().addToClipboardHistory('a');
      useAppStore.getState().clearClipboardHistory();
      expect(useAppStore.getState().clipboardHistory).toHaveLength(0);
    });
  });

  // ── RSS Feeds ─────────────────────────────────────────────────────────────

  describe('rssFeeds', () => {
    it('addRssFeed appends a feed URL', () => {
      useAppStore.getState().addRssFeed('https://example.com/rss');
      expect(useAppStore.getState().rssFeeds).toContain('https://example.com/rss');
    });

    it('removeRssFeed removes a feed URL', () => {
      useAppStore.getState().addRssFeed('https://example.com/rss');
      useAppStore.getState().removeRssFeed('https://example.com/rss');
      expect(useAppStore.getState().rssFeeds).not.toContain('https://example.com/rss');
    });
  });

  // ── Calendar Events ───────────────────────────────────────────────────────

  describe('calendarEvents', () => {
    it('addCalendarEvent appends an event', () => {
      const event = { date: '2025-01-01', title: 'New Year', encrypted: false };
      useAppStore.getState().addCalendarEvent(event);
      expect(useAppStore.getState().calendarEvents).toContainEqual(event);
    });
  });

  // ── Encrypted Notes ───────────────────────────────────────────────────────

  describe('encryptedNotes', () => {
    it('saveEncryptedNote stores a note by id', () => {
      useAppStore.getState().saveEncryptedNote('note-1', 'encrypted-content-abc');
      expect(useAppStore.getState().encryptedNotes['note-1']).toBe('encrypted-content-abc');
    });

    it('overwrites existing note with same id', () => {
      useAppStore.getState().saveEncryptedNote('note-1', 'v1');
      useAppStore.getState().saveEncryptedNote('note-1', 'v2');
      expect(useAppStore.getState().encryptedNotes['note-1']).toBe('v2');
    });
  });

  // ── Git Token ─────────────────────────────────────────────────────────────

  describe('setGitToken', () => {
    it('updates the git token', () => {
      useAppStore.getState().setGitToken('ghp_abc123');
      expect(useAppStore.getState().gitToken).toBe('ghp_abc123');
    });
  });

  // ── Marketplace ───────────────────────────────────────────────────────────

  describe('marketplace', () => {
    it('installWidget adds widget to installedWidgets', () => {
      // Find a widget not already installed in the catalog
      const { installedWidgets } = useAppStore.getState();
      const candidate = MARKETPLACE_CATALOG.find((e: any) => !(e.id in installedWidgets));

      if (candidate) {
        useAppStore.getState().installWidget(candidate.id);
        expect(useAppStore.getState().installedWidgets[candidate.id]).toBeDefined();
      }
    });

    it('uninstallWidget removes widget from installedWidgets', () => {
      const entry = MARKETPLACE_CATALOG[0];

      useAppStore.getState().installWidget(entry.id);
      expect(useAppStore.getState().installedWidgets[entry.id]).toBeDefined();

      useAppStore.getState().uninstallWidget(entry.id);
      expect(useAppStore.getState().installedWidgets[entry.id]).toBeUndefined();
    });
  });

  // ── Prompt Library ────────────────────────────────────────────────────────

  describe('promptLibrary', () => {
    it('updatePromptContent updates the prompt content', () => {
      const prompts = useAppStore.getState().promptLibrary;
      const firstId = prompts[0].id;

      useAppStore.getState().updatePromptContent(firstId, 'Updated content here');
      const updated = useAppStore.getState().promptLibrary.find(p => p.id === firstId);
      expect(updated?.content).toBe('Updated content here');
    });

    it('savePromptVersion adds a new version to prompt history', () => {
      const prompts = useAppStore.getState().promptLibrary;
      const firstId = prompts[0].id;
      const versionsBefore = prompts[0].versions.length;

      useAppStore.getState().savePromptVersion(firstId, 'snapshot note');
      const updated = useAppStore.getState().promptLibrary.find(p => p.id === firstId);
      expect(updated?.versions.length).toBe(versionsBefore + 1);
      expect(updated?.versions[0].note).toBe('snapshot note');
    });

    it('restorePromptVersion reverts prompt to a saved version', () => {
      const prompts = useAppStore.getState().promptLibrary;
      const firstId = prompts[0].id;

      useAppStore.getState().updatePromptContent(firstId, 'Version A');
      useAppStore.getState().savePromptVersion(firstId, 'v A');

      const versionId = useAppStore.getState().promptLibrary.find(p => p.id === firstId)!
        .versions[0].id;

      useAppStore.getState().updatePromptContent(firstId, 'Version B');
      useAppStore.getState().restorePromptVersion(firstId, versionId);

      const restored = useAppStore.getState().promptLibrary.find(p => p.id === firstId);
      expect(restored?.content).toBe('Version A');
    });

    it('updatePromptVariables sets variables on the prompt', () => {
      const prompts = useAppStore.getState().promptLibrary;
      const firstId = prompts[0].id;

      useAppStore.getState().updatePromptVariables(firstId, { name: 'Alice', role: 'dev' });
      const updated = useAppStore.getState().promptLibrary.find(p => p.id === firstId);
      expect(updated?.variables).toEqual({ name: 'Alice', role: 'dev' });
    });

    it('tagPrompt sets tags on the prompt', () => {
      const prompts = useAppStore.getState().promptLibrary;
      const firstId = prompts[0].id;

      useAppStore.getState().tagPrompt(firstId, ['ai', 'productivity']);
      const updated = useAppStore.getState().promptLibrary.find(p => p.id === firstId);
      expect(updated?.tags).toEqual(['ai', 'productivity']);
    });

    it('addPrompt prepends the new prompt and sets it as active', () => {
      const newPrompt = {
        id: 'test-prompt-new',
        name: 'My Prompt',
        content: 'Hello {{name}}',
        tags: ['test'],
        versions: [],
        variables: { name: 'World' },
      };

      useAppStore.getState().addPrompt(newPrompt);
      const { promptLibrary, activePromptId } = useAppStore.getState();
      expect(promptLibrary[0].id).toBe('test-prompt-new');
      expect(activePromptId).toBe('test-prompt-new');
    });
  });

  // ── WritePad / Scratchpad / Weather ───────────────────────────────────────

  describe('content state', () => {
    it('setWritePadContent updates writePadContent', () => {
      useAppStore.getState().setWritePadContent('Draft text here');
      expect(useAppStore.getState().writePadContent).toBe('Draft text here');
    });

    it('setScratchpadContent updates scratchpadContent', () => {
      useAppStore.getState().setScratchpadContent('# My Notes');
      expect(useAppStore.getState().scratchpadContent).toBe('# My Notes');
    });

    it('setWeatherLocation updates weatherLocation', () => {
      useAppStore.getState().setWeatherLocation('Oslo');
      expect(useAppStore.getState().weatherLocation).toBe('Oslo');
    });
  });

  // ── CyberEditor ───────────────────────────────────────────────────────────

  describe('cyberEditor', () => {
    it('setCyberEditorTabs replaces tabs', () => {
      const tabs = [
        { id: 'tab-1', name: 'main.ts', language: 'typescript', content: 'const x = 1;' },
      ];
      useAppStore.getState().setCyberEditorTabs(tabs);
      expect(useAppStore.getState().cyberEditorTabs).toEqual(tabs);
    });

    it('setCyberEditorActiveTab sets the active tab', () => {
      useAppStore.getState().setCyberEditorActiveTab('tab-2');
      expect(useAppStore.getState().cyberEditorActiveTab).toBe('tab-2');
    });
  });

  // ── setGlobalState ────────────────────────────────────────────────────────

  describe('setGlobalState', () => {
    it('merges partial state into the store', () => {
      useAppStore.getState().setGlobalState({ gitToken: 'merged-token' });
      expect(useAppStore.getState().gitToken).toBe('merged-token');
    });
  });
});
