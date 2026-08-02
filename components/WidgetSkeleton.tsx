import React from 'react';

/**
 * Cyberpunk-styled loading placeholder used while a lazy widget chunk loads.
 */
export const WidgetSkeleton: React.FC<{ label?: string }> = ({ label = 'LOADING MODULE' }) => (
  <div className="h-full w-full flex flex-col items-center justify-center gap-3 bg-slate-950/40 font-mono">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-sm animate-pulse" />
      <div className="absolute inset-1 border border-fuchsia-500/40 rounded-sm animate-spin [animation-duration:3s]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[8px] text-cyan-400 font-bold tracking-widest">OG</span>
      </div>
    </div>
    <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] animate-pulse">{label}</span>
    <div className="w-24 h-0.5 bg-slate-800 overflow-hidden rounded">
      <div className="h-full w-1/2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 animate-[shimmer_1.2s_ease-in-out_infinite]" />
    </div>
    <style>{`
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }
    `}</style>
  </div>
);
