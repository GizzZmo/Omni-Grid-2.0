/**
 * Local multi-tab collaboration scaffolding.
 * Uses BroadcastChannel so multiple tabs of the same origin can share presence
 * and simple layout pings. No server required. Real multi-user sync remains
 * a Phase 5 / optional backend concern.
 */

const CHANNEL_NAME = 'omni-grid-collab';

export interface CollabMessage {
  type: 'presence' | 'layout_ping' | 'hello';
  tabId: string;
  payload?: unknown;
  ts: string;
}

type Listener = (msg: CollabMessage) => void;

let channel: BroadcastChannel | null = null;
const listeners = new Set<Listener>();
const tabId = typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `tab-${Date.now()}`;

const ensureChannel = (): BroadcastChannel | null => {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (ev: MessageEvent<CollabMessage>) => {
      listeners.forEach(fn => fn(ev.data));
    };
  }
  return channel;
};

export const getCollabTabId = (): string => tabId;

export const subscribeCollab = (listener: Listener): (() => void) => {
  ensureChannel();
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const broadcastCollab = (type: CollabMessage['type'], payload?: unknown): void => {
  const ch = ensureChannel();
  if (!ch) return;
  const msg: CollabMessage = {
    type,
    tabId,
    payload,
    ts: new Date().toISOString(),
  };
  ch.postMessage(msg);
};

export const announcePresence = (): void => {
  broadcastCollab('presence', { userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : '' });
};

// Auto-announce on load (best-effort)
if (typeof window !== 'undefined') {
  setTimeout(announcePresence, 500);
}
