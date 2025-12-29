import React from 'react';
import { Layers, Activity, Zap, Box } from 'lucide-react';

export const ChainPulse: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-fuchsia-400 uppercase">
          <Activity size={14} /> Logic Layer Pulse
        </div>
        <div className="text-[10px] text-slate-500">TPS & Blob Fees</div>
      </div>

      {/* ETH L2 Dominance */}
      <div className="bg-slate-900/30 border border-slate-800 rounded p-2 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-bold">
          <Layers size={10} /> ETH Modular Stack (TPS)
        </div>

        <div className="space-y-2">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-slate-300">
              <span>Base (Coinbase)</span>
              <span className="text-emerald-400">35.2 TPS</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[70%]"></div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-slate-300">
              <span>Arbitrum One</span>
              <span className="text-emerald-400">28.4 TPS</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 w-[55%]"></div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-slate-300">
              <span>Ethereum L1</span>
              <span className="text-slate-500">14.1 TPS</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-slate-600 w-[30%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Solana Velocity */}
      <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded p-2 flex flex-col justify-center gap-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Zap size={64} className="text-fuchsia-500" />
        </div>
        <div className="text-[10px] text-fuchsia-400 uppercase font-bold flex items-center gap-1 z-10">
          <Zap size={10} /> Monolithic Velocity (SOL)
        </div>

        <div className="flex items-end gap-1 items-baseline z-10">
          <span className="text-3xl font-black text-white">2,491</span>
          <span className="text-xs text-slate-500">TPS (True)</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2 z-10">
          <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <div className="text-[9px] text-slate-500 uppercase">Compute Units</div>
            <div className="text-xs text-emerald-400 font-mono">42M / block</div>
          </div>
          <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <div className="text-[9px] text-slate-500 uppercase">Validators</div>
            <div className="text-xs text-fuchsia-400 font-mono">1,822</div>
          </div>
        </div>
      </div>
    </div>
  );
};
