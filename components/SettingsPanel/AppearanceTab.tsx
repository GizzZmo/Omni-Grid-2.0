import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useAppStore } from '../../store';
import { AppTheme } from '../../types';
import { THEME_PRESETS } from '../../themes/presets';

export const AppearanceTab: React.FC = () => {
  const theme = useAppStore(s => s.theme);
  const setTheme = useAppStore(s => s.setTheme);
  const [customColors, setCustomColors] = useState({
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
  });

  const applyTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    setCustomColors({
      primary: newTheme.colors.primary,
      secondary: newTheme.colors.secondary,
      accent: newTheme.colors.accent,
    });
    const root = document.documentElement;
    root.style.setProperty('--color-bg', newTheme.colors.background);
    root.style.setProperty('--color-surface', newTheme.colors.surface);
    root.style.setProperty('--color-primary', newTheme.colors.primary);
    root.style.setProperty('--color-secondary', newTheme.colors.secondary);
    root.style.setProperty('--color-text', newTheme.colors.text);
    root.style.setProperty('--color-accent', newTheme.colors.accent);
    root.style.setProperty('--radius', newTheme.radius);
  };

  const applyCustomColor = (key: 'primary' | 'secondary' | 'accent', value: string) => {
    setCustomColors(prev => ({ ...prev, [key]: value }));
    const updated: AppTheme = {
      ...theme,
      colors: { ...theme.colors, [key]: value },
    };
    setTheme(updated);
    document.documentElement.style.setProperty(`--color-${key}`, value);
  };

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

      {/* Theme Presets */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Theme Presets
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {THEME_PRESETS.map(preset => {
            const isActive = theme.name === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => applyTheme(preset)}
                aria-pressed={isActive}
                className={`relative p-4 rounded border text-left transition-all ${
                  isActive
                    ? 'border-cyan-500/70 bg-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.colors.primary }}
                  />
                  <span
                    className={`text-sm font-medium ${isActive ? 'text-cyan-400' : 'text-slate-300'}`}
                  >
                    {preset.name}
                  </span>
                </div>
                {/* Color swatches */}
                <div className="flex gap-1">
                  {Object.values(preset.colors).map((color, idx) => (
                    <div
                      key={idx}
                      className="w-4 h-4 rounded-sm border border-white/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                    <Check size={10} className="text-black" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Accent Colors */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Custom Accent Colors
        </h4>

        <div className="space-y-3">
          {(
            [
              { key: 'primary', label: 'Primary', desc: 'Main brand color' },
              { key: 'secondary', label: 'Secondary', desc: 'Secondary accent' },
              { key: 'accent', label: 'Accent', desc: 'Highlight / success' },
            ] as const
          ).map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between py-2 px-4 bg-slate-900/50 rounded border border-slate-800"
            >
              <div>
                <div className="text-sm text-slate-200 font-medium">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">
                  {customColors[key]}
                </span>
                <input
                  type="color"
                  value={customColors[key]}
                  onChange={e => applyCustomColor(key, e.target.value)}
                  aria-label={`${label} color picker`}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-700 bg-transparent p-0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
