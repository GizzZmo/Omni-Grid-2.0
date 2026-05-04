/**
 * BrowserWidget.tsx
 *
 * Embedded browser widget for Omni-Grid.
 *
 * Features:
 *  - URL bar with navigation (back / forward / refresh / home)
 *  - Iframe sandbox for safe embedding
 *  - Bookmarks (persisted in localStorage)
 *  - Quick-access preset tiles
 *  - Error state for blocked / unreachable URLs
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Home,
  Bookmark,
  BookmarkCheck,
  X,
  Lock,
  AlertCircle,
  ExternalLink,
  Star,
} from 'lucide-react';

const STORAGE_KEY = 'omni-browser-bookmarks';
const HOME_URL = 'https://www.google.com/webhp?igu=1';

const PRESETS = [
  { label: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { label: 'MDN', url: 'https://developer.mozilla.org', icon: '📚' },
  { label: 'Can I Use', url: 'https://caniuse.com', icon: '🔍' },
  { label: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '💬' },
  { label: 'NPM', url: 'https://npmjs.com', icon: '📦' },
  { label: 'Hacker News', url: 'https://news.ycombinator.com', icon: '🧡' },
];

interface BookmarkEntry {
  id: string;
  title: string;
  url: string;
  addedAt: number;
}

const loadBookmarks = (): BookmarkEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BookmarkEntry[];
  } catch {
    /* ignore */
  }
  return [];
};

const saveBookmarks = (bms: BookmarkEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bms));
  } catch {
    /* ignore */
  }
};

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const normalizeUrl = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) return HOME_URL;
  // Already has a protocol
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Looks like a domain
  if (/^[\w-]+\.\w{2,}/.test(trimmed)) return `https://${trimmed}`;
  // Treat as a search query
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
};

export const BrowserWidget: React.FC = () => {
  const [url, setUrl] = useState(HOME_URL);
  const [inputUrl, setInputUrl] = useState(HOME_URL);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [history, setHistory] = useState<string[]>([HOME_URL]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>(loadBookmarks);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [pageTitle, setPageTitle] = useState('New Tab');
  const iframeRef = useRef<React.ElementRef<'iframe'>>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHttps = url.startsWith('https://');
  const isBookmarked = bookmarks.some(b => b.url === url);

  const navigate = useCallback(
    (target: string) => {
      const normalized = normalizeUrl(target);
      setUrl(normalized);
      setInputUrl(normalized);
      setIsLoading(true);
      setHasError(false);
      setPageTitle('Loading…');

      setHistory(prev => {
        const newHist = prev.slice(0, historyIndex + 1);
        newHist.push(normalized);
        setHistoryIndex(newHist.length - 1);
        return newHist;
      });
    },
    [historyIndex]
  );

  const goBack = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const target = history[newIndex];
    setHistoryIndex(newIndex);
    setUrl(target);
    setInputUrl(target);
    setIsLoading(true);
    setHasError(false);
  };

  const goForward = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const target = history[newIndex];
    setHistoryIndex(newIndex);
    setUrl(target);
    setInputUrl(target);
    setIsLoading(true);
    setHasError(false);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      // Re-set src to force reload
      iframeRef.current.src = url;
    }
  };

  const handleGoHome = () => navigate(HOME_URL);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(inputUrl);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    try {
      const title = iframeRef.current?.contentDocument?.title;
      if (title) setPageTitle(title);
    } catch {
      // Cross-origin - can't read title
      setPageTitle(new URL(url).hostname);
    }
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    setPageTitle('Connection Error');
  };

  const toggleBookmark = () => {
    if (isBookmarked) {
      const updated = bookmarks.filter(b => b.url !== url);
      setBookmarks(updated);
      saveBookmarks(updated);
    } else {
      const bm: BookmarkEntry = {
        id: generateId(),
        title: pageTitle !== 'Loading…' ? pageTitle : new URL(url).hostname,
        url,
        addedAt: Date.now(),
      };
      const updated = [bm, ...bookmarks];
      setBookmarks(updated);
      saveBookmarks(updated);
    }
  };

  const openBookmark = (burl: string) => {
    navigate(burl);
    setShowBookmarks(false);
  };

  const deleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    saveBookmarks(updated);
  };

  const openExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Select all on focus for easy URL editing
  const handleInputFocus = () => inputRef.current?.select();

  return (
    <div className="h-full flex flex-col bg-slate-950 font-mono text-slate-200 overflow-hidden relative">
      {/* Navigation bar */}
      <div className="flex items-center gap-1.5 px-2 py-2 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        {/* Nav buttons */}
        <button
          onClick={goBack}
          disabled={historyIndex <= 0}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
          title="Back"
        >
          <ArrowLeft size={13} />
        </button>
        <button
          onClick={goForward}
          disabled={historyIndex >= history.length - 1}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
          title="Forward"
        >
          <ArrowRight size={13} />
        </button>
        <button
          onClick={handleRefresh}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          title="Refresh"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin text-cyan-400' : ''} />
        </button>
        <button
          onClick={handleGoHome}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          title="Home"
        >
          <Home size={13} />
        </button>

        {/* URL bar */}
        <form onSubmit={handleFormSubmit} className="flex-1 flex items-center gap-1.5">
          <div className="flex-1 flex items-center gap-1.5 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs focus-within:border-cyan-500/50 transition-all">
            {isHttps ? (
              <Lock size={10} className="text-emerald-400 flex-shrink-0" />
            ) : (
              <Globe size={10} className="text-slate-500 flex-shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              onFocus={handleInputFocus}
              className="flex-1 bg-transparent outline-none text-slate-200 placeholder-slate-600 min-w-0"
              placeholder="Enter URL or search…"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <button type="submit" className="sr-only">
            Go
          </button>
        </form>

        {/* Bookmark toggle */}
        <button
          onClick={toggleBookmark}
          className={`p-1.5 rounded hover:bg-slate-800 transition-all ${isBookmarked ? 'text-amber-400' : 'text-slate-400 hover:text-white'}`}
          title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          {isBookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
        </button>

        {/* Bookmarks panel toggle */}
        <button
          onClick={() => setShowBookmarks(v => !v)}
          className={`p-1.5 rounded hover:bg-slate-800 transition-all ${showBookmarks ? 'text-cyan-400 bg-slate-800' : 'text-slate-400 hover:text-white'}`}
          title="Bookmarks"
        >
          <Star size={13} />
        </button>

        {/* Open in new tab */}
        <button
          onClick={openExternal}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          title="Open in new tab"
        >
          <ExternalLink size={13} />
        </button>
      </div>

      {/* Bookmarks panel */}
      {showBookmarks && (
        <div className="absolute top-[44px] right-0 z-20 w-72 max-h-80 bg-slate-900 border border-slate-700 rounded-b-lg shadow-2xl overflow-y-auto custom-scrollbar flex flex-col">
          <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Bookmarks ({bookmarks.length})
            </span>
            <button
              onClick={() => setShowBookmarks(false)}
              className="text-slate-500 hover:text-white"
            >
              <X size={12} />
            </button>
          </div>

          {bookmarks.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-slate-500">
              No bookmarks yet. Click ★ to add the current page.
            </div>
          ) : (
            bookmarks.map(bm => (
              <button
                key={bm.id}
                onClick={() => openBookmark(bm.url)}
                className="group flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-800 transition-all border-b border-slate-800/50"
              >
                <Globe size={11} className="text-slate-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-slate-200 truncate font-medium">{bm.title}</div>
                  <div className="text-[9px] text-slate-500 truncate">{bm.url}</div>
                </div>
                <button
                  onClick={e => deleteBookmark(bm.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                >
                  <X size={10} />
                </button>
              </button>
            ))
          )}
        </div>
      )}

      {/* Loading bar */}
      {isLoading && (
        <div className="h-[2px] bg-slate-800 flex-shrink-0">
          <div className="h-full bg-cyan-400 animate-pulse" style={{ width: '60%' }} />
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 relative overflow-hidden">
        {hasError ? (
          /* Error state */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-slate-950">
            <AlertCircle size={40} className="text-red-400 opacity-60" />
            <div className="text-center">
              <div className="text-sm font-bold text-red-400 mb-1">Connection Error</div>
              <div className="text-xs text-slate-500 max-w-xs">
                The page could not be loaded. This may be due to network restrictions,
                X-Frame-Options headers, or the site being unavailable.
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 hover:text-white hover:border-slate-500 transition-all"
              >
                <RefreshCw size={11} />
                Retry
              </button>
              <button
                onClick={openExternal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-cyan-800 rounded text-xs text-cyan-400 hover:border-cyan-500 transition-all"
              >
                <ExternalLink size={11} />
                Open in Browser
              </button>
            </div>
          </div>
        ) : /* New-tab / preset grid shown when on HOME_URL or no navigation yet */
        url === HOME_URL && !isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 overflow-y-auto custom-scrollbar bg-slate-950">
            <div className="text-center">
              <Globe size={32} className="text-cyan-400 mx-auto mb-2 opacity-70" />
              <div className="text-lg font-bold text-slate-200 tracking-wide">New Tab</div>
              <div className="text-xs text-slate-500 mt-1">
                Enter a URL or search above, or pick a preset
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
              {PRESETS.map(preset => (
                <button
                  key={preset.url}
                  onClick={() => navigate(preset.url)}
                  className="flex flex-col items-center gap-1.5 p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-600 hover:bg-slate-800 transition-all"
                >
                  <span className="text-xl">{preset.icon}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{preset.label}</span>
                </button>
              ))}
            </div>

            {bookmarks.length > 0 && (
              <div className="w-full max-w-xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Star size={10} /> Bookmarks
                </div>
                <div className="flex flex-col gap-1">
                  {bookmarks.slice(0, 5).map(bm => (
                    <button
                      key={bm.id}
                      onClick={() => navigate(bm.url)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded hover:border-slate-600 transition-all text-left"
                    >
                      <Globe size={10} className="text-slate-500 flex-shrink-0" />
                      <span className="text-[11px] text-slate-300 truncate">{bm.title}</span>
                    </button>
                  ))}
                  {bookmarks.length > 5 && (
                    <button
                      onClick={() => setShowBookmarks(true)}
                      className="text-[10px] text-slate-500 hover:text-cyan-400 py-1"
                    >
                      +{bookmarks.length - 5} more
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={url}
            title="Browser"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-slate-900/60 border-t border-slate-800 flex-shrink-0">
        <span className="text-[9px] text-slate-500 truncate max-w-[60%]">{pageTitle}</span>
        <span className="text-[9px] text-slate-600 font-mono truncate max-w-[40%]">
          {new URL(url).hostname}
        </span>
      </div>
    </div>
  );
};
