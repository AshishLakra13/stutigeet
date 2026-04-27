'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Requests and manages a Screen Wake Lock so the display doesn't
 * dim/lock during worship stage mode.
 *
 * The lock is automatically re-acquired when the page becomes visible
 * again (e.g., after user switches tabs and returns).
 */
export function useWakeLock(enabled: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  const acquire = useCallback(async () => {
    if (!enabled) return;
    if (!('wakeLock' in navigator)) return; // not supported
    try {
      lockRef.current = await navigator.wakeLock.request('screen');
    } catch {
      // Permission denied or not available — silently ignore
    }
  }, [enabled]);

  const release = useCallback(async () => {
    if (lockRef.current) {
      await lockRef.current.release().catch(() => {});
      lockRef.current = null;
    }
  }, []);

  // Acquire / release when `enabled` changes
  useEffect(() => {
    if (enabled) {
      acquire();
    } else {
      release();
    }
    return () => {
      release();
    };
  }, [enabled, acquire, release]);

  // Re-acquire after visibility change (e.g., tab switch)
  useEffect(() => {
    if (!enabled) return;

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        acquire();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, acquire]);
}
