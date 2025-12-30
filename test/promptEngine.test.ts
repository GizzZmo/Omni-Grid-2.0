import { describe, expect, it } from 'vitest';
import { applyTemplate, estimateCost, estimateTokens, diffText } from '../services/promptEngine';

describe('promptEngine', () => {
  it('replaces template variables and preserves unknown placeholders', () => {
    const template = 'Hello {{ name }}, meet {{friend}} at {{ location }}';
    const output = applyTemplate(template, { name: 'Ada', friend: 'Grace' });
    expect(output).toContain('Ada');
    expect(output).toContain('Grace');
    expect(output).toContain('{{location}}');
  });

  it('estimates tokens and cost', () => {
    const tokens = estimateTokens('1234567890');
    expect(tokens).toBeGreaterThan(0);
    const cost = estimateCost(tokens, 0.1);
    expect(cost).toBeGreaterThan(0);
  });

  it('diffs previous and next text', () => {
    const diff = diffText('old line', 'new line');
    expect(diff.find(d => d.type === 'removed')?.value).toBe('old line');
    expect(diff.find(d => d.type === 'added')?.value).toBe('new line');
  });
});
