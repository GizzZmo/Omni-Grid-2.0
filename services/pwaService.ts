/**
 * pwaService.ts
 *
 * Handles Progressive Web App lifecycle for Omni-Grid 2.0:
 *  - Service worker registration & update detection
 *  - Deferred install-prompt management (beforeinstallprompt)
 *  - Online / offline status tracking
 */

export type PWAStatus =
  | 'unsupported'
  | 'registering'
  | 'registered'
  | 'update_available'
  | 'error';

export interface PWAState {
  status: PWAStatus;
  isOnline: boolean;
  canInstall: boolean;
  registration: ServiceWorkerRegistration | null;
}

type StateListener = (state: PWAState) => void;

// Deferred install-prompt event (non-standard, Chrome/Edge only)
let deferredInstallPrompt: Event | null = null;

const state: PWAState = {
  status: 'unsupported',
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  canInstall: false,
  registration: null,
};

const listeners = new Set<StateListener>();

const notify = () => listeners.forEach(fn => fn({ ...state }));

const setState = (patch: Partial<PWAState>) => {
  Object.assign(state, patch);
  notify();
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Subscribe to PWA state changes. Returns an unsubscribe function. */
export const onPWAStateChange = (listener: StateListener): (() => void) => {
  listeners.add(listener);
  listener({ ...state }); // emit current state immediately
  return () => listeners.delete(listener);
};

/** Return a snapshot of the current PWA state. */
export const getPWAState = (): PWAState => ({ ...state });

/**
 * Register the service worker and wire up lifecycle hooks.
 * Safe to call in SSR environments (no-ops when `navigator` is absent).
 */
export const register = async (swUrl = '/sw.js'): Promise<void> => {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) {
    setState({ status: 'unsupported' });
    return;
  }

  setState({ status: 'registering' });

  // Online / offline tracking
  window.addEventListener('online', () => setState({ isOnline: true }));
  window.addEventListener('offline', () => setState({ isOnline: false }));

  // Deferred install prompt (Chrome / Edge)
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    setState({ canInstall: true });
  });

  // Once installed via the prompt, clear the deferred event
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    setState({ canInstall: false });
  });

  try {
    const registration = await navigator.serviceWorker.register(swUrl);

    setState({ status: 'registered', registration });

    // Detect background updates
    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      if (!installing) return;

      installing.addEventListener('statechange', () => {
        if (
          installing.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          // A new version is waiting — notify the UI
          setState({ status: 'update_available' });
        }
      });
    });
  } catch (err) {
    console.error('[pwaService] Service worker registration failed:', err);
    setState({ status: 'error' });
  }
};

/**
 * Ask the browser to show the native install prompt.
 * Returns `true` if the prompt was shown, `false` otherwise.
 */
export const promptInstall = async (): Promise<boolean> => {
  if (!deferredInstallPrompt) return false;

  // `prompt()` exists on BeforeInstallPromptEvent but not on the base Event type
  const promptEvent = deferredInstallPrompt as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  };

  await promptEvent.prompt();
  const { outcome } = await promptEvent.userChoice;

  deferredInstallPrompt = null;
  setState({ canInstall: false });

  return outcome === 'accepted';
};

/**
 * Tell a waiting service worker to skip waiting and activate immediately.
 * Call this when the user acknowledges the "update available" notification.
 */
export const applyUpdate = (): void => {
  const reg = state.registration;
  if (reg?.waiting) {
    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
};
