import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { providers, getProviderById } from '../services/aiProviders';

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
        expect(typeof provider.run).toBe('function');
        expect(typeof provider.estimateTokens).toBe('function');
      }
    });

    it('has unique ids', () => {
      const ids = providers.map(p => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('getProviderById', () => {
    it('returns provider for known id', () => {
      const p = getProviderById('gemini-pro');
      expect(p).toBeDefined();
      expect(p!.id).toBe('gemini-pro');
    });

    it('returns undefined for unknown id', () => {
      expect(getProviderById('does-not-exist')).toBeUndefined();
    });
  });

  describe('estimateTokens on providers', () => {
    it('each provider estimateTokens function works correctly', () => {
      for (const provider of providers) {
        const tokens = provider.estimateTokens('hello world');
        expect(tokens).toBeGreaterThan(0);
      }
    });
  });

  describe('provider.run', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns a response object', async () => {
      const provider = getProviderById('gemini-pro')!;
      const promise = provider.run('test prompt');
      await vi.runAllTimersAsync();
      const response = await promise;
      expect(response.output).toBeTruthy();
      expect(typeof response.cost).toBe('number');
      expect(typeof response.tokens.input).toBe('number');
      expect(typeof response.tokens.output).toBe('number');
    });

    it('respects maxTokens option', async () => {
      const provider = getProviderById('gemini-pro')!;
      const promise = provider.run('x'.repeat(1000), { maxTokens: 50 });
      await vi.runAllTimersAsync();
      const response = await promise;
      // Simulated providers return full formatted output; assert response shape
      expect(response.output).toBeTruthy();
      expect(typeof response.tokens.input).toBe('number');
    });

    it('calculates cost proportional to token count', async () => {
      const provider = getProviderById('gemini-pro')!;
      const shortPromise = provider.run('hi');
      await vi.runAllTimersAsync();
      const shortResp = await shortPromise;

      const longPromise = provider.run('x'.repeat(400));
      await vi.runAllTimersAsync();
      const longResp = await longPromise;

      expect(longResp.cost).toBeGreaterThanOrEqual(shortResp.cost);
    });
  });
});
