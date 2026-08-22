import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSecretsToVault,
  loadSecretsFromVault,
  clearSecretsVault,
  encryptString,
  decryptString,
  setVaultPassphrase,
  unlockVault,
  lockVault,
  removeVaultPassphrase,
  changeVaultPassphrase,
  hasVaultPassphrase,
  getVaultStatus,
  VAULT_KEYS,
} from '../services/secureVault';

const sample = {
  geminiApiKey: 'gemini-test-key-abc',
  e2bApiKey: 'e2b-test-key-xyz',
  gitToken: 'ghp_test_token',
};

describe('secureVault', () => {
  beforeEach(() => {
    clearSecretsVault();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(VAULT_KEYS.FALLBACK_MATERIAL);
      localStorage.removeItem(VAULT_KEYS.META);
      localStorage.removeItem(VAULT_KEYS.STORAGE);
    }
  });

  it('round-trips secrets through AES-256-GCM vault (unprotected)', async () => {
    await saveSecretsToVault(sample);
    const loaded = await loadSecretsFromVault();
    expect(loaded).toEqual(sample);
  });

  it('does not store plaintext API keys in localStorage', async () => {
    await saveSecretsToVault({
      geminiApiKey: 'super-secret-gemini',
      e2bApiKey: 'super-secret-e2b',
      gitToken: 'super-secret-git',
    });

    const blob = localStorage.getItem(VAULT_KEYS.STORAGE);
    expect(blob).toBeTruthy();
    expect(blob).not.toContain('super-secret-gemini');
    expect(blob).not.toContain('super-secret-e2b');
    expect(blob).not.toContain('super-secret-git');
    expect(blob!.startsWith('v1.')).toBe(true);
  });

  it('returns empty secrets when vault is empty', async () => {
    const loaded = await loadSecretsFromVault();
    expect(loaded).toEqual({
      geminiApiKey: '',
      e2bApiKey: '',
      gitToken: '',
    });
  });

  it('clearSecretsVault removes ciphertext and meta', async () => {
    await saveSecretsToVault({ geminiApiKey: 'k', e2bApiKey: '', gitToken: '' });
    await setVaultPassphrase('test-pass-123');
    clearSecretsVault();
    expect(localStorage.getItem(VAULT_KEYS.STORAGE)).toBeNull();
    expect(localStorage.getItem(VAULT_KEYS.META)).toBeNull();
    expect(hasVaultPassphrase()).toBe(false);
  });

  it('encryptString / decryptString round-trip', async () => {
    const cipher = await encryptString('hello quantum');
    expect(cipher).not.toContain('hello quantum');
    const plain = await decryptString(cipher);
    expect(plain).toBe('hello quantum');
  });

  describe('passphrase protection', () => {
    it('setVaultPassphrase moves status to unlocked with meta present', async () => {
      await saveSecretsToVault(sample);
      expect(getVaultStatus()).toBe('unprotected');

      await setVaultPassphrase('correct-horse-battery');

      expect(hasVaultPassphrase()).toBe(true);
      expect(getVaultStatus()).toBe('unlocked');
      expect(localStorage.getItem(VAULT_KEYS.META)).toBeTruthy();
      // Still readable while unlocked
      expect(await loadSecretsFromVault()).toEqual(sample);
    });

    it('lockVault hides secrets until unlock', async () => {
      await saveSecretsToVault(sample);
      await setVaultPassphrase('correct-horse-battery');
      lockVault();

      expect(getVaultStatus()).toBe('locked');
      expect(await loadSecretsFromVault()).toEqual({
        geminiApiKey: '',
        e2bApiKey: '',
        gitToken: '',
      });
    });

    it('unlockVault with correct passphrase restores secrets', async () => {
      await saveSecretsToVault(sample);
      await setVaultPassphrase('correct-horse-battery');
      lockVault();

      const ok = await unlockVault('correct-horse-battery');
      expect(ok).toBe(true);
      expect(getVaultStatus()).toBe('unlocked');
      expect(await loadSecretsFromVault()).toEqual(sample);
    });

    it('unlockVault with wrong passphrase fails', async () => {
      await saveSecretsToVault(sample);
      await setVaultPassphrase('correct-horse-battery');
      lockVault();

      const ok = await unlockVault('wrong-password');
      expect(ok).toBe(false);
      expect(getVaultStatus()).toBe('locked');
    });

    it('rejects short passphrases', async () => {
      await expect(setVaultPassphrase('short')).rejects.toThrow(/at least 8/);
    });

    it('removeVaultPassphrase restores unprotected auto-load', async () => {
      await saveSecretsToVault(sample);
      await setVaultPassphrase('correct-horse-battery');
      lockVault();

      const ok = await removeVaultPassphrase('correct-horse-battery');
      expect(ok).toBe(true);
      expect(hasVaultPassphrase()).toBe(false);
      expect(getVaultStatus()).toBe('unprotected');
      expect(await loadSecretsFromVault()).toEqual(sample);
    });

    it('changeVaultPassphrase rotates the wrap', async () => {
      await saveSecretsToVault(sample);
      await setVaultPassphrase('old-passphrase-1');
      lockVault();

      const ok = await changeVaultPassphrase('old-passphrase-1', 'new-passphrase-2');
      expect(ok).toBe(true);

      lockVault();
      expect(await unlockVault('old-passphrase-1')).toBe(false);
      expect(await unlockVault('new-passphrase-2')).toBe(true);
      expect(await loadSecretsFromVault()).toEqual(sample);
    });

    it('does not persist secrets while locked', async () => {
      await saveSecretsToVault(sample);
      await setVaultPassphrase('correct-horse-battery');
      lockVault();

      await saveSecretsToVault({
        geminiApiKey: 'should-not-write',
        e2bApiKey: '',
        gitToken: '',
      });

      // Unlock and confirm old secrets still there (locked write was no-op)
      await unlockVault('correct-horse-battery');
      expect(await loadSecretsFromVault()).toEqual(sample);
    });
  });
});
