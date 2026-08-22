/**
 * Cloud / encrypted backup service.
 *
 * Reuses Secure Vault crypto (AES-256-GCM) so backups never leave the device
 * in plaintext. Supports:
 *   1. Encrypted local file download / restore
 *   2. Optional HTTPS endpoint (PUT/GET) for user-controlled cloud storage
 *      (WebDAV, S3 presigned URL, self-hosted, etc.)
 *
 * Threat model:
 *   ✓ Backup blobs are ciphertext only
 *   ✓ Endpoint URL never stores the DEK
 *   ✗ User must keep their vault passphrase to restore passphrase-protected vaults
 */

import {
  encryptString,
  decryptString,
  getVaultStatus,
} from './secureVault';

export const BACKUP_FORMAT_VERSION = 2;
export const BACKUP_MAGIC = 'omni-grid-encrypted-backup';

export interface EncryptedBackupEnvelope {
  magic: typeof BACKUP_MAGIC;
  version: number;
  createdAt: string;
  /** AES-GCM ciphertext of the JSON state (via vault DEK). */
  ciphertext: string;
  /** Whether vault was locked at export time (informational). */
  vaultStatus: string;
  /** Optional label chosen by the user. */
  label?: string;
}

export interface CloudEndpointConfig {
  /** Full URL that accepts PUT (upload) and GET (download). */
  url: string;
  /** Optional bearer token or custom header value. */
  authHeader?: string;
}

const ENDPOINT_KEY = 'omni-grid-cloud-endpoint';

export const saveCloudEndpoint = (cfg: CloudEndpointConfig | null): void => {
  if (typeof localStorage === 'undefined') return;
  if (!cfg) {
    localStorage.removeItem(ENDPOINT_KEY);
    return;
  }
  localStorage.setItem(ENDPOINT_KEY, JSON.stringify(cfg));
};

export const loadCloudEndpoint = (): CloudEndpointConfig | null => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ENDPOINT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CloudEndpointConfig;
  } catch {
    return null;
  }
};

/** Build an encrypted backup envelope from an arbitrary state snapshot. */
export async function createEncryptedBackup(
  state: unknown,
  label?: string
): Promise<EncryptedBackupEnvelope> {
  const status = getVaultStatus();
  if (status === 'locked') {
    throw new Error('Vault is locked — unlock before creating an encrypted backup');
  }
  const plaintext = JSON.stringify({
    version: BACKUP_FORMAT_VERSION,
    timestamp: new Date().toISOString(),
    state,
  });
  const ciphertext = await encryptString(plaintext);
  return {
    magic: BACKUP_MAGIC,
    version: BACKUP_FORMAT_VERSION,
    createdAt: new Date().toISOString(),
    ciphertext,
    vaultStatus: status,
    label,
  };
}

/** Decrypt an envelope and return the original state object. */
export async function restoreEncryptedBackup(
  envelope: EncryptedBackupEnvelope
): Promise<unknown> {
  if (envelope.magic !== BACKUP_MAGIC) {
    throw new Error('Not a valid Omni-Grid encrypted backup');
  }
  if (getVaultStatus() === 'locked') {
    throw new Error('Vault is locked — unlock before restoring');
  }
  const plaintext = await decryptString(envelope.ciphertext);
  const parsed = JSON.parse(plaintext) as { state?: unknown };
  if (!parsed || typeof parsed !== 'object' || !('state' in parsed)) {
    throw new Error('Backup payload is missing state');
  }
  return parsed.state;
}

/** Download encrypted backup as a .ogbak.json file. */
export async function downloadEncryptedBackup(
  state: unknown,
  label?: string
): Promise<void> {
  const envelope = await createEncryptedBackup(state, label);
  const blob = new Blob([JSON.stringify(envelope, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `omni-grid-encrypted-${new Date().toISOString().slice(0, 10)}.ogbak.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Upload encrypted backup to a user-configured HTTPS endpoint. */
export async function uploadToCloud(
  state: unknown,
  cfg?: CloudEndpointConfig | null,
  label?: string
): Promise<{ ok: boolean; error?: string }> {
  const endpoint = cfg ?? loadCloudEndpoint();
  if (!endpoint?.url) {
    return { ok: false, error: 'No cloud endpoint configured' };
  }
  if (!endpoint.url.startsWith('https://')) {
    return { ok: false, error: 'Cloud endpoint must use HTTPS' };
  }
  try {
    const envelope = await createEncryptedBackup(state, label);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (endpoint.authHeader) {
      headers['Authorization'] = endpoint.authHeader;
    }
    const res = await fetch(endpoint.url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(envelope),
    });
    if (!res.ok) {
      return { ok: false, error: `Upload failed: HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Upload failed',
    };
  }
}

/** Download encrypted backup from a user-configured HTTPS endpoint and restore state. */
export async function downloadFromCloud(
  cfg?: CloudEndpointConfig | null
): Promise<{ ok: boolean; state?: unknown; error?: string }> {
  const endpoint = cfg ?? loadCloudEndpoint();
  if (!endpoint?.url) {
    return { ok: false, error: 'No cloud endpoint configured' };
  }
  if (!endpoint.url.startsWith('https://')) {
    return { ok: false, error: 'Cloud endpoint must use HTTPS' };
  }
  try {
    const headers: Record<string, string> = {};
    if (endpoint.authHeader) {
      headers['Authorization'] = endpoint.authHeader;
    }
    const res = await fetch(endpoint.url, { method: 'GET', headers });
    if (!res.ok) {
      return { ok: false, error: `Download failed: HTTP ${res.status}` };
    }
    const envelope = (await res.json()) as EncryptedBackupEnvelope;
    const state = await restoreEncryptedBackup(envelope);
    return { ok: true, state };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Download failed',
    };
  }
}

/** Parse a File (from input or drop) into an encrypted envelope. */
export async function parseBackupFile(file: File): Promise<EncryptedBackupEnvelope> {
  const text = await file.text();
  const data = JSON.parse(text) as EncryptedBackupEnvelope;
  if (data.magic !== BACKUP_MAGIC) {
    throw new Error('File is not an Omni-Grid encrypted backup');
  }
  return data;
}
