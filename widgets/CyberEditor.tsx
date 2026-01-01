import React, { useState, useEffect, useRef } from 'react';
import {
  Code2,
  FileCode,
  Save,
  Download,
  Copy,
  Check,
  Sparkles,
  FileJson,
  FileType,
  Settings,
  Plus,
  X,
  ChevronDown,
  Wand2,
  Play,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../store';
import { GoogleGenAI } from '@google/genai';
import { DEV_DOCS_LANGUAGES } from './devdocsLanguages';
import { executePythonInSandbox } from '../services/e2bSandbox';

interface CodeTab {
  id: string;
  name: string;
  language: string;
  content: string;
}

// Predefined code templates
const CODE_TEMPLATES = {
  'omni-grid-widget': {
    name: 'Omni-Grid Widget',
    language: 'typescript',
    content: `
import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { useAppStore } from '../store';

export const CustomWidget: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize widget
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Your data fetching logic here
      const response = await fetch('https://api.example.com/data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Data fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 p-4 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-cyan-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Custom Widget
          </span>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="px-2 py-1 bg-cyan-900/30 border border-cyan-500/50 rounded text-[10px] text-cyan-400 hover:bg-cyan-900/50 transition-all"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        {loading ? (
          <div className="text-slate-500 text-sm">Loading data...</div>
        ) : data ? (
          <div className="text-center">
            <pre className="text-xs text-cyan-400">{JSON.stringify(data, null, 2)}</pre>
          </div>
        ) : (
          <div className="text-slate-500 text-sm">No data available</div>
        )}
      </div>
    </div>
  );
};
`.trim(),
  },
  'react-component': {
    name: 'React Component',
    language: 'typescript',
    content: `
import React, { useState } from 'react';

interface Props {
  title: string;
  onAction?: () => void;
}

export const Component: React.FC<Props> = ({ title, onAction }) => {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Count: {count}
        </button>
        {onAction && (
          <button 
            onClick={onAction}
            className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
          >
            Action
          </button>
        )}
      </div>
    </div>
  );
};
`.trim(),
  },
  'api-fetch': {
    name: 'API Fetch Template',
    language: 'typescript',
    content: `
async function fetchData<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Usage example
interface User {
  id: number;
  name: string;
  email: string;
}

fetchData<User[]>('https://api.example.com/users')
  .then(users => console.log('Users:', users))
  .catch(error => console.error('Error:', error));
`.trim(),
  },
  'zustand-store': {
    name: 'Zustand Store',
    language: 'typescript',
    content: `
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface StoreState {
  // State
  count: number;
  user: { name: string; email: string } | null;
  
  // Actions
  increment: () => void;
  decrement: () => void;
  setUser: (user: { name: string; email: string }) => void;
  reset: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Initial state
      count: 0,
      user: null,
      
      // Actions
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      setUser: (user) => set({ user }),
      reset: () => set({ count: 0, user: null }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
`.trim(),
  },
  'custom-hook': {
    name: 'Custom Hook',
    language: 'typescript',
    content: `
import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
  url: string;
  initialData?: T;
  autoFetch?: boolean;
}

export function useApi<T>({ url, initialData, autoFetch = true }: UseApiOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Fetch failed');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return { data, loading, error, refetch: fetchData };
}

// Usage
const MyComponent = () => {
  const { data, loading, error, refetch } = useApi<User[]>({ 
    url: 'https://api.example.com/users' 
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{JSON.stringify(data)}</div>;
};
`.trim(),
  },
};

export const CYBER_EDITOR_LANGUAGES = DEV_DOCS_LANGUAGES;
const SANDBOX_NO_OUTPUT = 'Execution completed with no output.';

export const CyberEditor: React.FC = () => {
  const { cyberEditorTabs, setCyberEditorTabs, cyberEditorActiveTab, setCyberEditorActiveTab } =
    useAppStore();

  const [tabs, setTabs] = useState<CodeTab[]>(
    cyberEditorTabs || [
      { id: '1', name: 'untitled.tsx', language: 'typescript', content: '// Start coding...\n' },
    ]
  );
  const [activeTabId, setActiveTabId] = useState(cyberEditorActiveTab || tabs[0]?.id);
  const [copied, setCopied] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [sandboxResult, setSandboxResult] = useState('');
  const [sandboxError, setSandboxError] = useState<string | null>(null);
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Persist tabs to store
  useEffect(() => {
    const handler = setTimeout(() => {
      setCyberEditorTabs(tabs);
      setCyberEditorActiveTab(activeTabId);
    }, 500);
    return () => clearTimeout(handler);
  }, [tabs, activeTabId]);

  const updateTabContent = (content: string) => {
    setTabs(tabs.map(t => (t.id === activeTabId ? { ...t, content } : t)));
  };

  const addTab = (template?: string) => {
    const newId = Date.now().toString();
    let newTab: CodeTab;

    if (template && CODE_TEMPLATES[template as keyof typeof CODE_TEMPLATES]) {
      const tmpl = CODE_TEMPLATES[template as keyof typeof CODE_TEMPLATES];
      newTab = {
        id: newId,
        name: `${tmpl.name.toLowerCase().replace(/\s+/g, '-')}.tsx`,
        language: tmpl.language,
        content: tmpl.content,
      };
    } else {
      newTab = {
        id: newId,
        name: `untitled-${tabs.length + 1}.tsx`,
        language: 'typescript',
        content: '// Start coding...\n',
      };
    }

    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setShowTemplates(false);
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) return; // Keep at least one tab
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([activeTab.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(activeTab.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCode = () => {
    // Simple formatting: add proper indentation
    try {
      const lines = activeTab.content.split('\n');
      let indentLevel = 0;
      const formatted = lines
        .map(line => {
          const trimmed = line.trim();
          if (trimmed.match(/^[}\]]/)) indentLevel = Math.max(0, indentLevel - 1);
          const result = '  '.repeat(indentLevel) + trimmed;
          if (trimmed.match(/[{[]$/)) indentLevel++;
          return result;
        })
        .join('\n');
      updateTabContent(formatted);
    } catch (e) {
      console.error('Format failed:', e);
    }
  };

  const runSandboxed = async () => {
    if (activeTab.language !== 'python') {
      setSandboxError('Sandbox execution is only available for Python.');
      setSandboxResult('');
      return;
    }

    if (!activeTab.content.trim()) {
      setSandboxError('Add Python code to execute in the sandbox.');
      setSandboxResult('');
      return;
    }

    setSandboxRunning(true);
    setSandboxError(null);
    setSandboxResult('');

    try {
      const result = await executePythonInSandbox(activeTab.content);
      setSandboxResult(result.output || SANDBOX_NO_OUTPUT);
      if (result.error) {
        setSandboxError(result.error);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sandbox execution failed.';
      setSandboxError(message);
    } finally {
      setSandboxRunning(false);
    }
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    try {
      // Check if API key exists
      if (!process.env.API_KEY) {
        updateTabContent(
          '// Error: Please add your Gemini API key in .env file (API_KEY=your_key_here)'
        );
        setAiLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Generate ${activeTab.language} code for: ${aiPrompt}. 
      Return ONLY the code without markdown fences or explanations.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert programmer. Generate clean, production-ready code.',
        },
      });

      let code = response.text || '// Generation failed';
      // Remove markdown fences if present
      if (code.includes('```')) {
        code = code.replace(/```[\w]*\n?/g, '').trim();
      }

      updateTabContent(code);
      setAiPrompt('');
    } catch (error) {
      console.error('AI generation failed:', error);
      updateTabContent('// AI generation failed. Check your API key in System Settings.');
    } finally {
      setAiLoading(false);
    }
  };

  const improveWithAI = async () => {
    const selection = textareaRef.current?.selectionStart;
    const hasSelection = selection !== textareaRef.current?.selectionEnd;
    const codeToImprove = hasSelection
      ? activeTab.content.substring(
          textareaRef.current!.selectionStart,
          textareaRef.current!.selectionEnd
        )
      : activeTab.content;

    if (!codeToImprove.trim()) return;

    setAiLoading(true);
    try {
      if (!process.env.API_KEY) {
        console.error('No API key available');
        setAiLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Improve this ${activeTab.language} code. Make it more efficient, readable, and follow best practices. Return ONLY the improved code:\n\n${codeToImprove}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      let improved = response.text || codeToImprove;
      if (improved.includes('```')) {
        improved = improved.replace(/```[\w]*\n?/g, '').trim();
      }

      if (hasSelection) {
        const before = activeTab.content.substring(0, textareaRef.current!.selectionStart);
        const after = activeTab.content.substring(textareaRef.current!.selectionEnd);
        updateTabContent(before + improved + after);
      } else {
        updateTabContent(improved);
      }
    } catch (error) {
      console.error('AI improvement failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const explainCode = async () => {
    const selection = textareaRef.current?.selectionStart;
    const hasSelection = selection !== textareaRef.current?.selectionEnd;
    const codeToExplain = hasSelection
      ? activeTab.content.substring(
          textareaRef.current!.selectionStart,
          textareaRef.current!.selectionEnd
        )
      : activeTab.content;

    if (!codeToExplain.trim()) return;

    setAiLoading(true);
    try {
      if (!process.env.API_KEY) {
        console.error('No API key available');
        setAiLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Explain this ${activeTab.language} code in clear, concise terms:\n\n${codeToExplain}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const explanation = response.text || 'No explanation available';

      // Add explanation as a comment
      const comment =
        activeTab.language === 'python' || activeTab.language === 'python'
          ? `# AI Explanation:\n# ${explanation.split('\n').join('\n# ')}\n\n`
          : `/* AI Explanation:\n * ${explanation.split('\n').join('\n * ')}\n */\n\n`;

      updateTabContent(comment + activeTab.content);
    } catch (error) {
      console.error('AI explanation failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 font-mono text-xs">
      {/* Tab Bar */}
      <div className="flex items-center bg-slate-900 border-b border-slate-800 overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 border-r border-slate-800 cursor-pointer transition-colors min-w-max ${
              activeTabId === tab.id
                ? 'bg-slate-950 text-cyan-400'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileCode size={12} />
            <span className="text-[10px]">{tab.name}</span>
            {tabs.length > 1 && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="hover:text-red-400 transition-colors"
              >
                <X size={10} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => addTab()}
          className="px-3 py-2 text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-slate-900/50 px-3 py-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 transition-colors"
            >
              <FileJson size={10} />
              Templates
              <ChevronDown size={10} />
            </button>

            {showTemplates && (
              <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded shadow-lg z-10 min-w-[200px]">
                {Object.entries(CODE_TEMPLATES).map(([key, tmpl]) => (
                  <button
                    key={key}
                    onClick={() => addTab(key)}
                    className="w-full text-left px-3 py-2 text-[10px] text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <select
            value={activeTab.language}
            onChange={e =>
              setTabs(
                tabs.map(t => (t.id === activeTabId ? { ...t, language: e.target.value } : t))
              )
            }
            className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            {CYBER_EDITOR_LANGUAGES.map(lang => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <button
            onClick={formatCode}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 transition-colors"
          >
            <RefreshCw size={10} className="inline mr-1" />
            Format
          </button>
          <button
            onClick={runSandboxed}
            disabled={sandboxRunning || activeTab.language !== 'python'}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 transition-colors disabled:opacity-50"
          >
            {sandboxRunning ? (
              <RefreshCw size={10} className="inline mr-1 animate-spin" />
            ) : (
              <Play size={10} className="inline mr-1" />
            )}
            Run
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 transition-colors"
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
          </button>
          <button
            onClick={downloadCode}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 transition-colors"
          >
            <Download size={10} />
          </button>
        </div>
      </div>

      {/* AI Assistant Bar */}
      <div className="bg-slate-900/30 border-b border-slate-800 px-3 py-2">
        <div className="flex items-center gap-2">
          <Sparkles size={12} className="text-fuchsia-400" />
          <input
            type="text"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generateWithAI()}
            placeholder="AI Assistant: Describe what you want to generate..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-fuchsia-500"
          />
          <button
            onClick={generateWithAI}
            disabled={aiLoading || !aiPrompt.trim()}
            className="px-2 py-1 bg-fuchsia-900/30 border border-fuchsia-500/50 rounded text-[10px] text-fuchsia-400 hover:bg-fuchsia-900/50 transition-all disabled:opacity-50"
          >
            {aiLoading ? <RefreshCw size={10} className="animate-spin" /> : <Zap size={10} />}
          </button>
          <button
            onClick={improveWithAI}
            disabled={aiLoading}
            className="px-2 py-1 bg-cyan-900/30 border border-cyan-500/50 rounded text-[10px] text-cyan-400 hover:bg-cyan-900/50 transition-all disabled:opacity-50"
          >
            <Wand2 size={10} className="inline mr-1" />
            Improve
          </button>
          <button
            onClick={explainCode}
            disabled={aiLoading}
            className="px-2 py-1 bg-emerald-900/30 border border-emerald-500/50 rounded text-[10px] text-emerald-400 hover:bg-emerald-900/50 transition-all disabled:opacity-50"
          >
            Explain
          </button>
        </div>
      </div>

      {(sandboxRunning || sandboxResult || sandboxError) && (
        <div className="bg-slate-900/40 border-b border-slate-800 px-3 py-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-cyan-300">
              <Play size={10} />
              E2B Sandbox
            </span>
            {sandboxRunning && <RefreshCw size={10} className="animate-spin text-cyan-300" />}
          </div>
          <pre
            className={`whitespace-pre-wrap text-[11px] font-mono ${
              sandboxError ? 'text-rose-400' : 'text-emerald-300'
            }`}
          >
            {sandboxError ? sandboxError : sandboxResult || SANDBOX_NO_OUTPUT}
          </pre>
        </div>
      )}

      {/* Code Editor */}
      <div className="flex-1 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={activeTab.content}
          onChange={e => updateTabContent(e.target.value)}
          className="w-full h-full bg-slate-950 text-slate-200 p-4 resize-none focus:outline-none font-mono text-xs leading-relaxed custom-scrollbar"
          spellCheck={false}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between bg-slate-900 border-t border-slate-800 px-3 py-1 text-[9px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400">{activeTab.language.toUpperCase()}</span>
          <span>{activeTab.content.split('\n').length} lines</span>
          <span>{activeTab.content.length} chars</span>
        </div>
        <div className="flex items-center gap-2">
          <Code2 size={10} className="text-fuchsia-400" />
          <span className="text-fuchsia-400">CYBER EDITOR</span>
        </div>
      </div>
    </div>
  );
};
