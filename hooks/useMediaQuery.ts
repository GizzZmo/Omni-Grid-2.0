import { useState, useEffect } from 'react';

/**
 * SSR-safe media query hook.
 * Defaults to `false` until mounted to avoid hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches('matches' in e ? e.matches : (e as MediaQueryList).matches);
    };
    onChange(mql);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** True when viewport is phone-sized (< 768px). */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');

/** True when coarse pointer (touch-first device). */
export const useIsTouch = () => useMediaQuery('(pointer: coarse)');

/** True when viewport is tablet or smaller (< 1024px). */
export const useIsTabletOrSmaller = () => useMediaQuery('(max-width: 1023px)');
