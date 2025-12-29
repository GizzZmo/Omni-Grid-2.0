import React, { useState, useMemo } from 'react';
import { Globe, TrendingUp, Activity, ArrowRight, Zap, Waves } from 'lucide-react';

// --- Atomic Components (Atomic Design) ---

const FlowNode = ({
  label,
  subLabel,
  color,
  height,
  x,
  y,
}: {
  label: string;
  subLabel: string;
  color: string;
  height: number;
  x: string;
  y: string;
}) => (
  <div
    className="absolute flex flex-col items-center group transition-all duration-500 hover:scale-105 z-10"
    style={{ left: x, top: y }}
  >
    <div
      className={`w-6 rounded-md shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-md transition-all duration-300 ${color}`}
      style={{ height: `${height}px` }}
    >
      <div className="w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50"></div>
    </div>
    <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col w-24 pointer-events-none">
      <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest drop-shadow-md">
        {label}
      </span>
      <span className="text-[8px] text-slate-500 font-mono">{subLabel}</span>
    </div>
  </div>
);

const FlowLink = ({ startY, endY, startX, endX, thickness, color, delay }: any) => {
  // Bezier curve calculation for smooth flow
  const path = `M ${startX} ${startY} C ${startX + 60} ${startY}, ${endX - 60} ${endY}, ${endX} ${endY}`;

  return (
    <g className="group">
      {/* Base Path */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeOpacity="0.1"
        className="transition-all duration-300 group-hover:stroke-opacity-30"
      />
      {/* Animated Flow Particle */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={Math.max(1, thickness / 4)}
        strokeOpacity="0.8"
        strokeDasharray="4, 8"
        className="animate-flow"
        style={{ animationDelay: `${delay}s`, animationDuration: '3s' }}
      />
    </g>
  );
};

// --- Main Widget ---

export const MacroNet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'HEATMAP' | 'FLOW'>('HEATMAP');

  // Simulated Correlation Matrix Data
  const correlationData = [
    { asset: 'BTC', m2: 0.85, inflation: 0.62, yield: -0.45 },
    { asset: 'ETH', m2: 0.78, inflation: 0.55, yield: -0.38 },
    { asset: 'NOK', m2: 0.32, inflation: 0.21, yield: 0.45 },
  ];

  // Memoize random offset values to avoid calling Math.random during render
  const heights = [40, 45, 42, 55, 60, 58, 70, 85, 90, 88];
  const randomOffsets = useMemo(
    () => heights.map(() => Math.random() * 20 - 10),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="h-full flex flex-col gap-3 relative overflow-hidden">
      {/* Header / Tabs */}
      <div className="flex items-center justify-between bg-slate-900 p-1 rounded border border-slate-800 shrink-0 z-20">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('HEATMAP')}
            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'HEATMAP' ? 'bg-blue-900/40 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-blue-300'}`}
          >
            <Globe size={12} /> Macro
          </button>
          <button
            onClick={() => setActiveTab('FLOW')}
            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'FLOW' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-emerald-300'}`}
          >
            <Waves size={12} /> Flows
          </button>
        </div>
        <div className="px-2 text-[9px] text-slate-500 font-mono hidden sm:block">
          Global Liquidity Index
        </div>
      </div>

      {activeTab === 'HEATMAP' ? (
        <>
          {/* Visualization of BTC vs M2 */}
          <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded p-2 relative flex flex-col justify-end min-h-0">
            <div className="absolute top-2 left-2 text-[10px] text-slate-500 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> BTC
              <span className="w-2 h-2 rounded-full bg-blue-500/50 ml-2"></span> M2 Supply
            </div>

            <div className="flex items-end justify-between h-full gap-1 px-2 pb-1">
              {heights.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col justify-end gap-1 group relative h-full"
                >
                  {/* M2 Line Approximation (Background) */}
                  <div
                    className="bg-blue-500/20 w-full absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-1000"
                    style={{ height: `${h + randomOffsets[i]}%` }}
                  ></div>
                  {/* BTC Bar */}
                  <div
                    className="bg-orange-500/80 w-full rounded-t-sm transition-all group-hover:bg-orange-400 relative z-10 shadow-[0_0_10px_rgba(249,115,22,0.2)]"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-orange-400 opacity-0 group-hover:opacity-100 bg-slate-900 px-1 rounded border border-orange-500/50">
                      ${(h * 800).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[8px] text-slate-600 mt-1 uppercase font-bold px-2">
              <span>Q1-23</span>
              <span>Q2-23</span>
              <span>Q3-23</span>
              <span>Q4-23</span>
              <span>Q1-24</span>
            </div>
          </div>

          {/* Correlation Matrix */}
          <div className="h-auto shrink-0 flex flex-col gap-1">
            <div className="grid grid-cols-4 gap-1 text-[9px] text-slate-500 font-bold uppercase text-center mb-1">
              <span className="text-left pl-2">Asset</span>
              <span>M2 Corr</span>
              <span>CPI Corr</span>
              <span>Yield</span>
            </div>
            {correlationData.map(d => (
              <div
                key={d.asset}
                className="grid grid-cols-4 gap-1 items-center bg-slate-900/50 p-1.5 rounded border border-white/5 hover:border-blue-500/30 transition-colors"
              >
                <span className="text-xs font-bold text-slate-200 pl-1">{d.asset}</span>
                <span
                  className={`text-xs font-mono text-center ${d.m2 > 0.7 ? 'text-emerald-400' : 'text-slate-400'}`}
                >
                  {d.m2 > 0 ? '+' : ''}
                  {d.m2}
                </span>
                <span className="text-xs font-mono text-slate-400 text-center">{d.inflation}</span>
                <span
                  className={`text-xs font-mono text-center ${d.yield > 0 ? 'text-blue-400' : 'text-red-400'}`}
                >
                  {d.yield}%
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-950 to-slate-950 pointer-events-none"></div>

          {/* SVG Layer for Flows */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* FIAT to STABLES */}
            <FlowLink
              startX={40}
              startY={80}
              endX={140}
              endY={80}
              thickness={20}
              color="#10b981"
              delay={0}
            />
            {/* STABLES to ASSETS */}
            <FlowLink
              startX={165}
              startY={80}
              endX={260}
              endY={40}
              thickness={12}
              color="#3b82f6"
              delay={0.5}
            />{' '}
            {/* BTC */}
            <FlowLink
              startX={165}
              startY={80}
              endX={260}
              endY={100}
              thickness={8}
              color="#8b5cf6"
              delay={0.8}
            />{' '}
            {/* ETH */}
            <FlowLink
              startX={165}
              startY={80}
              endX={260}
              endY={150}
              thickness={4}
              color="#f59e0b"
              delay={1.1}
            />{' '}
            {/* SOL */}
            {/* ETH to L2s */}
            <FlowLink
              startX={285}
              startY={100}
              endX={350}
              endY={100}
              thickness={4}
              color="#6366f1"
              delay={1.5}
            />
          </svg>

          {/* Nodes Layer */}
          <div className="w-full h-full relative z-10">
            {/* Column 1: Source */}
            <FlowNode
              x="5%"
              y="30%"
              height={80}
              color="bg-emerald-500"
              label="FIAT"
              subLabel="Global M2"
            />

            {/* Column 2: Liquidity */}
            <FlowNode
              x="35%"
              y="30%"
              height={80}
              color="bg-blue-500"
              label="STABLES"
              subLabel="$150B Liquidity"
            />

            {/* Column 3: Assets */}
            <FlowNode
              x="65%"
              y="10%"
              height={60}
              color="bg-orange-500"
              label="BTC"
              subLabel="Store of Value"
            />
            <FlowNode
              x="65%"
              y="40%"
              height={50}
              color="bg-fuchsia-500"
              label="ETH"
              subLabel="Settlement"
            />
            <FlowNode
              x="65%"
              y="70%"
              height={40}
              color="bg-cyan-500"
              label="SOL"
              subLabel="Execution"
            />

            {/* Column 4: L2/Apps */}
            <FlowNode
              x="90%"
              y="45%"
              height={30}
              color="bg-indigo-500"
              label="L2s"
              subLabel="Arbitrum/Base"
            />
          </div>

          <style>{`
                  @keyframes flow {
                    to { stroke-dashoffset: -12; }
                  }
                  .animate-flow {
                    stroke-dasharray: 4;
                    animation: flow 1s linear infinite;
                  }
                `}</style>
        </div>
      )}
    </div>
  );
};
