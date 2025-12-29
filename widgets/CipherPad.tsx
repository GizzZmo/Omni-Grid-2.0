import React, { useState } from 'react';
import { Lock, Unlock, Save, FileKey } from 'lucide-react';

export const CipherPad: React.FC = () => {
  const [locked, setLocked] = useState(true);
  const [key, setKey] = useState('');
  const [content, setContent] = useState('');

  const toggleLock = () => {
    if (!key) return alert('Set a session key first.');
    setLocked(!locked);
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
          onChange={e => setKey(e.target.value)}
          disabled={!locked}
          placeholder="Session Encryption Key"
          className="flex-1 bg-transparent text-xs text-white outline-none placeholder-slate-600"
        />
        <button
          onClick={toggleLock}
          className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300 hover:text-white"
        >
          {locked ? 'UNLOCK' : 'LOCK'}
        </button>
      </div>

      {locked ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-2 border border-dashed border-slate-800 rounded bg-slate-900/20">
          <FileKey size={32} />
          <span className="text-xs">Content Encrypted (AES-GCM)</span>
        </div>
      ) : (
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Type sensitive notes here. They will be encrypted in memory when locked."
          className="flex-1 bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono text-emerald-300 resize-none focus:outline-none focus:border-emerald-500"
        />
      )}
    </div>
  );
};
