import React, { useState, useEffect } from 'react';
import { BookOpen, HelpCircle, FileText, ChevronRight, Search, Terminal } from 'lucide-react';

export const HelpDesk: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'WIKI' | 'QA' | 'GUIDES'>('WIKI');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // A11y & Performance: Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const toggleItem = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const WIKI_DATA = [
    {
      id: 'w1',
      term: 'Omni-Grid',
      def: 'A local-first, privacy-centric Super App designed to replace fragmented browser tools. It uses a "Bento Box" grid layout to host multiple isolated "Widgets".',
    },
    {
      id: 'w2',
      term: 'Neural Link',
      def: 'The connection between the local environment and the Google Gemini API. Requires an API Key in the environment variables to function.',
    },
    {
      id: 'w3',
      term: 'Pipeline Arch',
      def: 'The design philosophy allowing outputs from one widget (e.g., Transformer JSON) to be dragged and dropped into another (e.g., Scratchpad).',
    },
    {
      id: 'w4',
      term: 'Local Persistence',
      def: "Data is saved to the browser's LocalStorage/IndexedDB. No user data is sent to a central server, ensuring maximum privacy. Clearing browser cache will wipe this.",
    },
    {
      id: 'w5',
      term: 'Grounding',
      def: 'The process of anchoring AI model outputs to verifiable, real-world data sources (e.g., Google Search results) to reduce hallucinations.',
    },
    {
      id: 'w6',
      term: 'AES-GCM',
      def: 'Galois/Counter Mode. An authenticated encryption algorithm used by the Cipher Pad widget to secure notes in memory before locking.',
    },
    {
      id: 'w7',
      term: 'Cross-Talk',
      def: 'An event bus protocol allowing widgets to share data via Drag & Drop. E.g., dropping a hex code into a text field triggers specific processing.',
    },
    {
      id: 'w8',
      term: 'Smart Grid',
      def: 'A strategic framework for asset management dividing capital into Physical (Infrastructure), Liquidity (Stablecoins), Logic (Smart Contracts), and Macro (Store of Value) layers.',
    },
    {
      id: 'w9',
      term: 'Pomodoro',
      def: 'A time management method used in the Focus HUD. It uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks.',
    },
    {
      id: 'w10',
      term: 'JWT (JSON Web Token)',
      def: 'A compact, URL-safe means of representing claims to be transferred between two parties. The Dev Optic widget can decode these to reveal payload data.',
    },
    {
      id: 'w11',
      term: 'RSS (Really Simple Syndication)',
      def: 'A web feed that allows users and applications to access updates to websites in a standardized, computer-readable format. Used by the News Feed widget.',
    },
    {
      id: 'w12',
      term: 'Brown Noise',
      def: 'A type of signal noise produced by Brownian motion. It is deeper than white noise and is used in the Focus HUD to mask distracting sounds and improve concentration.',
    },
    {
      id: 'w13',
      term: 'Zustand',
      def: 'The state management library powering Omni-Grid. It handles the global state of widgets, layouts, and data persistence efficiently.',
    },
    {
      id: 'w14',
      term: 'Markdown',
      def: 'A lightweight markup language for creating formatted text using a plain-text editor. Supported in the Neural Scratchpad and WritePad.',
    },
    {
      id: 'w15',
      term: 'Latency',
      def: 'The delay before a transfer of data begins following an instruction. Local-first apps have near-zero latency for UI interactions compared to cloud apps.',
    },
  ];

  const QA_DATA = [
    {
      id: 'q1',
      q: 'Is my data private?',
      a: 'Yes. All data processing happens in your browser. The only data that leaves your machine is text sent to the AI API if you explicitly use those features.',
    },
    {
      id: 'q2',
      q: 'How do I save my layout?',
      a: 'The layout is saved automatically to your local browser storage. You can also manually "Backup" the entire grid state to a JSON file via the top-right menu.',
    },
    {
      id: 'q3',
      q: 'Where do I get an API Key?',
      a: 'You need a Google Gemini API key. This is typically set in the environment variables during deployment or development (.env file).',
    },
    {
      id: 'q4',
      q: 'The widgets are stuck/frozen?',
      a: 'Go to the "System Core" widget, select the "Settings" tab, and click "Factory Reset" (Skull Icon) to clear local cache and reload. You can also kill specific widgets in the "Tasks" tab.',
    },
    {
      id: 'q5',
      q: 'Why did Research Browser change?',
      a: 'The previous iframe method was blocked by many websites (X-Frame-Options). The new version uses AI Grounding to perform live searches and synthesize answers.',
    },
    {
      id: 'q6',
      q: 'Is the crypto data real?',
      a: 'Yes, widgets like Market Feed and Chain Pulse pull data from public APIs (Coinbase, etc.). Rate limits may apply if refreshed too aggressively.',
    },
    {
      id: 'q7',
      q: 'Can I write code here?',
      a: 'Yes. The Web Terminal acts as a JavaScript REPL, and the Widget Architect can actually generate React code for new widgets. The Polyglot Box translates code.',
    },
    {
      id: 'q8',
      q: 'How do I change the theme?',
      a: 'Use the "Aesthetic Engine" widget. You can type a prompt like "Cyberpunk Red" or upload an image to generate a matching color scheme.',
    },
    {
      id: 'q9',
      q: 'Can I use this offline?',
      a: 'Yes! Most widgets (Calc, Notes, Timer, Cipher, etc.) work entirely offline. Only AI and Feed widgets require an internet connection.',
    },
    {
      id: 'q10',
      q: 'What is the "Ghost" widget?',
      a: 'The Ghost widget is a predictive suggestion generated by the "Smart Grid" AI. It analyzes your current layout and suggests a tool you might need next.',
    },
    {
      id: 'q11',
      q: 'Does the terminal run Node.js?',
      a: "No, the Web Terminal runs in the browser's JavaScript sandbox. It has access to window objects and standard browser APIs, but not the file system.",
    },
    {
      id: 'q12',
      q: 'How secure is the Cipher Pad?',
      a: 'It uses AES-GCM encryption. However, the security is tied to your session. If you refresh the page without backing up, the ephemeral keys are lost.',
    },
    {
      id: 'q13',
      q: 'Why is the layout locked?',
      a: 'The "LOCKED" button in the header prevents accidental drags. Click "UNLOCKED" to enable resizing and moving widgets.',
    },
    {
      id: 'q14',
      q: 'Can I add my own RSS feeds?',
      a: 'Currently, the News Feed uses a curated list of tech sources. Custom feed management is planned for the v2 update.',
    },
    {
      id: 'q15',
      q: 'Mobile support?',
      a: 'Omni-Grid is responsive, but best experienced on desktop due to the density of information. On mobile, widgets stack vertically.',
    },
  ];

  const GUIDES_DATA = [
    // Core System
    {
      id: 'g_sys',
      title: 'System Core',
      steps: [
        'Monitor simulated CPU/Mem usage.',
        'Kill unresponsive widgets via the Task Manager tab.',
        'Toggle CRT Scanlines/Audio.',
        'Perform Factory Reset.',
      ],
    },
    {
      id: 'g_help',
      title: 'Help Desk',
      steps: [
        'Use the Search bar to find definitions.',
        'Read Q&A for troubleshooting.',
        'Browse these guides for operational protocols.',
      ],
    },
    // Tools
    {
      id: 'g_trans',
      title: 'Transformer',
      steps: [
        'Paste JSON or CSV data.',
        'Click convert buttons.',
        'Drag output to other widgets.',
        'Use the "Units" tab for PX/REM conversion.',
      ],
    },
    {
      id: 'g_scratch',
      title: 'Neural Notes',
      steps: [
        'Type or paste text.',
        'Highlight text to reveal AI Context Menu.',
        'Use Cmd+K shortcut.',
        'Drag files into the text area to import.',
      ],
    },
    {
      id: 'g_focus',
      title: 'Focus HUD',
      steps: [
        'Add tasks to the Kanban queue.',
        'Click Play to start 25m Pomodoro.',
        'Toggle Brown Noise for immersion.',
        'Mark tasks complete.',
      ],
    },
    {
      id: 'g_dev',
      title: 'Dev Optic',
      steps: [
        'Paste JWT strings to decode payload.',
        'Test Regex patterns against strings.',
        'View real-time matches and flags.',
      ],
    },
    {
      id: 'g_cipher',
      title: 'Cipher Vault',
      steps: [
        'Generate UUID v4 or NanoIDs.',
        'Hash text using SHA-256/512.',
        'Base64 encode/decode strings.',
      ],
    },
    {
      id: 'g_chroma',
      title: 'Chroma Lab',
      steps: [
        'Pick a base color.',
        'View generated shades (50-900).',
        'Click any shade to copy the Tailwind class.',
        'Use the pipette visualizer.',
      ],
    },
    {
      id: 'g_temp',
      title: 'Temporal Nexus',
      steps: [
        'View current UTC/Local time.',
        'Switch to "On This Day".',
        "Use AI to fetch historical facts for today's date.",
      ],
    },
    {
      id: 'g_sonic',
      title: 'Sonic Arch',
      steps: [
        'Reference the Circle of Fifths.',
        'View compatible Major/Minor chords.',
        'Use the Metronome for timing.',
        'Play reference tones.',
      ],
    },
    {
      id: 'g_calc',
      title: 'Quantum Calc',
      steps: [
        'Perform standard arithmetic.',
        'Use scientific functions (sin, cos, log).',
        'View history of the last result.',
        'Handle complex expressions.',
      ],
    },
    // Financial
    {
      id: 'g_asset',
      title: 'Asset Command',
      steps: [
        'Add tickers (e.g. BTC, ETH).',
        'Define logic rules (IF BTC < 50k THEN ALERT).',
        'Generate AI Portfolio Analysis.',
      ],
    },
    {
      id: 'g_poly',
      title: 'Polyglot Box',
      steps: [
        'Select Source and Target languages.',
        'Paste code snippet.',
        'Click Translate to transpile logic via AI.',
        'Copy result.',
      ],
    },
    {
      id: 'g_write',
      title: 'WritePad',
      steps: [
        'Select a template (Email, Invoice).',
        'Use AI Draft to generate content from prompts.',
        'Drag & Drop Cross-Talk content to append.',
      ],
    },
    {
      id: 'g_weather',
      title: 'Weather Station',
      steps: [
        'Enter City or Zip Code.',
        'View current conditions.',
        'Monitor Humidity and Wind speeds.',
      ],
    },
    {
      id: 'g_valuta',
      title: 'Valuta Exchange',
      steps: [
        'Select input currency (USD).',
        'Select target currency (EUR).',
        'Enter amount to see real-time conversion rates.',
      ],
    },
    // Advanced
    {
      id: 'g_arch',
      title: 'Widget Architect',
      steps: [
        'Describe a widget idea (e.g. "Crypto Tracker").',
        'Click Generate Prototype.',
        'View Logic Graph and Copy React Code.',
      ],
    },
    {
      id: 'g_theme',
      title: 'Aesthetic Engine',
      steps: [
        'Describe a vibe (e.g. "Cyberpunk Red").',
        'Upload an image to extract colors.',
        'Apply generated theme to the entire app.',
      ],
    },
    {
      id: 'g_radio',
      title: 'Signal Radio',
      steps: [
        'Tune into SoundCloud sets.',
        'Activate Microphone for visualizer.',
        'Watch frequency bars react to audio.',
      ],
    },
    {
      id: 'g_sudoku',
      title: 'Sudoku Grid',
      steps: [
        'Select Difficulty.',
        'Fill cells (1-9).',
        'Use "Note Mode" to mark possibilities.',
        'Clear board when finished.',
      ],
    },
    // Dev/Research
    {
      id: 'g_docu',
      title: 'DocuHub',
      steps: [
        'Browse offline documentation via DevDocs wrapper.',
        'Access standard library refs.',
        'Use external links for source.',
      ],
    },
    {
      id: 'g_git',
      title: 'Git Pulse',
      steps: [
        'Enter Personal Access Token (PAT).',
        'Monitor open PRs.',
        'Check build status and merge readiness.',
      ],
    },
    {
      id: 'g_track',
      title: 'Project Tracker',
      steps: [
        'Create tasks in "Todo".',
        'Drag tasks between "Progress" and "Done".',
        'Manage simple project kanban flow.',
      ],
    },
    {
      id: 'g_term',
      title: 'Web Terminal',
      steps: [
        'Execute JavaScript commands.',
        'Access browser console features.',
        'Test logic snippets locally.',
      ],
    },
    {
      id: 'g_news',
      title: 'News Feed',
      steps: [
        'Read latest headlines.',
        'Refresh for updates.',
        'Click external links to read full articles.',
      ],
    },
    {
      id: 'g_pad',
      title: 'Cipher Pad',
      steps: [
        'Enter a session key.',
        'Unlock pad.',
        'Type sensitive notes.',
        'Lock to encrypt in memory.',
      ],
    },
    {
      id: 'g_pdf',
      title: 'PDF Viewer',
      steps: [
        'Drag and Drop PDF files.',
        'Read whitepapers or docs inline.',
        'Close file to reset.',
      ],
    },
    {
      id: 'g_browser',
      title: 'Research Browser',
      steps: [
        'Enter query (e.g. "React 19 features").',
        'AI browses the web.',
        'Read synthesized summary and click source citations.',
      ],
    },
    {
      id: 'g_cal',
      title: 'Secure Calendar',
      steps: [
        'Navigate months.',
        'Click dates to add events.',
        'Events are stored locally and encrypted.',
      ],
    },
    {
      id: 'g_macro',
      title: 'Macro Net',
      steps: [
        'Analyze Global Liquidity heatmap.',
        'Check asset correlations against M2 supply.',
        'Monitor inflation impact.',
      ],
    },
    {
      id: 'g_chain',
      title: 'Chain Pulse',
      steps: ['Track TPS of L1 vs L2s.', 'Monitor blob fees.', 'Watch Solana compute unit usage.'],
    },
    {
      id: 'g_reg',
      title: 'Reg Radar',
      steps: [
        'Monitor regulatory threat levels.',
        'Read updates on SEC/MiCA actions.',
        'Check jurisdiction status.',
      ],
    },
    {
      id: 'g_mkt',
      title: 'Market Feed',
      steps: [
        'View 24h prices for major assets.',
        'Track percentage changes.',
        'Auto-refreshes every 60s.',
      ],
    },
  ];

  return (
    <div className="h-full flex flex-col gap-3 font-mono">
      {/* Tab Header */}
      <div
        className="flex bg-slate-900/50 p-1 border border-slate-800 rounded-lg shrink-0"
        role="tablist"
      >
        <button
          onClick={() => setActiveTab('WIKI')}
          className={`flex-1 flex items-center justify-center gap-2 py-1 text-[10px] font-bold rounded transition-all ${activeTab === 'WIKI' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-emerald-300'}`}
          role="tab"
          aria-selected={activeTab === 'WIKI'}
        >
          <BookOpen size={12} /> Wiki
        </button>
        <button
          onClick={() => setActiveTab('QA')}
          className={`flex-1 flex items-center justify-center gap-2 py-1 text-[10px] font-bold rounded transition-all ${activeTab === 'QA' ? 'bg-amber-900/40 text-amber-400 border border-amber-500/30' : 'text-slate-500 hover:text-amber-300'}`}
          role="tab"
          aria-selected={activeTab === 'QA'}
        >
          <HelpCircle size={12} /> Q&A
        </button>
        <button
          onClick={() => setActiveTab('GUIDES')}
          className={`flex-1 flex items-center justify-center gap-2 py-1 text-[10px] font-bold rounded transition-all ${activeTab === 'GUIDES' ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-cyan-300'}`}
          role="tab"
          aria-selected={activeTab === 'GUIDES'}
        >
          <FileText size={12} /> Guides
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/30 border border-slate-800/50 rounded-lg p-2 min-h-0">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-900 px-2 py-1.5 rounded mb-3 border border-slate-800 focus-within:border-emerald-500/50 shrink-0 sticky top-0 z-20">
          <Search size={12} className="text-slate-500" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search database..."
            className="bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none w-full"
            aria-label="Search Help Desk"
          />
        </div>

        {/* WIKI Tab */}
        {activeTab === 'WIKI' && (
          <div className="flex flex-col gap-2">
            {WIKI_DATA.filter(i =>
              i.term.toLowerCase().includes(debouncedSearch.toLowerCase())
            ).map(item => (
              <div
                key={item.id}
                className="bg-slate-900/50 border border-slate-800 p-2 rounded hover:border-emerald-500/30 transition-colors group"
              >
                <div className="text-emerald-400 font-bold text-xs mb-1 group-hover:text-emerald-300 flex items-center gap-2">
                  <Terminal size={10} className="opacity-50" /> {item.term}
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed pl-4 border-l border-slate-800">
                  {item.def}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QA Tab */}
        {activeTab === 'QA' && (
          <div className="flex flex-col gap-2">
            {QA_DATA.filter(i => i.q.toLowerCase().includes(debouncedSearch.toLowerCase())).map(
              item => (
                <div
                  key={item.id}
                  className="bg-slate-900/50 border border-slate-800 rounded overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center justify-between p-2 text-left hover:bg-slate-800/50 transition-colors"
                    aria-expanded={expandedItem === item.id}
                  >
                    <span className="text-amber-400 font-bold text-xs">{item.q}</span>
                    <ChevronRight
                      size={12}
                      className={`text-slate-500 transition-transform ${expandedItem === item.id ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {expandedItem === item.id && (
                    <div className="p-2 pt-0 text-[10px] text-slate-400 border-t border-slate-800/50 leading-relaxed bg-black/20 pl-4">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* GUIDES Tab */}
        {activeTab === 'GUIDES' && (
          <div className="flex flex-col gap-3">
            {GUIDES_DATA.filter(i =>
              i.title.toLowerCase().includes(debouncedSearch.toLowerCase())
            ).map(guide => (
              <div
                key={guide.id}
                className="bg-slate-900/50 border border-slate-800 p-3 rounded hover:border-cyan-500/30 transition-all"
              >
                <div className="text-cyan-400 font-bold text-xs mb-2 flex items-center gap-2 border-b border-white/5 pb-1">
                  <FileText size={12} /> {guide.title}
                </div>
                <ul className="flex flex-col gap-1.5">
                  {guide.steps.map((step, idx) => (
                    <li key={idx} className="text-[10px] text-slate-400 flex gap-2">
                      <span className="text-slate-600 font-mono">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
