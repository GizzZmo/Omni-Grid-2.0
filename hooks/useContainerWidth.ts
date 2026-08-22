import { useState, useRef, useCallback, useLayoutEffect } from 'react';

/**
 * Observe container width for ResponsiveGridLayout.
 * Prefer ResizeObserver; fall back to window resize.
 */
export function useContainerWidth(defaultWidth = 1200) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(defaultWidth);
  const [mounted, setMounted] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w > 0) setWidth(w);
  }, []);

  // Callback ref: setMounted is called outside an effect body, when the element attaches.
  const containerRef = useCallback(
    (el: HTMLDivElement | null) => {
      ref.current = el;
      if (el) setMounted(true);
    },
    [],
  );

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => measure());
      ro.observe(el);
      return () => ro.disconnect();
    }

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  return { width, containerRef, mounted };
}
