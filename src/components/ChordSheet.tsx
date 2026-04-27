'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { parseChordPro, transposeToKey, songToHtml } from '@/lib/chordpro';

type ChordSheetProps = {
  chordpro: string;
  originalKey: string | null;
};

export function ChordSheet({ chordpro, originalKey }: ChordSheetProps) {
  const searchParams = useSearchParams();
  const targetKey = searchParams.get('key') ?? originalKey ?? null;

  const html = useMemo(() => {
    try {
      const song = parseChordPro(chordpro);
      const transposed =
        targetKey && targetKey !== originalKey
          ? transposeToKey(song, targetKey)
          : song;
      return songToHtml(transposed);
    } catch {
      const escaped = chordpro
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<pre class="text-sm text-muted-foreground whitespace-pre-wrap">${escaped}</pre>`;
    }
  }, [chordpro, originalKey, targetKey]);

  return (
    <div
      className="chord-sheet"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
