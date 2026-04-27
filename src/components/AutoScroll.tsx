'use client';

import { useEffect, useRef, useCallback } from 'react';

type AutoScrollProps = {
  /** Speed in pixels per second (1–200). Default: 30 */
  speed?: number;
  /** Whether auto-scroll is active */
  enabled: boolean;
};

/**
 * AutoScroll — scrolls the page at a constant speed using requestAnimationFrame.
 * Render-less component: produces no DOM nodes.
 */
export function AutoScroll({ speed = 30, enabled }: AutoScrollProps) {
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const tick = useCallback(
    (now: number) => {
      if (lastTimeRef.current !== null) {
        const delta = (now - lastTimeRef.current) / 1000; // seconds
        window.scrollBy({ top: speed * delta, behavior: 'instant' });
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    },
    [speed],
  );

  useEffect(() => {
    if (enabled) {
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, tick]);

  return null;
}
