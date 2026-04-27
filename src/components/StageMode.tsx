'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useWakeLock } from '@/lib/wake-lock';

/**
 * StageMode — mounts/unmounts the stage-mode class on <body>
 * and holds the Wake Lock while stage mode is active.
 *
 * This is a render-less component: it produces no UI itself.
 * The actual visual changes are applied by CSS classes on <body>
 * which hide nav, enlarge text, etc.
 *
 * Stage mode is toggled by the `?stage=1` URL param.
 */
export function StageMode() {
  const searchParams = useSearchParams();
  const isStage = searchParams.get('stage') === '1';

  // Keep screen awake while on stage
  useWakeLock(isStage);

  // Apply/remove CSS class on <body>
  useEffect(() => {
    if (isStage) {
      document.body.classList.add('stage-mode');
    } else {
      document.body.classList.remove('stage-mode');
    }
    return () => {
      document.body.classList.remove('stage-mode');
    };
  }, [isStage]);

  return null;
}

/**
 * Hook to read and toggle stage mode via URL param.
 */
export function useStageMode() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isStage = searchParams.get('stage') === '1';

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (isStage) {
      params.delete('stage');
    } else {
      params.set('stage', '1');
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
  }

  return { isStage, toggle };
}
