
import React, { useState, useEffect } from 'react';
import { PenTool, FileText, Eraser, Sparkles, Copy, Check, Loader2, ArrowDownToLine } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useAppStore } from '../store';
import { processCrossTalk } from '../services/gridIntelligence';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEMPLATES: Record<string, string> = {
  'Blank': '',
  'Cover Letter': `[Your Name]
[Your Address]
[City, State, Zip]
[Your Email]
[Your Phone Number]

[Date]

[Hiring Manager Name]
[Company Name]
[Company Address]

Dear [Hiring Manager Name],

I am writing to express my enthusiastic interest in the [Job Title] position at [Company Name]. With my background in [Your Field/Experience], I am confident in my ability to contribute effectively to your team.

[Paragraph 1: Introduction and Hook - Why this role?]

[Paragraph 2: Highlight specific achievements and skills relevant to the job description.]

[Paragraph 3: Connect your values with the company culture.]

Thank you for your time and consideration. I look forward to the possibility of discussing my application further.

Sincerely,

[Your Name]`,
  'Resignation': `[Your Name]
[Date]

[Manager Name]
[Company Name]

Dear [Manager Name],

Please accept this letter as formal notification that I am resigning from my position as [Your Job Title] at [Company Name]. My last day will be [Date].

I want to express my gratitude for the opportunities I have had during my time here. I have enjoyed working with the team and have learned a great deal.

I will do everything I can to ensure a smooth transition during my notice period.

Sincerely,

[Your Name]`,
  'Business Inquiry': `Subject: Inquiry Regarding [Product/Service] - [Your Company/Name]

Dear [Name/Team],

I hope this email finds you well.

My name is [Your Name] and I am contacting you on behalf of [Your Company]. We are interested in [Product/Service Name] and would like to request more information regarding:

1. [Specific Question 1]
2. [Specific Question 2]
3. Pricing and availability

Could we schedule a brief call next week to discuss this further?

Best regards,

[Your Name]
[Your Title]`,
  'Meeting Minutes': `**Meeting Minutes**

**Date:** [Date]
**Time:** [Time]
**Location:** [Location/Link]

**Attendees:**
- [Name 1]
- [Name 2]

**Agenda:**
1. [Topic 1]
2. [Topic 2]

**Discussion Points:**
- [Key Point 1]
- [Key Point 2]

**Action Items:**
- [ ] [Task] - Assigned to: [Name] - Due: [Date]
- [ ] [Task] - Assigned to: [Name] - Due: [Date]

**Next Meeting:** [Date/Time]`,
  'Memo': `**MEMORANDUM**

**TO:** [Recipient(s)]
**FROM:** [Your Name]
**DATE:** [Date]
**SUBJECT:** [Subject]

---

**Background**
[Brief context on why this memo is being written.]

**Analysis/Update**
[Detailed explanation of the situation, data, or update.]

**Recommendation/Action Required**
[Clear steps that need to be taken.]`,
  'Invoice': `INVOICE #[Number]
Date: [Date]
Due Date: [Date]

FROM:
[Your Name/Business]
[Address]

TO:
[Client Name]
[Address]

| Description | Hours/Qty | Rate | Total |
|-------------|-----------|------|-------|
| [Item 1]    | 1         | $0   | $0    |
| [Item 2]    | 1         | $0   | $0    |

Subtotal: $0
Tax: $0
**TOTAL: $0**

Payment Terms: [Net 30/Due on Receipt]
Payment Methods: [Bank Transfer/PayPal]`,
};

export const WritePad: React.FC = () => {
  const { writePadContent, setWritePadContent } = useAppStore();
  // Performance: Local state
  const [localContent, setLocalContent] = useState(writePadContent);
  const [selectedTemplate, setSelectedTemplate] = useState('Blank');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync from store (e.g. reload or reset)
  useEffect(() => {
    if (localContent !== writePadContent) {
        setLocalContent(writePadContent);
    }
  }, [writePadContent]);

  // Debounce sync to store
  useEffect(() => {
    const handler = setTimeout(() => {
        if (localContent !== writePadContent) {
            setWritePadContent(localContent);
        }
    }, 600);
    return () => clearTimeout(handler);
  }, [localContent, writePadContent, setWritePadContent]);

  const handleTemplateSelect = (key: string) => {
    setSelectedTemplate(key);
    // Templates update immediately
    const content = TEMPLATES[key];
    setLocalContent(content);
    setWritePadContent(content);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(localContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAiDraft = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Draft a formal document based on this request: "${prompt}". 
        
        Keep the tone professional. 
        Use placeholders like [Name] where specific info is needed. 
        Do not include markdown code blocks, just raw text.`,
      });
      const generated = response.text || '';
      setLocalContent(generated);
      setWritePadContent(generated);
      setShowPrompt(false);
    } catch (e) {
      setLocalContent(localContent + "\n\n[AI Generation Failed]");
    } finally {
      setLoading(false);
    }
  };

  // Cross-Talk Drop Handler
  const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedText = e.dataTransfer.getData('text/plain');
      
      if (droppedText) {
          setLoading(true);
          try {
             // Grid Intelligence: Cross-Talk Protocol
             const processedContent = await processCrossTalk(droppedText, 'WritePad');
             const newContent = localContent ? `${localContent}\n\n${processedContent}` : processedContent;
             setLocalContent(newContent);
             setWritePadContent(newContent);
          } catch (e) {
             console.error("Cross-Talk failed");
          } finally {
             setLoading(false);
          }
      }
  };

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800" role="toolbar" aria-label="Editor Toolbar">
        <select 
          value={selectedTemplate}
          onChange={(e) => handleTemplateSelect(e.target.value)}
          className="bg-slate-800 text-slate-200 text-xs rounded px-2 py-1 border border-slate-700 outline-none focus:border-rose-500 max-w-[150px]"
          aria-label="Select Template"
        >
          {Object.keys(TEMPLATES).map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>

        <button 
          onClick={() => setShowPrompt(!showPrompt)}
          className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded font-bold transition-colors ${showPrompt ? 'bg-rose-900/50 text-rose-300' : 'bg-slate-800 text-slate-400 hover:text-rose-400'}`}
          aria-expanded={showPrompt}
          aria-label="Toggle AI Draft Input"
        >
          <Sparkles size={12} /> AI Draft
        </button>

        <button 
          onClick={() => { setLocalContent(''); setWritePadContent(''); }}
          className="ml-auto text-slate-500 hover:text-red-400 transition-colors"
          title="Clear"
          aria-label="Clear Document"
        >
          <Eraser size={14} />
        </button>
      </div>

      {/* AI Prompt Input (Conditional) */}
      {showPrompt && (
        <div className="flex gap-2 p-2 bg-slate-900/50 border border-rose-900/30 rounded animate-in fade-in slide-in-from-top-2">
            <input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., 'Write a polite decline email for a wedding invitation'..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-rose-500 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAiDraft()}
              aria-label="AI Prompt Input"
            />
            <button 
              onClick={handleAiDraft}
              disabled={loading}
              className="bg-rose-700 hover:bg-rose-600 text-white px-3 py-1 rounded text-xs font-bold disabled:opacity-50"
              aria-label="Generate Draft"
            >
              {loading ? <Loader2 size={12} className="animate-spin"/> : 'Generate'}
            </button>
        </div>
      )}

      {/* Editor */}
      <div 
        className={`flex-1 relative group rounded transition-all duration-300 ${isDragOver ? 'ring-2 ring-rose-500 bg-rose-900/20' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <textarea
          value={localContent}
          onChange={(e) => setLocalContent(e.target.value)}
          className="w-full h-full bg-white text-slate-900 p-6 text-sm font-serif leading-relaxed resize-none focus:outline-none rounded shadow-inner selection:bg-rose-200"
          placeholder="Select a template, start typing, or drop content here to draft automatically..."
          aria-label="Document Editor"
        />
        
        {/* Copy Button Overlay */}
        {localContent && (
           <button 
             onClick={handleCopy}
             className="absolute top-4 right-4 p-2 bg-white/90 border border-slate-200 text-slate-400 hover:text-rose-600 rounded-lg shadow-sm backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
             title="Copy to Clipboard"
             aria-label="Copy Content"
           >
             {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
           </button>
        )}

        {/* Drag Overlay Indicator */}
        {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-rose-500/10 pointer-events-none backdrop-blur-[1px] rounded">
                <div className="bg-slate-900 text-rose-400 px-4 py-2 rounded-full shadow-2xl border border-rose-500 flex items-center gap-2 animate-bounce">
                    <ArrowDownToLine size={16} /> 
                    <span className="font-bold text-xs">Cross-Talk Active: Drop to Draft</span>
                </div>
            </div>
        )}

        {/* Loading Indicator */}
        {loading && (
            <div className="absolute bottom-4 right-4 bg-slate-900 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2" role="status">
                <Loader2 size={12} className="animate-spin" /> Processing Intent...
            </div>
        )}
      </div>
    </div>
  );
};
