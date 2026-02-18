import React from 'react';
import { useAppStore } from '../../store';
import { Key, Code2, Zap } from 'lucide-react';

export const AdvancedTab: React.FC = () => {
  const geminiApiKey = useAppStore(s => s.settings.geminiApiKey);
  const e2bApiKey = useAppStore(s => s.settings.e2bApiKey);
  const setGeminiApiKey = useAppStore(s => s.setGeminiApiKey);
  const setE2bApiKey = useAppStore(s => s.setE2bApiKey);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wide mb-4">
          Advanced Settings
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Configure API keys and developer options
        </p>
      </div>

      {/* API Keys */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Key className="w-3 h-3" />
          API Configuration
        </h4>
        
        <div className="space-y-4">
          {/* Gemini API Key */}
          <div className="py-3 px-4 bg-slate-900/50 rounded border border-slate-800">
            <label className="block mb-2">
              <div className="text-sm text-slate-200 font-medium mb-1">Gemini API Key</div>
              <div className="text-xs text-slate-500 mb-3">
                Required for AI-powered features (Neural Scratchpad, AI Chat, etc.)
              </div>
              <input
                type="password"
                value={geminiApiKey}
                onChange={e => setGeminiApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </label>
            <div className="text-xs text-slate-500 mt-2">
              Get your API key from{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                Google AI Studio
              </a>
            </div>
          </div>

          {/* E2B API Key */}
          <div className="py-3 px-4 bg-slate-900/50 rounded border border-slate-800">
            <label className="block mb-2">
              <div className="text-sm text-slate-200 font-medium mb-1">E2B API Key</div>
              <div className="text-xs text-slate-500 mb-3">
                Required for sandboxed Python execution in certain widgets
              </div>
              <input
                type="password"
                value={e2bApiKey}
                onChange={e => setE2bApiKey(e.target.value)}
                placeholder="e2b_..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </label>
            <div className="text-xs text-slate-500 mt-2">
              Get your API key from{' '}
              <a
                href="https://e2b.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                E2B.dev
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Mode */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Code2 className="w-3 h-3" />
          Developer Options
        </h4>
        
        <div className="flex items-center justify-between py-3 px-4 bg-slate-900/50 rounded border border-slate-800">
          <div>
            <div className="text-sm text-slate-200 font-medium">Developer Mode</div>
            <div className="text-xs text-slate-500">Enable advanced debugging features</div>
          </div>
          <button
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700"
            role="switch"
            aria-checked={false}
          >
            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-slate-900/50 rounded border border-slate-800">
          <div>
            <div className="text-sm text-slate-200 font-medium">Debug Logs</div>
            <div className="text-xs text-slate-500">Show detailed console logs</div>
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

      {/* Performance */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-3 h-3" />
          Performance
        </h4>
        
        <div className="py-3 px-4 bg-slate-900/50 rounded border border-slate-800">
          <div className="text-xs text-slate-400 space-y-2">
            <div className="flex justify-between">
              <span>Bundle Size:</span>
              <span className="text-slate-300">&lt; 500KB (gzipped)</span>
            </div>
            <div className="flex justify-between">
              <span>Target FPS:</span>
              <span className="text-slate-300">60 FPS</span>
            </div>
            <div className="flex justify-between">
              <span>Memory Usage:</span>
              <span className="text-slate-300">&lt; 100MB baseline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
