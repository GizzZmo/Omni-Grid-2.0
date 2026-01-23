import React from 'react';
import { Palette, Sun, Moon } from 'lucide-react';

export const AppearanceTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wide mb-4">
          Appearance Settings
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Customize the visual theme and styling of your workspace
        </p>
      </div>

      {/* Theme Selection */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Theme
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Cyberpunk Theme */}
          <div className="relative p-4 bg-slate-900 border-2 border-cyan-500/50 rounded cursor-pointer hover:border-cyan-400 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-sm font-medium text-cyan-400">Cyberpunk</span>
            </div>
            <div className="text-xs text-slate-400">Neon accents, dark mode</div>
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-500" />
          </div>

          {/* Nord Theme */}
          <div className="relative p-4 bg-slate-900 border border-slate-700 rounded cursor-pointer hover:border-slate-500 transition-colors opacity-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <span className="text-sm font-medium text-slate-300">Nord</span>
            </div>
            <div className="text-xs text-slate-500">Coming soon</div>
          </div>

          {/* Dracula Theme */}
          <div className="relative p-4 bg-slate-900 border border-slate-700 rounded cursor-pointer hover:border-slate-500 transition-colors opacity-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm font-medium text-slate-300">Dracula</span>
            </div>
            <div className="text-xs text-slate-500">Coming soon</div>
          </div>

          {/* Light Theme */}
          <div className="relative p-4 bg-slate-900 border border-slate-700 rounded cursor-pointer hover:border-slate-500 transition-colors opacity-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <span className="text-sm font-medium text-slate-300">Light</span>
            </div>
            <div className="text-xs text-slate-500">Coming soon</div>
          </div>
        </div>
      </div>

      {/* Custom Colors */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Custom Colors
        </h4>
        
        <div className="py-4 px-4 bg-slate-900/50 rounded border border-slate-800 text-center">
          <Palette className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <div className="text-sm text-slate-400 mb-1">Theme Customization</div>
          <div className="text-xs text-slate-500">
            Advanced theme editor coming in Phase 2
          </div>
        </div>
      </div>

      {/* Animations */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Animations
        </h4>
        
        <div className="flex items-center justify-between py-3 px-4 bg-slate-900/50 rounded border border-slate-800">
          <div>
            <div className="text-sm text-slate-200 font-medium">Enable Animations</div>
            <div className="text-xs text-slate-500">Smooth transitions and effects</div>
          </div>
          <button
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-cyan-500"
            role="switch"
            aria-checked={true}
          >
            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-slate-900/50 rounded border border-slate-800">
          <div>
            <div className="text-sm text-slate-200 font-medium">Reduced Motion</div>
            <div className="text-xs text-slate-500">Accessibility option</div>
          </div>
          <button
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700"
            role="switch"
            aria-checked={false}
          >
            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
