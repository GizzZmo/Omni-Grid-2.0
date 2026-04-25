/**
 * WidgetMarketplace.tsx
 *
 * Full-featured Widget Marketplace for Omni-Grid.
 * Features:
 *  - Browse all widgets by category
 *  - One-click install / uninstall
 *  - Update notifications with one-click update-all
 *  - Search and filter
 *  - Version history / changelog
 *  - Developer portal tab for community submissions
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Trash2,
  RefreshCw,
  Star,
  Tag,
  ArrowUpCircle,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Code2,
  ShieldCheck,
  BookOpen,
  Package,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '../store';
import { MARKETPLACE_CATALOG } from './marketplaceCatalog';
import { MarketplaceCategory, MarketplaceEntry } from '../types';

const CATEGORIES: { id: MarketplaceCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'utility', label: 'Utility' },
  { id: 'developer', label: 'Developer' },
  { id: 'finance', label: 'Finance' },
  { id: 'creative', label: 'Creative' },
  { id: 'ai', label: 'AI' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'community', label: 'Community' },
];

const CATEGORY_COLORS: Record<MarketplaceCategory, string> = {
  all: 'text-slate-400',
  utility: 'text-cyan-400',
  developer: 'text-orange-400',
  finance: 'text-emerald-400',
  creative: 'text-pink-400',
  ai: 'text-fuchsia-400',
  productivity: 'text-blue-400',
  community: 'text-amber-400',
};

type Tab = 'browse' | 'installed' | 'updates' | 'developer';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        size={10}
        className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}
      />
    ))}
    <span className="text-[10px] text-slate-500 ml-1">{rating.toFixed(1)}</span>
  </div>
);

const VersionBadge: React.FC<{ version: string; highlight?: boolean }> = ({
  version,
  highlight,
}) => (
  <span
    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
      highlight
        ? 'bg-emerald-900/40 border border-emerald-500/50 text-emerald-400'
        : 'bg-slate-800 text-slate-400'
    }`}
  >
    v{version}
  </span>
);

const WidgetCard: React.FC<{
  entry: MarketplaceEntry;
  installedVersion?: string;
  hasUpdate: boolean;
  onInstall: () => void;
  onUninstall: () => void;
  onViewDetails: () => void;
}> = ({ entry, installedVersion, hasUpdate, onInstall, onUninstall, onViewDetails }) => {
  const isInstalled = installedVersion !== undefined;
  const colorClass = CATEGORY_COLORS[entry.category];

  return (
    <div
      className={`group relative bg-slate-900/60 border rounded-lg p-3 flex flex-col gap-2 transition-all duration-200 hover:border-slate-600 cursor-pointer ${
        isInstalled ? 'border-slate-700' : 'border-slate-800'
      } ${hasUpdate ? 'border-amber-500/40' : ''}`}
      onClick={onViewDetails}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-white truncate">{entry.name}</span>
            <VersionBadge version={entry.version} highlight={isInstalled} />
            {hasUpdate && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-900/40 border border-amber-500/50 text-amber-400 flex items-center gap-1">
                <ArrowUpCircle size={9} />
                UPDATE
              </span>
            )}
          </div>
          <div className={`text-[10px] mt-0.5 font-medium uppercase tracking-wider ${colorClass}`}>
            {entry.category}
          </div>
        </div>
        {isInstalled && <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />}
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{entry.description}</p>

      {/* Meta row */}
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <StarRating rating={entry.rating} />
        <span className="text-[10px] text-slate-500">
          {entry.downloads >= 1000 ? `${(entry.downloads / 1000).toFixed(1)}k` : entry.downloads}{' '}
          installs
        </span>
        <span className="text-[10px] text-slate-600 font-mono">{entry.author}</span>
      </div>

      {/* Tags */}
      <div className="flex gap-1 flex-wrap">
        {entry.tags.slice(0, 4).map(tag => (
          <span
            key={tag}
            className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-slate-400 font-mono"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-1" onClick={e => e.stopPropagation()}>
        {isInstalled ? (
          <>
            {hasUpdate && (
              <button
                onClick={onInstall}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-amber-900/30 border border-amber-500/50 rounded text-[10px] text-amber-400 hover:bg-amber-900/50 transition-all font-bold"
              >
                <ArrowUpCircle size={11} />
                Update
              </button>
            )}
            <button
              onClick={onUninstall}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-900/20 border border-red-500/30 rounded text-[10px] text-red-400 hover:bg-red-900/40 transition-all"
            >
              <Trash2 size={11} />
              Uninstall
            </button>
          </>
        ) : (
          <button
            onClick={onInstall}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-bold transition-all ${colorClass} bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-500`}
          >
            <Download size={11} />
            Install
          </button>
        )}
        <button
          onClick={onViewDetails}
          className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400 hover:text-white hover:border-slate-500 transition-all"
        >
          <ChevronRight size={11} />
        </button>
      </div>
    </div>
  );
};

const DetailPanel: React.FC<{
  entry: MarketplaceEntry;
  installedVersion?: string;
  hasUpdate: boolean;
  onInstall: () => void;
  onUninstall: () => void;
  onClose: () => void;
}> = ({ entry, installedVersion, hasUpdate, onInstall, onUninstall, onClose }) => {
  const isInstalled = installedVersion !== undefined;
  const colorClass = CATEGORY_COLORS[entry.category];

  return (
    <div className="absolute inset-0 bg-slate-950 z-10 flex flex-col overflow-y-auto custom-scrollbar">
      {/* Top bar */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-800 sticky top-0 bg-slate-950 z-10">
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-all text-xs"
        >
          ← Back
        </button>
        <span className={`text-xs font-bold uppercase tracking-wider ${colorClass}`}>
          {entry.category}
        </span>
        {!entry.isCore && (
          <span className="px-1.5 py-0.5 rounded bg-amber-900/30 border border-amber-500/40 text-[9px] text-amber-400 font-bold uppercase">
            Community
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Title & versions */}
        <div>
          <h2 className="text-xl font-bold text-white mb-1">{entry.name}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <VersionBadge version={entry.version} highlight={isInstalled} />
            {isInstalled && (
              <span className="text-[10px] text-slate-500">Installed: v{installedVersion}</span>
            )}
            {hasUpdate && (
              <span className="text-[10px] text-amber-400 font-bold">
                ↑ Update available: v{entry.version}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={entry.rating} />
            <span className="text-[10px] text-slate-500">
              {entry.downloads.toLocaleString()} installs
            </span>
            <span className="text-[10px] text-slate-500 font-mono">by {entry.author}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Description
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">{entry.description}</p>
        </div>

        {/* Changelog */}
        {entry.changelog && (
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Latest Changes
            </h3>
            <p className="text-xs text-slate-400 font-mono bg-slate-900/60 border border-slate-800 rounded p-3 leading-relaxed">
              {entry.changelog}
            </p>
          </div>
        )}

        {/* Grid requirements */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Grid Requirements
          </h3>
          <div className="flex gap-4 text-xs text-slate-300">
            <span>
              Min Width: <span className="text-cyan-400 font-mono">{entry.minGridW} cols</span>
            </span>
            <span>
              Min Height: <span className="text-cyan-400 font-mono">{entry.minGridH} rows</span>
            </span>
          </div>
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Tags
          </h3>
          <div className="flex gap-1.5 flex-wrap">
            {entry.tags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono"
              >
                <Tag size={9} />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Last updated */}
        <p className="text-[10px] text-slate-600 font-mono">Updated: {entry.updatedAt}</p>

        {/* Action */}
        <div className="flex gap-3">
          {isInstalled ? (
            <>
              {hasUpdate && (
                <button
                  onClick={onInstall}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-900/30 border border-amber-500/50 rounded text-xs text-amber-400 hover:bg-amber-900/50 transition-all font-bold"
                >
                  <ArrowUpCircle size={14} />
                  Update to v{entry.version}
                </button>
              )}
              <button
                onClick={onUninstall}
                className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400 hover:bg-red-900/40 transition-all"
              >
                <Trash2 size={14} />
                Uninstall
              </button>
            </>
          ) : (
            <button
              onClick={onInstall}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all ${colorClass} bg-slate-800 border border-slate-600 hover:bg-slate-700`}
            >
              <Download size={14} />
              Install Widget
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const DeveloperPortalTab: React.FC = () => (
  <div className="p-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar h-full">
    <div>
      <h2 className="text-lg font-bold text-fuchsia-400 mb-1">Developer Portal</h2>
      <p className="text-xs text-slate-400 leading-relaxed">
        Build and share widgets with the Omni-Grid community. Follow the guides below to create,
        test, and submit your widget to the marketplace.
      </p>
    </div>

    {/* Quick links */}
    <div className="grid grid-cols-1 gap-3">
      {[
        {
          icon: BookOpen,
          color: 'text-cyan-400',
          bg: 'bg-cyan-900/20 border-cyan-500/30',
          title: 'Widget Development Guide',
          desc: 'Step-by-step guide from type definition to deployment.',
          path: 'docs/widget-development.md',
        },
        {
          icon: Code2,
          color: 'text-orange-400',
          bg: 'bg-orange-900/20 border-orange-500/30',
          title: 'Plugin API Reference',
          desc: 'Complete API docs: store, AI service, utilities, CSS variables.',
          path: 'docs/widget-api/api-reference.md',
        },
        {
          icon: ShieldCheck,
          color: 'text-emerald-400',
          bg: 'bg-emerald-900/20 border-emerald-500/30',
          title: 'Security Guidelines',
          desc: 'CSP, input sanitization, safe store usage, and network rules.',
          path: 'docs/plugin-security.md',
        },
        {
          icon: Package,
          color: 'text-fuchsia-400',
          bg: 'bg-fuchsia-900/20 border-fuchsia-500/30',
          title: 'Submission Checklist',
          desc: 'Community widget submission workflow and review criteria.',
          path: 'docs/developer-portal.md',
        },
      ].map(item => (
        <div
          key={item.title}
          className={`flex items-start gap-3 p-3 rounded-lg border ${item.bg} transition-all`}
        >
          <item.icon size={18} className={`${item.color} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-white">{item.title}</span>
              <span className="text-[9px] text-slate-500 font-mono truncate">{item.path}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Submission steps */}
    <div>
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
        Submission Workflow
      </h3>
      <div className="flex flex-col gap-2">
        {[
          {
            step: '01',
            label: 'Build your widget',
            desc: 'Follow the 5-step creation workflow in the dev guide.',
          },
          {
            step: '02',
            label: 'Pass security checklist',
            desc: 'All items in docs/plugin-security.md §7 must pass.',
          },
          {
            step: '03',
            label: 'Add catalog entry',
            desc: 'Append your entry to widgets/marketplaceCatalog.ts with isCore: false.',
          },
          {
            step: '04',
            label: 'Write tests',
            desc: 'Add a test file under test/ covering render, state, and interactions.',
          },
          {
            step: '05',
            label: 'Open pull request',
            desc: 'Target the main branch with the PR template. Tag a core reviewer.',
          },
          {
            step: '06',
            label: 'Review & merge',
            desc: 'Core team reviews within 7 days. Address feedback and get merged.',
          },
        ].map(s => (
          <div key={s.step} className="flex items-start gap-3">
            <span className="text-[10px] font-mono font-bold text-fuchsia-500 w-5 flex-shrink-0 mt-0.5">
              {s.step}
            </span>
            <div>
              <span className="text-xs font-bold text-slate-200">{s.label}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* GitHub link */}
    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-900 border border-slate-700">
      <ExternalLink size={14} className="text-slate-400" />
      <div>
        <p className="text-xs font-bold text-slate-200">Contribute on GitHub</p>
        <p className="text-[11px] text-slate-500">
          Fork the repository and open a pull request to submit your widget.
        </p>
      </div>
    </div>

    {/* Versioning info */}
    <div>
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
        Widget Versioning
      </h3>
      <div className="bg-slate-900/60 border border-slate-800 rounded p-3 text-[11px] text-slate-400 leading-relaxed font-mono space-y-1">
        <p>
          <span className="text-cyan-400">version</span> follows{' '}
          <span className="text-fuchsia-400">semver</span> (MAJOR.MINOR.PATCH)
        </p>
        <p>
          <span className="text-emerald-400">MAJOR</span> — breaking API or behavior change
        </p>
        <p>
          <span className="text-blue-400">MINOR</span> — new feature, backward-compatible
        </p>
        <p>
          <span className="text-slate-400">PATCH</span> — bug fix or small improvement
        </p>
        <p className="mt-2 text-[10px] text-slate-500">
          Update the <span className="text-white">version</span> field in your catalog entry with
          each release. The marketplace will surface update notifications automatically.
        </p>
      </div>
    </div>
  </div>
);

export const WidgetMarketplace: React.FC = () => {
  const installedWidgets = useAppStore(s => s.installedWidgets);
  const availableUpdates = useAppStore(s => s.availableUpdates);
  const marketplaceLastChecked = useAppStore(s => s.marketplaceLastChecked);
  const installWidget = useAppStore(s => s.installWidget);
  const uninstallWidget = useAppStore(s => s.uninstallWidget);
  const checkForUpdates = useAppStore(s => s.checkForUpdates);
  const toggleWidget = useAppStore(s => s.toggleWidget);

  const [tab, setTab] = useState<Tab>('browse');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<MarketplaceCategory>('all');
  const [selectedEntry, setSelectedEntry] = useState<MarketplaceEntry | null>(null);
  const [checking, setChecking] = useState(false);

  // Auto-check for updates on mount if never checked
  useEffect(() => {
    if (marketplaceLastChecked === 0) {
      checkForUpdates();
    }
  }, [marketplaceLastChecked, checkForUpdates]);

  const handleCheckForUpdates = async () => {
    setChecking(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    checkForUpdates();
    setChecking(false);
  };

  const handleInstall = (id: string) => {
    installWidget(id);
    // Also activate the widget on the grid
    const visibleWidgets = useAppStore.getState().visibleWidgets;
    if (!visibleWidgets.includes(id)) {
      toggleWidget(id);
    }
  };

  const handleUninstall = (id: string) => {
    uninstallWidget(id);
    if (selectedEntry?.id === id) setSelectedEntry(null);
  };

  const filteredEntries = useMemo(() => {
    return MARKETPLACE_CATALOG.filter(entry => {
      if (category !== 'all' && entry.category !== category) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          entry.name.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q) ||
          entry.tags.some(t => t.includes(q)) ||
          entry.author.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [category, query]);

  const installedEntries = MARKETPLACE_CATALOG.filter(e => installedWidgets[e.id] !== undefined);
  const updateEntries = MARKETPLACE_CATALOG.filter(e => availableUpdates.includes(e.id));

  return (
    <div className="h-full flex flex-col bg-slate-950 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/40 flex-shrink-0">
        <div>
          <h2 className="text-sm font-bold text-fuchsia-400 uppercase tracking-wider">
            Widget Marketplace
          </h2>
          <p className="text-[10px] text-slate-500 font-mono">
            {MARKETPLACE_CATALOG.length} widgets · {Object.keys(installedWidgets).length} installed
            {availableUpdates.length > 0 && (
              <span className="text-amber-400 ml-2 font-bold">
                · {availableUpdates.length} update{availableUpdates.length !== 1 ? 's' : ''}{' '}
                available
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleCheckForUpdates}
          disabled={checking}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 hover:text-white hover:border-slate-500 transition-all disabled:opacity-50"
        >
          {checking ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
          {checking ? 'Checking...' : 'Check Updates'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 flex-shrink-0 bg-slate-900/20">
        {(
          [
            { id: 'browse', label: 'Browse', badge: null },
            {
              id: 'installed',
              label: 'Installed',
              badge: Object.keys(installedWidgets).length || null,
            },
            {
              id: 'updates',
              label: 'Updates',
              badge: availableUpdates.length || null,
            },
            { id: 'developer', label: 'Developer', badge: null },
          ] as const
        ).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors relative ${
              tab === t.id
                ? 'text-fuchsia-400 border-b-2 border-fuchsia-400 -mb-px'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.label}
            {t.badge !== null && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  t.id === 'updates'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Detail panel overlay */}
      {selectedEntry && (
        <DetailPanel
          entry={selectedEntry}
          installedVersion={installedWidgets[selectedEntry.id]}
          hasUpdate={availableUpdates.includes(selectedEntry.id)}
          onInstall={() => handleInstall(selectedEntry.id)}
          onUninstall={() => handleUninstall(selectedEntry.id)}
          onClose={() => setSelectedEntry(null)}
        />
      )}

      {/* Tab content */}
      {tab === 'browse' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Search + category filter */}
          <div className="p-3 flex items-center gap-2 border-b border-slate-800 flex-shrink-0 flex-wrap">
            <div className="relative flex-1 min-w-[160px]">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search widgets..."
                className="w-full pl-7 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-fuchsia-500/50 transition-colors"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    category === cat.id
                      ? `${CATEGORY_COLORS[cat.id]} bg-slate-800 border border-slate-600`
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Widget grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            {filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-500">
                <AlertCircle size={24} />
                <span className="text-xs">No widgets match your search</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredEntries.map(entry => (
                  <WidgetCard
                    key={entry.id}
                    entry={entry}
                    installedVersion={installedWidgets[entry.id]}
                    hasUpdate={availableUpdates.includes(entry.id)}
                    onInstall={() => handleInstall(entry.id)}
                    onUninstall={() => handleUninstall(entry.id)}
                    onViewDetails={() => setSelectedEntry(entry)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'installed' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          {installedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-500">
              <Package size={24} />
              <span className="text-xs">No widgets installed</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {installedEntries.map(entry => (
                <WidgetCard
                  key={entry.id}
                  entry={entry}
                  installedVersion={installedWidgets[entry.id]}
                  hasUpdate={availableUpdates.includes(entry.id)}
                  onInstall={() => handleInstall(entry.id)}
                  onUninstall={() => handleUninstall(entry.id)}
                  onViewDetails={() => setSelectedEntry(entry)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'updates' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          {updateEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-500">
              <CheckCircle size={24} className="text-emerald-500" />
              <span className="text-xs">All widgets are up to date</span>
            </div>
          ) : (
            <>
              {/* Update all button */}
              <div className="flex items-center justify-between mb-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                <div>
                  <p className="text-xs font-bold text-amber-400">
                    {updateEntries.length} update{updateEntries.length !== 1 ? 's' : ''} available
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Keeping widgets up to date ensures you have the latest features and security
                    fixes.
                  </p>
                </div>
                <button
                  onClick={() => updateEntries.forEach(e => handleInstall(e.id))}
                  className="flex items-center gap-2 px-3 py-2 bg-amber-900/40 border border-amber-500/50 rounded text-xs text-amber-400 hover:bg-amber-900/60 transition-all font-bold flex-shrink-0 ml-4"
                >
                  <ArrowUpCircle size={12} />
                  Update All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {updateEntries.map(entry => (
                  <WidgetCard
                    key={entry.id}
                    entry={entry}
                    installedVersion={installedWidgets[entry.id]}
                    hasUpdate={true}
                    onInstall={() => handleInstall(entry.id)}
                    onUninstall={() => handleUninstall(entry.id)}
                    onViewDetails={() => setSelectedEntry(entry)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'developer' && <DeveloperPortalTab />}

      {/* Footer */}
      <div className="px-4 py-1.5 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between flex-shrink-0">
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
          Omni-Grid Marketplace · Local-First · No Telemetry
        </span>
        {marketplaceLastChecked > 0 && (
          <span className="text-[9px] text-slate-600 font-mono">
            Last checked: {new Date(marketplaceLastChecked).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};
