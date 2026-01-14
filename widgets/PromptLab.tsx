import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  GitBranch,
  History,
  Save,
  SplitSquareVertical,
  Play,
  Zap,
  Tag,
  Keyboard,
  Loader2,
  RefreshCcw,
  Wand2,
} from 'lucide-react';
import { useAppStore } from '../store';
import { applyTemplate, diffText, estimateCost, estimateTokens } from '../services/promptEngine';
import { getProviderById, providers } from '../services/aiProviders';
import { CompletionResponse } from '../types';

export const PromptLab: React.FC = () => {
  const {
    promptLibrary,
    activePromptId,
    setActivePrompt,
    updatePromptContent,
    savePromptVersion,
    restorePromptVersion,
    updatePromptVariables,
    tagPrompt,
  } = useAppStore();

  const [filter, setFilter] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([
    providers[0].id,
    providers[1].id,
  ]);
  const [results, setResults] = useState<Record<string, CompletionResponse>>({});
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const currentPrompt =
    promptLibrary.find(p => p.id === activePromptId) ?? promptLibrary.at(0) ?? null;

  useEffect(() => {
    if (!activePromptId && currentPrompt) {
      setActivePrompt(currentPrompt.id);
    }
  }, [activePromptId, currentPrompt, setActivePrompt]);

  const compiledPrompt = useMemo(() => {
    if (!currentPrompt) return '';
    return applyTemplate(currentPrompt.content, currentPrompt.variables);
  }, [currentPrompt]);

  const inputTokens = estimateTokens(compiledPrompt);
  const projectedCost = selectedProviders.reduce((sum, id) => {
    const provider = getProviderById(id);
    if (!provider) return sum;
    return sum + estimateCost(inputTokens, provider.costPer1kTokens);
  }, 0);

  const handleRun = useCallback(async () => {
    if (!currentPrompt) return;
    setRunning(true);
    setResults({});
    const targets = providers.filter(p => selectedProviders.includes(p.id));
    const compiled = compiledPrompt;
    const runResults = await Promise.allSettled(targets.map(async p => p.run(compiled)));
    const mapped: Record<string, CompletionResponse> = {};
    runResults.forEach(result => {
      if (result.status === 'fulfilled') {
        mapped[result.value.providerId] = result.value;
      }
    });
    setResults(mapped);
    setRunning(false);
  }, [compiledPrompt, currentPrompt, selectedProviders]);

  const toggleProvider = (id: string) => {
    setSelectedProviders(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]));
  };

  const onSaveVersion = useCallback(() => {
    if (!currentPrompt) return;
    savePromptVersion(currentPrompt.id, note || undefined);
    setNote('');
  }, [currentPrompt, note, savePromptVersion]);

  const onAddTag = () => {
    if (!currentPrompt || !tagInput.trim()) return;
    const tokens = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    const merged = Array.from(new Set([...(currentPrompt?.tags ?? []), ...tokens]));
    tagPrompt(currentPrompt.id, merged);
    setTagInput('');
  };

  const filteredLibrary = promptLibrary.filter(p => {
    const matchesText =
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.content.toLowerCase().includes(filter.toLowerCase());
    if (!filter.trim()) return true;
    return matchesText;
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!currentPrompt) return;
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSaveVersion();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentPrompt, handleRun, onSaveVersion]);

  const latestVersion = currentPrompt?.versions.at(0);
  const versionToDiff =
    currentPrompt && selectedVersion
      ? currentPrompt.versions.find(v => v.id === selectedVersion)
      : latestVersion;
  const diffs =
    currentPrompt && versionToDiff ? diffText(versionToDiff.content, currentPrompt.content) : [];

  return (
    <div className="h-full grid grid-cols-12 gap-4 text-xs text-slate-200">
      <div className="col-span-3 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <SplitSquareVertical size={16} className="text-fuchsia-400" />
          <span className="font-bold tracking-wide uppercase text-[11px]">Prompt Library</span>
        </div>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Search or filter prompts..."
          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] focus:border-fuchsia-500 outline-none"
        />
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
          {filteredLibrary.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePrompt(p.id)}
              className={`w-full text-left p-2 rounded border transition-all ${
                currentPrompt?.id === p.id
                  ? 'border-fuchsia-500/60 bg-fuchsia-900/20'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-[12px] text-white">{p.name}</div>
                <span className="text-[10px] text-slate-500">{p.tags.slice(0, 2).join(', ')}</span>
              </div>
              <div className="text-slate-400 line-clamp-2 text-[11px] mt-1">{p.content}</div>
            </button>
          ))}
        </div>
        {currentPrompt && (
          <div className="bg-slate-900 border border-slate-800 rounded p-2 space-y-2">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-emerald-400" />
              <span className="font-semibold">Tags</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {currentPrompt.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-[10px] text-emerald-200"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="Add tags (comma separated)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] focus:border-emerald-500 outline-none"
              />
              <button
                onClick={onAddTag}
                className="px-2 py-1 bg-emerald-700/40 border border-emerald-500/40 rounded text-[10px] font-bold"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <GitBranch size={16} className="text-cyan-400" />
          <span className="font-bold uppercase tracking-wide text-[11px]">Prompt Editor</span>
          <div className="ml-auto flex items-center gap-2 text-[10px] text-slate-400">
            <Keyboard size={12} /> Ctrl+Enter = Run · Ctrl+S = Snapshot
          </div>
        </div>
        {currentPrompt ? (
          <>
            <textarea
              value={currentPrompt.content}
              onChange={e => updatePromptContent(currentPrompt.id, e.target.value)}
              className="flex-1 min-h-[200px] bg-slate-950 border border-slate-800 rounded p-3 text-[12px] leading-relaxed font-mono text-slate-100 focus:border-cyan-500 outline-none"
              placeholder="Write or paste your prompt here..."
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900 border border-slate-800 rounded p-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Wand2 size={14} className="text-pink-400" />
                  <span className="font-semibold">Template Variables</span>
                </div>
                {Object.entries(currentPrompt.variables).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-slate-800 text-[10px]">{`{{ ${key} }}`}</span>
                    <input
                      value={value}
                      onChange={e =>
                        updatePromptVariables(currentPrompt.id, {
                          ...currentPrompt.variables,
                          [key]: e.target.value,
                        })
                      }
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] focus:border-pink-500 outline-none"
                    />
                  </div>
                ))}
                <button
                  onClick={() =>
                    updatePromptVariables(currentPrompt.id, {
                      ...currentPrompt.variables,
                      [`var_${Object.keys(currentPrompt.variables).length + 1}`]: '',
                    })
                  }
                  className="text-[11px] text-pink-300 hover:text-white transition-colors"
                >
                  + Add variable
                </button>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded p-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-amber-400" />
                  <span className="font-semibold">Live Stats</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Input tokens</span>
                  <span className="text-amber-300 font-bold">{inputTokens}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Est. cost ({selectedProviders.length} models)</span>
                  <span className="text-emerald-300 font-bold">${projectedCost.toFixed(4)}</span>
                </div>
                <button
                  onClick={handleRun}
                  disabled={running}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-cyan-700/40 border border-cyan-500/40 rounded text-[12px] font-bold text-cyan-100 hover:bg-cyan-600/40 disabled:opacity-60"
                >
                  {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  Run A/B Test
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Snapshot note (optional)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] focus:border-emerald-500 outline-none"
              />
              <button
                onClick={onSaveVersion}
                className="px-3 py-1 bg-emerald-700/40 border border-emerald-500/40 rounded text-[12px] font-bold text-emerald-100 flex items-center gap-2"
              >
                <Save size={14} /> Save Version
              </button>
            </div>
          </>
        ) : (
          <div className="text-slate-400">No prompt selected.</div>
        )}

        {currentPrompt && (
          <div className="bg-slate-900 border border-slate-800 rounded p-2">
            <div className="flex items-center gap-2 mb-2">
              <SplitSquareVertical size={14} className="text-indigo-400" />
              <span className="font-semibold">Compiled Preview</span>
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded p-2 text-[11px] whitespace-pre-wrap text-slate-100 min-h-[80px]">
              {compiledPrompt || 'Fill variables to see preview.'}
            </pre>
          </div>
        )}
      </div>

      <div className="col-span-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <SplitSquareVertical size={16} className="text-cyan-300" />
          <span className="font-bold uppercase tracking-wide text-[11px]">A/B Output</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {providers.map(provider => (
            <label
              key={provider.id}
              className={`flex items-center gap-2 px-2 py-1 rounded border text-[11px] cursor-pointer ${
                selectedProviders.includes(provider.id)
                  ? 'border-cyan-500/60 bg-cyan-900/30'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedProviders.includes(provider.id)}
                onChange={() => toggleProvider(provider.id)}
              />
              <span className="font-semibold">{provider.name}</span>
              <span className="text-slate-500">(${provider.costPer1kTokens}/1k tok)</span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2">
          {Object.values(results).map(result => (
            <div
              key={result.providerId}
              className="border border-slate-800 bg-slate-900 rounded p-2 space-y-2"
            >
              {(() => {
                const provider = getProviderById(result.providerId);
                const label = provider?.name ?? result.providerId;
                return (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[12px]">{label}</span>
                    <span className="text-[10px] text-slate-500">
                      {result.tokens.input}→{result.tokens.output} tokens · $
                      {result.cost.toFixed(4)} · {result.latencyMs}ms
                    </span>
                  </div>
                );
              })()}
              <pre className="whitespace-pre-wrap text-[11px] text-slate-100">{result.output}</pre>
            </div>
          ))}
          {!Object.values(results).length && (
            <div className="text-slate-500 text-[11px]">
              Run the prompt to see side-by-side provider outputs.
            </div>
          )}
        </div>

        {currentPrompt && (
          <div className="bg-slate-900 border border-slate-800 rounded p-2 space-y-2">
            <div className="flex items-center gap-2">
              <History size={14} className="text-amber-400" />
              <span className="font-semibold">Version History</span>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedVersion ?? ''}
                onChange={e => setSelectedVersion(e.target.value || null)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] focus:border-amber-500 outline-none"
              >
                <option value="">Latest</option>
                {currentPrompt.versions.map(v => (
                  <option key={v.id} value={v.id}>
                    {new Date(v.createdAt).toLocaleString()} · {v.tokens} tok{' '}
                    {v.note ? `· ${v.note}` : ''}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  selectedVersion && restorePromptVersion(currentPrompt.id, selectedVersion)
                }
                disabled={!selectedVersion}
                className="px-2 py-1 bg-amber-700/30 border border-amber-500/40 rounded text-[11px] disabled:opacity-50"
              >
                Rollback
              </button>
              <button
                onClick={() => setSelectedVersion(null)}
                className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[11px]"
              >
                <RefreshCcw size={12} />
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded p-2 max-h-48 overflow-y-auto custom-scrollbar text-[11px] space-y-1">
              {diffs.map((line, idx) => (
                <div
                  key={`${line.type}-${idx}`}
                  className={`whitespace-pre-wrap ${
                    line.type === 'added'
                      ? 'text-emerald-300'
                      : line.type === 'removed'
                        ? 'text-rose-300'
                        : 'text-slate-200'
                  }`}
                >
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '} {line.value}
                </div>
              ))}
              {!diffs.length && <div className="text-slate-500">No differences detected.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
