import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

// Must use regular function (not arrow) so it works as a constructor with `new`
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(function (this: any, { apiKey }: { apiKey: string }) {
    this._apiKey = apiKey;
    this.models = { generateContent: vi.fn().mockResolvedValue({ text: 'mocked response' }) };
  }),
}));

// Mock the store to control geminiApiKey
vi.mock('../store', () => ({
  useAppStore: {
    getState: vi.fn(() => ({ settings: { geminiApiKey: '' } })),
  },
}));

import { getGenAIClient, refineText } from '../services/geminiService';
import { useAppStore } from '../store';
import { GoogleGenAI } from '@google/genai';

const MockedGenAI = vi.mocked(GoogleGenAI);

describe('geminiService', () => {
  afterEach(() => {
    vi.clearAllMocks();
    // Re-apply constructor mock with default generateContent returning a valid response
    MockedGenAI.mockImplementation(function (this: any, { apiKey }: any) {
      this._apiKey = apiKey;
      this.models = { generateContent: vi.fn().mockResolvedValue({ text: 'mocked response' }) };
    });
  });

  describe('getGenAIClient', () => {
    it('creates a GoogleGenAI instance when called', () => {
      const client = getGenAIClient('test-key-123');
      expect(client).not.toBeNull();
    });

    it('uses the provided override key', () => {
      getGenAIClient('explicit-key-abc');
      const calls = MockedGenAI.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall?.[0]?.apiKey).toBe('explicit-key-abc');
    });

    it('reuses the cached instance when the same key is used twice', () => {
      const first = getGenAIClient('same-key');
      const second = getGenAIClient('same-key');
      expect(first).toBe(second);
    });

    it('creates a new instance when the key changes', () => {
      getGenAIClient('key-v1');
      const constructCallsAfterFirst = MockedGenAI.mock.calls.length;
      getGenAIClient('key-v2');
      expect(MockedGenAI.mock.calls.length).toBe(constructCallsAfterFirst + 1);
    });
  });

  describe('refineText', () => {
    it('calls generateContent and returns the response text', async () => {
      vi.mocked(useAppStore.getState).mockReturnValue({
        settings: { geminiApiKey: 'valid-key' },
      } as any);

      const result = await refineText('hello world', 'REFINE');
      expect(result).toBe('mocked response');
    });

    it('returns original text when API returns empty response', async () => {
      // Get the cached AI client and override generateContent for this one call
      const client = getGenAIClient() as any;
      if (client?.models) {
        vi.spyOn(client.models, 'generateContent').mockResolvedValueOnce({ text: '' });
      }

      const result = await refineText('fallback text', 'REFINE');
      expect(result).toBe('fallback text');
    });

    it('throws "Failed to process text with AI." when API call fails', async () => {
      const client = getGenAIClient() as any;
      if (client?.models) {
        vi.spyOn(client.models, 'generateContent').mockRejectedValueOnce(
          new Error('Network error')
        );
      }

      await expect(refineText('some text', 'EXPAND')).rejects.toThrow(
        'Failed to process text with AI.'
      );
    });

    it('works for all instruction types', async () => {
      vi.mocked(useAppStore.getState).mockReturnValue({
        settings: { geminiApiKey: 'valid-key' },
      } as any);
      const instructions = ['REFINE', 'EXPAND', 'TRANSLATE', 'ANALYZE', 'SUMMARY', 'TONE'] as const;
      for (const instruction of instructions) {
        const result = await refineText('test', instruction);
        expect(result).toBe('mocked response');
      }
    });
  });
});
