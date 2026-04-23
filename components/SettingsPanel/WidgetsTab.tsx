import React from 'react';
import { useAppStore } from '../../store';
import { Grid3x3, Eye, EyeOff } from 'lucide-react';

export const WidgetsTab: React.FC = () => {
  const visibleWidgets = useAppStore(s => s.visibleWidgets);
  const toggleWidget = useAppStore(s => s.toggleWidget);

  const widgetCategories = [
    {
      name: 'Core',
      widgets: [
        { id: 'SYSTEM', name: 'System Core', description: 'System status and controls' },
        { id: 'HELP', name: 'Help Desk', description: 'Documentation and support' },
        { id: 'SCRATCHPAD', name: 'Neural Scratchpad', description: 'AI-powered notes' },
        { id: 'TRANSFORMER', name: 'Universal Transformer', description: 'Data format converter' },
        { id: 'STRATEGIC', name: 'Strategic Blueprint', description: 'Project strategy document' },
        { id: 'MARKET', name: 'Widget Market', description: 'Widget launcher marketplace' },
      ],
    },
    {
      name: 'Productivity',
      widgets: [
        { id: 'FOCUS_HUD', name: 'Focus HUD', description: 'Pomodoro timer and tasks' },
        { id: 'WRITEPAD', name: 'Write Pad', description: 'Document drafting' },
        { id: 'SECURE_CALENDAR', name: 'Secure Calendar', description: 'Encrypted event management' },
        { id: 'TEMPORAL', name: 'Temporal Nexus', description: 'World clock and timers' },
        { id: 'POLYGLOT', name: 'Polyglot Box', description: 'Language translator' },
        { id: 'CLIPBOARD', name: 'Clipboard Stream', description: 'Clipboard history manager' },
      ],
    },
    {
      name: 'AI',
      widgets: [
        { id: 'NEURAL_CHAT', name: 'Neural Chat', description: 'AI chat assistant' },
        { id: 'PROMPT_LAB', name: 'Prompt Lab', description: 'AI prompt engineering workspace' },
      ],
    },
    {
      name: 'Developer',
      widgets: [
        { id: 'DEV_OPTIC', name: 'Dev Optic', description: 'Developer utilities' },
        { id: 'WEB_TERMINAL', name: 'Web Terminal', description: 'JavaScript REPL' },
        { id: 'CYBER_EDITOR', name: 'Cyber Editor', description: 'Monaco code editor' },
        { id: 'GIT_PULSE', name: 'Git Pulse', description: 'Repository monitor' },
        { id: 'DOCU_HUB', name: 'DocuHub', description: 'Developer documentation viewer' },
        { id: 'PROJECT_TRACKER', name: 'Project Tracker', description: 'Kanban project board' },
        { id: 'ARCHITECT', name: 'Widget Architect', description: 'Custom widget builder' },
      ],
    },
    {
      name: 'Research',
      widgets: [
        { id: 'NEWS_FEED', name: 'News Feed', description: 'RSS news aggregator' },
        { id: 'RESEARCH_BROWSER', name: 'Research Browser', description: 'AI-powered research tool' },
        { id: 'PDF_VIEWER', name: 'PDF Viewer', description: 'In-browser PDF reader' },
        { id: 'CIPHER_PAD', name: 'Cipher Pad', description: 'Encrypted notes' },
      ],
    },
    {
      name: 'Finance',
      widgets: [
        { id: 'ASSET', name: 'Asset Command', description: 'Crypto & stock price tracker' },
        { id: 'VALUTA', name: 'Valuta Exchange', description: 'Currency converter' },
        { id: 'MACRO_NET', name: 'Macro Net', description: 'Macro-economic flow visualizer' },
        { id: 'CHAIN_PULSE', name: 'Chain Pulse', description: 'Blockchain L2 metrics' },
        { id: 'REG_RADAR', name: 'Regulatory Radar', description: 'Crypto regulatory news' },
      ],
    },
    {
      name: 'Utilities',
      widgets: [
        { id: 'CALC', name: 'Quantum Calc', description: 'Scientific calculator' },
        { id: 'CIPHER_VAULT', name: 'Cipher Vault', description: 'Cryptographic hashing tools' },
        { id: 'WEATHER', name: 'Weather Station', description: 'Weather forecasts' },
        { id: 'CHROMA_LAB', name: 'Chroma Lab', description: 'Color palette generator' },
        { id: 'THEME_ENGINE', name: 'Aesthetic Engine', description: 'AI theme generator' },
      ],
    },
    {
      name: 'Entertainment',
      widgets: [
        { id: 'SONIC', name: 'Sonic Architecture', description: 'Music theory & player' },
        { id: 'SUNO_PLAYER', name: 'Suno Player', description: 'Suno AI music player' },
        { id: 'RADIO', name: 'Signal Radio', description: 'Internet radio player' },
        { id: 'SUDOKU', name: 'Sudoku', description: 'Sudoku puzzle game' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wide mb-4">
          Widget Management
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Enable or disable widgets to customize your workspace
        </p>
      </div>

      {widgetCategories.map(category => (
        <div key={category.name} className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Grid3x3 className="w-3 h-3" />
            {category.name}
          </h4>

          <div className="space-y-2">
            {category.widgets.map(widget => {
              const isVisible = visibleWidgets.includes(widget.id);
              return (
                <div
                  key={widget.id}
                  className="flex items-center justify-between py-3 px-4 bg-slate-900/50 rounded border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-sm text-slate-200 font-medium">{widget.name}</div>
                    <div className="text-xs text-slate-500">{widget.description}</div>
                  </div>
                  <button
                    onClick={() => toggleWidget(widget.id)}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors
                      ${
                        isVisible
                          ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }
                    `}
                  >
                    {isVisible ? (
                      <>
                        <Eye className="w-3 h-3" />
                        Enabled
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Disabled
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="pt-4 border-t border-slate-800">
        <div className="text-xs text-slate-500">
          Tip: Disabled widgets can be re-enabled from the Widget Launcher (Cmd+K)
        </div>
      </div>
    </div>
  );
};
