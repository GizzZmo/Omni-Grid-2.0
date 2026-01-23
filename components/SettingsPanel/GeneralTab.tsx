import React from 'react';
import { useAppStore } from '../../store';
import { Power, RefreshCw, Clock } from 'lucide-react';

export const GeneralTab: React.FC = () => {
  const settings = useAppStore(s => s.settings);
  const toggleSetting = useAppStore(s => s.toggleSetting);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wide mb-4">
          General Settings
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Configure basic application behavior and preferences
        </p>
      </div>

      {/* Visual Effects */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Visual Effects
        </h4>
        
        <div className="flex items-center justify-between py-3 px-4 bg-slate-900/50 rounded border border-slate-800">
          <div className="flex items-center gap-3">
            <Power className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-sm text-slate-200 font-medium">Scanlines Effect</div>
              <div className="text-xs text-slate-500">Retro CRT monitor overlay</div>
            </div>
          </div>
          <button
            onClick={() => toggleSetting('scanlines')}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full
              transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950
              ${settings.scanlines ? 'bg-cyan-500' : 'bg-slate-700'}
            `}
            role="switch"
            aria-checked={settings.scanlines}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings.scanlines ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-slate-900/50 rounded border border-slate-800">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-sm text-slate-200 font-medium">Sound Effects</div>
              <div className="text-xs text-slate-500">UI interaction sounds</div>
            </div>
          </div>
          <button
            onClick={() => toggleSetting('sound')}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full
              transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950
              ${settings.sound ? 'bg-cyan-500' : 'bg-slate-700'}
            `}
            role="switch"
            aria-checked={settings.sound}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings.sound ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Startup Behavior */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Startup Behavior
        </h4>
        
        <div className="py-3 px-4 bg-slate-900/50 rounded border border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div className="text-sm text-slate-200 font-medium">On Startup</div>
          </div>
          <div className="text-xs text-slate-400 mb-3">
            Choose what happens when you launch Omni-Grid
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="startup"
                value="restore"
                defaultChecked
                className="text-cyan-500 focus:ring-cyan-500"
              />
              <span>Restore previous session</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="startup"
                value="default"
                className="text-cyan-500 focus:ring-cyan-500"
              />
              <span>Load default layout</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="startup"
                value="empty"
                className="text-cyan-500 focus:ring-cyan-500"
              />
              <span>Start with empty grid</span>
            </label>
          </div>
        </div>
      </div>

      {/* Auto-save */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Data Persistence
        </h4>
        
        <div className="py-3 px-4 bg-slate-900/50 rounded border border-slate-800">
          <div className="text-xs text-slate-400 mb-2">
            Your data is automatically saved to browser local storage
          </div>
          <div className="text-xs text-cyan-400">
            ✓ Auto-save enabled (continuous)
          </div>
        </div>
      </div>
    </div>
  );
};
