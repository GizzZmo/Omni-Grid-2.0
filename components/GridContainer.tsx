import React, { useMemo, Suspense, lazy } from 'react';
import type { Layout } from 'react-grid-layout';
import { ResponsiveGrid } from './ResponsiveGrid';
import { useAppStore } from '../store';
import { WidgetShell } from './WidgetShell';
import { WidgetSkeleton } from './WidgetSkeleton';

// Eager (lightweight core)
import { UniversalTransformer } from '../widgets/UniversalTransformer';
import { NeuralScratchpad } from '../widgets/NeuralScratchpad';
import { FocusHUD } from '../widgets/FocusHUD';
import { DevOptic } from '../widgets/DevOptic';
import { CipherVault } from '../widgets/CipherVault';
import { ChromaLab } from '../widgets/ChromaLab';
import { TemporalNexus } from '../widgets/TemporalNexus';
import { QuantumCalc } from '../widgets/QuantumCalc';
import { AssetCommand } from '../widgets/AssetCommand';
import { SystemCore } from '../widgets/SystemCore';
import { HelpDesk } from '../widgets/HelpDesk';
import { GhostWidget } from '../widgets/GhostWidget';
import { SudokuGrid } from '../widgets/SudokuGrid';
import { ClipboardStream } from '../widgets/ClipboardStream';
import { ValutaExchange } from '../widgets/ValutaExchange';
import { WeatherStation } from '../widgets/WeatherStation';

// Lazy (heavy / less-frequently opened)
const SonicArchitecture = lazy(() =>
  import('../widgets/SonicArchitecture').then(m => ({ default: m.SonicArchitecture }))
);
const PolyglotBox = lazy(() =>
  import('../widgets/PolyglotBox').then(m => ({ default: m.PolyglotBox }))
);
const WritePad = lazy(() => import('../widgets/WritePad').then(m => ({ default: m.WritePad })));
const WidgetArchitect = lazy(() =>
  import('../widgets/WidgetArchitect').then(m => ({ default: m.WidgetArchitect }))
);
const AestheticEngine = lazy(() =>
  import('../widgets/AestheticEngine').then(m => ({ default: m.AestheticEngine }))
);
const SignalRadio = lazy(() =>
  import('../widgets/SignalRadio').then(m => ({ default: m.SignalRadio }))
);
const DocuHub = lazy(() => import('../widgets/DocuHub').then(m => ({ default: m.DocuHub })));
const GitPulse = lazy(() => import('../widgets/GitPulse').then(m => ({ default: m.GitPulse })));
const ProjectTracker = lazy(() =>
  import('../widgets/ProjectTracker').then(m => ({ default: m.ProjectTracker }))
);
const WebTerminal = lazy(() =>
  import('../widgets/WebTerminal').then(m => ({ default: m.WebTerminal }))
);
const CyberEditor = lazy(() =>
  import('../widgets/CyberEditor').then(m => ({ default: m.CyberEditor }))
);
const NewsFeed = lazy(() => import('../widgets/NewsFeed').then(m => ({ default: m.NewsFeed })));
const CipherPad = lazy(() => import('../widgets/CipherPad').then(m => ({ default: m.CipherPad })));
const PDFViewer = lazy(() => import('../widgets/PDFViewer').then(m => ({ default: m.PDFViewer })));
const ResearchBrowser = lazy(() =>
  import('../widgets/ResearchBrowser').then(m => ({ default: m.ResearchBrowser }))
);
const SecureCalendar = lazy(() =>
  import('../widgets/SecureCalendar').then(m => ({ default: m.SecureCalendar }))
);
const MacroNet = lazy(() => import('../widgets/MacroNet').then(m => ({ default: m.MacroNet })));
const ChainPulse = lazy(() =>
  import('../widgets/ChainPulse').then(m => ({ default: m.ChainPulse }))
);
const RegRadar = lazy(() => import('../widgets/RegRadar').then(m => ({ default: m.RegRadar })));
const MarketWidget = lazy(() =>
  import('../widgets/MarketWidget').then(m => ({ default: m.MarketWidget }))
);
const StrategicBlueprint = lazy(() =>
  import('../widgets/StrategicBlueprint').then(m => ({ default: m.StrategicBlueprint }))
);
const PromptLab = lazy(() => import('../widgets/PromptLab').then(m => ({ default: m.PromptLab })));
const NeuralChat = lazy(() =>
  import('../widgets/NeuralChat').then(m => ({ default: m.NeuralChat }))
);
const SunoPlayer = lazy(() =>
  import('../widgets/SunoPlayer').then(m => ({ default: m.SunoPlayer }))
);
const WidgetMarketplace = lazy(() =>
  import('../widgets/WidgetMarketplace').then(m => ({ default: m.WidgetMarketplace }))
);
const MultiAgentHub = lazy(() =>
  import('../widgets/MultiAgentHub').then(m => ({ default: m.MultiAgentHub }))
);
const BrowserWidget = lazy(() =>
  import('../widgets/BrowserWidget').then(m => ({ default: m.BrowserWidget }))
);
const CommunityPortal = lazy(() =>
  import('../widgets/CommunityPortal').then(m => ({ default: m.CommunityPortal }))
);

import {
  FileJson,
  BrainCircuit,
  Activity,
  Code2,
  Lock,
  Palette,
  Clock,
  Music,
  Music2,
  Calculator,
  TrendingUp,
  Languages,
  PenTool,
  Cloud,
  DollarSign,
  Terminal,
  HelpCircle,
  PenTool as PenToolIcon,
  Wand2,
  Radio,
  Grid,
  Book,
  GitPullRequest,
  Layout as LayoutIcon,
  Globe,
  Rss,
  FileText,
  Calendar,
  Scale,
  Briefcase,
  Clipboard,
  FileCode,
  GitBranch,
  MessageSquare,
  ShoppingBag,
  Bot,
  Sparkles,
} from 'lucide-react';
import { downloadJson, uploadJson } from '../utils';

/** Wrap a lazy widget in Suspense with cyberpunk skeleton */
const Lazy = ({ children, label }: { children: React.ReactNode; label?: string }) => (
  <Suspense fallback={<WidgetSkeleton label={label} />}>{children}</Suspense>
);

export const GridContainer: React.FC = () => {
  const layouts = useAppStore(s => s.layouts);
  const updateLayout = useAppStore(s => s.updateLayout);
  const visibleWidgets = useAppStore(s => s.visibleWidgets);
  const isLayoutLocked = useAppStore(s => s.isLayoutLocked);
  const isCompact = useAppStore(s => s.isCompact);
  const ghostWidget = useAppStore(s => s.ghostWidget);

  const setScratchpadContent = useAppStore(s => s.setScratchpadContent);
  const setTasks = useAppStore(s => s.setTasks);
  const setTickers = useAppStore(s => s.setTickers);
  const setWritePadContent = useAppStore(s => s.setWritePadContent);
  const setWeatherLocation = useAppStore(s => s.setWeatherLocation);

  const handleLayoutChange = (layout: Layout[]) => {
    const cleanLayout = layout.map((l: any) => ({
      i: l.i,
      x: l.x,
      y: l.y,
      w: l.w,
      h: l.h,
    }));
    updateLayout(cleanLayout);
  };

  const getStore = useAppStore.getState;

  const widgetComponents = useMemo(
    () => ({
      SYSTEM: (
        <WidgetShell id="SYSTEM" title="System Core" icon={<Terminal size={14} />} accentColor="text-red-400" className="h-full">
          <SystemCore />
        </WidgetShell>
      ),
      HELP: (
        <WidgetShell id="HELP" title="Help Desk" icon={<HelpCircle size={14} />} accentColor="text-emerald-400" className="h-full">
          <HelpDesk />
        </WidgetShell>
      ),
      TRANSFORMER: (
        <WidgetShell id="TRANSFORMER" title="Transformer" icon={<FileJson size={14} />} accentColor="text-indigo-400" className="h-full">
          <UniversalTransformer />
        </WidgetShell>
      ),
      SCRATCHPAD: (
        <WidgetShell
          id="SCRATCHPAD"
          title="Neural Scratchpad"
          icon={<BrainCircuit size={14} />}
          accentColor="text-fuchsia-400"
          className="h-full"
          onExport={() => downloadJson('scratchpad.json', { content: getStore().scratchpadContent })}
          onImport={() => uploadJson(data => { if (data.content) setScratchpadContent(data.content); })}
        >
          <NeuralScratchpad />
        </WidgetShell>
      ),
      FOCUS_HUD: (
        <WidgetShell
          id="FOCUS_HUD"
          title="Focus HUD"
          icon={<Activity size={14} />}
          accentColor="text-cyan-400"
          className="h-full"
          onExport={() => downloadJson('tasks.json', { tasks: getStore().tasks })}
          onImport={() => uploadJson(data => { if (Array.isArray(data.tasks)) setTasks(data.tasks); })}
        >
          <FocusHUD />
        </WidgetShell>
      ),
      DEV_OPTIC: (
        <WidgetShell id="DEV_OPTIC" title="Dev Optic" icon={<Code2 size={14} />} accentColor="text-orange-400" className="h-full">
          <DevOptic />
        </WidgetShell>
      ),
      CIPHER_VAULT: (
        <WidgetShell id="CIPHER_VAULT" title="Cipher Vault" icon={<Lock size={14} />} accentColor="text-emerald-400" className="h-full">
          <CipherVault />
        </WidgetShell>
      ),
      CHROMA_LAB: (
        <WidgetShell id="CHROMA_LAB" title="Chroma Lab" icon={<Palette size={14} />} accentColor="text-pink-400" className="h-full">
          <ChromaLab />
        </WidgetShell>
      ),
      TEMPORAL: (
        <WidgetShell id="TEMPORAL" title="Temporal Nexus" icon={<Clock size={14} />} accentColor="text-blue-400" className="h-full">
          <TemporalNexus />
        </WidgetShell>
      ),
      SONIC: (
        <WidgetShell id="SONIC" title="Sonic Architecture" icon={<Music size={14} />} accentColor="text-purple-400" className="h-full">
          <Lazy label="SONIC ARCHITECTURE"><SonicArchitecture /></Lazy>
        </WidgetShell>
      ),
      CALC: (
        <WidgetShell id="CALC" title="Quantum Calc" icon={<Calculator size={14} />} accentColor="text-teal-400" className="h-full">
          <QuantumCalc />
        </WidgetShell>
      ),
      ASSET: (
        <WidgetShell
          id="ASSET"
          title="Asset Command"
          icon={<TrendingUp size={14} />}
          accentColor="text-emerald-400"
          className="h-full"
          onExport={() => downloadJson('assets.json', { tickers: getStore().tickers })}
          onImport={() => uploadJson(data => { if (Array.isArray(data.tickers)) setTickers(data.tickers); })}
        >
          <AssetCommand />
        </WidgetShell>
      ),
      POLYGLOT: (
        <WidgetShell id="POLYGLOT" title="Polyglot Box" icon={<Languages size={14} />} accentColor="text-indigo-300" className="h-full">
          <Lazy label="POLYGLOT BOX"><PolyglotBox /></Lazy>
        </WidgetShell>
      ),
      WRITEPAD: (
        <WidgetShell
          id="WRITEPAD"
          title="WritePad"
          icon={<PenTool size={14} />}
          accentColor="text-rose-400"
          className="h-full"
          onExport={() => downloadJson('document.json', { content: getStore().writePadContent })}
          onImport={() => uploadJson(data => { if (data.content) setWritePadContent(data.content); })}
        >
          <Lazy label="WRITEPAD"><WritePad /></Lazy>
        </WidgetShell>
      ),
      WEATHER: (
        <WidgetShell
          id="WEATHER"
          title="Weather"
          icon={<Cloud size={14} />}
          accentColor="text-sky-400"
          className="h-full"
          onExport={() => downloadJson('weather_loc.json', { location: getStore().weatherLocation })}
          onImport={() => uploadJson(data => { if (data.location) setWeatherLocation(data.location); })}
        >
          <WeatherStation />
        </WidgetShell>
      ),
      VALUTA: (
        <WidgetShell id="VALUTA" title="Valuta" icon={<DollarSign size={14} />} accentColor="text-emerald-400" className="h-full">
          <ValutaExchange />
        </WidgetShell>
      ),
      ARCHITECT: (
        <WidgetShell id="ARCHITECT" title="Widget Architect" icon={<PenToolIcon size={14} />} accentColor="text-indigo-400" className="h-full">
          <Lazy label="WIDGET ARCHITECT"><WidgetArchitect /></Lazy>
        </WidgetShell>
      ),
      THEME_ENGINE: (
        <WidgetShell id="THEME_ENGINE" title="Aesthetic Engine" icon={<Wand2 size={14} />} accentColor="text-pink-400" className="h-full">
          <Lazy label="AESTHETIC ENGINE"><AestheticEngine /></Lazy>
        </WidgetShell>
      ),
      RADIO: (
        <WidgetShell id="RADIO" title="Signal Radio" icon={<Radio size={14} />} accentColor="text-cyan-400" className="h-full">
          <Lazy label="SIGNAL RADIO"><SignalRadio /></Lazy>
        </WidgetShell>
      ),
      SUDOKU: (
        <WidgetShell id="SUDOKU" title="Sudoku" icon={<Grid size={14} />} accentColor="text-cyan-400" className="h-full">
          <SudokuGrid />
        </WidgetShell>
      ),
      GHOST: <GhostWidget />,
      DOCU_HUB: (
        <WidgetShell id="DOCU_HUB" title="DocuHub" icon={<Book size={14} />} accentColor="text-indigo-400" className="h-full">
          <Lazy label="DOCUHUB"><DocuHub /></Lazy>
        </WidgetShell>
      ),
      GIT_PULSE: (
        <WidgetShell id="GIT_PULSE" title="Git Pulse" icon={<GitPullRequest size={14} />} accentColor="text-orange-400" className="h-full">
          <Lazy label="GIT PULSE"><GitPulse /></Lazy>
        </WidgetShell>
      ),
      PROJECT_TRACKER: (
        <WidgetShell id="PROJECT_TRACKER" title="Project Tracker" icon={<LayoutIcon size={14} />} accentColor="text-blue-400" className="h-full">
          <Lazy label="PROJECT TRACKER"><ProjectTracker /></Lazy>
        </WidgetShell>
      ),
      WEB_TERMINAL: (
        <WidgetShell id="WEB_TERMINAL" title="Web Terminal" icon={<Terminal size={14} />} accentColor="text-slate-400" className="h-full">
          <Lazy label="WEB TERMINAL"><WebTerminal /></Lazy>
        </WidgetShell>
      ),
      CYBER_EDITOR: (
        <WidgetShell id="CYBER_EDITOR" title="Cyber Editor" icon={<FileCode size={14} />} accentColor="text-fuchsia-400" className="h-full">
          <Lazy label="CYBER EDITOR"><CyberEditor /></Lazy>
        </WidgetShell>
      ),
      NEWS_FEED: (
        <WidgetShell id="NEWS_FEED" title="News Feed" icon={<Rss size={14} />} accentColor="text-orange-400" className="h-full">
          <Lazy label="NEWS FEED"><NewsFeed /></Lazy>
        </WidgetShell>
      ),
      CIPHER_PAD: (
        <WidgetShell id="CIPHER_PAD" title="Cipher Pad" icon={<Lock size={14} />} accentColor="text-emerald-400" className="h-full">
          <Lazy label="CIPHER PAD"><CipherPad /></Lazy>
        </WidgetShell>
      ),
      PDF_VIEWER: (
        <WidgetShell id="PDF_VIEWER" title="PDF Viewer" icon={<FileText size={14} />} accentColor="text-red-400" className="h-full">
          <Lazy label="PDF VIEWER"><PDFViewer /></Lazy>
        </WidgetShell>
      ),
      RESEARCH_BROWSER: (
        <WidgetShell id="RESEARCH_BROWSER" title="Research Browser" icon={<Globe size={14} />} accentColor="text-cyan-400" className="h-full">
          <Lazy label="RESEARCH BROWSER"><ResearchBrowser /></Lazy>
        </WidgetShell>
      ),
      SECURE_CALENDAR: (
        <WidgetShell id="SECURE_CALENDAR" title="Secure Calendar" icon={<Calendar size={14} />} accentColor="text-indigo-400" className="h-full">
          <Lazy label="SECURE CALENDAR"><SecureCalendar /></Lazy>
        </WidgetShell>
      ),
      MACRO_NET: (
        <WidgetShell id="MACRO_NET" title="Macro Net" icon={<Globe size={14} />} accentColor="text-blue-400" className="h-full">
          <Lazy label="MACRO NET"><MacroNet /></Lazy>
        </WidgetShell>
      ),
      CHAIN_PULSE: (
        <WidgetShell id="CHAIN_PULSE" title="Chain Pulse" icon={<Activity size={14} />} accentColor="text-fuchsia-400" className="h-full">
          <Lazy label="CHAIN PULSE"><ChainPulse /></Lazy>
        </WidgetShell>
      ),
      REG_RADAR: (
        <WidgetShell id="REG_RADAR" title="Reg Radar" icon={<Scale size={14} />} accentColor="text-amber-400" className="h-full">
          <Lazy label="REG RADAR"><RegRadar /></Lazy>
        </WidgetShell>
      ),
      MARKET: (
        <WidgetShell id="MARKET" title="Market Feed" icon={<Activity size={14} />} accentColor="text-blue-400" className="h-full">
          <Lazy label="MARKET FEED"><MarketWidget /></Lazy>
        </WidgetShell>
      ),
      STRATEGIC: (
        <WidgetShell id="STRATEGIC" title="Strategic Blueprint" icon={<Briefcase size={14} />} accentColor="text-blue-500" className="h-full">
          <Lazy label="STRATEGIC BLUEPRINT"><StrategicBlueprint /></Lazy>
        </WidgetShell>
      ),
      CLIPBOARD: (
        <WidgetShell id="CLIPBOARD" title="Memory Buffer" icon={<Clipboard size={14} />} accentColor="text-cyan-400" className="h-full">
          <ClipboardStream />
        </WidgetShell>
      ),
      PROMPT_LAB: (
        <WidgetShell id="PROMPT_LAB" title="Prompt Lab" icon={<GitBranch size={14} />} accentColor="text-fuchsia-400" className="h-full">
          <Lazy label="PROMPT LAB"><PromptLab /></Lazy>
        </WidgetShell>
      ),
      NEURAL_CHAT: (
        <WidgetShell id="NEURAL_CHAT" title="Neural Chat" icon={<MessageSquare size={14} />} accentColor="text-fuchsia-400" className="h-full">
          <Lazy label="NEURAL CHAT"><NeuralChat /></Lazy>
        </WidgetShell>
      ),
      SUNO_PLAYER: (
        <WidgetShell id="SUNO_PLAYER" title="Suno Player" icon={<Music2 size={14} />} accentColor="text-fuchsia-400" className="h-full">
          <Lazy label="SUNO PLAYER"><SunoPlayer /></Lazy>
        </WidgetShell>
      ),
      MARKETPLACE: (
        <WidgetShell id="MARKETPLACE" title="Widget Marketplace" icon={<ShoppingBag size={14} />} accentColor="text-fuchsia-400" className="h-full">
          <Lazy label="MARKETPLACE"><WidgetMarketplace /></Lazy>
        </WidgetShell>
      ),
      MULTI_AGENT_HUB: (
        <WidgetShell id="MULTI_AGENT_HUB" title="Multi-Agent Hub" icon={<Bot size={14} />} accentColor="text-fuchsia-400" className="h-full">
          <Lazy label="MULTI-AGENT HUB"><MultiAgentHub /></Lazy>
        </WidgetShell>
      ),
      BROWSER_WIDGET: (
        <WidgetShell id="BROWSER_WIDGET" title="Browser" icon={<Globe size={14} />} accentColor="text-cyan-400" className="h-full">
          <Lazy label="BROWSER"><BrowserWidget /></Lazy>
        </WidgetShell>
      ),
      COMMUNITY_PORTAL: (
        <WidgetShell id="COMMUNITY_PORTAL" title="Community Portal" icon={<Sparkles size={14} />} accentColor="text-amber-400" className="h-full">
          <Lazy label="COMMUNITY PORTAL"><CommunityPortal /></Lazy>
        </WidgetShell>
      ),
    }),
    []
  );

  const activeLayout = [...layouts.lg.filter(item => visibleWidgets.includes(item.i))];

  if (ghostWidget) {
    const ghostItem = layouts.lg.find(l => l.i === 'GHOST');
    if (ghostItem) {
      activeLayout.push(ghostItem);
    } else {
      activeLayout.push({ i: 'GHOST', x: 0, y: Infinity, w: 4, h: 4 });
    }
  }

  return (
    <ResponsiveGrid
      layout={activeLayout}
      onLayoutChange={handleLayoutChange}
      isLayoutLocked={isLayoutLocked}
      isCompact={isCompact}
    >
      {activeLayout.map(item => (
        <div
          key={item.i}
          data-grid={item}
          className={`relative ${item.i === 'GHOST' ? 'z-0' : 'z-10'}`}
        >
          {(widgetComponents as any)[item.i] || (
            <div className="text-red-500">Error: Unknown Widget</div>
          )}
        </div>
      ))}
    </ResponsiveGrid>
  );
};
