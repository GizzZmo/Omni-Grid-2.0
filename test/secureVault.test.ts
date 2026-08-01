import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSecretsToVault,
  loadSecretsFromVault,
  clearSecretsVault,
  encryptString,
  decryptString,
  VAULT_KEYS,
} from '../services/secureVault';

describe('secureVault', () => {
  beforeEach(() => {
    clearSecretsVault();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(VAULT_KEYS.FALLBACK_MATERIAL);
    }
  });

  it('round-trips secrets through AES-256-GCM vault', async () => {
    const secrets = {
      geminiApiKey: 'gemini-test-key-abc',
      e2bApiKey: 'e2b-test-key-xyz',
      gitToken: 'ghp_test_token',
    };

    await saveSecretsToVault(secrets);
    const loaded = await loadSecretsFromVault();

    expect(loaded).toEqual(secrets);
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

  it('clearSecretsVault removes ciphertext', async () => {
    await saveSecretsToVault({
      geminiApiKey: 'k',
      e2bApiKey: '',
      gitToken: '',
    });
    clearSecretsVault();
    expect(localStorage.getItem(VAULT_KEYS.STORAGE)).toBeNull();
  });

  it('encryptString / decryptString round-trip', async () => {
    const cipher = await encryptString('hello quantum');
    expect(cipher).not.toContain('hello quantum');
    const plain = await decryptString(cipher);
    expect(plain).toBe('hello quantum');
  });
});
