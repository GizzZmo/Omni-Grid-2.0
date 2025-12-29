import React, { useState, useRef } from 'react';
import { Palette, Image as ImageIcon, Wand2, Upload, Loader2, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useAppStore } from '../store';
import { AppTheme } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const AestheticEngine: React.FC = () => {
  const { setTheme, theme } = useAppStore();
  const [activeMode, setActiveMode] = useState<'TEXT' | 'IMAGE'>('TEXT');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<AppTheme | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);

    // Dynamically inject CSS variables
    const root = document.documentElement;
    root.style.setProperty('--color-bg', newTheme.colors.background);
    root.style.setProperty('--color-surface', newTheme.colors.surface);
    root.style.setProperty('--color-primary', newTheme.colors.primary);
    root.style.setProperty('--color-secondary', newTheme.colors.secondary);
    root.style.setProperty('--color-text', newTheme.colors.text);
    root.style.setProperty('--color-accent', newTheme.colors.accent);
    root.style.setProperty('--radius', newTheme.radius);

    // Force specific overrides if needed via stylesheet injection
    const styleId = 'dynamic-theme-style';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    // Override Tailwind utility classes behavior by forcing the variables
    styleTag.innerHTML = `
      .bg-slate-950 { background-color: ${newTheme.colors.background} !important; }
      .bg-slate-900 { background-color: ${newTheme.colors.surface} !important; }
      .text-slate-200 { color: ${newTheme.colors.text} !important; }
      .border-cyan-500 { border-color: ${newTheme.colors.primary} !important; }
      .text-cyan-400 { color: ${newTheme.colors.primary} !important; }
      .text-fuchsia-400 { color: ${newTheme.colors.secondary} !important; }
    `;
  };

  const generateTheme = async (imageBase64?: string) => {
    if (!prompt.trim() && !imageBase64) return;
    setLoading(true);

    try {
      let userPrompt = '';
      if (imageBase64) {
        userPrompt = 'Extract a color palette and aesthetic from this image. ';
      } else {
        userPrompt = `Create a UI theme based on this vibe: "${prompt}". `;
      }

      const fullPrompt = `${userPrompt}
      Return a JSON object with this schema:
      {
        "name": "Theme Name",
        "colors": {
          "background": "#hex",
          "surface": "#hex (slightly lighter than bg)",
          "primary": "#hex (main brand color)",
          "secondary": "#hex (secondary accent)",
          "text": "#hex (readable text)",
          "accent": "#hex (success/highlight)"
        },
        "radius": "0px" or "0.5rem" or "1rem" (border radius preference)
      }`;

      // Config for Gemini
      let reqContents: any = {
        parts: [{ text: fullPrompt }],
      };

      if (imageBase64) {
        reqContents.parts.unshift({
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: imageBase64 ? reqContents : fullPrompt, // Different structure for multimodel
        config: { responseMimeType: 'application/json' },
      });

      const themeData = JSON.parse(response.text || '{}');

      // Default font since AI might hallucinate fonts not loaded
      const newTheme: AppTheme = {
        name: themeData.name || 'AI Generated',
        colors: themeData.colors || {
          background: '#000000',
          surface: '#111111',
          primary: '#ffffff',
          secondary: '#888888',
          text: '#eeeeee',
          accent: '#00ff00',
        },
        font: 'Share Tech Mono',
        radius: themeData.radius || '0.5rem',
      };

      setPreviewTheme(newTheme);
      applyTheme(newTheme);
    } catch (e) {
      console.error(e);
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        generateTheme(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Toggle Mode */}
      <div className="flex bg-slate-900 p-1 rounded-lg">
        <button
          onClick={() => setActiveMode('TEXT')}
          className={`flex-1 py-1 text-xs font-bold rounded transition-colors ${activeMode === 'TEXT' ? 'bg-pink-600 text-white' : 'text-slate-500'}`}
        >
          Text Prompt
        </button>
        <button
          onClick={() => setActiveMode('IMAGE')}
          className={`flex-1 py-1 text-xs font-bold rounded transition-colors ${activeMode === 'IMAGE' ? 'bg-pink-600 text-white' : 'text-slate-500'}`}
        >
          Mood Board
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {activeMode === 'TEXT' ? (
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe the vibe... e.g. 'High-end Swiss Watch', 'Nintendo 64 Retro', 'Forest Gump'"
            className="w-full h-24 bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-200 resize-none focus:outline-none focus:border-pink-500"
          />
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 bg-slate-950 border-2 border-dashed border-slate-800 rounded flex flex-col items-center justify-center cursor-pointer hover:border-pink-500/50 transition-colors"
          >
            <ImageIcon className="text-slate-600 mb-2" />
            <span className="text-xs text-slate-500">Upload Image</span>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
          </div>
        )}

        <button
          onClick={() => generateTheme()}
          disabled={loading}
          className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
          Generate Aesthetic
        </button>

        {/* Live Preview / Info */}
        <div className="bg-slate-900/50 border border-slate-800 rounded p-3">
          <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">
            Current System State
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-white/10"
                style={{ backgroundColor: theme.colors.background }}
              ></div>
              <span className="text-slate-400">BG</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-white/10"
                style={{ backgroundColor: theme.colors.primary }}
              ></div>
              <span className="text-slate-400">Pri</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-white/10"
                style={{ backgroundColor: theme.colors.secondary }}
              ></div>
              <span className="text-slate-400">Sec</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-white/10"
                style={{ backgroundColor: theme.colors.accent }}
              ></div>
              <span className="text-slate-400">Acc</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
            {theme.name}
          </div>
        </div>
      </div>
    </div>
  );
};
