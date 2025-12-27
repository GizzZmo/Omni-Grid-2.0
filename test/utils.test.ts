import { describe, it, expect } from 'vitest';
import { downloadJson, uploadJson } from '../utils';

describe('Utils', () => {
  describe('downloadJson', () => {
    it('should be a function', () => {
      expect(typeof downloadJson).toBe('function');
    });
  });

  describe('uploadJson', () => {
    it('should be a function', () => {
      expect(typeof uploadJson).toBe('function');
    });
  });
});
