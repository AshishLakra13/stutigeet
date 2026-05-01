'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { SongSearchRecord } from '@/lib/search';

const CommandPalette = dynamic(
  () => import('@/components/CommandPalette').then((m) => m.CommandPalette),
  { ssr: false },
);

type Props = {
  songs: SongSearchRecord[];
};

export function CommandPaletteTrigger({ songs }: Props) {
  const [open, setOpen] = useState(false);
  // Once loaded, keep the component mounted so subsequent opens are instant.
  const [loaded, setLoaded] = useState(false);

  const openPalette = useCallback(() => {
    setLoaded(true);
    setOpen(true);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (!open) {
        openPalette();
      } else {
        setOpen(false);
      }
    }
  }, [open, openPalette]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('command-palette:open', openPalette);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('command-palette:open', openPalette);
    };
  }, [handleKeyDown, openPalette]);

  if (!loaded) return null;

  return <CommandPalette songs={songs} open={open} onOpenChange={setOpen} />;
}
