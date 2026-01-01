import React, { useState } from 'react';
import { PenTool, Box, Play, Cpu, Layers, Code, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store';
import { getGenAIClient } from '../services/geminiService';

const getAi = () => getGenAIClient();

export const WidgetArchitect: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BLUEPRINT' | 'CODE' | 'GRAPH'>('BLUEPRINT');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [logicNodes, setLogicNodes] = useState<
    Array<{ id: string; label: string; type: 'DATA' | 'LOGIC' | 'UI' }>
  >([]);

  const generatePrototype = async () => {
    if (!prompt.trim()) return;
    const ai = getAi();
    if (!ai) {
      setGeneratedCode('// AI Architect unavailable. Configure an API key to generate code.');
      setLogicNodes([]);
      return;
    }
    setLoading(true);
    setActiveTab('CODE');
    setGeneratedCode('// Initializing Architect Core...\n// Analyzing Semantic Intent...\n');

    try {
      // Step 1: Generate Architecture Graph
      const graphPrompt = `Analyze this widget request: "${prompt}".
      Return a JSON object representing the logic flow with an array of 'nodes'.
      Each node has: { id: string, label: string, type: 'DATA' | 'LOGIC' | 'UI' }.
      Example: [{"id":"1", "label":"Fetch Stripe API", "type":"DATA"}, {"id":"2", "label":"Calculate MRR", "type":"LOGIC"}]`;

      const graphRes = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: graphPrompt,
        config: { responseMimeType: 'application/json' },
      });

      const graphData = JSON.parse(graphRes.text || '{"nodes": []}');
      setLogicNodes(graphData.nodes || []);

      // Step 2: Generate React Code
      const codePrompt = `Create a React functional component for a widget that does: "${prompt}".
      It should use Tailwind CSS for styling.
      Return ONLY the code, no markdown fences.
      Assume 'React', 'useState', 'useEffect' and 'lucide-react' icons are available.`;

      const codeRes = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: codePrompt,
      });

      let code = codeRes.text || '// Generation Failed';
      if (code.startsWith('```')) {
        const lines = code.split('\n');
        code = lines.slice(1, lines.length - 1).join('\n');
      }
      setGeneratedCode(code);
    } catch (e) {
      setGeneratedCode('// Error: Neural Link Severed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 font-mono">
      {/* Tabs */}
      <div className="flex bg-slate-900 p-1 rounded-lg">
        {['BLUEPRINT', 'CODE', 'GRAPH'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 text-[10px] font-bold py-1 rounded transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'BLUEPRINT' && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-slate-900/50 p-4 rounded border border-indigo-500/20">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-indigo-400 font-bold uppercase">
                Prototype Creator
              </label>
              <span className="text-[9px] text-slate-500">AI-Powered Widget Builder</span>
            </div>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe your widget... e.g. 'A crypto tracker that alerts me when ETH drops below $2000 using CoinGecko API'"
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-200 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            onClick={generatePrototype}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Cpu size={14} className="animate-spin" /> : <Play size={14} />}
            {loading ? 'Compiling Neural Schema...' : 'Generate Prototype'}
          </button>

          <div className="mt-auto text-[10px] text-slate-500 p-2 border-l-2 border-slate-800">
            <strong className="text-slate-400">Architect Mode:</strong> Use this tool to rapidly
            prototype new widgets. The code generated in the next tab can be used to build real
            extensions.
          </div>
        </div>
      )}

      {activeTab === 'CODE' && (
        <div className="flex-1 relative group bg-slate-950 border border-slate-800 rounded overflow-hidden">
          <div className="absolute top-0 left-0 w-full bg-slate-900 p-1 border-b border-slate-800 flex justify-between items-center px-2">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Code size={10} /> Component.tsx
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(generatedCode)}
              className="text-[10px] text-indigo-400 hover:text-white"
            >
              Copy
            </button>
          </div>
          <textarea
            readOnly
            value={generatedCode}
            className="w-full h-full pt-8 p-4 bg-transparent text-xs font-mono text-emerald-300 resize-none focus:outline-none custom-scrollbar"
          />
        </div>
      )}

      {activeTab === 'GRAPH' && (
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded p-4 relative overflow-hidden flex flex-col items-center justify-center">
          {/* Simple Visualizer */}
          {logicNodes.length > 0 ? (
            <div className="flex flex-col gap-4 items-center w-full">
              {logicNodes.map((node, i) => (
                <div
                  key={node.id}
                  className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div
                    className={`
                          w-3/4 p-3 rounded border flex items-center gap-3 relative z-10
                          ${node.type === 'DATA' ? 'bg-blue-900/20 border-blue-500/50 text-blue-300' : ''}
                          ${node.type === 'LOGIC' ? 'bg-orange-900/20 border-orange-500/50 text-orange-300' : ''}
                          ${node.type === 'UI' ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-300' : ''}
                        `}
                  >
                    {node.type === 'DATA' && <Box size={14} />}
                    {node.type === 'LOGIC' && <Cpu size={14} />}
                    {node.type === 'UI' && <Layers size={14} />}
                    <div className="flex-1">
                      <div className="text-[8px] opacity-50 font-bold tracking-widest">
                        {node.type} LAYER
                      </div>
                      <div className="text-xs font-bold">{node.label}</div>
                    </div>
                  </div>
                  {i < logicNodes.length - 1 && <div className="h-6 w-0.5 bg-slate-700 my-1"></div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-600">
              <Layers size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-xs">No Blueprint Generated</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
