import React, { useState } from 'react';
import {
  Lock,
  Fingerprint,
  Hash,
  Copy,
  Check,
  ShieldCheck,
  ShieldOff,
  KeyRound,
} from 'lucide-react';

// ── AES-GCM helpers ──────────────────────────────────────────────────────────

async function deriveKey(passphrase: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
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

async function aesGcmEncrypt(plaintext: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16) as Uint8Array<ArrayBuffer>);
  const iv = crypto.getRandomValues(new Uint8Array(12) as Uint8Array<ArrayBuffer>);
  const key = await deriveKey(passphrase, salt);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  // Pack: salt(16) ‖ iv(12) ‖ ciphertext
  const combined = new Uint8Array(salt.byteLength + iv.byteLength + cipherBuffer.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.byteLength);
  combined.set(new Uint8Array(cipherBuffer), salt.byteLength + iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

async function aesGcmDecrypt(cipherB64: string, passphrase: string): Promise<string> {
  const combined = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0));
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);
  const key = await deriveKey(passphrase, salt);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

// ─────────────────────────────────────────────────────────────────────────────

export const CipherVault: React.FC = () => {
  const [mode, setMode] = useState<'GENERATE' | 'HASH' | 'ENCRYPT'>('GENERATE');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [hashType, setHashType] = useState('SHA-256');
  const [copied, setCopied] = useState(false);

  // AES-GCM state
  const [encryptMode, setEncryptMode] = useState<'ENCRYPT' | 'DECRYPT'>('ENCRYPT');
  const [passphrase, setPassphrase] = useState('');
  const [encryptInput, setEncryptInput] = useState('');
  const [encryptOutput, setEncryptOutput] = useState('');
  const [encryptError, setEncryptError] = useState('');
  const [encryptLoading, setEncryptLoading] = useState(false);
  const [encryptCopied, setEncryptCopied] = useState(false);

  const generateUUID = () => {
    setOutput(crypto.randomUUID());
  };

  const generateNanoid = () => {
    const urlAlphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
    let id = '';
    const bytes = crypto.getRandomValues(new Uint8Array(21));
    for (let i = 0; i < 21; i++) {
      id += urlAlphabet[bytes[i] % 64];
    }
    setOutput(id);
  };

  const handleHash = async (text: string) => {
    setInput(text);
    if (!text) {
      setOutput('');
      return;
    }

    if (hashType === 'Base64') {
      setOutput(btoa(text));
      return;
    }

    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest(hashType, msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    setOutput(hashArray.map(b => b.toString(16).padStart(2, '0')).join(''));
  };

  const handleEncryptAction = async () => {
    if (!encryptInput.trim()) return;
    if (!passphrase.trim()) {
      setEncryptError('Passphrase is required.');
      return;
    }
    setEncryptLoading(true);
    setEncryptError('');
    setEncryptOutput('');
    try {
      if (encryptMode === 'ENCRYPT') {
        const result = await aesGcmEncrypt(encryptInput, passphrase);
        setEncryptOutput(result);
      } else {
        const result = await aesGcmDecrypt(encryptInput, passphrase);
        setEncryptOutput(result);
      }
    } catch (_e) {
      setEncryptError(
        encryptMode === 'DECRYPT'
          ? 'Decryption failed — wrong passphrase or corrupt ciphertext.'
          : 'Encryption failed.'
      );
    } finally {
      setEncryptLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEncryptCopy = () => {
    navigator.clipboard.writeText(encryptOutput);
    setEncryptCopied(true);
    setTimeout(() => setEncryptCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Mode tabs */}
      <div className="flex bg-slate-900 p-1 rounded-lg">
        <button
          onClick={() => setMode('GENERATE')}
          className={`flex-1 py-1 text-xs font-bold rounded transition-colors ${mode === 'GENERATE' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Generate
        </button>
        <button
          onClick={() => setMode('HASH')}
          className={`flex-1 py-1 text-xs font-bold rounded transition-colors ${mode === 'HASH' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Transform
        </button>
        <button
          onClick={() => setMode('ENCRYPT')}
          className={`flex-1 py-1 text-xs font-bold rounded transition-colors ${mode === 'ENCRYPT' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          AES-GCM
        </button>
      </div>

      {mode === 'GENERATE' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="flex gap-2 w-full">
            <button
              onClick={generateUUID}
              className="flex-1 bg-slate-800 hover:bg-emerald-900/30 border border-slate-700 hover:border-emerald-500/50 p-3 rounded flex flex-col items-center gap-2 transition-all group"
            >
              <Fingerprint className="text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-mono text-slate-300">UUID v4</span>
            </button>
            <button
              onClick={generateNanoid}
              className="flex-1 bg-slate-800 hover:bg-emerald-900/30 border border-slate-700 hover:border-emerald-500/50 p-3 rounded flex flex-col items-center gap-2 transition-all group"
            >
              <Hash className="text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-mono text-slate-300">Nano ID</span>
            </button>
          </div>
        </div>
      )}

      {mode === 'HASH' && (
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex gap-2">
            <select
              value={hashType}
              onChange={e => {
                setHashType(e.target.value);
                handleHash(input);
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded p-1 flex-1 outline-none"
            >
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-1">SHA-1</option>
              <option value="SHA-384">SHA-384</option>
              <option value="SHA-512">SHA-512</option>
              <option value="Base64">Base64 Encode</option>
            </select>
          </div>
          <textarea
            value={input}
            onChange={e => handleHash(e.target.value)}
            placeholder="Input text to hash..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono resize-none focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {mode === 'ENCRYPT' && (
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {/* Encrypt / Decrypt sub-toggle */}
          <div className="flex bg-slate-950 p-1 rounded border border-slate-800 gap-1">
            <button
              onClick={() => {
                setEncryptMode('ENCRYPT');
                setEncryptOutput('');
                setEncryptError('');
              }}
              className={`flex-1 py-1 flex items-center justify-center gap-1 text-xs font-bold rounded transition-colors ${encryptMode === 'ENCRYPT' ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ShieldCheck size={10} /> Encrypt
            </button>
            <button
              onClick={() => {
                setEncryptMode('DECRYPT');
                setEncryptOutput('');
                setEncryptError('');
              }}
              className={`flex-1 py-1 flex items-center justify-center gap-1 text-xs font-bold rounded transition-colors ${encryptMode === 'DECRYPT' ? 'bg-amber-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ShieldOff size={10} /> Decrypt
            </button>
          </div>

          {/* Passphrase */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded px-2 py-1">
            <KeyRound size={12} className="text-slate-500 shrink-0" />
            <input
              type="password"
              value={passphrase}
              onChange={e => setPassphrase(e.target.value)}
              placeholder="Passphrase (used for key derivation)"
              className="flex-1 bg-transparent text-xs text-slate-300 outline-none placeholder-slate-600"
            />
          </div>

          {/* Input */}
          <textarea
            value={encryptInput}
            onChange={e => setEncryptInput(e.target.value)}
            placeholder={
              encryptMode === 'ENCRYPT'
                ? 'Plaintext to encrypt...'
                : 'Base64 ciphertext to decrypt...'
            }
            className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono resize-none focus:outline-none focus:border-emerald-500 min-h-[60px]"
          />

          <button
            onClick={handleEncryptAction}
            disabled={encryptLoading || !encryptInput.trim()}
            className="py-1.5 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded transition-colors"
          >
            {encryptLoading
              ? 'Processing…'
              : encryptMode === 'ENCRYPT'
                ? 'Encrypt (AES-GCM)'
                : 'Decrypt (AES-GCM)'}
          </button>

          {encryptError && (
            <div className="text-[10px] text-red-400 font-mono bg-red-950/30 border border-red-900/50 rounded px-2 py-1">
              {encryptError}
            </div>
          )}

          {/* Output */}
          {encryptOutput && (
            <div className="relative">
              <div className="text-[10px] uppercase text-slate-600 font-bold mb-1 pl-1">Output</div>
              <div className="bg-black/30 border border-slate-800 rounded p-3 font-mono text-xs text-emerald-400 break-all max-h-[80px] overflow-y-auto custom-scrollbar">
                {encryptOutput}
              </div>
              <button
                onClick={handleEncryptCopy}
                className="absolute top-6 right-2 p-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {encryptCopied ? (
                  <Check size={12} className="text-emerald-500" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Output Area — shown for GENERATE and HASH modes */}
      {mode !== 'ENCRYPT' && (
        <div className="relative">
          <div className="text-[10px] uppercase text-slate-600 font-bold mb-1 pl-1">
            Output Result
          </div>
          <div className="bg-black/30 border border-slate-800 rounded p-3 font-mono text-xs text-emerald-400 break-all min-h-[48px] flex items-center">
            {output || <span className="text-slate-700 italic">...</span>}
          </div>
          {output && (
            <button
              onClick={handleCopy}
              className="absolute top-6 right-2 p-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
