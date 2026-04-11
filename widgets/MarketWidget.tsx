import React, { useState, useMemo } from 'react';
import {
  FileJson,
  Brain,
  Clock,
  Calculator,
  Globe,
  PenTool,
  CalendarDays,
  Target,
  Clipboard,
  Grid,
  Code2,
  Terminal,
  GitBranch,
  BookOpen,
  Activity,
  Lock,
  Shield,
  Cpu,
  Wrench,
  Sparkles,
  MessageSquare,
  Wand2,
  Zap,
  Newspaper,
  FileText,
  Search,
  Languages,
  HelpCircle,
  TrendingUp,
  Link,
  DollarSign,
  BarChart2,
  Music,
  Radio,
  Palette,
  Cloud,
  BrainCircuit,
  Layout,
  Store,
  Check,
  X,
  Plus,
} from 'lucide-react';
import { useAppStore } from '../store';

type Category =
  | 'All'
  | 'Productivity'
  | 'Developer'
  | 'AI'
  | 'Research'
  | 'Finance'
  | 'Entertainment';

interface MarketplaceWidget {
  type: string;
  name: string;
  desc: string;
  category: Exclude<Category, 'All'>;
  icon: React.ReactNode;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  FileJson: <FileJson size={16} />,
  Brain: <Brain size={16} />,
  Clock: <Clock size={16} />,
  Calculator: <Calculator size={16} />,
  Globe: <Globe size={16} />,
  PenTool: <PenTool size={16} />,
  CalendarDays: <CalendarDays size={16} />,
  Layout: <Layout size={16} />,
  Target: <Target size={16} />,
  Clipboard: <Clipboard size={16} />,
  Grid: <Grid size={16} />,
  Code2: <Code2 size={16} />,
  Terminal: <Terminal size={16} />,
  GitBranch: <GitBranch size={16} />,
  BookOpen: <BookOpen size={16} />,
  Activity: <Activity size={16} />,
  Lock: <Lock size={16} />,
  Shield: <Shield size={16} />,
  Cpu: <Cpu size={16} />,
  Wrench: <Wrench size={16} />,
  Sparkles: <Sparkles size={16} />,
  MessageSquare: <MessageSquare size={16} />,
  BrainCircuit: <BrainCircuit size={16} />,
  Wand2: <Wand2 size={16} />,
  Zap: <Zap size={16} />,
  Newspaper: <Newspaper size={16} />,
  FileText: <FileText size={16} />,
  Search: <Search size={16} />,
  Languages: <Languages size={16} />,
  HelpCircle: <HelpCircle size={16} />,
  TrendingUp: <TrendingUp size={16} />,
  Link: <Link size={16} />,
  DollarSign: <DollarSign size={16} />,
  BarChart2: <BarChart2 size={16} />,
  Music: <Music size={16} />,
  Radio: <Radio size={16} />,
  Palette: <Palette size={16} />,
  Cloud: <Cloud size={16} />,
};

const MARKETPLACE_WIDGETS: MarketplaceWidget[] = [
  {
    type: 'TRANSFORMER',
    name: 'Universal Transformer',
    desc: 'Transform text between formats',
    category: 'Productivity',
    icon: ICON_MAP.FileJson,
  },
  {
    type: 'SCRATCHPAD',
    name: 'Neural Scratchpad',
    desc: 'AI-powered notes with Gemini',
    category: 'Productivity',
    icon: ICON_MAP.Brain,
  },
  {
    type: 'FOCUS_HUD',
    name: 'Focus HUD',
    desc: 'Pomodoro timer & task manager',
    category: 'Productivity',
    icon: ICON_MAP.Clock,
  },
  {
    type: 'CALC',
    name: 'Quantum Calc',
    desc: 'Scientific calculator',
    category: 'Productivity',
    icon: ICON_MAP.Calculator,
  },
  {
    type: 'TEMPORAL',
    name: 'Temporal Nexus',
    desc: 'World clocks & time zones',
    category: 'Productivity',
    icon: ICON_MAP.Globe,
  },
  {
    type: 'WRITEPAD',
    name: 'Write Pad',
    desc: 'Rich text editor',
    category: 'Productivity',
    icon: ICON_MAP.PenTool,
  },
  {
    type: 'SECURE_CALENDAR',
    name: 'Secure Calendar',
    desc: 'Private calendar widget',
    category: 'Productivity',
    icon: ICON_MAP.CalendarDays,
  },
  {
    type: 'PROJECT_TRACKER',
    name: 'Project Tracker',
    desc: 'Kanban board for tasks',
    category: 'Productivity',
    icon: ICON_MAP.Layout,
  },
  {
    type: 'STRATEGIC',
    name: 'Strategic Blueprint',
    desc: 'Strategy & planning board',
    category: 'Productivity',
    icon: ICON_MAP.Target,
  },
  {
    type: 'CLIPBOARD',
    name: 'Clipboard Stream',
    desc: 'Clipboard history manager',
    category: 'Productivity',
    icon: ICON_MAP.Clipboard,
  },
  {
    type: 'SUDOKU',
    name: 'Sudoku Grid',
    desc: 'Classic sudoku puzzle game',
    category: 'Productivity',
    icon: ICON_MAP.Grid,
  },
  {
    type: 'CYBER_EDITOR',
    name: 'Cyber Editor',
    desc: 'Monaco code editor with AI',
    category: 'Developer',
    icon: ICON_MAP.Code2,
  },
  {
    type: 'WEB_TERMINAL',
    name: 'Web Terminal',
    desc: 'JavaScript REPL terminal',
    category: 'Developer',
    icon: ICON_MAP.Terminal,
  },
  {
    type: 'GIT_PULSE',
    name: 'Git Pulse',
    desc: 'GitHub repository monitor',
    category: 'Developer',
    icon: ICON_MAP.GitBranch,
  },
  {
    type: 'DOCU_HUB',
    name: 'Docu Hub',
    desc: 'Documentation browser',
    category: 'Developer',
    icon: ICON_MAP.BookOpen,
  },
  {
    type: 'DEV_OPTIC',
    name: 'Dev Optic',
    desc: 'API & network inspector',
    category: 'Developer',
    icon: ICON_MAP.Activity,
  },
  {
    type: 'CIPHER_VAULT',
    name: 'Cipher Vault',
    desc: 'Hashing & encryption tools',
    category: 'Developer',
    icon: ICON_MAP.Lock,
  },
  {
    type: 'CIPHER_PAD',
    name: 'Cipher Pad',
    desc: 'Text encryption & steganography',
    category: 'Developer',
    icon: ICON_MAP.Shield,
  },
  {
    type: 'SYSTEM',
    name: 'System Core',
    desc: 'System resource monitor',
    category: 'Developer',
    icon: ICON_MAP.Cpu,
  },
  {
    type: 'ARCHITECT',
    name: 'Widget Architect',
    desc: 'Build & scaffold new widgets',
    category: 'Developer',
    icon: ICON_MAP.Wrench,
  },
  {
    type: 'PROMPT_LAB',
    name: 'Prompt Lab',
    desc: 'AI prompt workspace',
    category: 'AI',
    icon: ICON_MAP.Sparkles,
  },
  {
    type: 'NEURAL_CHAT',
    name: 'Neural Chat',
    desc: 'AI chat with Gemini',
    category: 'AI',
    icon: ICON_MAP.MessageSquare,
  },
  {
    type: 'THEME_ENGINE',
    name: 'Aesthetic Engine',
    desc: 'Visual effects & animations',
    category: 'AI',
    icon: ICON_MAP.Zap,
  },
  {
    type: 'NEWS_FEED',
    name: 'News Feed',
    desc: 'AI-curated news aggregator',
    category: 'Research',
    icon: ICON_MAP.Newspaper,
  },
  {
    type: 'PDF_VIEWER',
    name: 'PDF Viewer',
    desc: 'Document reader & annotator',
    category: 'Research',
    icon: ICON_MAP.FileText,
  },
  {
    type: 'RESEARCH_BROWSER',
    name: 'Research Browser',
    desc: 'AI-powered research tool',
    category: 'Research',
    icon: ICON_MAP.Search,
  },
  {
    type: 'POLYGLOT',
    name: 'Polyglot Box',
    desc: 'Language translator',
    category: 'Research',
    icon: ICON_MAP.Languages,
  },
  {
    type: 'HELP',
    name: 'Help Desk',
    desc: 'Documentation & help center',
    category: 'Research',
    icon: ICON_MAP.HelpCircle,
  },
  {
    type: 'MACRO_NET',
    name: 'Macro Net',
    desc: 'Global macroeconomics data',
    category: 'Finance',
    icon: ICON_MAP.TrendingUp,
  },
  {
    type: 'CHAIN_PULSE',
    name: 'Chain Pulse',
    desc: 'Blockchain & DeFi tracker',
    category: 'Finance',
    icon: ICON_MAP.Link,
  },
  {
    type: 'REG_RADAR',
    name: 'Reg Radar',
    desc: 'Regulatory compliance monitor',
    category: 'Finance',
    icon: ICON_MAP.Shield,
  },
  {
    type: 'VALUTA',
    name: 'Valuta Exchange',
    desc: 'Currency exchange rates',
    category: 'Finance',
    icon: ICON_MAP.DollarSign,
  },
  {
    type: 'ASSET',
    name: 'Asset Command',
    desc: 'Asset portfolio tracker',
    category: 'Finance',
    icon: ICON_MAP.BarChart2,
  },
  {
    type: 'SONIC',
    name: 'Sonic Architecture',
    desc: 'Music theory & audio tools',
    category: 'Entertainment',
    icon: ICON_MAP.Music,
  },
  {
    type: 'RADIO',
    name: 'Signal Radio',
    desc: 'Internet radio player',
    category: 'Entertainment',
    icon: ICON_MAP.Radio,
  },
  {
    type: 'CHROMA_LAB',
    name: 'Chroma Lab',
    desc: 'Color palette generator',
    category: 'Entertainment',
    icon: ICON_MAP.Palette,
  },
  {
    type: 'WEATHER',
    name: 'Weather Station',
    desc: 'Real-time weather & forecasts',
    category: 'Entertainment',
    icon: ICON_MAP.Cloud,
  },
];

const CATEGORIES: Category[] = [
  'All',
  'Productivity',
  'Developer',
  'AI',
  'Research',
  'Finance',
  'Entertainment',
];

const CATEGORY_COLORS: Record<string, string> = {
  Productivity: 'text-cyan-400 border-cyan-500/40 bg-cyan-900/20',
  Developer: 'text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-900/20',
  AI: 'text-emerald-400 border-emerald-500/40 bg-emerald-900/20',
  Research: 'text-amber-400 border-amber-500/40 bg-amber-900/20',
  Finance: 'text-blue-400 border-blue-500/40 bg-blue-900/20',
  Entertainment: 'text-rose-400 border-rose-500/40 bg-rose-900/20',
};

export const MarketWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const visibleWidgets = useAppStore(s => s.visibleWidgets);
  const toggleWidget = useAppStore(s => s.toggleWidget);

  const isInstalled = (type: string) => visibleWidgets.includes(type);

  const filtered = useMemo(() => {
    return MARKETPLACE_WIDGETS.filter(w => {
      const matchesTab = activeTab === 'All' || w.category === activeTab;
      const matchesSearch =
        !search.trim() ||
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.desc.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, search]);

  const countByCategory = useMemo(() => {
    const counts: Partial<Record<Category, number>> = {};
    MARKETPLACE_WIDGETS.forEach(w => {
      counts[w.category] = (counts[w.category] ?? 0) + 1;
    });
    counts['All'] = MARKETPLACE_WIDGETS.length;
    return counts;
  }, []);

  const installedCount = visibleWidgets.length;

  return (
    <div className="h-full flex flex-col bg-slate-950 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <Store size={12} className="text-cyan-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Widget Marketplace
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400">{installedCount} installed</span>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-slate-800/40 shrink-0">
        <div className="relative">
          <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search widgets..."
            className="w-full bg-slate-900 border border-slate-700 rounded pl-6 pr-3 py-1.5 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-slate-800/40 overflow-x-auto shrink-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeTab === cat
                ? 'bg-cyan-900/40 border border-cyan-500/50 text-cyan-400'
                : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
            }`}
          >
            {cat}
            <span
              className={`text-[8px] px-1 rounded ${activeTab === cat ? 'bg-cyan-900 text-cyan-300' : 'bg-slate-800 text-slate-600'}`}
            >
              {countByCategory[cat] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Widget list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-slate-600">
            <Search size={24} className="mb-2 opacity-40" />
            <p className="text-[10px]">No widgets found</p>
          </div>
        )}
        {filtered.map(widget => {
          const installed = isInstalled(widget.type);
          const colorClass =
            CATEGORY_COLORS[widget.category] ?? 'text-slate-400 border-slate-700 bg-slate-900/20';
          return (
            <div
              key={widget.type}
              className={`flex items-center gap-3 px-3 py-2.5 rounded border transition-all group ${
                installed
                  ? 'bg-slate-900/80 border-slate-700 hover:border-slate-600'
                  : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
              }`}
            >
              {/* Icon */}
              <div
                className={`w-8 h-8 rounded flex items-center justify-center border shrink-0 ${colorClass}`}
              >
                {widget.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-200 truncate">
                    {widget.name}
                  </span>
                  <span
                    className={`text-[8px] uppercase font-bold px-1 rounded border hidden sm:inline ${colorClass}`}
                  >
                    {widget.category}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{widget.desc}</p>
              </div>

              {/* Toggle button */}
              <button
                onClick={() => toggleWidget(widget.type)}
                className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded border text-[9px] font-semibold uppercase tracking-wider transition-all ${
                  installed
                    ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400 hover:bg-red-900/30 hover:border-red-500/50 hover:text-red-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-cyan-900/30 hover:border-cyan-500/50 hover:text-cyan-400'
                }`}
                title={installed ? 'Remove widget' : 'Add widget'}
              >
                {installed ? (
                  <>
                    <Check size={9} />
                    <span className="hidden sm:inline">Added</span>
                  </>
                ) : (
                  <>
                    <Plus size={9} />
                    <span className="hidden sm:inline">Add</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-3 py-1.5 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-[9px] text-slate-600 font-mono">
          {filtered.length} widget{filtered.length !== 1 ? 's' : ''} shown
        </span>
        <span className="text-[9px] text-slate-600 uppercase tracking-widest">
          Omni-Grid Market
        </span>
      </div>
    </div>
  );
};
