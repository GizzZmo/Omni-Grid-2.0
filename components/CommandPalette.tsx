import React, { useState, useEffect, useRef } from 'react';
import { Command, Loader2, Terminal, Search, Zap } from 'lucide-react';
import { useAppStore } from '../store';
import { getGenAIClient } from '../services/geminiService';

export const CommandPalette: React.FC = () => {
  const { isCmdPaletteOpen, setCmdPaletteOpen, toggleWidget, resetAll, toggleLayoutLock } =
    useAppStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(!isCmdPaletteOpen);
      }
      if (e.key === 'Escape') {
        setCmdPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCmdPaletteOpen, setCmdPaletteOpen]);

  useEffect(() => {
    if (isCmdPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCmdPaletteOpen]);

  const executeCommand = async () => {
    if (!input.trim()) return;
    const ai = getGenAIClient();
    if (!ai) {
      console.warn('AI Command Processor is offline (missing API key).');
      setInput('');
      return;
    }
    setLoading(true);

    try {
      // Intent Classification via Gemini
      const prompt = `
        You are an OS Command Processor. User Input: "${input}"
        
        Available Actions:
        - TOGGLE_WIDGET(id): Open/Close a widget. IDs: SYSTEM, HELP, TRANSFORMER, SCRATCHPAD, FOCUS_HUD, DEV_OPTIC, CIPHER_VAULT, CHROMA_LAB, TEMPORAL, SONIC, CALC, ASSET, POLYGLOT, WRITEPAD, WEATHER, VALUTA, ARCHITECT, THEME_ENGINE, RADIO, SUDOKU, NEWS_FEED, WEB_TERMINAL, RESEARCH_BROWSER.
        - RESET_SYSTEM: Factory reset.
        - LOCK_LAYOUT: Toggle layout lock.
        - UNKNOWN: If not clear.

        Return JSON only: { "action": "ACTION_NAME", "payload": "ID_OR_NULL" }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const result = JSON.parse(response.text || '{}');

      if (result.action === 'TOGGLE_WIDGET' && result.payload) {
        toggleWidget(result.payload);
        setCmdPaletteOpen(false);
      } else if (result.action === 'RESET_SYSTEM') {
        if (confirm('Factory Reset requested via Command Line. Proceed?')) resetAll();
        setCmdPaletteOpen(false);
      } else if (result.action === 'LOCK_LAYOUT') {
        toggleLayoutLock();
        setCmdPaletteOpen(false);
      } else {
        // Fallback or Unknown
        alert('Command not recognized by Neural Core.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  if (!isCmdPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[600px] max-w-[90vw] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-slate-800">
          {loading ? (
            <Loader2 className="animate-spin text-fuchsia-500" />
          ) : (
            <Terminal className="text-slate-400" />
          )}
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && executeCommand()}
            placeholder="Type a command... (e.g. 'Open Terminal', 'Reset System')"
            className="flex-1 bg-transparent text-lg text-white placeholder-slate-600 outline-none font-mono"
          />
          <div className="flex gap-2">
            <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400">ESC</span>
            <span className="text-[10px] bg-fuchsia-900/30 text-fuchsia-400 px-2 py-1 rounded border border-fuchsia-500/30">
              ENTER
            </span>
          </div>
        </div>
        <div className="bg-slate-950 p-2 text-[10px] text-slate-500 flex justify-between px-4">
          <span className="flex items-center gap-1">
            <Zap size={10} /> NLP Engine Active
          </span>
          <span className="flex items-center gap-1">
            <Search size={10} /> Gemini 3.5 Flash
          </span>
        </div>
      </div>
    </div>
  );
};
