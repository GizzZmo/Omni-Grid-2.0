
import React, { useEffect, useState } from 'react';
import { GridContainer } from './components/GridContainer';
import { useAppStore } from './store';
import { optimizeLayout } from './services/gridIntelligence';
import { MatrixRain } from './components/MatrixRain';
import { WidgetLauncher } from './components/WidgetLauncher';
import { CommandPalette } from './components/CommandPalette';
import { Save, FolderOpen, Lock, Unlock, Sparkles, Loader2, Terminal, HelpCircle, FileJson, BrainCircuit, Activity, Code2, TrendingUp, Music, Wand2, AlignVerticalSpaceAround, Pause, Play, Ghost } from 'lucide-react';
import { downloadJson, uploadJson } from './utils';

const App: React.FC = () => {
  // Optimized: Individual selectors to prevent re-renders when unrelated state changes (like input typing)
  const visibleWidgets = useAppStore(s => s.visibleWidgets);
  const toggleWidget = useAppStore(s => s.toggleWidget);
  const setGlobalState = useAppStore(s => s.setGlobalState);
  const settings = useAppStore(s => s.settings);
  const isLayoutLocked = useAppStore(s => s.isLayoutLocked);
  const toggleLayoutLock = useAppStore(s => s.toggleLayoutLock);
  const isCompact = useAppStore(s => s.isCompact);
  const toggleCompact = useAppStore(s => s.toggleCompact);
  const theme = useAppStore(s => s.theme);
  const layouts = useAppStore(s => s.layouts);
  const updateLayout = useAppStore(s => s.updateLayout);
  const setGhostWidget = useAppStore(s => s.setGhostWidget);

  const [organizing, setOrganizing] = useState(false);
  const [showLauncher, setShowLauncher] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  const handleGlobalBackup = () => {
    // Imperative read of state to avoid subscription
    const currentState = useAppStore.getState();
    const backup = {
       version: 1,
       timestamp: new Date().toISOString(),
       state: currentState
    };
    downloadJson(`omni-grid-backup-${new Date().toISOString().slice(0,10)}.json`, backup);
  };

  const handleGlobalRestore = () => {
    uploadJson((data) => {
        if (data.state) {
            if (confirm("RESTORE BACKUP? CURRENT SESSION DATA WILL BE OVERWRITTEN.")) {
                setGlobalState(data.state);
                setIsFrozen(false);
            }
        } else {
            alert("INVALID BACKUP FILE DETECTED.");
        }
    });
  };

  const handleAutoOrganize = async () => {
      setOrganizing(true);
      try {
          const result = await optimizeLayout(layouts.lg, visibleWidgets);
          
          if (result.layout) {
              let newLayout = [...result.layout];
              if (result.ghost) {
                  const hasGhostLayout = newLayout.find(l => l.i === 'GHOST');
                  if (!hasGhostLayout) {
                      newLayout.push({ i: 'GHOST', x: 0, y: 100, w: 4, h: 4 });
                  }
                  setGhostWidget(result.ghost);
              } else {
                  setGhostWidget(null);
              }
              updateLayout(newLayout);
          }
      } catch (e) {
          console.error("Auto-org failed", e);
      } finally {
          setOrganizing(false);
      }
  };

  // Apply theme on load
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-bg', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--radius', theme.radius);

    const styleId = 'dynamic-theme-style';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `
      .bg-slate-950 { background-color: ${theme.colors.background} !important; }
      .bg-slate-900 { background-color: ${theme.colors.surface} !important; }
      .text-slate-200 { color: ${theme.colors.text} !important; }
      .border-cyan-500 { border-color: ${theme.colors.primary} !important; }
      .text-cyan-400 { color: ${theme.colors.primary} !important; }
      .text-fuchsia-400 { color: ${theme.colors.secondary} !important; }
    `;
  }, [theme]);

  return (
    <div className={`h-screen w-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden relative selection:bg-fuchsia-500/30 ${settings.scanlines ? 'scanlines' : ''}`}>
      {/* Background Ambience & Grid */}
      <MatrixRain />
      
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/80 to-slate-950/90 z-0 pointer-events-none"></div>

      {/* Overlays */}
      {showLauncher && <WidgetLauncher onClose={() => setShowLauncher(false)} />}
      <CommandPalette />

      {/* Global Header / Controls */}
      <div className="absolute top-0 left-0 w-full z-50 flex justify-between items-center p-4 pointer-events-none" role="banner">
          {/* Brand */}
          <div className="pointer-events-auto flex items-center gap-4">
              <h1 className="text-3xl font-gothic text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)] tracking-wide">
                  OMNI-GRID
              </h1>
              <button 
                  onClick={() => setShowLauncher(true)}
                  disabled={isFrozen}
                  className="px-4 py-1.5 bg-fuchsia-900/30 border border-fuchsia-500/50 hover:bg-fuchsia-500/20 rounded text-xs font-bold text-fuchsia-300 hover:text-white uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(217,70,239,0.2)] animate-pulse hover:animate-none disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Open Widget Launcher"
              >
                  [ LAUNCHER ]
              </button>
          </div>

          <div className="pointer-events-auto flex gap-2">
             <button 
               onClick={handleAutoOrganize}
               disabled={organizing || isFrozen}
               className="group flex items-center gap-2 px-3 py-1.5 bg-cyan-900/30 backdrop-blur border border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-900/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] rounded-sm text-[10px] font-display font-bold text-cyan-400 hover:text-cyan-300 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-wait"
               aria-label="Summon Ghost Widget (Auto-Organize)"
             >
                {organizing ? <Loader2 size={12} className="animate-spin" /> : <Ghost size={12} />} 
                {organizing ? 'SUMMONING...' : 'GHOST'}
             </button>

             <div className="w-[1px] h-full bg-slate-800 mx-1"></div>

             <button
               onClick={toggleCompact}
               disabled={isFrozen}
               className={`group flex items-center gap-2 px-3 py-1.5 backdrop-blur border rounded-sm text-[10px] font-display font-bold transition-all uppercase tracking-widest disabled:opacity-50 ${isCompact ? 'bg-indigo-900/40 border-indigo-500/50 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-slate-900/80 border-slate-700/50 text-slate-400 hover:text-white'}`}
               aria-label={isCompact ? "Disable Auto-Fit" : "Enable Auto-Fit"}
             >
                <AlignVerticalSpaceAround size={12} />
                {isCompact ? 'AUTOFIT: ON' : 'AUTOFIT: OFF'}
             </button>
             
             <button
               onClick={toggleLayoutLock}
               disabled={isFrozen}
               className={`group flex items-center gap-2 px-3 py-1.5 backdrop-blur border rounded-sm text-[10px] font-display font-bold transition-all uppercase tracking-widest disabled:opacity-50 ${isLayoutLocked ? 'bg-red-900/20 border-red-500/50 text-red-400 hover:bg-red-900/40' : 'bg-slate-900/80 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-500'}`}
               aria-label={isLayoutLocked ? "Unlock Layout" : "Lock Layout"}
             >
                {isLayoutLocked ? <Lock size={12} /> : <Unlock size={12} />}
                {isLayoutLocked ? 'LOCKED' : 'UNLOCKED'}
             </button>

             <div className="w-[1px] h-full bg-slate-800 mx-1"></div>

             <button
               onClick={() => setIsFrozen(!isFrozen)}
               className={`group flex items-center gap-2 px-3 py-1.5 backdrop-blur border rounded-sm text-[10px] font-display font-bold transition-all uppercase tracking-widest ${isFrozen ? 'bg-amber-900/40 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-pulse' : 'bg-slate-900/80 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-500'}`}
               aria-label={isFrozen ? "Resume System" : "Freeze System"}
             >
                {isFrozen ? <Play size={12} /> : <Pause size={12} />}
                {isFrozen ? 'RESUME' : 'FREEZE'}
             </button>

             {!isFrozen && (
               <>
                 <button 
                   onClick={handleGlobalBackup}
                   className="group flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur border border-cyan-900/50 hover:border-cyan-400 hover:bg-cyan-900/20 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] rounded-sm text-[10px] font-display font-bold text-slate-400 hover:text-cyan-300 transition-all uppercase tracking-widest"
                   aria-label="Backup Data"
                 >
                    <Save size={12} className="group-hover:text-cyan-400" /> Backup
                 </button>
                 <button 
                   onClick={handleGlobalRestore}
                   className="group flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur border border-fuchsia-900/50 hover:border-fuchsia-400 hover:bg-fuchsia-900/20 hover:shadow-[0_0_10px_rgba(217,70,239,0.3)] rounded-sm text-[10px] font-display font-bold text-slate-400 hover:text-fuchsia-300 transition-all uppercase tracking-widest"
                   aria-label="Restore Data"
                 >
                    <FolderOpen size={12} className="group-hover:text-fuchsia-400" /> Restore
                 </button>
               </>
             )}
          </div>
      </div>

      {/* Main Grid Area */}
      <main className="flex-1 overflow-y-auto relative z-10 p-4 pt-16 pb-24 custom-scrollbar">
        <GridContainer />
        
        {/* Frozen System Overlay */}
        {isFrozen && (
            <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center flex-col gap-6 animate-in fade-in duration-300">
                <div className="text-3xl font-display font-bold text-amber-400 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                    System Suspended
                </div>
                
                <div className="flex gap-4">
                     <button
                        onClick={handleGlobalBackup}
                        className="group flex items-center gap-3 px-6 py-3 bg-slate-900 border border-cyan-500/50 hover:bg-cyan-900/20 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] rounded transition-all"
                     >
                        <Save size={20} className="text-cyan-400" />
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-bold text-slate-200">CREATE SNAPSHOT</span>
                            <span className="text-[10px] text-cyan-500 uppercase tracking-wider">Save Full State</span>
                        </div>
                     </button>

                     <button
                        onClick={() => setIsFrozen(false)}
                        className="group flex items-center gap-3 px-6 py-3 bg-slate-900 border border-slate-700 hover:border-white/30 hover:bg-slate-800 rounded transition-all"
                     >
                        <Play size={20} className="text-slate-400 group-hover:text-white" />
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-bold text-slate-200">RESUME</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Unlock System</span>
                        </div>
                     </button>
                </div>

                <div className="text-xs text-slate-500 font-mono">
                    All processes halted. Ready for archival.
                </div>
            </div>
        )}
      </main>

      {/* Mac-style Dock */}
      {!isFrozen && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 max-w-[90vw] overflow-x-auto custom-scrollbar" role="navigation" aria-label="Dock">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
              
              <DockItem 
                active={visibleWidgets.includes('SYSTEM')} 
                onClick={() => toggleWidget('SYSTEM')}
                icon={<Terminal size={18} />}
                label="System Core"
                color="bg-red-500"
              />

              <DockItem 
                active={visibleWidgets.includes('HELP')} 
                onClick={() => toggleWidget('HELP')}
                icon={<HelpCircle size={18} />}
                label="Help Desk"
                color="bg-emerald-500"
              />

              <div className="w-[1px] h-8 bg-white/10 mx-1"></div>

              {/* Core Tools */}
              <DockItem 
                active={visibleWidgets.includes('TRANSFORMER')} 
                onClick={() => toggleWidget('TRANSFORMER')}
                icon={<FileJson size={18} />}
                label="Transformer"
                color="bg-indigo-500"
              />
              <DockItem 
                active={visibleWidgets.includes('SCRATCHPAD')} 
                onClick={() => toggleWidget('SCRATCHPAD')}
                icon={<BrainCircuit size={18} />}
                label="AI Notes"
                color="bg-fuchsia-600"
              />
              <DockItem 
                active={visibleWidgets.includes('FOCUS_HUD')} 
                onClick={() => toggleWidget('FOCUS_HUD')}
                icon={<Activity size={18} />}
                label="Focus"
                color="bg-cyan-500"
              />

              <div className="w-[1px] h-8 bg-white/10 mx-1"></div>

              {/* Dev Suite */}
              <DockItem 
                active={visibleWidgets.includes('DEV_OPTIC')} 
                onClick={() => toggleWidget('DEV_OPTIC')}
                icon={<Code2 size={18} />}
                label="DevTools"
                color="bg-orange-500"
              />
              <DockItem 
                active={visibleWidgets.includes('WEB_TERMINAL')} 
                onClick={() => toggleWidget('WEB_TERMINAL')}
                icon={<Terminal size={18} />}
                label="Terminal"
                color="bg-slate-400"
              />

              <div className="w-[1px] h-8 bg-white/10 mx-1"></div>

              {/* Smart Grid */}
              <DockItem 
                active={visibleWidgets.includes('ASSET')} 
                onClick={() => toggleWidget('ASSET')}
                icon={<TrendingUp size={18} />}
                label="Assets"
                color="bg-emerald-500"
              />
              <DockItem 
                active={visibleWidgets.includes('MARKET')} 
                onClick={() => toggleWidget('MARKET')}
                icon={<Activity size={18} />}
                label="Market Feed"
                color="bg-blue-400"
              />
              
              <div className="w-[1px] h-8 bg-white/10 mx-1"></div>

              {/* Creative/Utility */}
              <DockItem 
                active={visibleWidgets.includes('SONIC')} 
                onClick={() => toggleWidget('SONIC')}
                icon={<Music size={18} />}
                label="Music"
                color="bg-purple-500"
              />
              <DockItem 
                active={visibleWidgets.includes('THEME_ENGINE')} 
                onClick={() => toggleWidget('THEME_ENGINE')}
                icon={<Wand2 size={18} />}
                label="Aesthetic"
                color="bg-pink-500"
              />
              
            </div>
          </div>
      )}
    </div>
  );
};

const DockItem = ({ active, onClick, icon, label, color }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color: string }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center justify-center w-10 h-10 shrink-0 rounded-lg transition-all duration-300 ${active ? 'bg-slate-800 shadow-[0_0_10px_rgba(255,255,255,0.1)] scale-110 border border-white/20' : 'hover:bg-slate-800/50 hover:scale-110 border border-transparent'}`}
      title={label}
      aria-label={label}
    >
      <div className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
        {icon}
      </div>
      {/* Indicator dot */}
      {active && (
        <div className={`absolute -bottom-2 w-1 h-1 rounded-full ${color} shadow-[0_0_5px_currentColor]`}></div>
      )}
    </button>
  );
}

export default App;
