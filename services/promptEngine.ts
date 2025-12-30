import { CompletionResponse } from '../types';

export const estimateTokens = (text: string): number => {
  if (!text.trim()) return 0;
  const rough = Math.ceil(text.length / 4); // ~4 chars per token heuristic
  return Math.max(1, rough);
};

export const estimateCost = (tokens: number, costPer1kTokens: number): number => {
  if (!tokens) return 0;
  return Number(((tokens / 1000) * costPer1kTokens).toFixed(4));
};

export const applyTemplate = (template: string, variables: Record<string, string>): string => {
  return template.replace(/{{\s*([\w.-]+)\s*}}/g, (_, key: string) => {
    const value = variables[key];
    return value !== undefined && value !== null ? value : `{{${key}}}`;
  });
};

export interface DiffLine {
  type: 'context' | 'added' | 'removed';
  value: string;
}

export const diffText = (previous: string, next: string): DiffLine[] => {
  const prevLines = previous.split('\n');
  const nextLines = next.split('\n');
  const max = Math.max(prevLines.length, nextLines.length);
  const diff: DiffLine[] = [];

  for (let i = 0; i < max; i++) {
    const a = prevLines[i];
    const b = nextLines[i];
    if (a === b) {
      if (a !== undefined) diff.push({ type: 'context', value: a });
      continue;
    }
    if (a !== undefined) diff.push({ type: 'removed', value: a });
    if (b !== undefined) diff.push({ type: 'added', value: b });
  }

  return diff;
};

export const formatCompletion = (
  providerId: string,
  prompt: string,
  amplification = 1.1
): CompletionResponse => {
  const inputTokens = estimateTokens(prompt);
  const outputTokens = Math.max(8, Math.round(inputTokens * amplification));
  return {
    providerId,
    output: `[${providerId}] ${prompt.slice(0, 280)}${prompt.length > 280 ? '…' : ''}`,
    tokens: {
      input: inputTokens,
      output: outputTokens,
    },
    cost: 0,
    latencyMs: 0,
  };
};
