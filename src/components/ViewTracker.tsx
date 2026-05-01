'use client';

import { useEffect } from 'react';

export function ViewTracker({ songId }: { songId: string }) {
  useEffect(() => {
    fetch('/api/track/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    }).catch(() => {});
  }, [songId]);

  return null;
}
