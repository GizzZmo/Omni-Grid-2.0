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
      ],
    },
    {
      name: 'Productivity',
      widgets: [
        { id: 'FOCUS_HUD', name: 'Focus HUD', description: 'Pomodoro timer' },
        { id: 'WRITEPAD', name: 'Write Pad', description: 'Document drafting' },
        { id: 'SECURE_CALENDAR', name: 'Secure Calendar', description: 'Event management' },
      ],
    },
    {
      name: 'Developer',
      widgets: [
        { id: 'DEV_OPTIC', name: 'Dev Optic', description: 'Developer utilities' },
        { id: 'WEB_TERMINAL', name: 'Web Terminal', description: 'JavaScript REPL' },
        { id: 'CYBER_EDITOR', name: 'Cyber Editor', description: 'Code editor' },
        { id: 'GIT_PULSE', name: 'Git Pulse', description: 'Repository monitor' },
      ],
    },
    {
      name: 'Utilities',
      widgets: [
        { id: 'CALC', name: 'Quantum Calc', description: 'Scientific calculator' },
        { id: 'CIPHER_VAULT', name: 'Cipher Vault', description: 'Hashing tools' },
        { id: 'WEATHER', name: 'Weather Station', description: 'Weather forecasts' },
        { id: 'VALUTA', name: 'Valuta Exchange', description: 'Currency converter' },
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
