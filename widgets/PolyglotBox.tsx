import React, { useState } from 'react';
import { ArrowRight, Copy, Check, Loader2, Play, Terminal } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const LANGUAGES = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 
  'Go', 'Rust', 'Swift', 'PHP', 'Ruby', 'SQL', 'Bash', 'Haskell'
];

export const PolyglotBox: React.FC = () => {
  const [sourceLang, setSourceLang] = useState('Python');
  const [targetLang, setTargetLang] = useState('JavaScript');
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!inputCode.trim()) return;

    setLoading(true);
    setOutputCode(''); // Clear previous output

    try {
      const prompt = `Translate the following ${sourceLang} code to ${targetLang}. 
      Do not include any explanations, markdown formatting (like \`\`\`), or comments unless necessary for the code to run. 
      Just return the raw code.
      
      Code:
      ${inputCode}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      // Simple cleanup if the model still returns markdown fences despite instructions
      let cleanCode = response.text || '';
      if (cleanCode.startsWith('```')) {
        const lines = cleanCode.split('\n');
        cleanCode = lines.slice(1, lines.length - 1).join('\n');
      }

      setOutputCode(cleanCode.trim());
    } catch (e) {
      setOutputCode("// Translation failed. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Controls */}
      <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
        <select 
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="bg-slate-800 text-slate-200 text-xs rounded px-2 py-1 border border-slate-700 outline-none focus:border-indigo-500"
        >
          {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        <ArrowRight size={14} className="text-slate-500" />

        <select 
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="bg-slate-800 text-slate-200 text-xs rounded px-2 py-1 border border-slate-700 outline-none focus:border-indigo-500"
        >
          {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        <button 
          onClick={handleTranslate}
          disabled={loading || !inputCode}
          className="ml-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs px-3 py-1 rounded font-bold flex items-center gap-1 transition-colors"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
          Translate
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col sm:flex-row gap-2 min-h-0">
        {/* Input */}
        <div className="flex-1 flex flex-col gap-1 relative group">
          <span className="text-[10px] font-bold text-slate-500 uppercase ml-1">Input ({sourceLang})</span>
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder={`Paste ${sourceLang} code here...`}
            className="flex-1 w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono text-slate-300 resize-none focus:outline-none focus:border-indigo-500/50 custom-scrollbar leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="flex-1 flex flex-col gap-1 relative group">
          <div className="flex justify-between items-center px-1">
             <span className="text-[10px] font-bold text-indigo-400 uppercase">Output ({targetLang})</span>
             {outputCode && (
                <button 
                  onClick={handleCopy} 
                  className="text-slate-500 hover:text-white transition-colors"
                  title="Copy Code"
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
             )}
          </div>
          <textarea
            readOnly
            value={outputCode}
            placeholder="Translation will appear here..."
            className="flex-1 w-full bg-slate-900/50 border border-slate-800 rounded p-3 text-xs font-mono text-indigo-200 resize-none focus:outline-none custom-scrollbar leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};