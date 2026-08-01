/**
 * Omni-Grid Secure Vault
 *
 * Encrypts sensitive secrets (API keys, tokens) before they touch durable storage.
 *
 * Cryptography (quantum-resistant for data-at-rest):
 *   - AES-256-GCM  — symmetric AEAD; Grover reduces security to ~128-bit, still NIST-approved
 *   - Device key   — random 256-bit AES key, preferably non-extractable in IndexedDB
 *   - Unique 96-bit IV per encryption
 *
 * Threat model:
 *   ✓ Protects against casual localStorage inspection / log leaks / some extensions
 *   ✓ Detects ciphertext tampering (GCM auth tag)
 *   ✗ Does not stop XSS that can call Web Crypto with the same origin key
 *   ✗ Full browser-profile theft can still recover IndexedDB keys
 */

const VAULT_STORAGE_KEY = 'omni-grid-secrets';
const DEVICE_KEY_DB = 'omni-grid-vault';
const DEVICE_KEY_STORE = 'keys';
const DEVICE_KEY_ID = 'device-aes-256';
const FALLBACK_KEY_MATERIAL = 'omni-grid-vault-key-material';

export interface VaultSecrets {
  geminiApiKey: string;
  e2bApiKey: string;
  gitToken: string;
}

const EMPTY_SECRETS: VaultSecrets = {
  geminiApiKey: '',
  e2bApiKey: '',
  gitToken: '',
};

const hasSubtle =
  typeof globalThis !== 'undefined' &&
  typeof globalThis.crypto !== 'undefined' &&
  typeof globalThis.crypto.subtle !== 'undefined';

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
};

const base64ToBytes = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

// ── Device key (IndexedDB preferred, localStorage fallback for tests/SSR) ────

const openKeyDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DEVICE_KEY_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DEVICE_KEY_STORE)) {
        db.createObjectStore(DEVICE_KEY_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
  });

const idbGetKey = async (): Promise<CryptoKey | null> => {
  try {
    const db = await openKeyDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(DEVICE_KEY_STORE, 'readonly');
      const store = tx.objectStore(DEVICE_KEY_STORE);
      const req = store.get(DEVICE_KEY_ID);
      req.onsuccess = () => resolve((req.result as CryptoKey) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
};

const idbPutKey = async (key: CryptoKey): Promise<void> => {
  const db = await openKeyDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DEVICE_KEY_STORE, 'readwrite');
    const store = tx.objectStore(DEVICE_KEY_STORE);
    const req = store.put(key, DEVICE_KEY_ID);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

const createAesKey = async (extractable: boolean): Promise<CryptoKey> => {
  if (!hasSubtle) throw new Error('Web Crypto unavailable');
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, extractable, [
    'encrypt',
    'decrypt',
  ]);
};

const importRawKey = async (raw: ArrayBuffer, extractable: boolean): Promise<CryptoKey> => {
  if (!hasSubtle) throw new Error('Web Crypto unavailable');
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, extractable, [
    'encrypt',
    'decrypt',
  ]);
};

/** Prefer non-extractable key in IndexedDB; fall back to raw material in localStorage. */
const getOrCreateDeviceKey = async (): Promise<CryptoKey> => {
  if (!hasSubtle) throw new Error('Web Crypto unavailable');

  const existing = await idbGetKey();
  if (existing) return existing;

  // Try non-extractable key in IndexedDB (best)
  try {
    const nonExtractable = await createAesKey(false);
    await idbPutKey(nonExtractable);
    return nonExtractable;
  } catch {
    // Fall through to extractable / localStorage material
  }

  // Fallback: persist raw key material (still encrypts secrets; weaker isolation)
  if (typeof localStorage !== 'undefined') {
    const existingMaterial = localStorage.getItem(FALLBACK_KEY_MATERIAL);
    if (existingMaterial) {
      return importRawKey(base64ToBytes(existingMaterial).buffer as ArrayBuffer, true);
    }
    const extractable = await createAesKey(true);
    const raw = new Uint8Array(await crypto.subtle.exportKey('raw', extractable));
    localStorage.setItem(FALLBACK_KEY_MATERIAL, bytesToBase64(raw));
    try {
      await idbPutKey(extractable);
    } catch {
      /* ignore */
    }
    return extractable;
  }

  // Last resort: ephemeral in-memory key (secrets won't survive reload)
  return createAesKey(false);
};

// ── Encrypt / decrypt ────────────────────────────────────────────────────────

const encryptJson = async (payload: unknown, key: CryptoKey): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const combined = new Uint8Array(iv.byteLength + cipherBuf.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuf), iv.byteLength);
  // Version prefix for future algorithm upgrades
  return `v1.${bytesToBase64(combined)}`;
};

const decryptJson = async <T>(blob: string, key: CryptoKey): Promise<T> => {
  const raw = blob.startsWith('v1.') ? blob.slice(3) : blob;
  const combined = base64ToBytes(raw);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(plainBuf)) as T;
};

// ── Public API ───────────────────────────────────────────────────────────────

export const saveSecretsToVault = async (secrets: VaultSecrets): Promise<void> => {
  if (typeof localStorage === 'undefined' || !hasSubtle) return;
  try {
    const key = await getOrCreateDeviceKey();
    const ciphertext = await encryptJson(secrets, key);
    localStorage.setItem(VAULT_STORAGE_KEY, ciphertext);
  } catch (err) {
    console.error('[secureVault] Failed to save secrets:', err);
  }
};

export const loadSecretsFromVault = async (): Promise<VaultSecrets> => {
  if (typeof localStorage === 'undefined' || !hasSubtle) return { ...EMPTY_SECRETS };
  const blob = localStorage.getItem(VAULT_STORAGE_KEY);
  if (!blob) return { ...EMPTY_SECRETS };
  try {
    const key = await getOrCreateDeviceKey();
    const parsed = await decryptJson<Partial<VaultSecrets>>(blob, key);
    return {
      geminiApiKey: parsed.geminiApiKey ?? '',
      e2bApiKey: parsed.e2bApiKey ?? '',
      gitToken: parsed.gitToken ?? '',
    };
  } catch (err) {
    console.error('[secureVault] Failed to load secrets (tampered or wrong key):', err);
    return { ...EMPTY_SECRETS };
  }
};

export const clearSecretsVault = (): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(VAULT_STORAGE_KEY);
};

/** Encrypt an arbitrary string (used by tests / ad-hoc callers). */
export const encryptString = async (plaintext: string): Promise<string> => {
  const key = await getOrCreateDeviceKey();
  return encryptJson({ v: plaintext }, key);
};

export const decryptString = async (blob: string): Promise<string> => {
  const key = await getOrCreateDeviceKey();
  const parsed = await decryptJson<{ v: string }>(blob, key);
  return parsed.v;
};

export const VAULT_KEYS = {
  STORAGE: VAULT_STORAGE_KEY,
  FALLBACK_MATERIAL: FALLBACK_KEY_MATERIAL,
} as const;
