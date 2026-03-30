import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Loader2, Copy, Check, MessageSquare, Plus } from 'lucide-react';
import { getGenAIClient } from '../services/geminiService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: '0',
  role: 'assistant',
  content: 'Neural link established. How can I assist you today, operator?',
  timestamp: Date.now(),
};

const STORAGE_KEY = 'omni-chat-history';

const loadMessages = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return [WELCOME_MESSAGE];
};

const SYSTEM_INSTRUCTION =
  'You are a helpful AI assistant embedded in Omni-Grid, a cyberpunk-themed productivity dashboard. Be concise, practical, and slightly cyberpunk in tone. Format code with markdown code blocks.';

export const NeuralChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist messages to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore storage errors
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const ai = getGenAIClient();
    if (!ai) {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'No API key detected. Add your Gemini API key in **Settings → Advanced** to enable AI responses.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errMsg]);
      setLoading(false);
      return;
    }

    try {
      // Build conversation history for context
      const history = messages
        .filter(m => m.id !== '0')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }));

      const assistantMsgId = crypto.randomUUID();
      setMessages(prev => [
        ...prev,
        { id: assistantMsgId, role: 'assistant', content: '', timestamp: Date.now() },
      ]);

      // Use streaming response
      const stream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts: [{ text }] }],
        config: { systemInstruction: SYSTEM_INSTRUCTION },
      });

      for await (const chunk of stream) {
        const chunkText = chunk.text ?? '';
        if (chunkText) {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId ? { ...m, content: m.content + chunkText } : m
            )
          );
        }
      }
    } catch (e) {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error communicating with AI: ${e instanceof Error ? e.message : 'Unknown error'}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const clearChat = () => {
    const welcome: ChatMessage = {
      id: '0',
      role: 'assistant',
      content: 'Memory wiped. Neural link re-established. How can I assist you?',
      timestamp: Date.now(),
    };
    setMessages([welcome]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  const newSession = () => {
    const welcome: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'New session initialized. Neural link established. Ready for your commands, operator.',
      timestamp: Date.now(),
    };
    setMessages([welcome]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  // Simple markdown-like rendering: bold and code blocks
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCode = false;
    let codeLines: string[] = [];
    let codeLang = '';

    lines.forEach((line, i) => {
      if (line.startsWith('```')) {
        if (!inCode) {
          inCode = true;
          codeLang = line.slice(3).trim();
          codeLines = [];
        } else {
          elements.push(
            <pre
              key={`code-${i}`}
              className="mt-2 mb-2 p-3 bg-slate-950 border border-slate-700 rounded text-[11px] text-emerald-300 overflow-x-auto font-mono whitespace-pre-wrap"
            >
              {codeLang && (
                <span className="text-slate-500 text-[10px] block mb-1">{codeLang}</span>
              )}
              {codeLines.join('\n')}
            </pre>
          );
          inCode = false;
          codeLines = [];
          codeLang = '';
        }
      } else if (inCode) {
        codeLines.push(line);
      } else if (line.trim() === '') {
        elements.push(<br key={`br-${i}`} />);
      } else {
        // Bold text replacement
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });
        elements.push(
          <p key={`p-${i}`} className="leading-relaxed">
            {parts}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={12} className="text-fuchsia-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Neural Chat
          </span>
          <span className="text-[10px] text-slate-600">•</span>
          <span className="text-[10px] text-slate-600 font-mono">
            {messages.length - 1} msg{messages.length - 1 !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={newSession}
            aria-label="New session"
            title="New session"
            className="p-1 text-slate-600 hover:text-cyan-400 transition-colors"
          >
            <Plus size={12} />
          </button>
          <button
            onClick={clearChat}
            aria-label="Clear chat history"
            className="p-1 text-slate-600 hover:text-red-400 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                msg.role === 'user'
                  ? 'bg-fuchsia-900/60 border border-fuchsia-700/50'
                  : 'bg-cyan-900/60 border border-cyan-700/50'
              }`}
            >
              {msg.role === 'user' ? (
                <User size={10} className="text-fuchsia-400" />
              ) : (
                <Bot size={10} className="text-cyan-400" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`group relative max-w-[80%] px-3 py-2 rounded text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-fuchsia-900/30 border border-fuchsia-800/40 text-fuchsia-100'
                  : 'bg-slate-900/80 border border-slate-700/50 text-slate-200'
              }`}
            >
              {renderContent(msg.content)}

              {/* Copy button */}
              <button
                onClick={() => copyMessage(msg.id, msg.content)}
                aria-label="Copy message"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-slate-500 hover:text-slate-300"
              >
                {copiedId === msg.id ? (
                  <Check size={10} className="text-emerald-400" />
                ) : (
                  <Copy size={10} />
                )}
              </button>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-cyan-900/60 border border-cyan-700/50">
              <Bot size={10} className="text-cyan-400" />
            </div>
            <div className="px-3 py-2 bg-slate-900/80 border border-slate-700/50 rounded text-xs">
              <Loader2 size={12} className="animate-spin text-cyan-400" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 p-3 border-t border-slate-800/60">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
            rows={2}
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-fuchsia-500/60 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="p-2 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-40 disabled:cursor-not-allowed rounded text-white transition-colors shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
