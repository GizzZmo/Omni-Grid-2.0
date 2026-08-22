import React, { useState } from 'react';
import { Clipboard, Copy, Trash2, Plus, GripHorizontal, Check } from 'lucide-react';
import { useAppStore } from '../store';

export const ClipboardStream: React.FC = () => {
  const { clipboardHistory, addToClipboardHistory, clearClipboardHistory } = useAppStore();
  const [justCopied, setJustCopied] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setJustCopied(index);
      setTimeout(() => setJustCopied(null), 1500);
    } catch (_e) {
      // ignore
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) addToClipboardHistory(text);
    } catch (_e) {
      // ignore
    }
  };

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase">
          <Clipboard size={14} /> Stream
        </div>
        <button
          onClick={handlePaste}
          className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 flex items-center gap-1"
        >
          <Plus size={10} /> Capture
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {clipboardHistory.length === 0 && (
          <div className="text-center text-slate-600 text-xs py-8">No history yet</div>
        )}
        {clipboardHistory.map((item, i) => (
          <div
            key={i}
            className="group relative bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-300 font-mono hover:border-indigo-500/40 transition-colors"
            draggable
            onDragStart={e => {
              e.dataTransfer.setData('text/plain', item);
              e.dataTransfer.effectAllowed = 'copy';
            }}
          >
            <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-50">
              <GripHorizontal size={12} className="text-indigo-400" />
            </div>
            <div className="pr-6 pl-4 break-all line-clamp-3">{item}</div>
            <button
              onClick={() => handleCopy(item, i)}
              className="absolute top-1 right-1 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {justCopied === i ? (
                <Check size={12} className="text-emerald-400" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          </div>
        ))}
      </div>

      {clipboardHistory.length > 0 && (
        <button
          onClick={clearClipboardHistory}
          className="text-[10px] text-slate-500 hover:text-red-400 flex items-center gap-1 self-end"
        >
          <Trash2 size={10} /> Clear Buffer
        </button>
      )}
    </div>
  );
};
