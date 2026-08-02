# STATE MANAGEMENT // ZUSTAND PATTERNS

```text
[ DOCUMENTATION: STATE-MANAGEMENT.MD ]
[ MODE: TECHNICAL DEEP-DIVE ]
```

## 🧠 OVERVIEW

Omni-Grid uses **Zustand** for state management, a lightweight alternative to Redux. This guide explains the state architecture, patterns, and best practices — including how **secrets are excluded from the main persist blob** and handled by the Secure Vault.

---

## 📦 WHY ZUSTAND?

### Advantages Over Alternatives

**vs. Redux:**

- ✅ Less boilerplate (~5x less code)
- ✅ No provider wrapping needed
- ✅ Simpler learning curve
- ✅ Better TypeScript integration
- ✅ Built-in middleware support

**vs. Context API:**

- ✅ Better performance (no unnecessary re-renders)
- ✅ Selective subscriptions
- ✅ Easier debugging
- ✅ More scalable for large apps

**vs. MobX:**

- ✅ Simpler API
- ✅ More predictable
- ✅ Better React integration
- ✅ Smaller bundle size

---

## 🏗️ STORE ARCHITECTURE

### Complete Store Structure (simplified)

```typescript
// store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  saveSecretsToVault,
  loadSecretsFromVault,
  // ... other vault helpers
} from './services/secureVault';

interface AppState {
  visibleWidgets: string[];
  layouts: { lg: GridItemData[] };

  settings: {
    geminiApiKey: string;   // in-memory only when unlocked
    e2bApiKey: string;
    scanlines: boolean;
    sound: boolean;
    startupBehavior: 'restore' | 'default' | 'empty';
  };

  gitToken: string;
  vaultStatus: 'unprotected' | 'locked' | 'unlocked';

  // Vault actions
  setVaultPassphrase: (passphrase: string) => Promise<{ ok: boolean; error?: string }>;
  unlockVault: (passphrase: string) => Promise<boolean>;
  lockVault: () => void;
  removeVaultPassphrase: (passphrase: string) => Promise<boolean>;

  // ... theme, widgets, actions
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ... state + actions
    }),
    {
      name: 'omni-grid-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => {
        // CRITICAL: never persist secrets or vault status in the main blob
        const { geminiApiKey: _g, e2bApiKey: _e, ...safeSettings } = state.settings;
        const { gitToken: _t, vaultStatus: _v, ...rest } = state;
        return {
          ...rest,
          settings: safeSettings,
        };
      },
      onRehydrateStorage: () => _state => {
        // Async: load ciphertext from vault, apply if unlocked / unprotected
      },
    }
  )
);
```

---

## 🔐 SECURE VAULT INTEGRATION

Secrets (Gemini API key, E2B API key, Git token) are **never** written in plaintext into `omni-grid-storage`.

### How it works

| Layer | Responsibility |
| --- | --- |
| **Zustand in-memory** | Holds plaintext keys only while the vault is unlocked (or unprotected) |
| **`partialize`** | Strips keys + `vaultStatus` before writing the main localStorage blob |
| **`services/secureVault.ts`** | Encrypts secrets with AES-256-GCM under a data-encryption key (DEK) |
| **IndexedDB** | Stores a non-extractable DEK when no passphrase is set |
| **Passphrase (optional)** | PBKDF2-SHA256 (600 000 iterations) derives a KEK that wraps the DEK |
| **Session** | DEK lives only in a module-level variable; `lockVault()` clears it and wipes keys from the store |

### Vault states

- **`unprotected`** — no passphrase; DEK auto-available (device key or fallback material)
- **`locked`** — passphrase set; DEK not in memory; secrets unavailable until unlock
- **`unlocked`** — passphrase verified this session; DEK in memory

### Store actions

```typescript
// Enable protection (min 8 chars). Leaves session unlocked.
await setVaultPassphrase(passphrase);

// Unlock after page load / lock
const ok = await unlockVault(passphrase);

// Wipe DEK + clear keys from memory (and from settings in the store)
lockVault();

// Remove passphrase protection (requires current passphrase)
await removeVaultPassphrase(passphrase);
```

UI for these actions lives in **System Core → Settings** (Vault Passphrase panel).

### Threat model (summary)

- ✓ localStorage dumps show only ciphertext for secrets
- ✓ Wrong passphrase fails GCM auth — cannot unwrap DEK
- ✓ Tampered ciphertext is detected
- ✗ XSS on the same origin can still abuse an *unlocked* session (lock when idle if needed)

See `services/secureVault.ts` and `docs/plugin-security.md` for full details.

---

## 🎯 USAGE PATTERNS

### Pattern 1: Selective Subscriptions

**❌ Bad: Subscribe to entire store**

```typescript
const MyWidget = () => {
  const state = useAppStore(); // Re-renders on ANY state change!
  return <div>{state.settings.geminiApiKey}</div>;
};
```

**✅ Good: Subscribe to specific properties**

```typescript
const MyWidget = () => {
  const geminiApiKey = useAppStore(s => s.settings.geminiApiKey);
  // Only re-renders when geminiApiKey changes
  return <div>{geminiApiKey}</div>;
};
```

**✅ Better: Multiple selective subscriptions**

```typescript
const MyWidget = () => {
  const geminiApiKey = useAppStore(s => s.settings.geminiApiKey);
  const scanlines = useAppStore(s => s.settings.scanlines);
  const theme = useAppStore(s => s.theme);
  // Re-renders only when these specific values change
  return <div>...</div>;
};
```

---

### Pattern 2: Action-Only Subscriptions

**For components that only call actions:**

```typescript
const ControlButton = () => {
  // No re-renders (actions don't change)
  const toggleWidget = useAppStore(s => s.toggleWidget);

  return (
    <button onClick={() => toggleWidget('SCRATCHPAD')}>
      Toggle
    </button>
  );
};
```

---

### Pattern 3: Imperative State Access

**For event handlers that don't need reactivity:**

```typescript
const handleBackup = () => {
  // Direct state access without subscription
  const currentState = useAppStore.getState();

  const backup = {
    version: 1,
    timestamp: new Date().toISOString(),
    state: currentState,
  };

  downloadJson('backup.json', backup);
};
```

> **Note:** Backups may include in-memory secrets if the vault is unlocked. Treat backup files as sensitive.

---

### Pattern 4: Computed Values

**Derived state from store:**

```typescript
const MyWidget = () => {
  const visibleWidgets = useAppStore(s => s.visibleWidgets);
  const widgetCount = visibleWidgets.length;
  const hasWidgets = widgetCount > 0;
  return <div>Widgets: {widgetCount}</div>;
};
```

---

## 🔄 ACTION PATTERNS

### Setting API keys (respects vault lock)

```typescript
setGeminiApiKey: key => {
  if (get().vaultStatus === 'locked') return;
  // sync runtime env + store + persistSecrets()
};
```

When the vault is locked, key setters are no-ops so plaintext cannot be written.

---

## 💾 PERSISTENCE PATTERNS

### Understanding persist Middleware

```typescript
persist(
  (set, get) => ({ /* state */ }),
  {
    name: 'omni-grid-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: state => ({ /* safe subset only */ }),
  }
);
```

### Partial Persistence (current production behavior)

```typescript
partialize: state => {
  const { geminiApiKey: _g, e2bApiKey: _e, ...safeSettings } = state.settings;
  const { gitToken: _t, vaultStatus: _v, ...rest } = state;
  return {
    ...rest,
    settings: safeSettings,
  };
},
```

Secrets are written separately via `saveSecretsToVault()` to the key `omni-grid-secrets` (ciphertext only).

### Migration / rehydration

`onRehydrateStorage` runs after the main blob is restored. It:

1. Reads vault status
2. If **locked**, wipes any leftover secret fields from the store
3. If **unlocked / unprotected**, decrypts vault ciphertext and merges into `settings` / `gitToken`
4. Migrates any legacy plaintext keys that might still exist in older backups

---

## 🧪 TESTING PATTERNS

### Pattern 1: Mock Store for Unit Tests

```typescript
import { create } from 'zustand';

const createMockStore = (initialState = {}) => {
  return create(() => ({
    visibleWidgets: [],
    toggleWidget: vi.fn(),
    ...initialState,
  }));
};
```

### Pattern 2: Vault integration tests

See `test/secureVault.test.ts` for round-trip, lock/unlock, and wrong-passphrase coverage.

---

## 🎨 ADVANCED PATTERNS

### Store Slices / Middleware / Subscriptions

(Same as before — see previous sections in git history for full examples of slices, `devtools`, and `subscribe`.)

---

## 🚀 PERFORMANCE OPTIMIZATION

### 1. Avoid Over-Subscribing

Prefer targeted selectors (`useAppStore(s => s.settings.geminiApiKey)`).

### 2. Memoize Selectors

```typescript
import { shallow } from 'zustand/shallow';

const { apiKey, theme } = useAppStore(
  s => ({ apiKey: s.settings.geminiApiKey, theme: s.theme }),
  shallow
);
```

### 3. Batch Updates

```typescript
useAppStore.setState({
  visibleWidgets: [],
  tasks: [],
  // multiple fields in one setState
});
```

---

## 📚 FURTHER READING

- **[Architecture](./architecture.md)** - Overall system design
- **[Configuration](./configuration.md)** - API keys, vault passphrase UI
- **[Plugin Security](./plugin-security.md)** - Security requirements for widgets
- **[API Reference](./api-reference.md)** - Complete API
- **Zustand Docs:** https://github.com/pmndrs/zustand

---

_State management is not just about storing data—it's about orchestrating change securely._

**[← Back to Documentation Hub](./README.md)**
