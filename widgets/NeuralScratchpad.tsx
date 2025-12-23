
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, FileSearch, ArrowDownToLine, Command, Zap, MessageSquare, Languages, FileText } from 'lucide-react';
import { useAppStore } from '../store';
import { refineText } from '../services/geminiService';

export const NeuralScratchpad: React.FC = () => {
  const { scratchpadContent, setScratchpadContent } = useAppStore();
  // Performance: Local state for immediate UI feedback
  const [localContent, setLocalContent] = useState(scratchpadContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [menuPos, setMenuPos] = useState<{x: number, y: number} | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Performance: Sync store changes to local state (e.g. from imports), but avoid cursor jumps if focused
  useEffect(() => {
      // Only sync if content is different to avoid unnecessary renders
      if (scratchpadContent !== localContent) {
          setLocalContent(scratchpadContent);
      }
  }, [scratchpadContent]);

  // Performance: Debounce write to global store (persist layer)
  useEffect(() => {
      const handler = setTimeout(() => {
          if (localContent !== scratchpadContent) {
              setScratchpadContent(localContent);
          }
      }, 600); // 600ms debounce
      return () => clearTimeout(handler);
  }, [localContent, scratchpadContent, setScratchpadContent]);

  const handleLocalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalContent(e.target.value);
  };

  const handleAIAction = async (action: 'REFINE' | 'EXPAND' | 'TRANSLATE' | 'ANALYZE' | 'SUMMARY' | 'TONE') => {
    setMenuPos(null); // Close menu
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Use localContent for immediate consistency
    let selectedText = localContent.substring(start, end);
    let isSelection = true;

    if (start === end) {
      selectedText = localContent;
      isSelection = false;
    }

    if (!selectedText.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await refineText(selectedText, action);
      
      let newText = '';
      if (isSelection && action !== 'ANALYZE' && action !== 'SUMMARY') {
        // Replace selection for editing tasks
        newText = localContent.substring(0, start) + result + localContent.substring(end);
      } else {
        // Append result for analysis or summary
        newText = localContent + `\n\n--- AI ${action} ---\n` + result + "\n-------------------";
      }
      
      // Update both immediately to prevent race conditions during AI async return
      setLocalContent(newText);
      setScratchpadContent(newText);

    } catch (err) {
      setError('AI request failed. Check key.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      const newText = localContent + `\n\n--- Imported Data [${new Date().toLocaleTimeString()}] ---\n${text}\n`;
      setLocalContent(newText);
      setScratchpadContent(newText); // Immediate save for imports
    }
  };

  // Handle Text Selection for Floating Menu
  const handleSelect = () => {
      const textarea = textAreaRef.current;
      if (!textarea) return;
      
      if (textarea.selectionStart !== textarea.selectionEnd) {
          // Logic handled in mouseup for positioning
      } else {
          setMenuPos(null);
      }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
      const textarea = textAreaRef.current;
      if (textarea && textarea.selectionStart !== textarea.selectionEnd) {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          setMenuPos({
              x: Math.min(x, rect.width - 150),
              y: Math.max(y - 40, 10) 
          });
      } else {
          setMenuPos(null);
      }
  };

  // Keyboard Shortcuts
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
              e.preventDefault();
              const textarea = textAreaRef.current;
              if (textarea) {
                  textarea.focus();
                  if (textarea.selectionStart !== textarea.selectionEnd) {
                      handleAIAction('REFINE');
                  } else {
                      setError('Select text to use AI commands');
                      setTimeout(() => setError(''), 1500);
                  }
              }
          }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [localContent]); // Depend on localContent

  return (
    <div className="h-full flex flex-col relative" onMouseLeave={() => setMenuPos(null)}>
      {/* Floating Context Menu */}
      {menuPos && (
          <div 
            className="absolute z-50 bg-slate-900 border border-fuchsia-500/50 shadow-2xl rounded-lg p-1 flex flex-col gap-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-100"
            style={{ left: menuPos.x, top: menuPos.y }}
            role="menu"
            aria-label="AI Context Menu"
          >
              <div className="text-[10px] text-fuchsia-400 font-bold px-2 py-1 border-b border-white/10 flex items-center justify-between">
                  <span>AI CMD</span>
                  <span className="text-[8px] bg-white/10 px-1 rounded">⌘J</span>
              </div>
              <button onClick={() => handleAIAction('REFINE')} className="text-left text-xs px-2 py-1.5 hover:bg-fuchsia-900/50 text-slate-200 rounded flex items-center gap-2" role="menuitem"><Sparkles size={10}/> Refine</button>
              <button onClick={() => handleAIAction('EXPAND')} className="text-left text-xs px-2 py-1.5 hover:bg-fuchsia-900/50 text-slate-200 rounded flex items-center gap-2" role="menuitem"><Zap size={10}/> Expand</button>
              <button onClick={() => handleAIAction('SUMMARY')} className="text-left text-xs px-2 py-1.5 hover:bg-fuchsia-900/50 text-slate-200 rounded flex items-center gap-2" role="menuitem"><FileText size={10}/> Summarize</button>
              <button onClick={() => handleAIAction('TONE')} className="text-left text-xs px-2 py-1.5 hover:bg-fuchsia-900/50 text-slate-200 rounded flex items-center gap-2" role="menuitem"><MessageSquare size={10}/> Cyberpunk Tone</button>
              <button onClick={() => handleAIAction('TRANSLATE')} className="text-left text-xs px-2 py-1.5 hover:bg-fuchsia-900/50 text-slate-200 rounded flex items-center gap-2" role="menuitem"><Languages size={10}/> Translate</button>
          </div>
      )}

      {/* Toolbar */}
      <div className="flex gap-2 mb-2 overflow-x-auto pb-1 custom-scrollbar" role="toolbar" aria-label="Editor Toolbar">
         <button 
           onClick={() => handleAIAction('ANALYZE')}
           disabled={loading}
           className="flex-1 flex items-center justify-center gap-1 bg-fuchsia-900/30 hover:bg-fuchsia-900/50 border border-fuchsia-800/50 text-fuchsia-300 text-[10px] py-1 px-2 rounded transition-all font-bold whitespace-nowrap"
           title="Analyze selected data"
           aria-label="Analyze Text"
         >
           <FileSearch size={12} /> Analyze
         </button>
         <button 
           onClick={() => handleAIAction('SUMMARY')}
           disabled={loading}
           className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] py-1 px-2 rounded transition-colors whitespace-nowrap"
           aria-label="Summarize Text"
         >
           Summarize
         </button>
         <button 
           onClick={() => handleAIAction('TONE')}
           disabled={loading}
           className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] py-1 px-2 rounded transition-colors whitespace-nowrap"
           aria-label="Shift Tone"
         >
           Tone Shift
         </button>
      </div>

      <div 
        className={`flex-1 relative transition-colors duration-200 rounded-lg ${isDragOver ? 'bg-fuchsia-900/20 ring-2 ring-fuchsia-500' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <textarea
          ref={textAreaRef}
          value={localContent}
          onChange={handleLocalChange}
          onSelect={handleSelect}
          onMouseUp={handleMouseUp}
          className="w-full h-full bg-transparent text-sm text-slate-200 leading-relaxed font-sans resize-none focus:outline-none p-1 placeholder-slate-600 custom-scrollbar selection:bg-fuchsia-500/40 selection:text-white"
          placeholder="Type something here... Highlight text for AI context menu."
          aria-label="Scratchpad Input"
        />
         {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-900 text-fuchsia-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl border border-fuchsia-500/50">
                <ArrowDownToLine size={14} /> Drop Data Here
              </div>
            </div>
          )}
      </div>

      {loading && (
        <div className="absolute bottom-2 right-2 bg-slate-900/90 border border-slate-700 text-fuchsia-400 text-xs px-2 py-1 rounded flex items-center gap-2 shadow-lg z-10 animate-pulse" role="status">
          <Loader2 size={12} className="animate-spin" /> Processing...
        </div>
      )}
       {error && (
        <div className="absolute bottom-2 right-2 bg-red-900/90 border border-red-700 text-white text-xs px-2 py-1 rounded shadow-lg z-10" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
