import { describe, expect, it } from 'vitest';
import {
  applyTemplate,
  estimateCost,
  estimateTokens,
  diffText,
  formatCompletion,
} from '../services/promptEngine';

describe('promptEngine', () => {
  describe('applyTemplate', () => {
    it('replaces template variables and preserves unknown placeholders', () => {
      const template = 'Hello {{ name }}, meet {{friend}} at {{ location }}';
      const output = applyTemplate(template, { name: 'Ada', friend: 'Grace' });
      expect(output).toContain('Ada');
      expect(output).toContain('Grace');
      expect(output).toContain('{{location}}');
    });

    it('replaces multiple occurrences of the same variable', () => {
      const template = '{{x}} and {{x}}';
      const output = applyTemplate(template, { x: 'hello' });
      expect(output).toBe('hello and hello');
    });

    it('returns template unchanged when variables object is empty', () => {
      const template = 'Hello {{name}}';
      const output = applyTemplate(template, {});
      expect(output).toBe('Hello {{name}}');
    });

    it('handles dotted variable names like {{user.name}}', () => {
      const template = 'Hello {{user.name}}';
      const output = applyTemplate(template, { 'user.name': 'Alice' });
      expect(output).toBe('Hello Alice');
    });
  });

  describe('estimateTokens', () => {
    it('estimates tokens and cost', () => {
      const tokens = estimateTokens('1234567890');
      expect(tokens).toBeGreaterThan(0);
      const cost = estimateCost(tokens, 0.1);
      expect(cost).toBeGreaterThan(0);
    });

    it('returns 0 for empty or whitespace-only text', () => {
      expect(estimateTokens('')).toBe(0);
      expect(estimateTokens('   ')).toBe(0);
    });

    it('returns at least 1 for a single character', () => {
      expect(estimateTokens('a')).toBeGreaterThanOrEqual(1);
    });

    it('scales roughly with input length', () => {
      const short = estimateTokens('hello');
      const long = estimateTokens('hello world this is a longer sentence for testing');
      expect(long).toBeGreaterThan(short);
    });
  });

  describe('estimateCost', () => {
    it('returns 0 when token count is 0', () => {
      expect(estimateCost(0, 0.1)).toBe(0);
    });

    it('computes cost correctly at 1000 tokens', () => {
      expect(estimateCost(1000, 0.1)).toBe(0.1);
    });

    it('rounds to 4 decimal places', () => {
      const cost = estimateCost(1, 0.1);
      const decimals = cost.toString().split('.')[1]?.length ?? 0;
      expect(decimals).toBeLessThanOrEqual(4);
    });
  });

  describe('diffText', () => {
    it('diffs previous and next text', () => {
      const diff = diffText('old line', 'new line');
      expect(diff.find(d => d.type === 'removed')?.value).toBe('old line');
      expect(diff.find(d => d.type === 'added')?.value).toBe('new line');
    });

    it('marks unchanged lines as context', () => {
      const diff = diffText('same\nold', 'same\nnew');
      expect(diff.find(d => d.type === 'context')?.value).toBe('same');
    });

    it('handles added lines (next is longer)', () => {
      const diff = diffText('line1', 'line1\nline2');
      expect(diff.find(d => d.type === 'added')?.value).toBe('line2');
    });

    it('handles removed lines (prev is longer)', () => {
      const diff = diffText('line1\nline2', 'line1');
      expect(diff.find(d => d.type === 'removed')?.value).toBe('line2');
    });

    it('returns empty array for identical texts', () => {
      const diff = diffText('same content', 'same content');
      expect(diff.every(d => d.type === 'context')).toBe(true);
    });
  });

  describe('formatCompletion', () => {
    it('returns a CompletionResponse with correct shape', () => {
      const result = formatCompletion('my-provider', 'hello world');
      expect(result.providerId).toBe('my-provider');
      expect(typeof result.output).toBe('string');
      expect(result.tokens.input).toBeGreaterThan(0);
      expect(result.tokens.output).toBeGreaterThan(0);
      expect(result.cost).toBe(0);
      expect(result.latencyMs).toBe(0);
    });

    it('includes the provider id in the output', () => {
      const result = formatCompletion('test-provider', 'my prompt');
      expect(result.output).toContain('[test-provider]');
    });

    it('truncates prompts longer than 280 characters in the output', () => {
      const longPrompt = 'x'.repeat(400);
      const result = formatCompletion('p', longPrompt);
      expect(result.output).toContain('…');
    });

    it('does not truncate prompts shorter than 280 characters', () => {
      const shortPrompt = 'short prompt';
      const result = formatCompletion('p', shortPrompt);
      expect(result.output).not.toContain('…');
      expect(result.output).toContain(shortPrompt);
    });

    it('applies amplification factor to output tokens', () => {
      const longPrompt = 'This is a long enough prompt for testing amplification factors';
      const base = formatCompletion('p', longPrompt);
      const amplified = formatCompletion('p', longPrompt, 2.0);
      expect(amplified.tokens.output).toBeGreaterThan(base.tokens.output);
    });
  });
});
