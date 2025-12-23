import React, { useState } from 'react';
import { Lock, Fingerprint, Hash, Copy, Check, RefreshCw } from 'lucide-react';

export const CipherVault: React.FC = () => {
  const [mode, setMode] = useState<'GENERATE' | 'HASH'>('GENERATE');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [hashType, setHashType] = useState('SHA-256');
  const [copied, setCopied] = useState(false);

  const generateUUID = () => {
    setOutput(crypto.randomUUID());
  };

  const generateNanoid = () => {
    // Simple custom implementation of nanoid-like structure
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
    if (!text) { setOutput(''); return; }

    if (hashType === 'Base64') {
        setOutput(btoa(text));
        return;
    }
    
    // Web Crypto API for local hashing
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest(hashType, msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setOutput(hashHex);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-3">
        {/* Toggle */}
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
        </div>

        {mode === 'GENERATE' ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="flex gap-2 w-full">
                    <button onClick={generateUUID} className="flex-1 bg-slate-800 hover:bg-emerald-900/30 border border-slate-700 hover:border-emerald-500/50 p-3 rounded flex flex-col items-center gap-2 transition-all group">
                        <Fingerprint className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-mono text-slate-300">UUID v4</span>
                    </button>
                    <button onClick={generateNanoid} className="flex-1 bg-slate-800 hover:bg-emerald-900/30 border border-slate-700 hover:border-emerald-500/50 p-3 rounded flex flex-col items-center gap-2 transition-all group">
                        <Hash className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-mono text-slate-300">Nano ID</span>
                    </button>
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col gap-2">
                 <div className="flex gap-2">
                    <select 
                        value={hashType} 
                        onChange={(e) => { setHashType(e.target.value); handleHash(input); }}
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
                    onChange={(e) => handleHash(e.target.value)}
                    placeholder="Input text to hash..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono resize-none focus:outline-none focus:border-emerald-500"
                 />
            </div>
        )}

        {/* Output Area */}
        <div className="relative">
             <div className="text-[10px] uppercase text-slate-600 font-bold mb-1 pl-1">Output Result</div>
             <div className="bg-black/30 border border-slate-800 rounded p-3 font-mono text-xs text-emerald-400 break-all min-h-[48px] flex items-center">
                 {output || <span className="text-slate-700 italic">...</span>}
             </div>
             {output && (
                <button 
                    onClick={handleCopy} 
                    className="absolute top-6 right-2 p-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 transition-colors"
                >
                    {copied ? <Check size={12} className="text-emerald-500"/> : <Copy size={12} />}
                </button>
             )}
        </div>
    </div>
  );
};