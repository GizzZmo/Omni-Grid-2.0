import React, { useState } from 'react';
import { Lock, Unlock, FileKey, AlertTriangle } from 'lucide-react';

// ── AES-GCM helpers (PBKDF2 key derivation) ──────────────────────────────────

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptContent(plaintext: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  const combined = new Uint8Array(salt.byteLength + iv.byteLength + cipherBuffer.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.byteLength);
  combined.set(new Uint8Array(cipherBuffer), salt.byteLength + iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

async function decryptContent(cipherB64: string, passphrase: string): Promise<string> {
  const combined = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0));
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);
  const key = await deriveKey(passphrase, salt);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

// ─────────────────────────────────────────────────────────────────────────────

export const CipherPad: React.FC = () => {
  const [locked, setLocked] = useState(true);
  const [key, setKey] = useState('');
  const [content, setContent] = useState('');
  // Stores the AES-GCM ciphertext while the pad is locked
  const [vault, setVault] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLock = async () => {
    if (!key) return;
    if (!content.trim()) {
      // Nothing to encrypt — just lock visually
      setVault('');
      setLocked(true);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const encrypted = await encryptContent(content, key);
      setVault(encrypted);
      setContent('');
      setLocked(true);
    } catch (_e) {
      setError('Encryption failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleUnlock = async () => {
    if (!key) return;
    setError('');
    if (!vault) {
      // No stored ciphertext yet — just open the editor
      setLocked(false);
      return;
    }
    setBusy(true);
    try {
      const plaintext = await decryptContent(vault, key);
      setContent(plaintext);
      setVault('');
      setLocked(false);
    } catch (_e) {
      setError('Wrong key or corrupt data.');
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = () => {
    if (!key) return;
    if (locked) {
      handleUnlock();
    } else {
      handleLock();
    }
  };

  return (
    <div className="h-full flex flex-col gap-2 relative">
      <div className="flex gap-2 items-center bg-slate-900 p-2 rounded border border-slate-800">
        {locked ? (
          <Lock size={14} className="text-red-400" />
        ) : (
          <Unlock size={14} className="text-emerald-400" />
        )}
        <input
          type="password"
          value={key}
          onChange={e => {
            setKey(e.target.value);
            setError('');
          }}
          disabled={!locked}
          placeholder="Session Encryption Key"
          className="flex-1 bg-transparent text-xs text-white outline-none placeholder-slate-600"
        />
        <button
          onClick={handleToggle}
          disabled={busy || !key}
          className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300 hover:text-white disabled:opacity-40"
        >
          {busy ? '…' : locked ? 'UNLOCK' : 'LOCK'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-1 text-[10px] text-red-400 bg-red-950/30 border border-red-900/50 rounded px-2 py-1">
          <AlertTriangle size={10} /> {error}
        </div>
      )}

      {locked ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-2 border border-dashed border-slate-800 rounded bg-slate-900/20">
          <FileKey size={32} />
          <span className="text-xs">
            {vault ? 'Content Encrypted (AES-GCM)' : 'No content — unlock to write'}
          </span>
        </div>
      ) : (
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Type sensitive notes here. They will be encrypted with AES-GCM when locked."
          className="flex-1 bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono text-emerald-300 resize-none focus:outline-none focus:border-emerald-500"
        />
      )}
    </div>
  );
};
