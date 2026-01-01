import React from 'react';
import { useAppStore } from '../store';
import {
  Terminal,
  HelpCircle,
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
  PenTool as PenToolIcon,
  Wand2,
  Radio,
  Grid,
  Book,
  GitPullRequest,
  Layout,
  Rss,
  FileText,
  Globe,
  Calendar,
  Scale,
  X,
  Briefcase,
  Clipboard,
  GitBranch,
  FileCode,
} from 'lucide-react';

// Manual mapping of all available widget types to icons and names
export const WIDGET_REGISTRY = [
  {
    id: 'SYSTEM',
    name: 'System Core',
    icon: Terminal,
    color: 'text-red-400',
    bg: 'bg-red-900/20',
    border: 'border-red-500/50',
  },
  {
    id: 'HELP',
    name: 'Help Desk',
    icon: HelpCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-500/50',
  },
  {
    id: 'TRANSFORMER',
    name: 'Transformer',
    icon: FileJson,
    color: 'text-indigo-400',
    bg: 'bg-indigo-900/20',
    border: 'border-indigo-500/50',
  },
  {
    id: 'SCRATCHPAD',
    name: 'Neural Notes',
    icon: BrainCircuit,
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-900/20',
    border: 'border-fuchsia-500/50',
  },
  {
    id: 'FOCUS_HUD',
    name: 'Focus HUD',
    icon: Activity,
    color: 'text-cyan-400',
    bg: 'bg-cyan-900/20',
    border: 'border-cyan-500/50',
  },
  {
    id: 'DEV_OPTIC',
    name: 'Dev Optic',
    icon: Code2,
    color: 'text-orange-400',
    bg: 'bg-orange-900/20',
    border: 'border-orange-500/50',
  },
  {
    id: 'CIPHER_VAULT',
    name: 'Cipher Vault',
    icon: Lock,
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-500/50',
  },
  {
    id: 'CHROMA_LAB',
    name: 'Chroma Lab',
    icon: Palette,
    color: 'text-pink-400',
    bg: 'bg-pink-900/20',
    border: 'border-pink-500/50',
  },
  {
    id: 'TEMPORAL',
    name: 'Temporal',
    icon: Clock,
    color: 'text-blue-400',
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/50',
  },
  {
    id: 'SONIC',
    name: 'Sonic Arch',
    icon: Music,
    color: 'text-purple-400',
    bg: 'bg-purple-900/20',
    border: 'border-purple-500/50',
  },
  {
    id: 'CALC',
    name: 'Quantum Calc',
    icon: Calculator,
    color: 'text-teal-400',
    bg: 'bg-teal-900/20',
    border: 'border-teal-500/50',
  },
  {
    id: 'ASSET',
    name: 'Asset Cmd',
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-500/50',
  },
  {
    id: 'POLYGLOT',
    name: 'Polyglot',
    icon: Languages,
    color: 'text-indigo-300',
    bg: 'bg-indigo-900/20',
    border: 'border-indigo-500/50',
  },
  {
    id: 'WRITEPAD',
    name: 'WritePad',
    icon: PenTool,
    color: 'text-rose-400',
    bg: 'bg-rose-900/20',
    border: 'border-rose-500/50',
  },
  {
    id: 'WEATHER',
    name: 'Weather',
    icon: Cloud,
    color: 'text-sky-400',
    bg: 'bg-sky-900/20',
    border: 'border-sky-500/50',
  },
  {
    id: 'VALUTA',
    name: 'Valuta',
    icon: DollarSign,
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-500/50',
  },
  {
    id: 'ARCHITECT',
    name: 'Architect',
    icon: PenToolIcon,
    color: 'text-indigo-400',
    bg: 'bg-indigo-900/20',
    border: 'border-indigo-500/50',
  },
  {
    id: 'THEME_ENGINE',
    name: 'Aesthetic',
    icon: Wand2,
    color: 'text-pink-400',
    bg: 'bg-pink-900/20',
    border: 'border-pink-500/50',
  },
  {
    id: 'RADIO',
    name: 'Signal Radio',
    icon: Radio,
    color: 'text-cyan-400',
    bg: 'bg-cyan-900/20',
    border: 'border-cyan-500/50',
  },
  {
    id: 'SUDOKU',
    name: 'Sudoku',
    icon: Grid,
    color: 'text-cyan-400',
    bg: 'bg-cyan-900/20',
    border: 'border-cyan-500/50',
  },
  {
    id: 'DOCU_HUB',
    name: 'DocuHub',
    icon: Book,
    color: 'text-indigo-400',
    bg: 'bg-indigo-900/20',
    border: 'border-indigo-500/50',
  },
  {
    id: 'GIT_PULSE',
    name: 'Git Pulse',
    icon: GitPullRequest,
    color: 'text-orange-400',
    bg: 'bg-orange-900/20',
    border: 'border-orange-500/50',
  },
  {
    id: 'PROJECT_TRACKER',
    name: 'Tracker',
    icon: Layout,
    color: 'text-blue-400',
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/50',
  },
  {
    id: 'WEB_TERMINAL',
    name: 'Terminal',
    icon: Terminal,
    color: 'text-slate-400',
    bg: 'bg-slate-900/20',
    border: 'border-slate-500/50',
  },
  {
    id: 'CYBER_EDITOR',
    name: 'Cyber Editor',
    icon: FileCode,
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-900/20',
    border: 'border-fuchsia-500/50',
  },
  {
    id: 'NEWS_FEED',
    name: 'News Feed',
    icon: Rss,
    color: 'text-orange-400',
    bg: 'bg-orange-900/20',
    border: 'border-orange-500/50',
  },
  {
    id: 'CIPHER_PAD',
    name: 'Cipher Pad',
    icon: Lock,
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-500/50',
  },
  {
    id: 'PDF_VIEWER',
    name: 'PDF Viewer',
    icon: FileText,
    color: 'text-red-400',
    bg: 'bg-red-900/20',
    border: 'border-red-500/50',
  },
  {
    id: 'RESEARCH_BROWSER',
    name: 'Browser',
    icon: Globe,
    color: 'text-cyan-400',
    bg: 'bg-cyan-900/20',
    border: 'border-cyan-500/50',
  },
  {
    id: 'SECURE_CALENDAR',
    name: 'Calendar',
    icon: Calendar,
    color: 'text-indigo-400',
    bg: 'bg-indigo-900/20',
    border: 'border-indigo-500/50',
  },
  {
    id: 'MACRO_NET',
    name: 'Macro Net',
    icon: Globe,
    color: 'text-blue-400',
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/50',
  },
  {
    id: 'CHAIN_PULSE',
    name: 'Chain Pulse',
    icon: Activity,
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-900/20',
    border: 'border-fuchsia-500/50',
  },
  {
    id: 'REG_RADAR',
    name: 'Reg Radar',
    icon: Scale,
    color: 'text-amber-400',
    bg: 'bg-amber-900/20',
    border: 'border-amber-500/50',
  },
  {
    id: 'MARKET',
    name: 'Market Feed',
    icon: Activity,
    color: 'text-blue-400',
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/50',
  },
  {
    id: 'STRATEGIC',
    name: 'Blueprint',
    icon: Briefcase,
    color: 'text-blue-500',
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/50',
  },
  {
    id: 'CLIPBOARD',
    name: 'Mem Buffer',
    icon: Clipboard,
    color: 'text-cyan-400',
    bg: 'bg-cyan-900/20',
    border: 'border-cyan-500/50',
  },
  {
    id: 'PROMPT_LAB',
    name: 'Prompt Lab',
    icon: GitBranch,
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-900/20',
    border: 'border-fuchsia-500/50',
  },
];

interface WidgetLauncherProps {
  onClose: () => void;
}

export const WidgetLauncher: React.FC<WidgetLauncherProps> = ({ onClose }) => {
  const { visibleWidgets, toggleWidget } = useAppStore();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-[80vw] max-w-4xl h-[80vh] bg-slate-950 border border-fuchsia-500/50 rounded-lg shadow-[0_0_50px_rgba(217,70,239,0.2)] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-fuchsia-900/50 bg-slate-900/50">
          <h2 className="text-2xl font-gothic text-fuchsia-400 tracking-wider">WIDGET MANIFEST</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 custom-scrollbar">
          {WIDGET_REGISTRY.map(widget => {
            const isActive = visibleWidgets.includes(widget.id);
            return (
              <button
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                className={`
                                    flex flex-col items-center justify-center gap-3 p-4 rounded-lg border transition-all duration-300 group
                                    ${
                                      isActive
                                        ? `${widget.bg} ${widget.border} shadow-[0_0_15px_rgba(0,0,0,0.3)]`
                                        : 'bg-slate-900/30 border-slate-800 hover:border-slate-600 hover:bg-slate-900/60'
                                    }
                                `}
              >
                <div
                  className={`
                                    p-3 rounded-full transition-all duration-300
                                    ${isActive ? 'bg-black/30 scale-110' : 'bg-slate-800 group-hover:scale-110'}
                                `}
                >
                  <widget.icon
                    size={24}
                    className={isActive ? widget.color : 'text-slate-500 group-hover:text-white'}
                  />
                </div>
                <span
                  className={`
                                    text-xs font-bold uppercase tracking-widest
                                    ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}
                                `}
                >
                  {widget.name}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Status */}
        <div className="p-2 bg-slate-900/80 border-t border-slate-800 text-[10px] text-center text-slate-500 font-mono uppercase tracking-[0.2em]">
          System Modules: {WIDGET_REGISTRY.length} | Active: {visibleWidgets.length}
        </div>
      </div>
    </div>
  );
};
