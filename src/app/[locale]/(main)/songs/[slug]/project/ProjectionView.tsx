'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useWakeLock } from '@/lib/wake-lock';
import { cn } from '@/lib/utils';
import type { Slide } from '@/lib/song-slides';

type ProjectionViewProps = {
  slug: string;
  slides: Slide[];
  songTitle: string;
};

const SLIDE_LABELS: Record<string, string> = {
  verse: 'Verse',
  chorus: 'Chorus',
  bridge: 'Bridge',
  prechorus: 'Pre-Chorus',
  intro: 'Intro',
  outro: 'Outro',
  tag: 'Tag',
};

export function ProjectionView({ slug, slides, songTitle }: ProjectionViewProps) {
  const [index, setIndex] = useState(0);
  const [dark, setDark] = useState(true);
  const router = useRouter();

  useWakeLock(true);

  const go = useCallback(
    (delta: number) => {
      setIndex((prev) => Math.max(0, Math.min(slides.length - 1, prev + delta)));
    },
    [slides.length],
  );

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          go(1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          go(-1);
          break;
        case 'Escape':
          router.push(`/songs/${slug}`);
          break;
        case 't':
        case 'T':
          setDark((d) => !d);
          break;
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [go, router, slug]);

  const slide = slides[index];
  if (!slide) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white text-2xl">No content.</p>
      </div>
    );
  }

  const label = SLIDE_LABELS[slide.type] ?? slide.type;

  return (
    <div
      className={cn(
        'fixed inset-0 flex flex-col select-none cursor-none',
        dark ? 'bg-black text-white' : 'bg-white text-black',
      )}
      onClick={() => go(1)}
    >
      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
        <p
          style={{ fontSize: 'clamp(6vw, 8vw, 10vw)', lineHeight: 1.3 }}
          className="font-[family-name:var(--font-devanagari)] text-center leading-relaxed whitespace-pre-wrap max-w-5xl"
          lang="hi"
        >
          {slide.lines.join('\n')}
        </p>
      </div>

      {/* Bottom HUD — minimal, fades on inactivity */}
      <div className={cn(
        'flex items-center justify-between px-6 py-4 text-xs opacity-30',
        dark ? 'text-gray-400' : 'text-gray-600',
      )}>
        <span>{songTitle}</span>
        <span className="capitalize">{label}</span>
        <span>
          {index + 1} / {slides.length}
        </span>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-1.5 pb-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setIndex(i); }}
            className={cn(
              'h-1.5 rounded-full transition-all cursor-pointer',
              i === index
                ? dark ? 'bg-white w-5' : 'bg-black w-5'
                : dark ? 'bg-white/30 w-1.5' : 'bg-black/30 w-1.5',
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Keyboard hint (visible briefly) */}
      <style>{`
        @keyframes fadeout { 0% { opacity: 0.6 } 80% { opacity: 0.6 } 100% { opacity: 0 } }
      `}</style>
    </div>
  );
}
