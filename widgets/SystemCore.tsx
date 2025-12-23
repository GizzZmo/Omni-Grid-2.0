
import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Trash2, RefreshCw, AlertTriangle, ShieldCheck, Skull, Settings, Tv, Volume2, Key, Activity, XCircle, Power } from 'lucide-react';
import { useAppStore } from '../store';

export const SystemCore: React.FC = () => {
  const { logs, resetAll, addLog, settings, toggleSetting, visibleWidgets, toggleWidget } = useAppStore();
  const [activeTab, setActiveTab] = useState<'STATUS' | 'TASKS' | 'LOGS' | 'SETTINGS' | 'MANIFESTO'>('STATUS');
  const [memUsage, setMemUsage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        setMemUsage(Math.floor(Math.random() * 30) + 20);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handlePurge = () => {
      if (confirm("WARNING: COMPLETE SYSTEM RESET. ALL LOCAL DATA WILL BE LOST. PROCEED?")) {
          localStorage.clear();
          resetAll();
          window.location.reload();
      }
  };

  const getFakeStats = (id: string) => {
      // Deterministic fake stats based on ID string char code sum
      const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const cpu = (sum % 15) + 1;
      const mem = (sum % 120) + 10;
      return { cpu, mem, pid: sum };
  };

  return (
    <div className="h-full flex flex-col gap-3 font-mono">
       {/* Tab Bar */}
       <div className="flex bg-slate-900/50 p-1 border border-slate-800 overflow-x-auto custom-scrollbar">
        {['STATUS', 'TASKS', 'LOGS', 'SETTINGS', 'CORE'].map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab === 'CORE' ? 'MANIFESTO' : tab as any)}
                className={`flex-1 min-w-[50px] text-[10px] font-bold py-1 px-2 transition-all whitespace-nowrap ${activeTab === (tab === 'CORE' ? 'MANIFESTO' : tab) ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-600 hover:text-slate-400'}`}
            >
                {tab}
            </button>
        ))}
       </div>

       {activeTab === 'STATUS' && (
           <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
               {/* Health Grid */}
               <div className="grid grid-cols-2 gap-2">
                   <div className="bg-slate-900/50 p-2 border border-slate-800 flex flex-col gap-1">
                       <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Cpu size={10}/> Memory</span>
                       <div className="h-1 w-full bg-slate-800 rounded overflow-hidden">
                           <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${memUsage}%` }}></div>
                       </div>
                       <span className="text-right text-xs text-emerald-400">{memUsage} MB</span>
                   </div>
                   <div className="bg-slate-900/50 p-2 border border-slate-800 flex flex-col gap-1">
                       <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><ShieldCheck size={10}/> Security</span>
                       <span className="text-xs text-cyan-400 animate-pulse">ENCRYPTED</span>
                   </div>
               </div>

               {/* API Key Status (Read Only) */}
               <div className="bg-slate-900/50 p-2 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase mb-1 flex items-center gap-2"><Key size={10} /> Neural Link Status</div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${process.env.API_KEY ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-red-500'}`}></div>
                        <span className="text-slate-300">{process.env.API_KEY ? 'UPLINK ESTABLISHED (ENV)' : 'UPLINK OFFLINE - CHECK ENV VARS'}</span>
                    </div>
               </div>

                <div className="bg-slate-900/50 p-2 border border-slate-800 flex items-center justify-between">
                     <span className="text-[10px] text-slate-500 uppercase">Active Processes</span>
                     <span className="text-xs text-cyan-400 font-bold">{visibleWidgets.length}</span>
                </div>
           </div>
       )}

       {activeTab === 'TASKS' && (
           <div className="flex-1 flex flex-col bg-black/40 border border-slate-800 rounded overflow-hidden">
                <div className="flex items-center justify-between bg-slate-900 px-2 py-1 border-b border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span className="w-10">PID</span>
                    <span className="flex-1">COMMAND</span>
                    <span className="w-8 text-right">CPU</span>
                    <span className="w-8 text-right">MEM</span>
                    <span className="w-6"></span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {visibleWidgets.map(widgetId => {
                        const stats = getFakeStats(widgetId);
                        return (
                            <div key={widgetId} className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800/50 hover:bg-slate-800/30 group">
                                <span className="w-10 text-[10px] text-emerald-600 font-mono">{stats.pid}</span>
                                <span className="flex-1 text-xs text-slate-300 font-bold truncate pr-2">{widgetId}</span>
                                <span className="w-8 text-right text-[10px] text-slate-500">{stats.cpu}%</span>
                                <span className="w-8 text-right text-[10px] text-slate-500">{stats.mem}M</span>
                                <button 
                                    onClick={() => toggleWidget(widgetId)}
                                    className="w-6 flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors"
                                    title={`Kill Process ${widgetId}`}
                                >
                                    <XCircle size={12} />
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="bg-slate-900/80 p-1 text-[10px] text-slate-600 text-center border-t border-slate-800">
                    root@omni-grid:~# top -n 1
                </div>
           </div>
       )}

       {activeTab === 'LOGS' && (
           <div className="flex-1 bg-black/40 border border-slate-800 p-2 overflow-y-auto custom-scrollbar font-mono text-[10px] leading-relaxed">
               {logs.map((log, i) => (
                   <div key={i} className="mb-1 border-l-2 border-slate-800 pl-2 hover:border-cyan-500/50 hover:bg-white/5 transition-colors">
                       <span className="text-slate-500 mr-2">{log.split(']')[0]}]</span>
                       <span className="text-slate-300">{log.split(']')[1]}</span>
                   </div>
               ))}
               <div className="animate-pulse text-cyan-500">_</div>
           </div>
       )}

       {activeTab === 'SETTINGS' && (
           <div className="flex-1 flex flex-col gap-3 p-1">
               <div className="flex items-center justify-between p-2 bg-slate-900/50 border border-slate-800 rounded">
                   <div className="flex items-center gap-2 text-xs text-slate-300">
                       <Tv size={14} className="text-fuchsia-500" /> CRT Scanlines
                   </div>
                   <button 
                    onClick={() => toggleSetting('scanlines')}
                    className={`w-8 h-4 rounded-full transition-colors relative ${settings.scanlines ? 'bg-fuchsia-600' : 'bg-slate-700'}`}
                   >
                       <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${settings.scanlines ? 'translate-x-4' : 'translate-x-0'}`}></div>
                   </button>
               </div>

               <div className="flex items-center justify-between p-2 bg-slate-900/50 border border-slate-800 rounded">
                   <div className="flex items-center gap-2 text-xs text-slate-300">
                       <Volume2 size={14} className="text-cyan-500" /> System Audio
                   </div>
                   <button 
                    onClick={() => toggleSetting('sound')}
                    className={`w-8 h-4 rounded-full transition-colors relative ${settings.sound ? 'bg-cyan-600' : 'bg-slate-700'}`}
                   >
                       <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${settings.sound ? 'translate-x-4' : 'translate-x-0'}`}></div>
                   </button>
               </div>

               {/* Danger Zone moved here */}
               <div className="mt-auto border border-red-900/30 p-2 bg-red-900/5 rounded">
                   <div className="text-[10px] text-red-500 font-bold mb-2 flex items-center gap-1"><AlertTriangle size={10}/> FACTORY RESET</div>
                   <button 
                    onClick={handlePurge}
                    className="w-full border border-red-800/50 text-red-400 hover:bg-red-900/20 text-xs py-2 px-2 flex items-center justify-center gap-2 transition-colors uppercase tracking-widest font-bold"
                   >
                       <Skull size={14} /> PURGE ALL DATA
                   </button>
               </div>
           </div>
       )}

       {activeTab === 'MANIFESTO' && (
           <div className="flex-1 p-2 overflow-y-auto custom-scrollbar text-xs text-slate-300 leading-6 border border-slate-800 bg-slate-900/30">
               <p className="mb-4 text-cyan-400 font-bold">/// INCOMING TRANSMISSION...</p>
               <p className="mb-2">"The net is vast and infinite, but your grid is your own.</p>
               <p className="mb-2">We built Omni-Grid because the cloud is too loud. It watches, it waits, it charges subscription fees for tools that should be free.</p>
               <p className="mb-2">Here, processing is local. Your thoughts are yours. The tools are sharp.</p>
               <p className="mb-4">Keep it clean. Keep it local. Stay disconnected."</p>
               <div className="text-right mt-4 pt-2 border-t border-slate-800 text-fuchsia-400 font-display uppercase tracking-widest">
                   - Jon Constantine
               </div>
           </div>
       )}
    </div>
  );
};
