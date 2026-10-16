import { describe, it, expect, beforeEach, vi } from 'vitest';
import { trackEvent, getAnalyticsSummary, clearAnalytics } from '../services/localAnalytics';

describe('localAnalytics', () => {
  beforeEach(() => {
    localStorage.clear();
    clearAnalytics();
  });

  it('tracks widget opens and summarizes', () => {
    trackEvent('widget_open', 'SCRATCHPAD');
    trackEvent('widget_open', 'SCRATCHPAD');
    trackEvent('widget_open', 'FOCUS');
    const summary = getAnalyticsSummary();
    expect(summary.totalEvents).toBe(3);
    expect(summary.widgetOpens.SCRATCHPAD).toBe(2);
    expect(summary.widgetOpens.FOCUS).toBe(1);
    expect(summary.lastSeen).toBeTruthy();
  });

  it('clearAnalytics resets storage', () => {
    trackEvent('action', 'test');
    clearAnalytics();
    expect(getAnalyticsSummary().totalEvents).toBe(0);
  });
});
