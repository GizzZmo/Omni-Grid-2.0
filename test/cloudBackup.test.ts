import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../services/secureVault', () => {
  let status: 'unprotected' | 'locked' | 'unlocked' = 'unlocked';
  const store = new Map<string, string>();
  return {
    getVaultStatus: () => status,
    encryptString: async (plaintext: string) => {
      const id = `enc-${store.size}`;
      store.set(id, plaintext);
      return `v1.mock.${id}`;
    },
    decryptString: async (blob: string) => {
      const id = blob.replace('v1.mock.', '');
      const v = store.get(id);
      if (!v) throw new Error('decrypt failed');
      return v;
    },
    __setStatus: (s: typeof status) => {
      status = s;
    },
  };
});

import {
  createEncryptedBackup,
  restoreEncryptedBackup,
  BACKUP_MAGIC,
  saveCloudEndpoint,
  loadCloudEndpoint,
  uploadToCloud,
  downloadFromCloud,
} from '../services/cloudBackup';
import * as vault from '../services/secureVault';

describe('cloudBackup', () => {
  beforeEach(() => {
    localStorage.clear();
    (vault as any).__setStatus?.('unlocked');
  });

  it('creates and restores an encrypted envelope round-trip', async () => {
    const state = { visibleWidgets: ['SYSTEM'], theme: { name: 'test' } };
    const envelope = await createEncryptedBackup(state, 'unit');
    expect(envelope.magic).toBe(BACKUP_MAGIC);
    expect(envelope.version).toBe(2);
    expect(envelope.ciphertext).toBeTruthy();
    expect(envelope.label).toBe('unit');

    const restored = await restoreEncryptedBackup(envelope);
    expect(restored).toEqual(state);
  });

  it('rejects restore when vault is locked', async () => {
    const state = { a: 1 };
    const envelope = await createEncryptedBackup(state);
    (vault as any).__setStatus?.('locked');
    await expect(restoreEncryptedBackup(envelope)).rejects.toThrow(/locked/i);
  });

  it('rejects create when vault is locked', async () => {
    (vault as any).__setStatus?.('locked');
    await expect(createEncryptedBackup({ x: 1 })).rejects.toThrow(/locked/i);
  });

  it('persists and clears cloud endpoint config', () => {
    saveCloudEndpoint({ url: 'https://example.com/backup', authHeader: 'Bearer x' });
    expect(loadCloudEndpoint()).toEqual({
      url: 'https://example.com/backup',
      authHeader: 'Bearer x',
    });
    saveCloudEndpoint(null);
    expect(loadCloudEndpoint()).toBeNull();
  });

  it('uploadToCloud requires https endpoint', async () => {
    const result = await uploadToCloud({ a: 1 }, { url: 'http://insecure.example/b' });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/HTTPS/i);
  });

  it('uploadToCloud succeeds with mocked fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const result = await uploadToCloud(
      { widgets: [] },
      { url: 'https://backup.example/omni.json' }
    );
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backup.example/omni.json',
      expect.objectContaining({ method: 'PUT' })
    );
    vi.unstubAllGlobals();
  });

  it('downloadFromCloud restores state from endpoint', async () => {
    const state = { visibleWidgets: ['HELP'] };
    const envelope = await createEncryptedBackup(state);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => envelope,
    });
    vi.stubGlobal('fetch', fetchMock);
    const result = await downloadFromCloud({ url: 'https://backup.example/omni.json' });
    expect(result.ok).toBe(true);
    expect(result.state).toEqual(state);
    vi.unstubAllGlobals();
  });
});
