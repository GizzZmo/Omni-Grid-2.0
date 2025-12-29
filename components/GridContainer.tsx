import React, { useMemo } from 'react';
import RGL, { Layout } from 'react-grid-layout';
import { useAppStore } from '../store';
import { WidgetShell } from './WidgetShell';
import { UniversalTransformer } from '../widgets/UniversalTransformer';
import { NeuralScratchpad } from '../widgets/NeuralScratchpad';
import { FocusHUD } from '../widgets/FocusHUD';
import { DevOptic } from '../widgets/DevOptic';
import { CipherVault } from '../widgets/CipherVault';
import { ChromaLab } from '../widgets/ChromaLab';
import { TemporalNexus } from '../widgets/TemporalNexus';
import { SonicArchitecture } from '../widgets/SonicArchitecture';
import { QuantumCalc } from '../widgets/QuantumCalc';
import { AssetCommand } from '../widgets/AssetCommand';
import { PolyglotBox } from '../widgets/PolyglotBox';
import { WritePad } from '../widgets/WritePad';
import { WeatherStation } from '../widgets/WeatherStation';
import { ValutaExchange } from '../widgets/ValutaExchange';
import { SystemCore } from '../widgets/SystemCore';
import { HelpDesk } from '../widgets/HelpDesk';
import { WidgetArchitect } from '../widgets/WidgetArchitect';
import { AestheticEngine } from '../widgets/AestheticEngine';
import { GhostWidget } from '../widgets/GhostWidget';
import { SignalRadio } from '../widgets/SignalRadio';
import { SudokuGrid } from '../widgets/SudokuGrid';
// New Imports
import { DocuHub } from '../widgets/DocuHub';
import { GitPulse } from '../widgets/GitPulse';
import { ProjectTracker } from '../widgets/ProjectTracker';
import { WebTerminal } from '../widgets/WebTerminal';
import { CyberEditor } from '../widgets/CyberEditor';
import { NewsFeed } from '../widgets/NewsFeed';
import { CipherPad } from '../widgets/CipherPad';
import { PDFViewer } from '../widgets/PDFViewer';
import { ResearchBrowser } from '../widgets/ResearchBrowser';
import { SecureCalendar } from '../widgets/SecureCalendar';
import { MacroNet } from '../widgets/MacroNet';
import { ChainPulse } from '../widgets/ChainPulse';
import { RegRadar } from '../widgets/RegRadar';
import { MarketWidget } from '../widgets/MarketWidget';
import { StrategicBlueprint } from '../widgets/StrategicBlueprint';
import { ClipboardStream } from '../widgets/ClipboardStream';

import {
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
} from 'lucide-react';
import { downloadJson, uploadJson } from '../utils';

const WidthProvider = (RGL as any).WidthProvider;
const ReactGridLayout = WidthProvider(RGL);

export const GridContainer: React.FC = () => {
  // Performance Optimization: Select only what is needed for layout rendering
  const layouts = useAppStore(s => s.layouts);
  const updateLayout = useAppStore(s => s.updateLayout);
  const visibleWidgets = useAppStore(s => s.visibleWidgets);
  const isLayoutLocked = useAppStore(s => s.isLayoutLocked);
  const isCompact = useAppStore(s => s.isCompact);
  const ghostWidget = useAppStore(s => s.ghostWidget);

  // Setters for imports - these are stable references
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

  // Helper to read latest state for exports without subscribing this component to updates
  const getStore = useAppStore.getState;

  // Memoize widget list to prevent re-creation on every render
  const widgetComponents = useMemo(
    () => ({
      SYSTEM: (
        <WidgetShell
          id="SYSTEM"
          title="System Core"
          icon={<Terminal size={14} />}
          accentColor="text-red-400"
          className="h-full"
        >
          <SystemCore />
        </WidgetShell>
      ),
      HELP: (
        <WidgetShell
          id="HELP"
          title="Help Desk"
          icon={<HelpCircle size={14} />}
          accentColor="text-emerald-400"
          className="h-full"
        >
          <HelpDesk />
        </WidgetShell>
      ),
      TRANSFORMER: (
        <WidgetShell
          id="TRANSFORMER"
          title="Transformer"
          icon={<FileJson size={14} />}
          accentColor="text-indigo-400"
          className="h-full"
        >
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
          onExport={() =>
            downloadJson('scratchpad.json', { content: getStore().scratchpadContent })
          }
          onImport={() =>
            uploadJson(data => {
              if (data.content) setScratchpadContent(data.content);
            })
          }
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
          onImport={() =>
            uploadJson(data => {
              if (Array.isArray(data.tasks)) setTasks(data.tasks);
            })
          }
        >
          <FocusHUD />
        </WidgetShell>
      ),
      DEV_OPTIC: (
        <WidgetShell
          id="DEV_OPTIC"
          title="Dev Optic"
          icon={<Code2 size={14} />}
          accentColor="text-orange-400"
          className="h-full"
        >
          <DevOptic />
        </WidgetShell>
      ),
      CIPHER_VAULT: (
        <WidgetShell
          id="CIPHER_VAULT"
          title="Cipher Vault"
          icon={<Lock size={14} />}
          accentColor="text-emerald-400"
          className="h-full"
        >
          <CipherVault />
        </WidgetShell>
      ),
      CHROMA_LAB: (
        <WidgetShell
          id="CHROMA_LAB"
          title="Chroma Lab"
          icon={<Palette size={14} />}
          accentColor="text-pink-400"
          className="h-full"
        >
          <ChromaLab />
        </WidgetShell>
      ),
      TEMPORAL: (
        <WidgetShell
          id="TEMPORAL"
          title="Temporal Nexus"
          icon={<Clock size={14} />}
          accentColor="text-blue-400"
          className="h-full"
        >
          <TemporalNexus />
        </WidgetShell>
      ),
      SONIC: (
        <WidgetShell
          id="SONIC"
          title="Sonic Architecture"
          icon={<Music size={14} />}
          accentColor="text-purple-400"
          className="h-full"
        >
          <SonicArchitecture />
        </WidgetShell>
      ),
      CALC: (
        <WidgetShell
          id="CALC"
          title="Quantum Calc"
          icon={<Calculator size={14} />}
          accentColor="text-teal-400"
          className="h-full"
        >
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
          onImport={() =>
            uploadJson(data => {
              if (Array.isArray(data.tickers)) setTickers(data.tickers);
            })
          }
        >
          <AssetCommand />
        </WidgetShell>
      ),
      POLYGLOT: (
        <WidgetShell
          id="POLYGLOT"
          title="Polyglot Box"
          icon={<Languages size={14} />}
          accentColor="text-indigo-300"
          className="h-full"
        >
          <PolyglotBox />
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
          onImport={() =>
            uploadJson(data => {
              if (data.content) setWritePadContent(data.content);
            })
          }
        >
          <WritePad />
        </WidgetShell>
      ),
      WEATHER: (
        <WidgetShell
          id="WEATHER"
          title="Weather"
          icon={<Cloud size={14} />}
          accentColor="text-sky-400"
          className="h-full"
          onExport={() =>
            downloadJson('weather_loc.json', { location: getStore().weatherLocation })
          }
          onImport={() =>
            uploadJson(data => {
              if (data.location) setWeatherLocation(data.location);
            })
          }
        >
          <WeatherStation />
        </WidgetShell>
      ),
      VALUTA: (
        <WidgetShell
          id="VALUTA"
          title="Valuta"
          icon={<DollarSign size={14} />}
          accentColor="text-emerald-400"
          className="h-full"
        >
          <ValutaExchange />
        </WidgetShell>
      ),
      ARCHITECT: (
        <WidgetShell
          id="ARCHITECT"
          title="Widget Architect"
          icon={<PenToolIcon size={14} />}
          accentColor="text-indigo-400"
          className="h-full"
        >
          <WidgetArchitect />
        </WidgetShell>
      ),
      THEME_ENGINE: (
        <WidgetShell
          id="THEME_ENGINE"
          title="Aesthetic Engine"
          icon={<Wand2 size={14} />}
          accentColor="text-pink-400"
          className="h-full"
        >
          <AestheticEngine />
        </WidgetShell>
      ),
      RADIO: (
        <WidgetShell
          id="RADIO"
          title="Signal Radio"
          icon={<Radio size={14} />}
          accentColor="text-cyan-400"
          className="h-full"
        >
          <SignalRadio />
        </WidgetShell>
      ),
      SUDOKU: (
        <WidgetShell
          id="SUDOKU"
          title="Sudoku"
          icon={<Grid size={14} />}
          accentColor="text-cyan-400"
          className="h-full"
        >
          <SudokuGrid />
        </WidgetShell>
      ),
      GHOST: <GhostWidget />,
      DOCU_HUB: (
        <WidgetShell
          id="DOCU_HUB"
          title="DocuHub"
          icon={<Book size={14} />}
          accentColor="text-indigo-400"
          className="h-full"
        >
          <DocuHub />
        </WidgetShell>
      ),
      GIT_PULSE: (
        <WidgetShell
          id="GIT_PULSE"
          title="Git Pulse"
          icon={<GitPullRequest size={14} />}
          accentColor="text-orange-400"
          className="h-full"
        >
          <GitPulse />
        </WidgetShell>
      ),
      PROJECT_TRACKER: (
        <WidgetShell
          id="PROJECT_TRACKER"
          title="Project Tracker"
          icon={<LayoutIcon size={14} />}
          accentColor="text-blue-400"
          className="h-full"
        >
          <ProjectTracker />
        </WidgetShell>
      ),
      WEB_TERMINAL: (
        <WidgetShell
          id="WEB_TERMINAL"
          title="Web Terminal"
          icon={<Terminal size={14} />}
          accentColor="text-slate-400"
          className="h-full"
        >
          <WebTerminal />
        </WidgetShell>
      ),
      CYBER_EDITOR: (
        <WidgetShell
          id="CYBER_EDITOR"
          title="Cyber Editor"
          icon={<FileCode size={14} />}
          accentColor="text-fuchsia-400"
          className="h-full"
        >
          <CyberEditor />
        </WidgetShell>
      ),
      NEWS_FEED: (
        <WidgetShell
          id="NEWS_FEED"
          title="News Feed"
          icon={<Rss size={14} />}
          accentColor="text-orange-400"
          className="h-full"
        >
          <NewsFeed />
        </WidgetShell>
      ),
      CIPHER_PAD: (
        <WidgetShell
          id="CIPHER_PAD"
          title="Cipher Pad"
          icon={<Lock size={14} />}
          accentColor="text-emerald-400"
          className="h-full"
        >
          <CipherPad />
        </WidgetShell>
      ),
      PDF_VIEWER: (
        <WidgetShell
          id="PDF_VIEWER"
          title="PDF Viewer"
          icon={<FileText size={14} />}
          accentColor="text-red-400"
          className="h-full"
        >
          <PDFViewer />
        </WidgetShell>
      ),
      RESEARCH_BROWSER: (
        <WidgetShell
          id="RESEARCH_BROWSER"
          title="Research Browser"
          icon={<Globe size={14} />}
          accentColor="text-cyan-400"
          className="h-full"
        >
          <ResearchBrowser />
        </WidgetShell>
      ),
      SECURE_CALENDAR: (
        <WidgetShell
          id="SECURE_CALENDAR"
          title="Secure Calendar"
          icon={<Calendar size={14} />}
          accentColor="text-indigo-400"
          className="h-full"
        >
          <SecureCalendar />
        </WidgetShell>
      ),
      MACRO_NET: (
        <WidgetShell
          id="MACRO_NET"
          title="Macro Net"
          icon={<Globe size={14} />}
          accentColor="text-blue-400"
          className="h-full"
        >
          <MacroNet />
        </WidgetShell>
      ),
      CHAIN_PULSE: (
        <WidgetShell
          id="CHAIN_PULSE"
          title="Chain Pulse"
          icon={<Activity size={14} />}
          accentColor="text-fuchsia-400"
          className="h-full"
        >
          <ChainPulse />
        </WidgetShell>
      ),
      REG_RADAR: (
        <WidgetShell
          id="REG_RADAR"
          title="Reg Radar"
          icon={<Scale size={14} />}
          accentColor="text-amber-400"
          className="h-full"
        >
          <RegRadar />
        </WidgetShell>
      ),
      MARKET: (
        <WidgetShell
          id="MARKET"
          title="Market Feed"
          icon={<Activity size={14} />}
          accentColor="text-blue-400"
          className="h-full"
        >
          <MarketWidget />
        </WidgetShell>
      ),
      STRATEGIC: (
        <WidgetShell
          id="STRATEGIC"
          title="Strategic Blueprint"
          icon={<Briefcase size={14} />}
          accentColor="text-blue-500"
          className="h-full"
        >
          <StrategicBlueprint />
        </WidgetShell>
      ),
      CLIPBOARD: (
        <WidgetShell
          id="CLIPBOARD"
          title="Memory Buffer"
          icon={<Clipboard size={14} />}
          accentColor="text-cyan-400"
          className="h-full"
        >
          <ClipboardStream />
        </WidgetShell>
      ),
    }),
    []
  ); // Memoized: no dependencies, these shells are stable

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
    <ReactGridLayout
      className="layout"
      layout={activeLayout}
      cols={12}
      rowHeight={30}
      width={1200}
      draggableHandle=".drag-handle"
      onLayoutChange={handleLayoutChange}
      compactType={isCompact ? 'vertical' : null}
      preventCollision={false}
      margin={[16, 16]}
      isDraggable={!isLayoutLocked}
      isResizable={!isLayoutLocked}
      resizeHandles={['se']}
    >
      {activeLayout.map(item => (
        <div
          key={item.i}
          data-grid={item}
          className={`relative ${item.i === 'GHOST' ? 'z-0' : 'z-10'}`}
        >
          {/* Cast to any to avoid strict type indexing issues with dynamic keys */}
          {(widgetComponents as any)[item.i] || (
            <div className="text-red-500">Error: Unknown Widget</div>
          )}
        </div>
      ))}
    </ReactGridLayout>
  );
};
