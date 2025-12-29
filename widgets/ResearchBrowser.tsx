import React, { useState } from 'react';
import {
  Search,
  Globe,
  ShieldCheck,
  Loader2,
  ExternalLink,
  Link as LinkIcon,
  AlertCircle,
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const ResearchBrowser: React.FC = () => {
  const [query, setQuery] = useState('');
  const [content, setContent] = useState<{ text: string; chunks: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setContent(null);
    setError(null);

    try {
      // Using gemini-3-flash-preview for low latency research tasks
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Research the following topic deeply, check recent news if applicable, and provide a comprehensive summary with key facts: "${query}"`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || 'No intelligence gathered.';
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      setContent({ text, chunks });
    } catch (e) {
      console.error(e);
      setError('Neural Uplink Failed. Connection to Search Node refused.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-2 font-mono">
      <form
        onSubmit={handleSearch}
        className="flex gap-2 bg-slate-900 p-2 rounded border border-slate-800 shrink-0"
      >
        <Globe size={16} className="text-cyan-600" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter Research Query..."
          className="flex-1 bg-transparent text-xs text-white outline-none placeholder-slate-600"
        />
        <button type="submit" className="text-slate-400 hover:text-cyan-400" disabled={loading}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
        </button>
      </form>

      <div className="flex-1 bg-slate-950/50 rounded border border-slate-800 overflow-hidden relative flex flex-col">
        {!content && !loading && !error && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50">
            <ShieldCheck size={48} />
            <span className="text-xs">Secure Research Uplink Ready</span>
          </div>
        )}

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-cyan-400 gap-2">
            <Loader2 size={32} className="animate-spin" />
            <span className="text-xs animate-pulse">Scanning Global Network...</span>
          </div>
        )}

        {error && (
          <div className="flex-1 flex flex-col items-center justify-center text-red-400 gap-2 p-4 text-center">
            <AlertCircle size={32} />
            <span className="text-xs">{error}</span>
          </div>
        )}

        {content && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap mb-4 font-sans">
              {content.text}
            </div>

            {content.chunks.length > 0 && (
              <div className="border-t border-slate-800 pt-2 mt-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">
                  Source Telemetry
                </div>
                <div className="flex flex-col gap-1">
                  {content.chunks.map((chunk, i) => {
                    if (chunk.web) {
                      return (
                        <a
                          key={i}
                          href={chunk.web.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 p-1.5 bg-slate-900/50 rounded hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 transition-all group"
                        >
                          <LinkIcon
                            size={10}
                            className="text-slate-500 group-hover:text-cyan-400"
                          />
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[10px] text-cyan-400 font-bold truncate">
                              {chunk.web.title}
                            </span>
                            <span className="text-[8px] text-slate-600 truncate">
                              {chunk.web.uri}
                            </span>
                          </div>
                          <ExternalLink
                            size={10}
                            className="ml-auto text-slate-600 group-hover:text-white"
                          />
                        </a>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
