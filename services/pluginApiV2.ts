/**
 * pluginApiV2.ts
 *
 * Advanced Plugin API v2 for Omni-Grid.
 *
 * Provides:
 *  - Plugin registry with lifecycle management (register, activate, deactivate)
 *  - Event bus for inter-widget and inter-plugin messaging
 *  - Shared key-value store for cross-widget state
 *  - Permission model (declare required capabilities)
 *  - Theme-change and layout-change hooks
 *  - Sandboxed API surface exposed to plugins (OmniGridAPI)
 *
 * Usage (from a plugin/widget):
 *
 *   import { pluginRegistry, eventBus, sharedStore } from '../services/pluginApiV2';
 *
 *   // Register
 *   pluginRegistry.register({
 *     id: 'my-widget',
 *     name: 'My Widget',
 *     version: '1.0.0',
 *     permissions: ['sharedStore:read', 'sharedStore:write', 'events:publish'],
 *     onMount: (api) => { ... },
 *     onUnmount: () => { ... },
 *   });
 *
 *   // Publish events
 *   eventBus.publish('my-widget:data-ready', { value: 42 });
 *
 *   // Subscribe
 *   const unsub = eventBus.subscribe('other-widget:update', (payload) => { ... });
 */

// ── Permission types ──────────────────────────────────────────────────────────

export type PluginPermission =
  | 'sharedStore:read'
  | 'sharedStore:write'
  | 'events:publish'
  | 'events:subscribe'
  | 'ai:generate'
  | 'layout:read'
  | 'layout:write'
  | 'theme:read'
  | 'theme:write'
  | 'clipboard:read'
  | 'clipboard:write'
  | 'notifications:send';

// ── Plugin manifest ───────────────────────────────────────────────────────────

export interface PluginManifest {
  /** Unique plugin identifier, must match WidgetType or be a scoped id */
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  /** Required capabilities. The platform may deny activation if permissions are blocked. */
  permissions: PluginPermission[];
  /** Called when the widget mounts. Receives a sandboxed API object. */
  onMount?: (api: OmniGridPluginAPI) => void | Promise<void>;
  /** Called when the widget unmounts. */
  onUnmount?: () => void | Promise<void>;
  /** Called whenever the active theme changes. */
  onThemeChange?: (theme: ThemeSnapshot) => void;
  /** Called whenever the grid layout changes. */
  onLayoutChange?: (layout: LayoutSnapshot) => void;
}

export interface ThemeSnapshot {
  name: string;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    accent: string;
  };
  font: string;
  radius: string;
}

export interface LayoutSnapshot {
  items: Array<{ id: string; x: number; y: number; w: number; h: number }>;
}

// ── Sandboxed API surface exposed to plugins ──────────────────────────────────

export interface OmniGridPluginAPI {
  /** Plugin id (read-only) */
  readonly pluginId: string;
  /** Read a value from the shared cross-widget store */
  sharedStore: {
    get: (key: string) => unknown;
    set: (key: string, value: unknown) => void;
    delete: (key: string) => void;
    keys: () => string[];
  };
  /** Typed event bus */
  events: {
    publish: (channel: string, payload?: unknown) => void;
    subscribe: (channel: string, handler: (payload: unknown) => void) => () => void;
  };
  /** Emit a notification banner */
  notify: (message: string, level?: 'info' | 'warn' | 'error') => void;
  /** Get current platform version */
  getPlatformVersion: () => string;
}

// ── Plugin lifecycle state ────────────────────────────────────────────────────

export type PluginStatus = 'registered' | 'active' | 'inactive' | 'error';

export interface PluginRecord {
  manifest: PluginManifest;
  status: PluginStatus;
  error?: string;
  activatedAt?: number;
  deactivatedAt?: number;
}

// ── Event bus ─────────────────────────────────────────────────────────────────

type EventHandler = (payload: unknown) => void;

export class EventBus {
  private channels: Map<string, Set<EventHandler>> = new Map();
  private history: Array<{ channel: string; payload: unknown; ts: number }> = [];
  private readonly maxHistory = 200;

  subscribe(channel: string, handler: EventHandler): () => void {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(handler);
    return () => this.channels.get(channel)?.delete(handler);
  }

  publish(channel: string, payload?: unknown) {
    this.history.push({ channel, payload, ts: Date.now() });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    this.channels.get(channel)?.forEach(h => {
      try { h(payload); } catch { /* isolate handler errors */ }
    });
    // Wildcard listeners
    this.channels.get('*')?.forEach(h => {
      try { h({ channel, payload }); } catch { /* ignore */ }
    });
  }

  /** Returns recent published events, newest-first. */
  getHistory(limit = 50): Array<{ channel: string; payload: unknown; ts: number }> {
    return this.history.slice(-limit).reverse();
  }

  getChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  clear() {
    this.channels.clear();
    this.history.length = 0;
  }
}

// ── Shared store ──────────────────────────────────────────────────────────────

export class SharedPluginStore {
  private store: Map<string, unknown> = new Map();
  private onChange?: (key: string, value: unknown | undefined) => void;

  setChangeHandler(handler: (key: string, value: unknown | undefined) => void) {
    this.onChange = handler;
  }

  get(key: string): unknown {
    return this.store.get(key);
  }

  set(key: string, value: unknown) {
    this.store.set(key, value);
    this.onChange?.(key, value);
  }

  delete(key: string) {
    this.store.delete(key);
    this.onChange?.(key, undefined);
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  toObject(): Record<string, unknown> {
    return Object.fromEntries(this.store);
  }

  clear() {
    this.store.clear();
  }
}

// ── Notification bus ──────────────────────────────────────────────────────────

export interface PlatformNotification {
  id: string;
  pluginId: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  ts: number;
}

type NotificationListener = (n: PlatformNotification) => void;

export class NotificationBus {
  private listeners: Set<NotificationListener> = new Set();

  subscribe(handler: NotificationListener): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  emit(pluginId: string, message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const n: PlatformNotification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      pluginId,
      message,
      level,
      ts: Date.now(),
    };
    this.listeners.forEach(h => { try { h(n); } catch { /* ignore */ } });
  }
}

// ── Plugin registry ───────────────────────────────────────────────────────────

export class PluginRegistry {
  private plugins: Map<string, PluginRecord> = new Map();
  private apiCache: Map<string, OmniGridPluginAPI> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor(
    private readonly eventBus: EventBus,
    private readonly sharedStore: SharedPluginStore,
    private readonly notifications: NotificationBus,
  ) {}

  private notify() {
    this.listeners.forEach(l => l());
  }

  onChange(handler: () => void): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  /** Register a plugin manifest. Does not activate it yet. */
  register(manifest: PluginManifest): void {
    if (this.plugins.has(manifest.id)) {
      // Re-registration updates the manifest; clear cached API so permissions are re-evaluated
      const existing = this.plugins.get(manifest.id)!;
      this.plugins.set(manifest.id, { ...existing, manifest });
      this.apiCache.delete(manifest.id);
      this.notify();
      return;
    }
    this.plugins.set(manifest.id, { manifest, status: 'registered' });
    this.notify();
  }

  /** Activate a registered plugin (calls onMount). */
  async activate(pluginId: string): Promise<void> {
    const record = this.plugins.get(pluginId);
    if (!record) throw new Error(`Plugin not registered: ${pluginId}`);
    if (record.status === 'active') return;

    // Cache the API object per plugin to avoid rebuilding on every call
    if (!this.apiCache.has(pluginId)) {
      this.apiCache.set(pluginId, this.buildAPI(pluginId, record.manifest.permissions));
    }
    const api = this.apiCache.get(pluginId)!;

    try {
      await record.manifest.onMount?.(api);
      this.plugins.set(pluginId, {
        ...record,
        status: 'active',
        activatedAt: Date.now(),
        error: undefined,
      });
    } catch (err: unknown) {
      this.plugins.set(pluginId, {
        ...record,
        status: 'error',
        error: err instanceof Error ? err.message : 'Activation failed',
      });
    }
    this.notify();
  }

  /** Deactivate a plugin (calls onUnmount). */
  async deactivate(pluginId: string): Promise<void> {
    const record = this.plugins.get(pluginId);
    if (!record || record.status !== 'active') return;

    try {
      await record.manifest.onUnmount?.();
    } catch {
      // deactivation errors are non-fatal
    }
    this.plugins.set(pluginId, {
      ...record,
      status: 'inactive',
      deactivatedAt: Date.now(),
    });
    this.notify();
  }

  /** Broadcast a theme change to all active plugins. */
  broadcastThemeChange(theme: ThemeSnapshot) {
    for (const [, record] of this.plugins) {
      if (record.status === 'active') {
        try { record.manifest.onThemeChange?.(theme); } catch { /* ignore */ }
      }
    }
  }

  /** Broadcast a layout change to all active plugins. */
  broadcastLayoutChange(layout: LayoutSnapshot) {
    for (const [, record] of this.plugins) {
      if (record.status === 'active') {
        try { record.manifest.onLayoutChange?.(layout); } catch { /* ignore */ }
      }
    }
  }

  getAll(): PluginRecord[] {
    return Array.from(this.plugins.values());
  }

  get(id: string): PluginRecord | undefined {
    return this.plugins.get(id);
  }

  // ── API builder ────────────────────────────────────────────────────────────

  private buildAPI(pluginId: string, permissions: PluginPermission[]): OmniGridPluginAPI {
    const hasPermission = (p: PluginPermission) => permissions.includes(p);

    const guardedStore = {
      get: (key: string): unknown => {
        if (!hasPermission('sharedStore:read')) throw new Error(`Plugin ${pluginId} lacks sharedStore:read`);
        return this.sharedStore.get(key);
      },
      set: (key: string, value: unknown) => {
        if (!hasPermission('sharedStore:write')) throw new Error(`Plugin ${pluginId} lacks sharedStore:write`);
        this.sharedStore.set(`${pluginId}:${key}`, value);
      },
      delete: (key: string) => {
        if (!hasPermission('sharedStore:write')) throw new Error(`Plugin ${pluginId} lacks sharedStore:write`);
        this.sharedStore.delete(`${pluginId}:${key}`);
      },
      keys: (): string[] => {
        if (!hasPermission('sharedStore:read')) return [];
        return this.sharedStore.keys().filter(k => k.startsWith(`${pluginId}:`));
      },
    };

    const guardedEvents = {
      publish: (channel: string, payload?: unknown) => {
        if (!hasPermission('events:publish')) throw new Error(`Plugin ${pluginId} lacks events:publish`);
        this.eventBus.publish(`${pluginId}:${channel}`, payload);
      },
      subscribe: (channel: string, handler: (payload: unknown) => void): (() => void) => {
        if (!hasPermission('events:subscribe')) throw new Error(`Plugin ${pluginId} lacks events:subscribe`);
        return this.eventBus.subscribe(channel, handler);
      },
    };

    return {
      pluginId,
      sharedStore: guardedStore,
      events: guardedEvents,
      notify: (msg: string, level: 'info' | 'warn' | 'error' = 'info') => {
        if (!hasPermission('notifications:send')) return;
        this.notifications.emit(pluginId, msg, level);
      },
      getPlatformVersion: () => '2.0.0',
    };
  }
}

// ── Singleton instances ───────────────────────────────────────────────────────

export const eventBus = new EventBus();
export const sharedStore = new SharedPluginStore();
export const notificationBus = new NotificationBus();
export const pluginRegistry = new PluginRegistry(eventBus, sharedStore, notificationBus);

// Platform version constant
export const PLUGIN_API_VERSION = '2.0.0';
