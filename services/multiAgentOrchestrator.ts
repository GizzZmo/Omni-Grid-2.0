/**
 * multiAgentOrchestrator.ts
 *
 * Multi-agent orchestration layer for Omni-Grid.
 *
 * Provides a structured system for running multiple AI agents concurrently or
 * sequentially. Each agent has a named role, a system instruction, and produces
 * a typed result. The orchestrator tracks all tasks through a lifecycle:
 *
 *   pending → running → completed | failed | cancelled
 *
 * Usage:
 *   import { orchestrator } from './multiAgentOrchestrator';
 *
 *   const id = orchestrator.submit({
 *     agentId: 'researcher',
 *     prompt: 'Summarize recent advances in quantum computing',
 *   });
 *
 *   orchestrator.on('taskUpdate', (task) => console.log(task.status));
 */

import { getGenAIClient } from './geminiService';

// ── Types ────────────────────────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type ExecutionMode = 'parallel' | 'sequential';

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  color: string;
  icon: string;
}

export interface AgentTask {
  id: string;
  agentId: string;
  prompt: string;
  status: TaskStatus;
  result?: string;
  error?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  /** parent pipeline id, if part of a pipeline run */
  pipelineId?: string;
}

export interface PipelineConfig {
  id: string;
  name: string;
  mode: ExecutionMode;
  steps: Array<{ agentId: string; promptTemplate: string }>;
  /** If true, feed the previous step's result as context to the next step */
  chainResults: boolean;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  status: TaskStatus;
  taskIds: string[];
  createdAt: number;
  completedAt?: number;
  finalResult?: string;
}

type OrchestratorEvent = 'taskUpdate' | 'pipelineUpdate';
type EventCallback<T> = (payload: T) => void;

// ── Built-in agent definitions ───────────────────────────────────────────────

export const BUILT_IN_AGENTS: AgentDefinition[] = [
  {
    id: 'researcher',
    name: 'Researcher',
    description: 'Deep-dives topics, retrieves facts, and synthesizes comprehensive summaries.',
    systemInstruction:
      'You are an elite research agent. Provide thorough, fact-based summaries with key takeaways. Be accurate and cite important nuances.',
    color: 'text-cyan-400',
    icon: '🔬',
  },
  {
    id: 'coder',
    name: 'Coder',
    description: 'Generates, reviews, and refactors code across multiple languages.',
    systemInstruction:
      'You are an expert software engineer. Produce clean, well-commented, production-quality code. Always explain your approach briefly before the code block.',
    color: 'text-orange-400',
    icon: '⌨️',
  },
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'Interprets data, identifies patterns, and delivers structured insights.',
    systemInstruction:
      'You are a data analyst. Provide structured analysis with bullet-point insights, trends, and actionable recommendations.',
    color: 'text-emerald-400',
    icon: '📊',
  },
  {
    id: 'strategist',
    name: 'Strategist',
    description: 'Generates plans, evaluates options, and recommends optimal strategies.',
    systemInstruction:
      'You are a strategic planning expert. Think in frameworks. Provide options with pros/cons, and a clear recommendation with rationale.',
    color: 'text-fuchsia-400',
    icon: '🧭',
  },
  {
    id: 'critic',
    name: 'Critic',
    description: 'Reviews content, finds flaws, and suggests improvements.',
    systemInstruction:
      'You are a constructive critic. Identify weaknesses, logical gaps, and risks in any content you receive. Always pair each critique with an improvement suggestion.',
    color: 'text-amber-400',
    icon: '🎯',
  },
  {
    id: 'writer',
    name: 'Writer',
    description: 'Crafts polished written content – reports, docs, emails, and more.',
    systemInstruction:
      'You are a professional writer. Produce clear, engaging, well-structured prose tailored to the requested format and audience.',
    color: 'text-blue-400',
    icon: '✍️',
  },
];

// ── Orchestrator class ───────────────────────────────────────────────────────

class MultiAgentOrchestrator {
  private tasks: Map<string, AgentTask> = new Map();
  private pipelines: Map<string, PipelineConfig> = new Map();
  private pipelineRuns: Map<string, PipelineRun> = new Map();
  private listeners: Map<OrchestratorEvent, Set<EventCallback<unknown>>> = new Map([
    ['taskUpdate', new Set()],
    ['pipelineUpdate', new Set()],
  ]);
  private abortControllers: Map<string, { abort: () => void; aborted: boolean }> = new Map();

  // ── Event bus ─────────────────────────────────────────────────────────────

  on<T>(event: OrchestratorEvent, cb: EventCallback<T>): () => void {
    const set = this.listeners.get(event)!;
    (set as Set<EventCallback<T>>).add(cb);
    return () => (set as Set<EventCallback<T>>).delete(cb);
  }

  private emit<T>(event: OrchestratorEvent, payload: T) {
    this.listeners.get(event)!.forEach(cb => (cb as EventCallback<T>)(payload));
  }

  // ── Task management ────────────────────────────────────────────────────────

  private generateId(): string {
    return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  getAgent(id: string): AgentDefinition | undefined {
    return BUILT_IN_AGENTS.find(a => a.id === id);
  }

  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  getTask(id: string): AgentTask | undefined {
    return this.tasks.get(id);
  }

  getAllPipelineRuns(): PipelineRun[] {
    return Array.from(this.pipelineRuns.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  /** Submit a single-agent task. Returns the task id. */
  submit(options: { agentId: string; prompt: string; pipelineId?: string }): string {
    const id = this.generateId();
    const task: AgentTask = {
      id,
      agentId: options.agentId,
      prompt: options.prompt,
      status: 'pending',
      createdAt: Date.now(),
      pipelineId: options.pipelineId,
    };
    this.tasks.set(id, task);
    this.emit('taskUpdate', { ...task });
    // Run asynchronously
    void this.runTask(id);
    return id;
  }

  /** Cancel a pending or running task. */
  cancel(taskId: string) {
    const task = this.tasks.get(taskId);
    if (!task || task.status === 'completed' || task.status === 'failed') return;
    const ctrl = this.abortControllers.get(taskId);
    if (ctrl) ctrl.abort();
    this.updateTask(taskId, { status: 'cancelled', completedAt: Date.now() });
  }

  /** Clear all completed/failed/cancelled tasks. */
  clearFinished() {
    for (const [id, task] of this.tasks) {
      if (['completed', 'failed', 'cancelled'].includes(task.status)) {
        this.tasks.delete(id);
      }
    }
    this.emit('taskUpdate', null);
  }

  private updateTask(id: string, patch: Partial<AgentTask>) {
    const task = this.tasks.get(id);
    if (!task) return;
    const updated = { ...task, ...patch };
    this.tasks.set(id, updated);
    this.emit('taskUpdate', { ...updated });
  }

  private async runTask(id: string): Promise<string | null> {
    const task = this.tasks.get(id);
    if (!task) return null;

    const agent = this.getAgent(task.agentId);
    if (!agent) {
      this.updateTask(id, { status: 'failed', error: `Unknown agent: ${task.agentId}`, completedAt: Date.now() });
      return null;
    }

    const controller = { aborted: false, abort() { this.aborted = true; } };
    this.abortControllers.set(id, controller);

    this.updateTask(id, { status: 'running', startedAt: Date.now() });

    try {
      const ai = getGenAIClient();
      if (!ai) {
        this.updateTask(id, {
          status: 'failed',
          error: 'AI client not configured. Add your Gemini API key in Settings.',
          completedAt: Date.now(),
        });
        return null;
      }

      if (controller.aborted) {
        this.updateTask(id, { status: 'cancelled', completedAt: Date.now() });
        return null;
      }

      const fullPrompt = `${agent.systemInstruction}\n\n---\n\n${task.prompt}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: fullPrompt,
      });

      if (controller.aborted) {
        this.updateTask(id, { status: 'cancelled', completedAt: Date.now() });
        return null;
      }

      const result = response.text || '(No output)';
      this.updateTask(id, { status: 'completed', result, completedAt: Date.now() });
      return result;
    } catch (err: unknown) {
      if (controller.aborted) {
        this.updateTask(id, { status: 'cancelled', completedAt: Date.now() });
        return null;
      }
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.updateTask(id, {
        status: 'failed',
        error: message,
        completedAt: Date.now(),
      });
      return null;
    } finally {
      this.abortControllers.delete(id);
    }
  }

  // ── Pipeline management ───────────────────────────────────────────────────

  registerPipeline(config: PipelineConfig) {
    this.pipelines.set(config.id, config);
  }

  getPipelines(): PipelineConfig[] {
    return Array.from(this.pipelines.values());
  }

  /** Execute a registered pipeline. Returns the pipeline run id. */
  async runPipeline(pipelineId: string, initialPrompt: string): Promise<string> {
    const config = this.pipelines.get(pipelineId);
    if (!config) throw new Error(`Pipeline not found: ${pipelineId}`);

    const runId = this.generateId();
    const run: PipelineRun = {
      id: runId,
      pipelineId,
      status: 'running',
      taskIds: [],
      createdAt: Date.now(),
    };
    this.pipelineRuns.set(runId, run);
    this.emit('pipelineUpdate', { ...run });

    try {
      if (config.mode === 'parallel') {
        await this.runPipelineParallel(runId, config, initialPrompt);
      } else {
        await this.runPipelineSequential(runId, config, initialPrompt);
      }
    } catch {
      const r = this.pipelineRuns.get(runId)!;
      this.pipelineRuns.set(runId, { ...r, status: 'failed', completedAt: Date.now() });
      this.emit('pipelineUpdate', this.pipelineRuns.get(runId));
    }

    return runId;
  }

  private async runPipelineParallel(
    runId: string,
    config: PipelineConfig,
    initialPrompt: string
  ) {
    const taskIds: string[] = [];
    const promises = config.steps.map(step => {
      const prompt = step.promptTemplate.replace('{{input}}', initialPrompt);
      const taskId = this.generateId();
      const task: AgentTask = {
        id: taskId,
        agentId: step.agentId,
        prompt,
        status: 'pending',
        createdAt: Date.now(),
        pipelineId: runId,
      };
      this.tasks.set(taskId, task);
      taskIds.push(taskId);
      this.emit('taskUpdate', { ...task });
      return this.runTask(taskId);
    });

    const run = this.pipelineRuns.get(runId)!;
    this.pipelineRuns.set(runId, { ...run, taskIds });
    this.emit('pipelineUpdate', this.pipelineRuns.get(runId));

    const results = await Promise.all(promises);
    const finalResult = results.filter(Boolean).join('\n\n---\n\n');

    const updated = this.pipelineRuns.get(runId)!;
    this.pipelineRuns.set(runId, {
      ...updated,
      status: 'completed',
      completedAt: Date.now(),
      finalResult,
    });
    this.emit('pipelineUpdate', this.pipelineRuns.get(runId));
  }

  private async runPipelineSequential(
    runId: string,
    config: PipelineConfig,
    initialPrompt: string
  ) {
    const taskIds: string[] = [];
    let currentPrompt = initialPrompt;
    let lastResult: string | null = null;

    for (const step of config.steps) {
      let prompt = step.promptTemplate.replace('{{input}}', currentPrompt);
      if (config.chainResults && lastResult) {
        prompt = `Previous step result:\n${lastResult}\n\n---\n\n${prompt}`;
      }

      const taskId = this.generateId();
      const task: AgentTask = {
        id: taskId,
        agentId: step.agentId,
        prompt,
        status: 'pending',
        createdAt: Date.now(),
        pipelineId: runId,
      };
      this.tasks.set(taskId, task);
      taskIds.push(taskId);

      const run = this.pipelineRuns.get(runId)!;
      this.pipelineRuns.set(runId, { ...run, taskIds: [...taskIds] });
      this.emit('taskUpdate', { ...task });
      this.emit('pipelineUpdate', this.pipelineRuns.get(runId));

      lastResult = await this.runTask(taskId);
      if (lastResult) currentPrompt = lastResult;
    }

    const updated = this.pipelineRuns.get(runId)!;
    this.pipelineRuns.set(runId, {
      ...updated,
      status: 'completed',
      completedAt: Date.now(),
      finalResult: lastResult ?? undefined,
    });
    this.emit('pipelineUpdate', this.pipelineRuns.get(runId));
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────

export const orchestrator = new MultiAgentOrchestrator();

// Register default pipelines
orchestrator.registerPipeline({
  id: 'research-and-analyze',
  name: 'Research → Analyze',
  mode: 'sequential',
  chainResults: true,
  steps: [
    { agentId: 'researcher', promptTemplate: 'Research the following topic: {{input}}' },
    { agentId: 'analyst', promptTemplate: 'Analyze the research and provide key insights: {{input}}' },
    { agentId: 'strategist', promptTemplate: 'Based on the analysis, suggest strategic recommendations: {{input}}' },
  ],
});

orchestrator.registerPipeline({
  id: 'parallel-review',
  name: 'Parallel Expert Panel',
  mode: 'parallel',
  chainResults: false,
  steps: [
    { agentId: 'researcher', promptTemplate: 'From a research perspective, evaluate: {{input}}' },
    { agentId: 'analyst', promptTemplate: 'From an analytical perspective, evaluate: {{input}}' },
    { agentId: 'critic', promptTemplate: 'Critically review and find weaknesses in: {{input}}' },
    { agentId: 'strategist', promptTemplate: 'From a strategic perspective, evaluate: {{input}}' },
  ],
});

orchestrator.registerPipeline({
  id: 'code-review',
  name: 'Code → Review → Docs',
  mode: 'sequential',
  chainResults: true,
  steps: [
    { agentId: 'coder', promptTemplate: 'Write or improve the following code: {{input}}' },
    { agentId: 'critic', promptTemplate: 'Review the code for bugs, security issues, and improvements: {{input}}' },
    { agentId: 'writer', promptTemplate: 'Write clear documentation for the reviewed code: {{input}}' },
  ],
});
