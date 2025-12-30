import { AIProvider, CompletionResponse } from '../types';
import { estimateTokens, estimateCost, formatCompletion } from './promptEngine';

const simulatedRequest = async (
  providerId: string,
  prompt: string,
  costPer1kTokens: number,
  latencyMs = 600,
  label?: string
): Promise<CompletionResponse> => {
  const base = formatCompletion(providerId, prompt);
  const totalTokens = base.tokens.input + base.tokens.output;
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        ...base,
        output: `${base.output}\n\nSimulated response for provider "${label ?? providerId}".`,
        cost: estimateCost(totalTokens, costPer1kTokens),
        latencyMs,
      });
    }, latencyMs);
  });
};

export const providers: AIProvider[] = [
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    model: 'gemini-1.5-pro',
    costPer1kTokens: 0.125,
    latencyMs: 520,
    run: async prompt => simulatedRequest('gemini-pro', prompt, 0.125, 520, 'Gemini Pro'),
    estimateTokens,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    model: 'gpt-4o-mini',
    costPer1kTokens: 0.15,
    latencyMs: 680,
    run: async prompt => simulatedRequest('gpt-4o-mini', prompt, 0.15, 680, 'GPT-4o mini'),
    estimateTokens,
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3.5 Sonnet',
    model: 'claude-3.5-sonnet',
    costPer1kTokens: 0.2,
    latencyMs: 610,
    run: async prompt => simulatedRequest('claude-3-sonnet', prompt, 0.2, 610, 'Claude Sonnet'),
    estimateTokens,
  },
];

export const getProviderById = (id: string): AIProvider | undefined =>
  providers.find(p => p.id === id);
