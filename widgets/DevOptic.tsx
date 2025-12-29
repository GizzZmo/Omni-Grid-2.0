import React, { useState } from 'react';
import { Eye, Shield, Search } from 'lucide-react';

export const DevOptic: React.FC = () => {
  const [tool, setTool] = useState<'JWT' | 'REGEX'>('JWT');

  // JWT State
  const [jwtInput, setJwtInput] = useState('');
  const [jwtOutput, setJwtOutput] = useState<string | null>(null);

  // Regex State
  const [regexPattern, setRegexPattern] = useState('');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexString, setRegexString] = useState('');

  const handleJwtDecode = (token: string) => {
    setJwtInput(token);
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid Token Format');
      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64);
      setJwtOutput(JSON.stringify(JSON.parse(decoded), null, 2));
    } catch (e) {
      setJwtOutput(null);
    }
  };

  const runRegex = () => {
    if (!regexPattern) return [];
    try {
      const regex = new RegExp(regexPattern, regexFlags);
      const matches = [...regexString.matchAll(regex)];
      return matches.map(m => m[0]);
    } catch (e) {
      return ['Invalid Regex'];
    }
  };

  const matches = tool === 'REGEX' ? runRegex() : [];

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex gap-2 bg-slate-900 rounded-lg p-1">
        <button
          onClick={() => setTool('JWT')}
          className={`flex-1 py-1 flex items-center justify-center gap-1 text-xs font-medium rounded transition-colors ${tool === 'JWT' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <Shield size={10} /> JWT
        </button>
        <button
          onClick={() => setTool('REGEX')}
          className={`flex-1 py-1 flex items-center justify-center gap-1 text-xs font-medium rounded transition-colors ${tool === 'REGEX' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <Search size={10} /> Regex
        </button>
      </div>

      {tool === 'JWT' ? (
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300 placeholder-slate-700 focus:outline-none focus:border-orange-500"
            placeholder="Paste JWT here (ey...)"
            value={jwtInput}
            onChange={e => handleJwtDecode(e.target.value)}
          />
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded p-2 overflow-auto custom-scrollbar">
            {jwtOutput ? (
              <pre className="text-[10px] text-orange-400 font-mono whitespace-pre-wrap break-all">
                {jwtOutput}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-700 text-xs italic">
                Waiting for token...
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-[2] bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300 placeholder-slate-700 focus:outline-none focus:border-orange-500"
              placeholder="Regex Pattern"
              value={regexPattern}
              onChange={e => setRegexPattern(e.target.value)}
            />
            <input
              type="text"
              className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300 placeholder-slate-700 focus:outline-none focus:border-orange-500"
              placeholder="Flags (g, i)"
              value={regexFlags}
              onChange={e => setRegexFlags(e.target.value)}
            />
          </div>
          <textarea
            className="h-20 bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300 placeholder-slate-700 resize-none focus:outline-none focus:border-orange-500"
            placeholder="Test String"
            value={regexString}
            onChange={e => setRegexString(e.target.value)}
          />
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded p-2 overflow-auto custom-scrollbar">
            <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">
              Matches ({matches.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {matches.map((m, i) => (
                <span
                  key={i}
                  className="bg-orange-900/40 text-orange-300 px-1 rounded text-xs font-mono border border-orange-800/50"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
