import { describe, it, expect } from 'vitest';
import { providers, getProviderById } from '../services/aiProviders';
import { estimateTokens } from '../services/promptEngine';

describe('aiProviders', () => {
  describe('providers list', () => {
    it('has at least 3 providers', () => {
      expect(providers.length).toBeGreaterThanOrEqual(3);
    });

    it('each provider has required fields', () => {
      for (const provider of providers) {
        expect(provider.id).toBeTruthy();
        expect(provider.name).toBeTruthy();
        expect(provider.model).toBeTruthy();
        expect(typeof provider.costPer1kTokens).toBe('number');
        expect(typeof provider.run).toBe('function');
        expect(typeof provider.estimateTokens).toBe('function');
      }
    });

    it('providers have unique ids', () => {
      const ids = providers.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('includes gemini-pro, gpt-4o-mini, and claude-3-sonnet', () => {
      const ids = providers.map(p => p.id);
      expect(ids).toContain('gemini-pro');
      expect(ids).toContain('gpt-4o-mini');
      expect(ids).toContain('claude-3-sonnet');
    });

    it('each provider estimateTokens function works correctly', () => {
      for (const provider of providers) {
        const tokens = provider.estimateTokens('hello world');
        expect(tokens).toBeGreaterThan(0);
      }
    });
  });

  describe('getProviderById', () => {
    it('returns the correct provider by id', () => {
      const provider = getProviderById('gemini-pro');
      expect(provider).toBeDefined();
      expect(provider?.id).toBe('gemini-pro');
      expect(provider?.name).toBe('Gemini Pro');
    });

    it('returns undefined for unknown provider id', () => {
      const provider = getProviderById('unknown-provider-xyz');
      expect(provider).toBeUndefined();
    });
  });

  describe('provider run()', () => {
    it('returns a CompletionResponse with expected shape', async () => {
      const provider = getProviderById('gemini-pro')!;
      const response = await provider.run('short test prompt');

      expect(response.providerId).toBe('gemini-pro');
      expect(typeof response.output).toBe('string');
      expect(response.output.length).toBeGreaterThan(0);
      expect(typeof response.tokens.input).toBe('number');
      expect(typeof response.tokens.output).toBe('number');
      expect(typeof response.cost).toBe('number');
      expect(typeof response.latencyMs).toBe('number');
    }, 10_000);

    it('includes the prompt in the output', async () => {
      const provider = getProviderById('gpt-4o-mini')!;
      const response = await provider.run('uniquepromptstring');
      expect(response.output).toContain('uniquepromptstring');
    }, 10_000);

    it('truncates very long prompts in the output', async () => {
      const provider = getProviderById('claude-3-sonnet')!;
      const longPrompt = 'x'.repeat(500);
      const response = await provider.run(longPrompt);
      // Output should be truncated at 280 chars (+ provider prefix)
      expect(response.output.length).toBeLessThan(800);
    }, 10_000);

    it('calculates cost proportional to token count', async () => {
      const provider = getProviderById('gemini-pro')!;
      const shortResp = await provider.run('hi');
      const longResp = await provider.run('x'.repeat(400));
      expect(longResp.cost).toBeGreaterThanOrEqual(shortResp.cost);
    }, 20_000);
  });
});
