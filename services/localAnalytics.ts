/**
 * Local-only usage analytics.
 * Tracks widget activations and key actions. Never leaves the device.
 * Stored in localStorage under omni-grid-analytics.
 */

const STORAGE_KEY = 'omni-grid-analytics';

export interface AnalyticsEvent {
  type: 'widget_open' | 'widget_close' | 'action';
  name: string;
  ts: string;
}

export interface AnalyticsSummary {
  totalEvents: number;
  widgetOpens: Record<string, number>;
  lastSeen: string | null;
}

const load = (): AnalyticsEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
};

const save = (events: AnalyticsEvent[]) => {
  try {
    // Keep last 500 events
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-500)));
  } catch {
    // quota or private mode
  }
};

export const trackEvent = (type: AnalyticsEvent['type'], name: string): void => {
  const events = load();
  events.push({ type, name, ts: new Date().toISOString() });
  save(events);
};

export const getAnalyticsSummary = (): AnalyticsSummary => {
  const events = load();
  const widgetOpens: Record<string, number> = {};
  for (const e of events) {
    if (e.type === 'widget_open') {
      widgetOpens[e.name] = (widgetOpens[e.name] ?? 0) + 1;
    }
  }
  return {
    totalEvents: events.length,
    widgetOpens,
    lastSeen: events.length ? events[events.length - 1]!.ts : null,
  };
};

export const clearAnalytics = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
