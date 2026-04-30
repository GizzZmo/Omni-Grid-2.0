/**
 * CommunityPortal.tsx
 *
 * Community Plugin Submission Portal for Omni-Grid.
 *
 * Features:
 *  - Submission form: name, id, description, category, version, author, tags
 *  - Interactive security checklist (must complete before submitting)
 *  - Local submission queue persisted in Zustand / localStorage
 *  - Browse submissions with status badges (pending, approved, rejected)
 *  - Review panel showing submission details
 */

import React, { useState, useMemo } from 'react';
import {
  Send,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  ArrowLeft,
  Code2,
  Shield,
  Package,
  Sparkles,
  Trash2,
  Globe,
} from 'lucide-react';
import { MarketplaceCategory } from '../types';

// ── Types ────────────────────────────────────────────────────────────────────

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'in_review';

export interface PluginSubmission {
  id: string;
  widgetId: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: MarketplaceCategory;
  tags: string[];
  repositoryUrl: string;
  checklistPassed: string[];
  submittedAt: number;
  status: SubmissionStatus;
  reviewNote?: string;
}

// ── Security checklist ────────────────────────────────────────────────────────

const SECURITY_CHECKLIST = [
  {
    id: 'no-eval',
    label: 'No use of eval() or new Function()',
    category: 'security',
  },
  {
    id: 'no-network-secret',
    label: 'No API keys or secrets are hard-coded',
    category: 'security',
  },
  {
    id: 'input-sanitize',
    label: 'All user inputs are sanitized before rendering',
    category: 'security',
  },
  {
    id: 'csp-safe',
    label: 'Widget operates within Omni-Grid CSP policy',
    category: 'security',
  },
  {
    id: 'no-dom-xss',
    label: 'No direct innerHTML writes with untrusted content',
    category: 'security',
  },
  {
    id: 'store-safe',
    label: 'Only uses documented store selectors (no getState() abuse)',
    category: 'code-quality',
  },
  {
    id: 'types-defined',
    label: 'Widget type is added to WidgetType union in types.ts',
    category: 'code-quality',
  },
  {
    id: 'catalog-entry',
    label: 'Catalog entry added to marketplaceCatalog.ts with isCore: false',
    category: 'code-quality',
  },
  {
    id: 'tests-written',
    label: 'Unit or render tests added under test/',
    category: 'testing',
  },
  {
    id: 'no-console-spam',
    label: 'No excessive console.log statements in production code',
    category: 'code-quality',
  },
  {
    id: 'responsive',
    label: 'Widget is functional at minGridW × minGridH dimensions',
    category: 'ui',
  },
  {
    id: 'accessible',
    label: 'Interactive elements have aria-label / accessible text',
    category: 'ui',
  },
];

const CHECKLIST_CATEGORIES: Record<string, { label: string; color: string }> = {
  security: { label: 'Security', color: 'text-emerald-400' },
  'code-quality': { label: 'Code Quality', color: 'text-cyan-400' },
  testing: { label: 'Testing', color: 'text-fuchsia-400' },
  ui: { label: 'UI/UX', color: 'text-amber-400' },
};

const CATEGORIES: { id: MarketplaceCategory; label: string }[] = [
  { id: 'utility', label: 'Utility' },
  { id: 'developer', label: 'Developer' },
  { id: 'finance', label: 'Finance' },
  { id: 'creative', label: 'Creative' },
  { id: 'ai', label: 'AI' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'community', label: 'Community' },
];

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; Icon: React.ElementType }> = {
  pending: { label: 'Pending Review', color: 'text-amber-400', Icon: Clock },
  in_review: { label: 'In Review', color: 'text-blue-400', Icon: Shield },
  approved: { label: 'Approved', color: 'text-emerald-400', Icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-red-400', Icon: XCircle },
};

// ── Store helpers ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'omni-community-submissions';

const loadSubmissions = (): PluginSubmission[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PluginSubmission[]) : [];
  } catch { return []; }
};

const saveSubmissions = (items: PluginSubmission[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
};

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

// ── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: SubmissionStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`flex items-center gap-1 text-[9px] font-bold uppercase ${cfg.color}`}>
      <cfg.Icon size={9} />
      {cfg.label}
    </span>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

type ViewMode = 'list' | 'submit' | 'detail';

const EMPTY_FORM = {
  widgetId: '',
  name: '',
  description: '',
  version: '1.0.0',
  author: '',
  category: 'utility' as MarketplaceCategory,
  tagsRaw: '',
  repositoryUrl: '',
};

export const CommunityPortal: React.FC = () => {
  const [view, setView] = useState<ViewMode>('list');
  const [submissions, setSubmissions] = useState<PluginSubmission[]>(loadSubmissions);
  const [selected, setSelected] = useState<PluginSubmission | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [checklist, setChecklist] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const persist = (items: PluginSubmission[]) => {
    setSubmissions(items);
    saveSubmissions(items);
  };

  const allChecked = checklist.size === SECURITY_CHECKLIST.length;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.widgetId.trim()) e.widgetId = 'Widget ID is required';
    else if (!/^[A-Z_]+$/.test(form.widgetId.trim())) e.widgetId = 'Must be UPPER_SNAKE_CASE (e.g. MY_WIDGET)';
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.author.trim()) e.author = 'Author is required';
    if (!form.version.trim()) e.version = 'Version is required';
    if (!allChecked) e.checklist = 'All security checklist items must be confirmed';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submission: PluginSubmission = {
      id: generateId(),
      widgetId: form.widgetId.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim(),
      version: form.version.trim(),
      author: form.author.trim(),
      category: form.category,
      tags: form.tagsRaw
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean),
      repositoryUrl: form.repositoryUrl.trim(),
      checklistPassed: Array.from(checklist),
      submittedAt: Date.now(),
      status: 'pending',
    };

    persist([submission, ...submissions]);
    setSubmitted(true);
    setForm(EMPTY_FORM);
    setChecklist(new Set());
    setErrors({});
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this submission?')) return;
    persist(submissions.filter(s => s.id !== id));
    if (selected?.id === id) {
      setSelected(null);
      setView('list');
    }
  };

  const handleViewDetail = (sub: PluginSubmission) => {
    setSelected(sub);
    setView('detail');
  };

  const toggleCheck = (id: string) => {
    setChecklist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group checklist by category
  const groupedChecklist = useMemo(() => {
    const groups: Record<string, typeof SECURITY_CHECKLIST> = {};
    SECURITY_CHECKLIST.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, []);

  if (view === 'detail' && selected) {
    return (
      <div className="h-full flex flex-col bg-slate-950 font-mono text-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/40 flex-shrink-0">
          <button
            onClick={() => setView('list')}
            className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-all"
          >
            <ArrowLeft size={12} /> Back
          </button>
          <span className="text-xs font-bold text-fuchsia-400">Submission Detail</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-5">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2 className="text-lg font-bold text-white">{selected.name}</h2>
              <StatusBadge status={selected.status} />
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              ID: {selected.widgetId} · v{selected.version} · by {selected.author}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Submitted: {new Date(selected.submittedAt).toLocaleDateString()}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</div>
            <p className="text-xs text-slate-300 leading-relaxed">{selected.description}</p>
          </div>

          {selected.repositoryUrl && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Repository</div>
              <a
                href={selected.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Globe size={10} /> {selected.repositoryUrl}
              </a>
            </div>
          )}

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category & Tags</div>
            <div className="flex gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-fuchsia-900/30 border border-fuchsia-500/30 text-[9px] text-fuchsia-400 font-bold uppercase">
                {selected.category}
              </span>
              {selected.tags.map(tag => (
                <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-slate-400">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Security Checklist ({selected.checklistPassed.length}/{SECURITY_CHECKLIST.length} passed)
            </div>
            <div className="flex flex-col gap-1">
              {SECURITY_CHECKLIST.map(item => {
                const passed = selected.checklistPassed.includes(item.id);
                return (
                  <div key={item.id} className={`flex items-center gap-2 text-[11px] ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {passed ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>

          {selected.reviewNote && (
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Review Note</div>
              <p className="text-xs text-slate-300">{selected.reviewNote}</p>
            </div>
          )}

          <button
            onClick={e => { handleDelete(selected.id, e); setView('list'); }}
            className="flex items-center gap-2 px-3 py-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400 hover:bg-red-900/40 transition-all self-start"
          >
            <Trash2 size={12} /> Delete Submission
          </button>
        </div>
      </div>
    );
  }

  if (view === 'submit') {
    return (
      <div className="h-full flex flex-col bg-slate-950 font-mono text-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/40 flex-shrink-0">
          <button
            onClick={() => { setView('list'); setSubmitted(false); setErrors({}); }}
            className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-all"
          >
            <ArrowLeft size={12} /> Back
          </button>
          <span className="text-xs font-bold text-fuchsia-400">Submit a Plugin</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <CheckCircle2 size={40} className="text-emerald-400" />
              <div>
                <div className="text-sm font-bold text-emerald-400 mb-1">Submission Received!</div>
                <p className="text-xs text-slate-400 max-w-xs">
                  Your plugin has been added to the local queue. Once you open a pull request on
                  GitHub, the core team will review it within 7 days.
                </p>
              </div>
              <button
                onClick={() => { setSubmitted(false); setView('list'); }}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 hover:border-slate-500 transition-all"
              >
                View Submissions
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Basic info */}
              <section>
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Package size={11} /> Plugin Metadata
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Widget ID *</label>
                    <input
                      className={`w-full px-2 py-1.5 bg-slate-800 border rounded text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono uppercase ${errors.widgetId ? 'border-red-500/60' : 'border-slate-700'}`}
                      placeholder="MY_WIDGET"
                      value={form.widgetId}
                      onChange={e => setForm(f => ({ ...f, widgetId: e.target.value.toUpperCase() }))}
                    />
                    {errors.widgetId && <p className="text-[9px] text-red-400 mt-0.5">{errors.widgetId}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Display Name *</label>
                    <input
                      className={`w-full px-2 py-1.5 bg-slate-800 border rounded text-xs text-slate-200 outline-none focus:border-cyan-500 ${errors.name ? 'border-red-500/60' : 'border-slate-700'}`}
                      placeholder="My Awesome Widget"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                    {errors.name && <p className="text-[9px] text-red-400 mt-0.5">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Version *</label>
                    <input
                      className={`w-full px-2 py-1.5 bg-slate-800 border rounded text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono ${errors.version ? 'border-red-500/60' : 'border-slate-700'}`}
                      placeholder="1.0.0"
                      value={form.version}
                      onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                    />
                    {errors.version && <p className="text-[9px] text-red-400 mt-0.5">{errors.version}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Author *</label>
                    <input
                      className={`w-full px-2 py-1.5 bg-slate-800 border rounded text-xs text-slate-200 outline-none focus:border-cyan-500 ${errors.author ? 'border-red-500/60' : 'border-slate-700'}`}
                      placeholder="your-github-handle"
                      value={form.author}
                      onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    />
                    {errors.author && <p className="text-[9px] text-red-400 mt-0.5">{errors.author}</p>}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[10px] text-slate-400 mb-1">Description *</label>
                  <textarea
                    className={`w-full px-2 py-1.5 bg-slate-800 border rounded text-xs text-slate-200 outline-none focus:border-cyan-500 resize-none h-16 ${errors.description ? 'border-red-500/60' : 'border-slate-700'}`}
                    placeholder="A brief description of what your widget does…"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                  {errors.description && <p className="text-[9px] text-red-400 mt-0.5">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Category</label>
                    <select
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 outline-none focus:border-cyan-500"
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value as MarketplaceCategory }))}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Tags (comma-separated)</label>
                    <input
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 outline-none focus:border-cyan-500"
                      placeholder="tag1, tag2, tag3"
                      value={form.tagsRaw}
                      onChange={e => setForm(f => ({ ...f, tagsRaw: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[10px] text-slate-400 mb-1">Repository URL</label>
                  <input
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 outline-none focus:border-cyan-500"
                    placeholder="https://github.com/you/your-widget"
                    value={form.repositoryUrl}
                    onChange={e => setForm(f => ({ ...f, repositoryUrl: e.target.value }))}
                  />
                </div>
              </section>

              {/* Security checklist */}
              <section>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Shield size={11} /> Security Checklist
                  <span className="text-slate-500 font-normal ml-auto">
                    {checklist.size}/{SECURITY_CHECKLIST.length} confirmed
                  </span>
                </div>
                {errors.checklist && (
                  <div className="flex items-center gap-1.5 text-[10px] text-red-400 mb-2">
                    <AlertCircle size={11} /> {errors.checklist}
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  {Object.entries(groupedChecklist).map(([cat, items]) => {
                    const cfg = CHECKLIST_CATEGORIES[cat];
                    return (
                      <div key={cat}>
                        <div className={`text-[9px] font-bold uppercase tracking-wider mb-1.5 ${cfg.color}`}>
                          {cfg.label}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {items.map(item => {
                            const checked = checklist.has(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleCheck(item.id)}
                                className={`flex items-start gap-2 text-left p-2 rounded border transition-all ${checked ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}`}
                              >
                                {checked ? (
                                  <CheckSquare size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <Square size={13} className="text-slate-500 flex-shrink-0 mt-0.5" />
                                )}
                                <span className={`text-[11px] leading-relaxed ${checked ? 'text-emerald-300' : 'text-slate-400'}`}>
                                  {item.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Submit */}
              <button
                type="submit"
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded font-bold text-xs uppercase tracking-widest transition-all ${
                  allChecked
                    ? 'bg-fuchsia-900/40 border border-fuchsia-500/50 text-fuchsia-300 hover:bg-fuchsia-900/60 hover:shadow-[0_0_15px_rgba(217,70,239,0.2)]'
                    : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send size={13} />
                Submit for Review
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="h-full flex flex-col bg-slate-950 font-mono text-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/40 flex-shrink-0">
        <div>
          <h2 className="text-sm font-bold text-fuchsia-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} /> Community Portal
          </h2>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} · Build &amp; share widgets
          </p>
        </div>
        <button
          onClick={() => setView('submit')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-fuchsia-900/30 border border-fuchsia-500/40 rounded text-[10px] text-fuchsia-300 hover:bg-fuchsia-900/50 hover:border-fuchsia-400 transition-all font-bold uppercase"
        >
          <Send size={11} />
          Submit Plugin
        </button>
      </div>

      {/* Quick stats */}
      <div className="flex border-b border-slate-800 flex-shrink-0">
        {(['pending', 'in_review', 'approved', 'rejected'] as SubmissionStatus[]).map(status => {
          const count = submissions.filter(s => s.status === status).length;
          const cfg = STATUS_CONFIG[status];
          return (
            <div key={status} className="flex-1 px-3 py-2 flex flex-col items-center gap-0.5 border-r border-slate-800 last:border-r-0">
              <span className={`text-sm font-bold ${cfg.color}`}>{count}</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">{status.replace('_', ' ')}</span>
            </div>
          );
        })}
      </div>

      {/* Submission list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <Code2 size={32} className="text-slate-700" />
            <div>
              <div className="text-sm font-bold text-slate-400 mb-1">No submissions yet</div>
              <p className="text-xs text-slate-600 max-w-xs">
                Built a widget? Submit it for community review and get it listed in the marketplace.
              </p>
            </div>
            <button
              onClick={() => setView('submit')}
              className="px-4 py-2 bg-fuchsia-900/30 border border-fuchsia-500/40 rounded text-xs text-fuchsia-300 hover:bg-fuchsia-900/50 transition-all"
            >
              Submit Your First Plugin
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {submissions.map(sub => {
              return (
                <div
                  key={sub.id}
                  onClick={() => handleViewDetail(sub)}
                  className="group flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-lg hover:border-slate-600 cursor-pointer transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-bold text-white truncate">{sub.name}</span>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-800 px-1 rounded">
                        {sub.widgetId}
                      </span>
                      <StatusBadge status={sub.status} />
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{sub.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] text-slate-500">v{sub.version}</span>
                      <span className="text-[9px] text-slate-500">{sub.author}</span>
                      <span className="text-[9px] text-slate-600">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={e => handleDelete(sub.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-900/30 text-slate-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guidelines footer */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/20 flex-shrink-0">
        <p className="text-[9px] text-slate-600">
          Submissions are reviewed within 7 days. All plugins must pass the security checklist and follow{' '}
          <span className="text-slate-500">CONTRIBUTING.md</span>.
        </p>
      </div>
    </div>
  );
};
