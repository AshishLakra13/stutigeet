'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { parseChordPro, transposeToKey, songToHtml } from '@/lib/chordpro';
import { playChordNote, getAudioEnabled, setAudioEnabled } from '@/lib/chord-audio';

type ChordSheetProps = {
  chordpro: string;
  originalKey: string | null;
};

export function ChordSheet({ chordpro, originalKey }: ChordSheetProps) {
  const searchParams = useSearchParams();
  const targetKey = searchParams.get('key') ?? originalKey ?? null;

  const [audioEnabled, setAudioEnabledState] = useState(false);

  useEffect(() => {
    setAudioEnabledState(getAudioEnabled());
  }, []);

  const toggleAudio = useCallback(() => {
    setAudioEnabledState((prev) => {
      const next = !prev;
      setAudioEnabled(next);
      return next;
    });
  }, []);

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

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioEnabled) return;
      const target = e.target as HTMLElement;
      if (!target.classList.contains('chord')) return;

      // Pulse animation
      target.classList.remove('chord-pulse');
      void target.offsetWidth; // force reflow to restart animation
      target.classList.add('chord-pulse');
      target.addEventListener('animationend', () => target.classList.remove('chord-pulse'), {
        once: true,
      });

      playChordNote(target.textContent ?? '');
    },
    [audioEnabled],
  );

  return (
    <div className="relative">
      {/* Sound toggle — small, top-right of chord sheet */}
      <button
        onClick={toggleAudio}
        className="absolute -top-8 right-0 font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.08em] transition-colors duration-[180ms]"
        style={{ color: audioEnabled ? 'var(--accent)' : 'var(--muted-foreground)' }}
        aria-label={audioEnabled ? 'Disable chord audio' : 'Enable chord audio'}
        aria-pressed={audioEnabled}
      >
        {audioEnabled ? 'sound on' : 'sound off'}
      </button>

      <div
        className="chord-sheet"
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
