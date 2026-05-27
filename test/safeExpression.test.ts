import { describe, expect, it } from 'vitest';
import { evaluateMathExpression } from '../services/safeExpression';

describe('evaluateMathExpression', () => {
  it('evaluates arithmetic and precedence', () => {
    expect(evaluateMathExpression('2+3*4')).toBe(14);
  });

  it('supports scientific functions and constants', () => {
    expect(evaluateMathExpression('sqrt(16)+sin(0)+π')).toBeCloseTo(7.14159265, 6);
  });

  it('supports unary negation and powers', () => {
    expect(evaluateMathExpression('-(2+3)^2')).toBe(-25);
  });

  it('rejects unsupported tokens', () => {
    expect(() => evaluateMathExpression('alert(1)')).toThrow(/unsupported/i);
  });
});
