import React, { useState } from 'react';
import { Shield, Search, Copy, Check, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Human-readable labels for well-known JWT registered claims (RFC 7519)
const CLAIM_LABELS: Record<string, string> = {
  iss: 'Issuer',
  sub: 'Subject',
  aud: 'Audience',
  exp: 'Expires',
  nbf: 'Not Before',
  iat: 'Issued At',
  jti: 'JWT ID',
};

const TIME_CLAIMS = new Set(['exp', 'nbf', 'iat']);

function formatClaimValue(key: string, value: unknown): string {
  if (TIME_CLAIMS.has(key) && typeof value === 'number') {
    return new Date(value * 1000).toLocaleString();
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function decodeBase64Url(segment: string): unknown {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return JSON.parse(atob(padded));
}

interface JwtData {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  isExpired: boolean;
}

export const DevOptic: React.FC = () => {
  const [tool, setTool] = useState<'JWT' | 'REGEX'>('JWT');

  // JWT State
  const [jwtInput, setJwtInput] = useState('');
  const [jwtData, setJwtData] = useState<JwtData | null>(null);
  const [jwtError, setJwtError] = useState('');
  const [jwtCopied, setJwtCopied] = useState<'header' | 'payload' | null>(null);

  // Regex State
  const [regexPattern, setRegexPattern] = useState('');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexString, setRegexString] = useState('');

  const handleJwtDecode = (token: string) => {
    setJwtInput(token);
    setJwtError('');
    setJwtData(null);

    const trimmed = token.trim();
    if (!trimmed) return;

    try {
      const parts = trimmed.split('.');
      if (parts.length !== 3) throw new Error('Token must have exactly 3 dot-separated parts.');

      const header = decodeBase64Url(parts[0]) as Record<string, unknown>;
      const payload = decodeBase64Url(parts[1]) as Record<string, unknown>;

      const exp = typeof payload.exp === 'number' ? payload.exp : null;
      const isExpired = exp !== null && exp * 1000 < Date.now();

      setJwtData({ header, payload, isExpired });
    } catch (_e) {
      setJwtError((_e as Error).message || 'Invalid token format.');
    }
  };

  const copySection = (section: 'header' | 'payload') => {
    if (!jwtData) return;
    navigator.clipboard.writeText(JSON.stringify(jwtData[section], null, 2));
    setJwtCopied(section);
    setTimeout(() => setJwtCopied(null), 2000);
  };

  const runRegex = () => {
    if (!regexPattern) return [];
    try {
      const regex = new RegExp(regexPattern, regexFlags);
      const matches = [...regexString.matchAll(regex)];
      return matches.map(m => m[0]);
    } catch {
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
        <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-y-auto custom-scrollbar">
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300 placeholder-slate-700 focus:outline-none focus:border-orange-500"
            placeholder="Paste JWT here (ey…)"
            value={jwtInput}
            onChange={e => handleJwtDecode(e.target.value)}
          />

          {jwtError && (
            <div className="flex items-center gap-1 text-[10px] text-red-400 bg-red-950/30 border border-red-900/50 rounded px-2 py-1">
              <AlertTriangle size={10} /> {jwtError}
            </div>
          )}

          {jwtData && (
            <>
              {/* Token status badge */}
              <div
                className={`flex items-center gap-1 text-[10px] rounded px-2 py-1 font-mono ${jwtData.isExpired ? 'bg-red-950/40 border border-red-800/50 text-red-400' : 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-400'}`}
              >
                {jwtData.isExpired ? (
                  <>
                    <AlertTriangle size={10} /> TOKEN EXPIRED
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={10} /> TOKEN VALID (signature not verified)
                  </>
                )}
              </div>

              {/* Header section */}
              <div className="bg-slate-900 border border-slate-800 rounded">
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-sky-400">Header</span>
                  <button
                    onClick={() => copySection('header')}
                    className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label="Copy header"
                  >
                    {jwtCopied === 'header' ? (
                      <Check size={10} className="text-emerald-400" />
                    ) : (
                      <Copy size={10} />
                    )}
                  </button>
                </div>
                <table className="w-full text-[10px] font-mono">
                  <tbody>
                    {Object.entries(jwtData.header).map(([k, v]) => (
                      <tr key={k} className="border-b border-slate-800/50 last:border-0">
                        <td className="px-2 py-1 text-slate-500 whitespace-nowrap">{k}</td>
                        <td className="px-2 py-1 text-sky-300 break-all">{String(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payload section */}
              <div className="bg-slate-900 border border-slate-800 rounded">
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-orange-400">Payload</span>
                  <button
                    onClick={() => copySection('payload')}
                    className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label="Copy payload"
                  >
                    {jwtCopied === 'payload' ? (
                      <Check size={10} className="text-emerald-400" />
                    ) : (
                      <Copy size={10} />
                    )}
                  </button>
                </div>
                <table className="w-full text-[10px] font-mono">
                  <tbody>
                    {Object.entries(jwtData.payload).map(([k, v]) => (
                      <tr key={k} className="border-b border-slate-800/50 last:border-0">
                        <td className="px-2 py-1 whitespace-nowrap">
                          <span className="text-slate-500">{k}</span>
                          {CLAIM_LABELS[k] && (
                            <span className="ml-1 text-slate-700">({CLAIM_LABELS[k]})</span>
                          )}
                        </td>
                        <td
                          className={`px-2 py-1 break-all ${k === 'exp' && jwtData.isExpired ? 'text-red-400' : 'text-orange-300'}`}
                        >
                          {formatClaimValue(k, v)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!jwtData && !jwtError && (
            <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
              Waiting for token…
            </div>
          )}
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
