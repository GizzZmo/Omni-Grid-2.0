import React, { useState, useEffect } from 'react';
import { Clock, Calendar, History, RefreshCcw, Loader2 } from 'lucide-react';
import { getGenAIClient } from '../services/geminiService';

const getAi = () => getGenAIClient();

export const TemporalNexus: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'CLOCK' | 'HISTORY'>('CLOCK');
  const [historyData, setHistoryData] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchHistory = async () => {
    if (historyData && historyData.length > 10) return; // Cache simple check

    setLoading(true);
    try {
      const ai = getAi();
      if (!ai) {
        setHistoryData('Temporal Uplink requires a configured API key.');
        setLoading(false);
        return;
      }
      const today = time.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      const prompt = `Tell me 3 significant historical events that happened on ${today} in history. Format as a bulleted list. Keep it concise. Also, tell me one interesting fact about this specific day of the week.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setHistoryData(response.text || 'No data found.');
    } catch (e) {
      setHistoryData('Temporal Uplink Failed. Check Connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      fetchHistory();
    }
  }, [activeTab]);

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex bg-slate-900 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('CLOCK')}
          className={`flex-1 py-1 text-xs font-bold rounded transition-colors flex items-center justify-center gap-2 ${activeTab === 'CLOCK' ? 'bg-cyan-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Clock size={12} /> Time
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-1 text-xs font-bold rounded transition-colors flex items-center justify-center gap-2 ${activeTab === 'HISTORY' ? 'bg-cyan-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <History size={12} /> On This Day
        </button>
      </div>

      {activeTab === 'CLOCK' ? (
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Cyberpunk decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full border border-cyan-900/30 rounded-lg opacity-50"></div>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-600 font-mono tracking-tighter">
            {time.toLocaleTimeString([], { hour12: false })}
          </div>
          <div className="text-lg text-slate-400 font-bold tracking-widest uppercase mt-2">
            {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div className="text-xs text-slate-600 font-mono mt-4">
            UTC: {time.toISOString().split('T')[1].split('.')[0]}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/50 rounded-lg p-3 border border-slate-800 relative">
          {loading ? (
            <div className="flex h-full items-center justify-center text-cyan-500 gap-2">
              <Loader2 className="animate-spin" /> Querying Timeline...
            </div>
          ) : (
            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono">
              <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                <span className="text-cyan-400 font-bold uppercase">Historical Records</span>
                <button
                  onClick={() => {
                    setHistoryData('');
                    fetchHistory();
                  }}
                  className="text-slate-500 hover:text-white"
                >
                  <RefreshCcw size={12} />
                </button>
              </div>
              {historyData}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
