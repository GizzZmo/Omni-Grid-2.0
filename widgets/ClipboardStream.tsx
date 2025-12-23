
import React, { useState } from 'react';
import { Clipboard, Copy, Trash2, ArrowUpRight, Plus, GripHorizontal, Check } from 'lucide-react';
import { useAppStore } from '../store';

export const ClipboardStream: React.FC = () => {
  const { clipboardHistory, addToClipboardHistory, clearClipboardHistory } = useAppStore();
  const [justCopied, setJustCopied] = useState<number | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        addToClipboardHistory(text);
      }
    } catch (e) {
      alert("Permission to read clipboard denied. Please check browser settings.");
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setJustCopied(idx);
    setTimeout(() => setJustCopied(null), 1500);
  };

  const handleDragStart = (e: React.DragEvent, text: string) => {
      e.dataTransfer.setData('text/plain', text);
      e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="h-full flex flex-col gap-2">
        <button 
            onClick={handlePaste}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 text-slate-300 py-3 rounded transition-all group"
        >
            <Plus size={16} className="text-cyan-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Paste from System</span>
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 p-1">
            {clipboardHistory.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50">
                    <Clipboard size={32} />
                    <span className="text-xs text-center">Buffer Empty</span>
                </div>
            )}
            
            {clipboardHistory.map((item, i) => (
                <div 
                    key={i} 
                    className="bg-slate-900/50 border border-slate-800 rounded p-2 flex flex-col gap-2 group hover:border-cyan-500/30 transition-all relative"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                >
                    <div className="text-[10px] text-slate-400 font-mono line-clamp-3 leading-relaxed break-all">
                        {item}
                    </div>
                    
                    <div className="flex justify-between items-center mt-1 border-t border-white/5 pt-1">
                        <div className="flex items-center gap-1 text-[9px] text-slate-600">
                            <GripHorizontal size={10} /> Drag to Insert
                        </div>
                        <button 
                            onClick={() => handleCopy(item, i)}
                            className="p-1 hover:bg-cyan-900/50 rounded text-slate-500 hover:text-cyan-400 transition-colors"
                            title="Copy back to System"
                        >
                            {justCopied === i ? <Check size={12} className="text-emerald-500"/> : <Copy size={12} />}
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {clipboardHistory.length > 0 && (
            <button 
                onClick={clearClipboardHistory}
                className="text-[10px] text-red-400 hover:text-red-300 flex items-center justify-center gap-1 py-1 hover:bg-red-900/10 rounded transition-colors"
            >
                <Trash2 size={10} /> Clear Buffer
            </button>
        )}
    </div>
  );
};
