/**
 * Example: Counter Widget
 * A minimal widget demonstrating local state management.
 * Based on the Widget API getting-started guide.
 */
import React, { useState } from 'react';
import { Zap, Plus, Minus, RotateCcw } from 'lucide-react';

export const CounterWidget: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 bg-slate-950 p-4">
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-cyan-400" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Counter</span>
      </div>

      <span className="text-6xl font-mono font-bold text-white tabular-nums">{count}</span>

      <div className="flex gap-3">
        <button
          onClick={() => setCount(c => c - 1)}
          aria-label="Decrement"
          className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-red-900/30 hover:border-red-500/50 hover:text-red-400 transition-all"
        >
          <Minus size={18} />
        </button>
        <button
          onClick={() => setCount(0)}
          aria-label="Reset"
          className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-500 hover:text-slate-300 transition-all"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={() => setCount(c => c + 1)}
          aria-label="Increment"
          className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-cyan-900/30 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};
