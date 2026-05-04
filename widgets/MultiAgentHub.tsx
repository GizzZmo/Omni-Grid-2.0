/**
 * MultiAgentHub.tsx
 *
 * Multi-Agent Orchestration Hub widget for Omni-Grid.
 *
 * Provides a UI to:
 *  - Submit tasks to specific AI agents
 *  - Monitor all running, completed, and failed tasks
 *  - Run pre-built agent pipelines (sequential or parallel)
 *  - Inspect individual task results
 *  - Cancel running tasks
 */

import React, { useState, useEffect } from 'react';
import {
  StopCircle,
  Trash2,
  ChevronRight,
  ArrowLeft,
  Bot,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  GitBranch,
  LayoutList,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import {
  orchestrator,
  BUILT_IN_AGENTS,
  AgentTask,
  PipelineRun,
  AgentDefinition,
  TaskStatus,
} from '../services/multiAgentOrchestrator';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; Icon: React.ElementType }> =
  {
    pending: { label: 'Pending', color: 'text-amber-400', Icon: Clock },
    running: { label: 'Running', color: 'text-cyan-400', Icon: Loader2 },
    completed: { label: 'Done', color: 'text-emerald-400', Icon: CheckCircle2 },
    failed: { label: 'Failed', color: 'text-red-400', Icon: XCircle },
    cancelled: { label: 'Cancelled', color: 'text-slate-500', Icon: StopCircle },
  };

const formatDuration = (task: AgentTask): string => {
  const start = task.startedAt ?? task.createdAt;
  const end = task.completedAt ?? Date.now();
  const ms = end - start;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const AgentBadge: React.FC<{ agent: AgentDefinition }> = ({ agent }) => (
  <span className={`flex items-center gap-1 text-[10px] font-bold ${agent.color}`}>
    <span>{agent.icon}</span> {agent.name}
  </span>
);

const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`flex items-center gap-1 text-[9px] font-bold uppercase ${cfg.color}`}>
      <cfg.Icon size={9} className={status === 'running' ? 'animate-spin' : ''} />
      {cfg.label}
    </span>
  );
};

// ── Task detail view ──────────────────────────────────────────────────────────

const TaskDetail: React.FC<{ task: AgentTask; onBack: () => void }> = ({ task, onBack }) => {
  const [copied, setCopied] = useState(false);
  const agent = orchestrator.getAgent(task.agentId);

  const handleCopy = () => {
    if (!task.result) return;
    navigator.clipboard.writeText(task.result).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 font-mono text-slate-200 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/40 flex-shrink-0">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-all"
        >
          <ArrowLeft size={12} /> Back
        </button>
        <span className="text-xs font-bold text-fuchsia-400">Task Detail</span>
        <span className="ml-auto">
          <StatusBadge status={task.status} />
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
        {agent && (
          <div className="flex items-center gap-2">
            <AgentBadge agent={agent} />
            <span className="text-slate-600">·</span>
            <span className="text-[10px] text-slate-500">{formatDuration(task)}</span>
          </div>
        )}

        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Prompt
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded p-3 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
            {task.prompt}
          </div>
        </div>

        {task.result && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Result
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[9px] text-slate-500 hover:text-white transition-all px-1.5 py-0.5 rounded hover:bg-slate-800"
              >
                {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="bg-slate-900 border border-emerald-800/30 rounded p-3 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap break-words max-h-96 overflow-y-auto custom-scrollbar">
              {task.result}
            </div>
          </div>
        )}

        {task.error && (
          <div>
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">
              Error
            </div>
            <div className="bg-red-900/10 border border-red-500/20 rounded p-3 text-xs text-red-300">
              {task.error}
            </div>
          </div>
        )}

        {(task.status === 'running' || task.status === 'pending') && (
          <button
            onClick={() => orchestrator.cancel(task.id)}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400 hover:bg-red-900/40 transition-all self-start"
          >
            <StopCircle size={12} /> Cancel Task
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main widget ───────────────────────────────────────────────────────────────

type TabId = 'tasks' | 'submit' | 'pipelines';

export const MultiAgentHub: React.FC = () => {
  const [tasks, setTasks] = useState<AgentTask[]>(() => orchestrator.getAllTasks());
  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>(() =>
    orchestrator.getAllPipelineRuns()
  );
  const [selectedTask, setSelectedTask] = useState<AgentTask | null>(null);
  const [tab, setTab] = useState<TabId>('tasks');

  // Submit form
  const [selectedAgent, setSelectedAgent] = useState(BUILT_IN_AGENTS[0].id);
  const [prompt, setPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pipeline form
  const [selectedPipeline, setSelectedPipeline] = useState(
    orchestrator.getPipelines()[0]?.id ?? ''
  );
  const [pipelinePrompt, setPipelinePrompt] = useState('');
  const [runningPipeline, setRunningPipeline] = useState(false);

  const pipelines = orchestrator.getPipelines();

  // Subscribe to orchestrator events
  useEffect(() => {
    const unsubTask = orchestrator.on<AgentTask | null>('taskUpdate', () => {
      setTasks(orchestrator.getAllTasks());
      // Refresh selected task if open
      setSelectedTask(prev => {
        if (!prev) return prev;
        return orchestrator.getTask(prev.id) ?? prev;
      });
    });
    const unsubPipeline = orchestrator.on<PipelineRun | null>('pipelineUpdate', () => {
      setPipelineRuns(orchestrator.getAllPipelineRuns());
    });
    return () => {
      unsubTask();
      unsubPipeline();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || submitting) return;
    setSubmitting(true);
    orchestrator.submit({ agentId: selectedAgent, prompt: prompt.trim() });
    setPrompt('');
    setSubmitting(false);
    setTab('tasks');
  };

  const handleRunPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipelinePrompt.trim() || runningPipeline) return;
    setRunningPipeline(true);
    try {
      await orchestrator.runPipeline(selectedPipeline, pipelinePrompt.trim());
      setPipelinePrompt('');
      setTab('tasks');
    } finally {
      setRunningPipeline(false);
    }
  };

  const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'running').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const failedCount = tasks.filter(t => t.status === 'failed').length;

  if (selectedTask) {
    return <TaskDetail task={selectedTask} onBack={() => setSelectedTask(null)} />;
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 font-mono text-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/40 flex-shrink-0">
        <div>
          <h2 className="text-sm font-bold text-fuchsia-400 uppercase tracking-wider flex items-center gap-1.5">
            <Bot size={13} /> Multi-Agent Hub
          </h2>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {pendingCount > 0 && <span className="text-cyan-400">{pendingCount} active · </span>}
            {completedCount} done · {failedCount} failed · {tasks.length} total
          </p>
        </div>
        <button
          onClick={() => orchestrator.clearFinished()}
          className="flex items-center gap-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[9px] text-slate-400 hover:text-white hover:border-slate-500 transition-all"
          title="Clear finished tasks"
        >
          <Trash2 size={10} /> Clear
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 flex-shrink-0 bg-slate-900/20">
        {(
          [
            { id: 'tasks' as TabId, label: 'Tasks', Icon: LayoutList },
            { id: 'submit' as TabId, label: 'New Task', Icon: Send },
            { id: 'pipelines' as TabId, label: 'Pipelines', Icon: GitBranch },
          ] as const
        ).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${
              tab === t.id
                ? 'text-fuchsia-400 border-fuchsia-500 bg-fuchsia-900/10'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            <t.Icon size={11} />
            {t.label}
            {t.id === 'tasks' && pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-cyan-900/40 text-cyan-400 text-[8px]">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {/* Tasks tab */}
        {tab === 'tasks' && (
          <div className="h-full overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Bot size={32} className="text-slate-700" />
                <div>
                  <div className="text-sm font-bold text-slate-400 mb-1">No tasks yet</div>
                  <p className="text-xs text-slate-600">
                    Submit a task or run a pipeline to get started.
                  </p>
                </div>
              </div>
            ) : (
              tasks.map(task => {
                const agent = orchestrator.getAgent(task.agentId);
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="group flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-lg hover:border-slate-600 cursor-pointer transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        {agent && <AgentBadge agent={agent} />}
                        <StatusBadge status={task.status} />
                        {task.pipelineId && (
                          <span className="text-[9px] text-slate-600 flex items-center gap-0.5">
                            <GitBranch size={8} /> pipeline
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {task.prompt}
                      </p>
                      <div className="text-[9px] text-slate-600 mt-0.5">{formatDuration(task)}</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {(task.status === 'pending' || task.status === 'running') && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            orchestrator.cancel(task.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-900/30 text-slate-500 hover:text-red-400 transition-all"
                          title="Cancel"
                        >
                          <StopCircle size={12} />
                        </button>
                      )}
                      <ChevronRight
                        size={13}
                        className="text-slate-600 group-hover:text-slate-400 transition-all"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Submit tab */}
        {tab === 'submit' && (
          <form
            onSubmit={handleSubmit}
            className="h-full overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4"
          >
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Select Agent
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BUILT_IN_AGENTS.map(agent => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`flex flex-col gap-1 p-2.5 rounded-lg border text-left transition-all ${
                      selectedAgent === agent.id
                        ? 'bg-slate-800 border-fuchsia-500/50 shadow-[0_0_8px_rgba(217,70,239,0.15)]'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{agent.icon}</span>
                      <span className={`text-xs font-bold ${agent.color}`}>{agent.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                      {agent.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Prompt
              </label>
              <textarea
                className="w-full h-28 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 outline-none focus:border-fuchsia-500/50 resize-none leading-relaxed"
                placeholder="Enter your task prompt…"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={!prompt.trim()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-fuchsia-900/40 border border-fuchsia-500/50 rounded text-xs font-bold text-fuchsia-300 hover:bg-fuchsia-900/60 hover:shadow-[0_0_15px_rgba(217,70,239,0.2)] transition-all uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none"
            >
              <Send size={13} />
              Dispatch to {BUILT_IN_AGENTS.find(a => a.id === selectedAgent)?.name}
            </button>
          </form>
        )}

        {/* Pipelines tab */}
        {tab === 'pipelines' && (
          <div className="h-full overflow-y-auto custom-scrollbar p-4 flex flex-col gap-5">
            {/* Pipeline selector */}
            <form onSubmit={handleRunPipeline} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Choose Pipeline
                </label>
                <div className="flex flex-col gap-2">
                  {pipelines.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPipeline(p.id)}
                      className={`flex flex-col gap-1.5 p-3 rounded-lg border text-left transition-all ${
                        selectedPipeline === p.id
                          ? 'bg-slate-800 border-cyan-500/40'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GitBranch size={11} className="text-cyan-400 flex-shrink-0" />
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ml-auto ${
                            p.mode === 'parallel'
                              ? 'bg-fuchsia-900/30 text-fuchsia-400 border border-fuchsia-500/30'
                              : 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          {p.mode}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {p.steps.map((s, i) => {
                          const agent = orchestrator.getAgent(s.agentId);
                          return (
                            <span
                              key={i}
                              className="text-[9px] flex items-center gap-0.5 text-slate-500"
                            >
                              {agent && <span>{agent.icon}</span>}
                              {agent?.name}
                              {i < p.steps.length - 1 && (
                                <span
                                  className={`mx-1 ${p.mode === 'sequential' ? 'text-cyan-700' : 'text-fuchsia-700'}`}
                                >
                                  {p.mode === 'sequential' ? '→' : '‖'}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Input Prompt
                </label>
                <textarea
                  className="w-full h-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
                  placeholder="Enter the initial prompt for the pipeline…"
                  value={pipelinePrompt}
                  onChange={e => setPipelinePrompt(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={!pipelinePrompt.trim() || runningPipeline}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-900/40 border border-cyan-500/50 rounded text-xs font-bold text-cyan-300 hover:bg-cyan-900/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none"
              >
                {runningPipeline ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Running…
                  </>
                ) : (
                  <>
                    <Zap size={13} /> Run Pipeline
                  </>
                )}
              </button>
            </form>

            {/* Pipeline run history */}
            {pipelineRuns.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Pipeline Runs
                </div>
                <div className="flex flex-col gap-2">
                  {pipelineRuns.map(run => {
                    const pipeline = pipelines.find(p => p.id === run.pipelineId);
                    const runTasks = run.taskIds
                      .map(id => orchestrator.getTask(id))
                      .filter(Boolean) as AgentTask[];
                    const doneCount = runTasks.filter(t => t.status === 'completed').length;
                    return (
                      <div
                        key={run.id}
                        className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-200">
                            {pipeline?.name ?? run.pipelineId}
                          </span>
                          <StatusBadge status={run.status} />
                        </div>
                        <div className="text-[9px] text-slate-500">
                          {doneCount}/{run.taskIds.length} tasks ·{' '}
                          {new Date(run.createdAt).toLocaleTimeString()}
                        </div>
                        {run.status === 'running' && (
                          <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-500 transition-all duration-500"
                              style={{
                                width: `${(doneCount / Math.max(run.taskIds.length, 1)) * 100}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
