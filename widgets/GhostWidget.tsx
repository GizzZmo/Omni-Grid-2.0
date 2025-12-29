import React, { useState, useEffect } from 'react';
import {
  Ghost,
  PlusCircle,
  X,
  Scan,
  FileJson,
  BrainCircuit,
  Activity,
  Code2,
  Lock,
  Palette,
  Clock,
  Music,
  Calculator,
  TrendingUp,
  Languages,
  PenTool,
  Cloud,
  DollarSign,
  Terminal,
  HelpCircle,
  PenTool as PenToolIcon,
  Wand2,
  Radio,
  Grid,
} from 'lucide-react';
import { useAppStore } from '../store';

const ICONS: Record<string, any> = {
  TRANSFORMER: FileJson,
  SCRATCHPAD: BrainCircuit,
  FOCUS_HUD: Activity,
  DEV_OPTIC: Code2,
  CIPHER_VAULT: Lock,
  CHROMA_LAB: Palette,
  TEMPORAL: Clock,
  SONIC: Music,
  CALC: Calculator,
  ASSET: TrendingUp,
  POLYGLOT: Languages,
  WRITEPAD: PenTool,
  WEATHER: Cloud,
  VALUTA: DollarSign,
  SYSTEM: Terminal,
  HELP: HelpCircle,
  ARCHITECT: PenToolIcon,
  THEME_ENGINE: Wand2,
  RADIO: Radio,
  SUDOKU: Grid,
};

export const GhostWidget: React.FC = () => {
  const { ghostWidget, solidifyGhostWidget, setGhostWidget } = useAppStore();
  const [typedReason, setTypedReason] = useState('');

  // Typing effect for the AI reason
  useEffect(() => {
    if (ghostWidget?.reason) {
      setTypedReason('');
      let i = 0;
      const interval = setInterval(() => {
        setTypedReason(ghostWidget.reason.substring(0, i));
        i++;
        if (i > ghostWidget.reason.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [ghostWidget]);

  if (!ghostWidget) return null;

  const SuggestedIcon = ICONS[ghostWidget.suggestedWidgetId] || Ghost;

  return (
    <div className="h-full w-full relative group overflow-hidden bg-slate-900/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg flex flex-col shadow-[0_0_20px_rgba(6,182,212,0.1)]">
      {/* Holographic Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10 bg-[linear-gradient(0deg,transparent_0%,rgba(6,182,212,0.5)_50%,transparent_100%)] bg-[length:100%_4px]"></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.2)_0%,transparent_70%)]"></div>

      {/* Moving Scan Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.8)] z-0 animate-[scan_3s_ease-in-out_infinite]"></div>

      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-cyan-500/20 bg-cyan-900/10 z-10">
        <div className="flex items-center gap-2 text-cyan-400">
          <Scan size={14} className="animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest uppercase">GHOST PROTOCOL</span>
        </div>
        <button
          onClick={() => setGhostWidget(null)}
          className="text-slate-500 hover:text-red-400 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center z-10 gap-3">
        {/* Projected Icon */}
        <div className="relative group-hover:scale-110 transition-transform duration-500">
          <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20 animate-pulse"></div>
          <SuggestedIcon
            size={48}
            className="text-cyan-300 relative z-10 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-white tracking-wide">
            {ghostWidget.suggestedWidgetId.replace('_', ' ')}
          </h3>
          {ghostWidget.previewContent && (
            <div className="text-[10px] font-mono text-cyan-200/70 bg-cyan-900/20 px-2 py-1 rounded border border-cyan-500/20 shadow-inner">
              &quot;{ghostWidget.previewContent}&quot;
            </div>
          )}
        </div>

        {/* Typing Reason */}
        <div className="h-12 w-full max-w-[90%] flex items-center justify-center bg-black/20 rounded p-1 border border-white/5">
          <p className="text-[10px] text-slate-400 font-mono leading-tight">
            {typedReason}
            <span className="animate-blink text-cyan-400">_</span>
          </p>
        </div>

        <button
          onClick={solidifyGhostWidget}
          className="group/btn relative px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs rounded-sm transition-all overflow-hidden w-full max-w-[140px]"
        >
          <div className="absolute inset-0 w-0 bg-cyan-500/20 transition-all duration-300 group-hover/btn:w-full"></div>
          <span className="relative flex items-center justify-center gap-2 font-bold uppercase tracking-wider">
            <PlusCircle size={12} /> Materialize
          </span>
        </button>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500 opacity-50"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500 opacity-50"></div>

      <style>{`
         @keyframes scan {
           0% { top: 0%; opacity: 0; }
           10% { opacity: 1; }
           90% { opacity: 1; }
           100% { top: 100%; opacity: 0; }
         }
         .animate-blink {
             animation: blink 1s step-end infinite;
         }
         @keyframes blink {
             50% { opacity: 0; }
         }
       `}</style>
    </div>
  );
};
