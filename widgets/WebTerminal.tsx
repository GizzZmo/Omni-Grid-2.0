import React, { useState, useRef, useEffect } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { evaluateMathExpression } from '../services/safeExpression';

const MAX_HISTORY = 200;
const WELCOME_HISTORY: Array<{ type: 'in' | 'out' | 'err'; content: string }> = [
  { type: 'out', content: 'Omni-Grid Secure Runtime v2.0.0' },
  { type: 'out', content: 'Commands: help, calc <expr>, echo <text>, json <json>, time, clear' },
  { type: 'out', content: 'Human-in-the-loop guard is enabled.' },
];

export const WebTerminal: React.FC = () => {
  const [history, setHistory] = useState<Array<{ type: 'in' | 'out' | 'err'; content: string }>>(
    WELCOME_HISTORY
  );
  const [input, setInput] = useState('');
  const [requireConfirm, setRequireConfirm] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const appendHistory = (entry: { type: 'in' | 'out' | 'err'; content: string }) => {
    setHistory(prev => [...prev, entry].slice(-MAX_HISTORY));
  };

  const executeCommand = (command: string): { type: 'out' | 'err'; content: string } => {
    const [rawName, ...rest] = command.trim().split(/\s+/);
    const name = rawName.toLowerCase();
    const payload = rest.join(' ').trim();

    switch (name) {
      case 'help':
        return {
          type: 'out',
          content:
            'help | calc <expr> | echo <text> | json <json> | time | clear\nExample: calc (2+2)^3',
        };
      case 'calc': {
        if (!payload) return { type: 'err', content: 'Usage: calc <expression>' };
        const result = evaluateMathExpression(payload);
        return { type: 'out', content: String(Number.isInteger(result) ? result : +result.toFixed(8)) };
      }
      case 'echo':
        return { type: 'out', content: payload || '' };
      case 'json': {
        if (!payload) return { type: 'err', content: 'Usage: json <json-string>' };
        const parsed = JSON.parse(payload);
        return { type: 'out', content: JSON.stringify(parsed, null, 2) };
      }
      case 'time':
        return { type: 'out', content: new Date().toLocaleString() };
      case 'clear':
        setHistory(WELCOME_HISTORY);
        return { type: 'out', content: 'History reset.' };
      default:
        return {
          type: 'err',
          content: `Unknown command: "${name}". Run "help" for available commands.`,
        };
    }
  };

  const execute = () => {
    if (!input.trim()) return;

    const cmd = input.trim();
    appendHistory({ type: 'in', content: cmd });
    setInput('');

    if (requireConfirm) {
      const allowed = window.confirm('Execute this command inside the sandbox?');
      if (!allowed) {
        appendHistory({ type: 'out', content: 'Command cancelled by operator.' });
        return;
      }
    }

    try {
      const result = executeCommand(cmd);
      appendHistory(result);
    } catch (e) {
      appendHistory({ type: 'err', content: e instanceof Error ? e.message : 'Command failed.' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      execute();
    }
  };

  return (
    <div className="h-full flex flex-col bg-black border border-slate-800 font-mono text-xs rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar flex flex-col gap-1">
        {history.map((entry, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap break-all ${entry.type === 'in' ? 'text-cyan-400' : entry.type === 'err' ? 'text-red-400' : 'text-slate-300'}`}
          >
            {entry.type === 'in' ? '> ' : ''}
            {entry.content}
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
      <div className="p-2 bg-slate-900 border-t border-slate-800 flex gap-2 items-center">
        <span className="text-cyan-500 font-bold">{'>'}</span>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-slate-200"
          placeholder="calc (2+2)^3"
        />
        <label className="flex items-center gap-1 text-[10px] text-amber-300">
          <input
            type="checkbox"
            checked={requireConfirm}
            onChange={e => setRequireConfirm(e.target.checked)}
            aria-label="Execution guard"
          />
          Guard
        </label>
        <button
          onClick={() => setHistory(WELCOME_HISTORY)}
          className="text-slate-600 hover:text-red-400"
          aria-label="Clear terminal history"
        >
          <Trash2 size={12} />
        </button>
        <button onClick={execute} className="text-slate-600 hover:text-cyan-400" aria-label="Run command">
          <Play size={12} />
        </button>
      </div>
    </div>
  );
};
