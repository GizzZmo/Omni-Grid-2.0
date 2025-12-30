import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Trash2 } from 'lucide-react';

export const WebTerminal: React.FC = () => {
  const [history, setHistory] = useState<Array<{ type: 'in' | 'out' | 'err'; content: string }>>([
    { type: 'out', content: 'Omni-Grid JS Runtime Environment v1.0.0' },
    { type: 'out', content: 'Type JavaScript code to execute locally.' },
    { type: 'out', content: 'Human-in-the-loop guard is enabled.' },
  ]);
  const [input, setInput] = useState('');
  const [requireConfirm, setRequireConfirm] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const execute = () => {
    if (!input.trim()) return;

    const cmd = input;
    setHistory(prev => [...prev, { type: 'in', content: cmd }]);
    setInput('');

    if (requireConfirm) {
      const allowed = window.confirm('Execute this command inside the sandbox?');
      if (!allowed) {
        setHistory(prev => [...prev, { type: 'out', content: 'Command cancelled by operator.' }]);
        return;
      }
    }

    try {
      let result = eval(cmd);
      if (typeof result === 'object') result = JSON.stringify(result, null, 2);
      setHistory(prev => [...prev, { type: 'out', content: String(result) }]);
    } catch (e: any) {
      setHistory(prev => [...prev, { type: 'err', content: e.message }]);
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
          placeholder="console.log('Hello World')"
        />
        <label className="flex items-center gap-1 text-[10px] text-amber-300">
          <input
            type="checkbox"
            checked={requireConfirm}
            onChange={e => setRequireConfirm(e.target.checked)}
          />
          Guard
        </label>
        <button onClick={() => setHistory([])} className="text-slate-600 hover:text-red-400">
          <Trash2 size={12} />
        </button>
        <button onClick={execute} className="text-slate-600 hover:text-cyan-400">
          <Play size={12} />
        </button>
      </div>
    </div>
  );
};
