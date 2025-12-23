
import React from 'react';
import { Scale, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export const RegRadar: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-3">
        <div className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
                <Scale size={14} /> Regulatory Radar
            </div>
            <div className="flex items-center gap-1 text-[10px] text-red-400 animate-pulse">
                <AlertTriangle size={10} /> Threat Level: High
            </div>
        </div>

        {/* Threat Meter */}
        <div className="flex items-center gap-1 h-2 w-full mb-2">
            <div className="h-full flex-1 bg-emerald-900/50 rounded-l"></div>
            <div className="h-full flex-1 bg-yellow-900/50"></div>
            <div className="h-full flex-1 bg-orange-900/50"></div>
            <div className="h-full flex-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] rounded-r"></div>
        </div>

        {/* News Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
            
            <div className="bg-slate-900/50 p-2 rounded border border-l-2 border-slate-800 border-l-red-500">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-slate-300">SEC vs DeFi</span>
                    <span className="text-[8px] bg-red-900/30 text-red-400 px-1 rounded">CRITICAL</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                    Enforcement actions targeting non-custodial wallets increasing. Focus on "dealer" definitions.
                </p>
            </div>

            <div className="bg-slate-900/50 p-2 rounded border border-l-2 border-slate-800 border-l-emerald-500">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-slate-300">MiCA Framework (EU)</span>
                    <span className="text-[8px] bg-emerald-900/30 text-emerald-400 px-1 rounded">STABLE</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                    Full implementation timeline clarified. Stablecoin issuers (USDT) face strict reserve audits.
                </p>
            </div>

            <div className="bg-slate-900/50 p-2 rounded border border-l-2 border-slate-800 border-l-blue-500">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-slate-300">FIT21 Bill (US)</span>
                    <span className="text-[8px] bg-blue-900/30 text-blue-400 px-1 rounded">PENDING</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                    Market structure bill passing house signals bipartisan support for clear asset classification.
                </p>
            </div>

        </div>

        <div className="text-center text-[9px] text-slate-600 bg-slate-900 p-1 rounded">
            Scanning 14 Jurisdictions...
        </div>
    </div>
  );
};
