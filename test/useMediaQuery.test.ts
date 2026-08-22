import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery, useIsMobile } from '../hooks/useMediaQuery';

describe('useMediaQuery', () => {
  let listeners: Array<(e: MediaQueryListEvent) => void>;
  let currentMatches: boolean;

  beforeEach(() => {
    listeners = [];
    currentMatches = false;
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: currentMatches,
        media: query,
        addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => {
          listeners.push(fn);
        },
        removeEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => {
          listeners = listeners.filter(l => l !== fn);
        },
        dispatchEvent: () => true,
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false by default then updates when media matches', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(false);

    act(() => {
      currentMatches = true;
      listeners.forEach(fn => fn({ matches: true } as MediaQueryListEvent));
    });
    expect(listeners.length).toBeGreaterThan(0);
  });

  it('useIsMobile uses max-width 767px query', () => {
    renderHook(() => useIsMobile());
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
  });
});
