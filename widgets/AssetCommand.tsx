import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Brain,
  Trash2,
  Loader2,
  Coins,
  Play,
  Zap,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { useAppStore } from '../store';
import { getGenAIClient } from '../services/geminiService';

const ai = getGenAIClient();

const ASSET_CONTEXT: Record<string, string> = {
  NOK: 'The Physical Layer: 5G/6G IP Fortress & B2B Infrastructure.',
  USDT: 'The Liquidity Layer: Synthetic "oil" for 24/7 settlement.',
  ETH: 'The Logic Layer (Modular): Secure settlement backbone for L2s.',
  SOL: 'The Logic Layer (Monolithic): Consumer-grade high-speed execution.',
  BTC: 'The Macro Layer: Global Neutral Reserve & Sovereign Debt Hedge.',
};

export const AssetCommand: React.FC = () => {
  const { tickers, addTicker: storeAddTicker, removeTicker: storeRemoveTicker } = useAppStore();
  const [activeTab, setActiveTab] = useState<'TICKERS' | 'AUTOMATIONS' | 'INTEL'>('TICKERS');
  const [newTicker, setNewTicker] = useState('');
  const [intelResult, setIntelResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Automation Logic State
  const [logicAsset, setLogicAsset] = useState('BTC');
  const [logicOp, setLogicOp] = useState('<');
  const [logicVal, setLogicVal] = useState('');
  const [logicAction, setLogicAction] = useState('ALERT');
  const [automations, setAutomations] = useState<string[]>([]);

  const addTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTicker && !tickers.includes(newTicker.toUpperCase())) {
      storeAddTicker(newTicker.toUpperCase());
      setNewTicker('');
    }
  };

  const addAutomation = () => {
    if (!logicVal) return;
    const rule = `IF ${logicAsset} ${logicOp} ${logicVal} THEN ${logicAction}`;
    setAutomations([...automations, rule]);
    setLogicVal('');
  };

  const removeTicker = (t: string) => {
    storeRemoveTicker(t);
  };

  const analyzeSmartGrid = async () => {
    if (!ai) {
      setIntelResult('Neural Link offline (missing API key).');
      return;
    }

    setLoading(true);
    setIntelResult('');
    try {
      const list = tickers.join(', ');
      const context = tickers
        .map(t => `${t}: ${ASSET_CONTEXT[t] || 'Speculative Asset'}`)
        .join('\n');

      const prompt = `
        Act as a Strategic Grid Analyst. Analyze the following portfolio based on the "Smart Grid" Archetype (Physical, Liquidity, Logic, Macro layers).
        
        Assets:
        ${context}
        
        Provide:
        1. A brief "Correlation Check" (e.g. NOK vs SOL synergy).
        2. Liquidity Risk warning if USDT is present.
        3. A tactical rotation strategy based on current general market sentiment (e.g. "Risk-On" vs "Macro Uncertainty").
        
        Keep it concise, "Cyberpunk/Financial Terminal" style.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setIntelResult(response.text || 'Neural Link Analysis unavailable.');
    } catch (e) {
      setIntelResult('Neural Link Failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Tab Switcher */}
      <div className="flex bg-slate-900 p-1 rounded-lg">
        {['TICKERS', 'AUTOMATIONS', 'INTEL'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 text-[10px] font-bold py-1 rounded transition-colors ${activeTab === tab ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'TICKERS' && (
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <form onSubmit={addTicker} className="flex gap-2">
            <input
              value={newTicker}
              onChange={e => setNewTicker(e.target.value)}
              placeholder="Add Symbol (e.g. AAPL)"
              className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-emerald-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-slate-800 p-1 rounded hover:bg-slate-700 text-emerald-400"
            >
              <Plus size={14} />
            </button>
          </form>

          <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
            {tickers.map(t => (
              <div
                key={t}
                className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-white/5 hover:border-emerald-500/30 group"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-slate-800 rounded text-slate-400">
                      {['BTC', 'ETH', 'SOL', 'USDT', 'XRP'].includes(t) ? (
                        <Coins size={12} />
                      ) : (
                        <TrendingUp size={12} />
                      )}
                    </span>
                    <span className="font-bold text-slate-200 text-sm">{t}</span>
                  </div>
                  {ASSET_CONTEXT[t] && (
                    <span className="text-[9px] text-slate-500 ml-7">
                      {ASSET_CONTEXT[t].split(':')[0]}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeTicker(t)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'AUTOMATIONS' && (
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <div className="bg-slate-900/50 border border-slate-800 p-2 rounded flex flex-col gap-2">
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase mb-1">
              <Zap size={10} /> Logic Builder
            </div>
            <div className="flex gap-1">
              <select
                value={logicAsset}
                onChange={e => setLogicAsset(e.target.value)}
                className="w-16 bg-slate-800 text-[10px] rounded border border-slate-700 text-white outline-none"
              >
                {tickers.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                value={logicOp}
                onChange={e => setLogicOp(e.target.value)}
                className="w-10 bg-slate-800 text-[10px] rounded border border-slate-700 text-white outline-none"
              >
                <option>{'<'}</option>
                <option>{'>'}</option>
                <option>=</option>
              </select>
              <input
                value={logicVal}
                onChange={e => setLogicVal(e.target.value)}
                placeholder="Price/MA"
                className="flex-1 w-16 bg-slate-800 text-[10px] rounded border border-slate-700 text-white outline-none px-1"
              />
            </div>
            <div className="flex gap-1 items-center">
              <span className="text-[10px] text-slate-500">THEN</span>
              <select
                value={logicAction}
                onChange={e => setLogicAction(e.target.value)}
                className="flex-1 bg-slate-800 text-[10px] rounded border border-slate-700 text-white outline-none"
              >
                <option value="ALERT">Alert</option>
                <option value="BUY_SOL">Rotate to SOL</option>
                <option value="BUY_BTC">Rotate to BTC</option>
                <option value="STABLE">Exit to Stable</option>
              </select>
              <button
                onClick={addAutomation}
                className="bg-emerald-700 hover:bg-emerald-600 text-white p-1 rounded"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
            {automations.map((rule, i) => (
              <div
                key={i}
                className="bg-emerald-900/20 border border-emerald-900/50 p-2 rounded text-[10px] font-mono text-emerald-300 flex justify-between items-center"
              >
                <span>{rule}</span>
                <button
                  onClick={() => setAutomations(automations.filter((_, idx) => idx !== i))}
                  className="text-emerald-700 hover:text-red-400"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
            {automations.length === 0 && (
              <div className="text-center text-[10px] text-slate-600 italic mt-4">
                No active logic scripts.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'INTEL' && (
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {!intelResult ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 opacity-50">
              <Brain size={32} className="text-emerald-500 mb-2" />
              <p className="text-xs text-slate-400">Initialize Strategic Grid Analysis...</p>
            </div>
          ) : (
            <div className="flex-1 bg-slate-950 p-2 rounded border border-emerald-900/30 text-[10px] text-slate-300 leading-relaxed overflow-y-auto custom-scrollbar whitespace-pre-line font-mono">
              {intelResult}
            </div>
          )}

          <button
            onClick={analyzeSmartGrid}
            disabled={loading}
            className="w-full bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-800/50 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Lightbulb size={12} />}
            {loading ? 'Processing Layers...' : 'Generate Smart Grid Strategy'}
          </button>
        </div>
      )}
    </div>
  );
};
