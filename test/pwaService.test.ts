import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  register,
  promptInstall,
  applyUpdate,
  onPWAStateChange,
  getPWAState,
} from '../services/pwaService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeRegistration = (overrides: Partial<ServiceWorkerRegistration> = {}) =>
  ({
    installing: null,
    waiting: null,
    active: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    update: vi.fn(),
    unregister: vi.fn(() => Promise.resolve(true)),
    ...overrides,
  }) as unknown as ServiceWorkerRegistration;

const makeSW = (overrides = {}) =>
  ({
    state: 'installing',
    addEventListener: vi.fn(),
    postMessage: vi.fn(),
    ...overrides,
  }) as unknown as ServiceWorker;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Reset module-level state between tests by re-importing a fresh instance
  vi.resetModules();

  // Minimal navigator.serviceWorker mock
  Object.defineProperty(navigator, 'serviceWorker', {
    value: {
      register: vi.fn(),
      controller: null,
    },
    writable: true,
    configurable: true,
  });

  Object.defineProperty(navigator, 'onLine', {
    value: true,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('pwaService — getPWAState', () => {
  it('returns a state object with required fields', async () => {
    const { getPWAState } = await import('../services/pwaService');
    const state = getPWAState();
    expect(state).toHaveProperty('status');
    expect(state).toHaveProperty('isOnline');
    expect(state).toHaveProperty('canInstall');
    expect(state).toHaveProperty('registration');
  });
});

describe('pwaService — register (unsupported env)', () => {
  it('sets status to "unsupported" when serviceWorker is absent', async () => {
    // Remove serviceWorker support
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { register, getPWAState } = await import('../services/pwaService');
    await register('/sw.js');
    expect(getPWAState().status).toBe('unsupported');
  });
});

describe('pwaService — register (success)', () => {
  it('sets status to "registered" after a successful SW registration', async () => {
    const reg = makeRegistration();
    (navigator.serviceWorker as any).register = vi.fn().mockResolvedValue(reg);

    const { register, getPWAState } = await import('../services/pwaService');
    await register('/sw.js');

    expect(getPWAState().status).toBe('registered');
    expect(getPWAState().registration).toBe(reg);
  });

  it('calls navigator.serviceWorker.register with the provided SW URL', async () => {
    const reg = makeRegistration();
    const mockRegister = vi.fn().mockResolvedValue(reg);
    (navigator.serviceWorker as any).register = mockRegister;

    const { register } = await import('../services/pwaService');
    await register('/custom-sw.js');

    expect(mockRegister).toHaveBeenCalledWith('/custom-sw.js');
  });

  it('defaults to /sw.js when no URL is provided', async () => {
    const reg = makeRegistration();
    const mockRegister = vi.fn().mockResolvedValue(reg);
    (navigator.serviceWorker as any).register = mockRegister;

    const { register } = await import('../services/pwaService');
    await register(); // no argument

    expect(mockRegister).toHaveBeenCalledWith('/sw.js');
  });
});

describe('pwaService — register (error)', () => {
  it('sets status to "error" when SW registration throws', async () => {
    (navigator.serviceWorker as any).register = vi
      .fn()
      .mockRejectedValue(new Error('Registration failed'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { register, getPWAState } = await import('../services/pwaService');
    await register('/sw.js');

    expect(getPWAState().status).toBe('error');
    consoleSpy.mockRestore();
  });
});

describe('pwaService — onPWAStateChange', () => {
  it('calls the listener immediately with the current state', async () => {
    const { onPWAStateChange } = await import('../services/pwaService');
    const listener = vi.fn();
    const unsub = onPWAStateChange(listener);

    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0][0]).toHaveProperty('status');

    unsub();
  });

  it('unsubscribes correctly and stops receiving updates', async () => {
    const reg = makeRegistration();
    (navigator.serviceWorker as any).register = vi.fn().mockResolvedValue(reg);

    const { register, onPWAStateChange } = await import('../services/pwaService');
    const listener = vi.fn();
    const unsub = onPWAStateChange(listener);

    const callsBefore = listener.mock.calls.length;
    unsub();

    await register('/sw.js');

    // Listener should not have received any additional calls after unsubscribing
    expect(listener.mock.calls.length).toBe(callsBefore);
  });
});

describe('pwaService — promptInstall', () => {
  it('returns false when no deferred install prompt is available', async () => {
    const { promptInstall } = await import('../services/pwaService');
    const result = await promptInstall();
    expect(result).toBe(false);
  });
});

describe('pwaService — applyUpdate', () => {
  it('posts SKIP_WAITING to the waiting SW when one exists', async () => {
    const waitingSW = makeSW({ state: 'installed' });
    const reg = makeRegistration({ waiting: waitingSW });
    (navigator.serviceWorker as any).register = vi.fn().mockResolvedValue(reg);

    const { register, applyUpdate } = await import('../services/pwaService');
    await register('/sw.js');
    applyUpdate();

    expect((waitingSW as any).postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });

  it('does nothing when there is no waiting SW', async () => {
    const reg = makeRegistration({ waiting: null });
    (navigator.serviceWorker as any).register = vi.fn().mockResolvedValue(reg);

    const { register, applyUpdate } = await import('../services/pwaService');
    await register('/sw.js');

    // Should not throw
    expect(() => applyUpdate()).not.toThrow();
  });
});

describe('pwaService — online/offline tracking', () => {
  it('reflects navigator.onLine on initial state', async () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    const { getPWAState } = await import('../services/pwaService');
    // Module initialises isOnline from navigator.onLine at import time
    expect(getPWAState().isOnline).toBe(false);
  });
});
