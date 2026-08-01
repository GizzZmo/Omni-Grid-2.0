/**
 * Omni-Grid Secure Vault
 *
 * Encrypts sensitive secrets (API keys, tokens) before they touch durable storage.
 *
 * Cryptography (quantum-resistant for data-at-rest):
 *   - AES-256-GCM  — DEK encrypts secrets; Grover → ~128-bit, NIST-approved
 *   - PBKDF2-SHA256 (600k iterations) — derives KEK from user passphrase (OWASP)
 *   - Wrapped DEK — when a passphrase is set, DEK is never stored unprotected
 *   - Unique 96-bit IV per encryption
 *
 * States:
 *   unprotected — no passphrase; DEK in IndexedDB / fallback material (auto-unlock)
 *   locked      — passphrase set; DEK not in memory; secrets unavailable
 *   unlocked    — passphrase verified this session; DEK in memory
 *
 * Threat model:
 *   ✓ localStorage dumps show only ciphertext
 *   ✓ Wrong passphrase cannot unwrap DEK (GCM auth failure)
 *   ✓ Detects ciphertext tampering
 *   ✗ XSS on same origin can still abuse an unlocked session
 */

const VAULT_STORAGE_KEY = 'omni-grid-secrets';
const VAULT_META_KEY = 'omni-grid-vault-meta';
const DEVICE_KEY_DB = 'omni-grid-vault';
const DEVICE_KEY_STORE = 'keys';
const DEVICE_KEY_ID = 'device-aes-256';
const FALLBACK_KEY_MATERIAL = 'omni-grid-vault-key-material';

/** OWASP 2023 recommendation for PBKDF2-SHA256 */
const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;

export type VaultStatus = 'unprotected' | 'locked' | 'unlocked';

export interface VaultSecrets {
  geminiApiKey: string;
  e2bApiKey: string;
  gitToken: string;
}

interface VaultMeta {
  version: 1;
  salt: string; // base64
  wrappedDek: string; // v1.base64(iv||ciphertext of raw DEK)
  iterations: number;
}

const EMPTY_SECRETS: VaultSecrets = {
  geminiApiKey: '',
  e2bApiKey: '',
  gitToken: '',
};

/** Session-only unwrapped DEK (never written to disk when passphrase-protected). */
let sessionDek: CryptoKey | null = null;

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

// ── IndexedDB helpers ────────────────────────────────────────────────────────

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

const idbDeleteKey = async (): Promise<void> => {
  try {
    const db = await openKeyDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(DEVICE_KEY_STORE, 'readwrite');
      const store = tx.objectStore(DEVICE_KEY_STORE);
      const req = store.delete(DEVICE_KEY_ID);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    /* ignore */
  }
};

// ── Key primitives ───────────────────────────────────────────────────────────

const createAesKey = async (extractable: boolean): Promise<CryptoKey> => {
  if (!hasSubtle) throw new Error('Web Crypto unavailable');
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, extractable, [
    'encrypt',
    'decrypt',
  ]);
};

const importRawKey = async (raw: BufferSource, extractable: boolean): Promise<CryptoKey> => {
  if (!hasSubtle) throw new Error('Web Crypto unavailable');
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, extractable, [
    'encrypt',
    'decrypt',
  ]);
};

const deriveKek = async (passphrase: string, salt: Uint8Array): Promise<CryptoKey> => {
  if (!hasSubtle) throw new Error('Web Crypto unavailable');
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

const encryptBytes = async (data: Uint8Array, key: CryptoKey): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data as BufferSource);
  const combined = new Uint8Array(iv.byteLength + cipherBuf.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuf), iv.byteLength);
  return `v1.${bytesToBase64(combined)}`;
};

const decryptBytes = async (blob: string, key: CryptoKey): Promise<Uint8Array> => {
  const raw = blob.startsWith('v1.') ? blob.slice(3) : blob;
  const combined = base64ToBytes(raw);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext as BufferSource
  );
  return new Uint8Array(plainBuf);
};

const encryptJson = async (payload: unknown, key: CryptoKey): Promise<string> => {
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  return encryptBytes(encoded, key);
};

const decryptJson = async <T>(blob: string, key: CryptoKey): Promise<T> => {
  const plain = await decryptBytes(blob, key);
  return JSON.parse(new TextDecoder().decode(plain)) as T;
};

// ── Meta / status ────────────────────────────────────────────────────────────

const readMeta = (): VaultMeta | null => {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(VAULT_META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VaultMeta;
  } catch {
    return null;
  }
};

const writeMeta = (meta: VaultMeta): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(VAULT_META_KEY, JSON.stringify(meta));
};

const clearMeta = (): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(VAULT_META_KEY);
};

export const hasVaultPassphrase = (): boolean => readMeta() !== null;

export const getVaultStatus = (): VaultStatus => {
  if (!hasVaultPassphrase()) return 'unprotected';
  return sessionDek ? 'unlocked' : 'locked';
};

// ── Unprotected DEK (IndexedDB / fallback) ───────────────────────────────────

const getOrCreateUnprotectedDek = async (): Promise<CryptoKey> => {
  if (!hasSubtle) throw new Error('Web Crypto unavailable');

  if (sessionDek) return sessionDek;

  const existing = await idbGetKey();
  if (existing) {
    sessionDek = existing;
    return existing;
  }

  try {
    const nonExtractable = await createAesKey(false);
    await idbPutKey(nonExtractable);
    sessionDek = nonExtractable;
    return nonExtractable;
  } catch {
    /* fall through */
  }

  if (typeof localStorage !== 'undefined') {
    const existingMaterial = localStorage.getItem(FALLBACK_KEY_MATERIAL);
    if (existingMaterial) {
      const key = await importRawKey(base64ToBytes(existingMaterial).buffer as ArrayBuffer, true);
      sessionDek = key;
      return key;
    }
    const extractable = await createAesKey(true);
    const raw = new Uint8Array(await crypto.subtle.exportKey('raw', extractable));
    localStorage.setItem(FALLBACK_KEY_MATERIAL, bytesToBase64(raw));
    try {
      await idbPutKey(extractable);
    } catch {
      /* ignore */
    }
    sessionDek = extractable;
    return extractable;
  }

  const ephemeral = await createAesKey(false);
  sessionDek = ephemeral;
  return ephemeral;
};

/** Resolve DEK for encrypt/decrypt: session (unlocked) or unprotected device key. */
const resolveDek = async (): Promise<CryptoKey | null> => {
  if (sessionDek) return sessionDek;
  if (hasVaultPassphrase()) return null; // locked
  return getOrCreateUnprotectedDek();
};

const clearUnprotectedKeyMaterial = async (): Promise<void> => {
  await idbDeleteKey();
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(FALLBACK_KEY_MATERIAL);
  }
};

// ── Public API: secrets ──────────────────────────────────────────────────────

export const saveSecretsToVault = async (secrets: VaultSecrets): Promise<void> => {
  if (typeof localStorage === 'undefined' || !hasSubtle) return;
  try {
    const key = await resolveDek();
    if (!key) {
      console.warn('[secureVault] Vault is locked — secrets not persisted');
      return;
    }
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
    const key = await resolveDek();
    if (!key) return { ...EMPTY_SECRETS }; // locked
    const parsed = await decryptJson<Partial<VaultSecrets>>(blob, key);
    return {
      geminiApiKey: parsed.geminiApiKey ?? '',
      e2bApiKey: parsed.e2bApiKey ?? '',
      gitToken: parsed.gitToken ?? '',
    };
  } catch (err) {
    console.error('[secureVault] Failed to load secrets:', err);
    return { ...EMPTY_SECRETS };
  }
};

export const clearSecretsVault = (): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(VAULT_STORAGE_KEY);
  clearMeta();
  sessionDek = null;
  void clearUnprotectedKeyMaterial();
};

// ── Public API: passphrase ───────────────────────────────────────────────────

/**
 * Enable passphrase protection. Re-wraps the current DEK (or creates one).
 * Leaves the vault unlocked in this session.
 */
export const setVaultPassphrase = async (passphrase: string): Promise<void> => {
  if (!passphrase || passphrase.length < 8) {
    throw new Error('Passphrase must be at least 8 characters');
  }
  if (!hasSubtle) throw new Error('Web Crypto unavailable');

  // Ensure we have an extractable DEK to wrap
  let dek = sessionDek;
  if (!dek) {
    dek = await getOrCreateUnprotectedDek();
  }

  // Need raw bytes — re-generate extractable if current key is non-extractable
  let rawDek: Uint8Array;
  try {
    rawDek = new Uint8Array(await crypto.subtle.exportKey('raw', dek));
  } catch {
    // Non-extractable: decrypt secrets with old key, create new extractable DEK, re-encrypt
    const secrets = await loadSecretsFromVault();
    const newDek = await createAesKey(true);
    rawDek = new Uint8Array(await crypto.subtle.exportKey('raw', newDek));
    sessionDek = newDek;
    await saveSecretsToVault(secrets);
    dek = newDek;
  }

  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const kek = await deriveKek(passphrase, salt);
  const wrappedDek = await encryptBytes(rawDek, kek);

  writeMeta({
    version: 1,
    salt: bytesToBase64(salt),
    wrappedDek,
    iterations: PBKDF2_ITERATIONS,
  });

  // Remove unprotected material so DEK is only recoverable via passphrase
  await clearUnprotectedKeyMaterial();

  // Keep session unlocked with a non-extractable import of the same raw key
  sessionDek = await importRawKey(rawDek.buffer as ArrayBuffer, false);
};

/** Unlock vault with passphrase. Returns true on success. */
export const unlockVault = async (passphrase: string): Promise<boolean> => {
  const meta = readMeta();
  if (!meta) return true; // unprotected
  if (!hasSubtle) return false;

  try {
    const salt = base64ToBytes(meta.salt);
    const kek = await deriveKek(passphrase, salt);
    const rawDek = await decryptBytes(meta.wrappedDek, kek);
    sessionDek = await importRawKey(rawDek.buffer as ArrayBuffer, false);
    return true;
  } catch {
    sessionDek = null;
    return false;
  }
};

/** Lock vault: wipe session DEK. No-op if unprotected. */
export const lockVault = (): void => {
  if (!hasVaultPassphrase()) return;
  sessionDek = null;
};

/**
 * Remove passphrase protection. Requires current passphrase.
 * Restores unprotected device-key storage so secrets auto-load again.
 */
export const removeVaultPassphrase = async (passphrase: string): Promise<boolean> => {
  const ok = await unlockVault(passphrase);
  if (!ok || !sessionDek) return false;

  // Export / re-create extractable DEK for unprotected storage
  let raw: Uint8Array;
  try {
    raw = new Uint8Array(await crypto.subtle.exportKey('raw', sessionDek));
  } catch {
    const secrets = await loadSecretsFromVault();
    const newDek = await createAesKey(true);
    raw = new Uint8Array(await crypto.subtle.exportKey('raw', newDek));
    sessionDek = newDek;
    await saveSecretsToVault(secrets);
  }

  const extractable = await importRawKey(raw.buffer as ArrayBuffer, true);
  try {
    await idbPutKey(extractable);
  } catch {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(FALLBACK_KEY_MATERIAL, bytesToBase64(raw));
    }
  }

  clearMeta();
  sessionDek = extractable;
  return true;
};

/** Change passphrase (must know the current one). */
export const changeVaultPassphrase = async (
  currentPassphrase: string,
  newPassphrase: string
): Promise<boolean> => {
  if (!newPassphrase || newPassphrase.length < 8) {
    throw new Error('New passphrase must be at least 8 characters');
  }
  const ok = await unlockVault(currentPassphrase);
  if (!ok) return false;
  await setVaultPassphrase(newPassphrase);
  return true;
};

/** Encrypt an arbitrary string (uses current DEK if available). */
export const encryptString = async (plaintext: string): Promise<string> => {
  const key = await resolveDek();
  if (!key) throw new Error('Vault is locked');
  return encryptJson({ v: plaintext }, key);
};

export const decryptString = async (blob: string): Promise<string> => {
  const key = await resolveDek();
  if (!key) throw new Error('Vault is locked');
  const parsed = await decryptJson<{ v: string }>(blob, key);
  return parsed.v;
};

export const VAULT_KEYS = {
  STORAGE: VAULT_STORAGE_KEY,
  META: VAULT_META_KEY,
  FALLBACK_MATERIAL: FALLBACK_KEY_MATERIAL,
} as const;

export const VAULT_PBKDF2_ITERATIONS = PBKDF2_ITERATIONS;
