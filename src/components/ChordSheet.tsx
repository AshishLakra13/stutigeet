'use client';

import { useState, useCallback, useEffect } from 'react';
import { playChordNote, getAudioEnabled, setAudioEnabled } from '@/lib/chord-audio';

type ChordSheetProps = {
  html: string;
};

export function ChordSheet({ html }: ChordSheetProps) {
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
