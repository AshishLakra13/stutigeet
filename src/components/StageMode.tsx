'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useWakeLock } from '@/lib/wake-lock';

export function StageMode() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isStage = searchParams.get('stage') === '1';

  useWakeLock(isStage);

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

  // ESC key exits stage mode — refs keep handler fresh without re-registering
  const isStageRef = useRef(isStage);
  const searchParamsRef = useRef(searchParams);
  const routerRef = useRef(router);
  const pathnameRef = useRef(pathname);
  isStageRef.current = isStage;
  searchParamsRef.current = searchParams;
  routerRef.current = router;
  pathnameRef.current = pathname;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isStageRef.current) {
        const params = new URLSearchParams(searchParamsRef.current.toString());
        params.delete('stage');
        const query = params.toString();
        routerRef.current.replace(
          `${pathnameRef.current}${query ? `?${query}` : ''}`,
          { scroll: false },
        );
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return null;
}

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
