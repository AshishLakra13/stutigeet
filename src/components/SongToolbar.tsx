'use client';

import { useState, Suspense } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { RotateCcw, PlayCircle, PauseCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { nextKey } from '@/lib/keys';
import { cn } from '@/lib/utils';
import { StageMode, useStageMode } from '@/components/StageMode';
import { AutoScroll } from '@/components/AutoScroll';
import { BrandMark } from '@/components/BrandMark';

type SongToolbarProps = {
  originalKey: string | null;
};

function SongToolbarInner({ originalKey }: SongToolbarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentKey = searchParams.get('key') ?? originalKey ?? 'G';
  const isTransposed = currentKey !== originalKey;

  const { isStage, toggle: toggleStage } = useStageMode();

  const [autoScrollOn, setAutoScrollOn] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(30);

  function updateKey(newKey: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newKey === originalKey) {
      params.delete('key');
    } else {
      params.set('key', newKey);
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
  }

  function handleTranspose(direction: 1 | -1) {
    updateKey(nextKey(currentKey, direction));
  }

  function handleReset() {
    if (originalKey) updateKey(originalKey);
  }

  return (
    <>
      {/* Render-less helpers */}
      <StageMode />
      <AutoScroll enabled={autoScrollOn} speed={scrollSpeed} />

      {/* Stage toggle — BrandMark in gilt, fixed top-right */}
      <button
        onClick={toggleStage}
        className={cn(
          'fixed top-4 right-4 z-[100]',
          'transition-opacity duration-[220ms]',
          isStage ? 'opacity-30 hover:opacity-100' : 'opacity-100',
        )}
        style={{ color: 'var(--accent)' }}
        aria-label={isStage ? 'Exit stage mode' : 'Enter stage mode'}
      >
        <BrandMark size={32} />
      </button>

      {/* Auto-scroll pill — fixed bottom-left */}
      <div
        className={cn('fixed bottom-6 left-6 z-40 stage-fade print:hidden')}
        data-no-print
      >
        <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-card px-3 py-2 shadow-sm">
          <button
            className={cn(
              'flex items-center transition-colors',
              autoScrollOn ? 'text-[var(--accent)]' : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => setAutoScrollOn((v) => !v)}
            aria-label={autoScrollOn ? 'Pause auto-scroll' : 'Start auto-scroll'}
          >
            {autoScrollOn ? (
              <PauseCircle className="h-4 w-4" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
          </button>
          {autoScrollOn && (
            <div className="w-20">
              <Slider
                min={5}
                max={100}
                value={[scrollSpeed]}
                onValueChange={(vals) => {
                  if (Array.isArray(vals) && typeof vals[0] === 'number') {
                    setScrollSpeed(vals[0]);
                  }
                }}
                aria-label="Scroll speed"
              />
            </div>
          )}
        </div>
      </div>

      {/* Transpose pill — fixed bottom-right */}
      <div
        className={cn('fixed bottom-6 right-6 z-40 stage-fade print:hidden')}
        data-no-print
      >
        <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-card px-3 py-2 shadow-sm">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => handleTranspose(-1)}
            aria-label="Transpose down"
          >
            ‹
          </button>
          <span
            aria-live="polite"
            aria-label={`Current key: ${currentKey}`}
            className="font-[family-name:var(--font-mono)] text-base w-8 text-center numerals-old text-foreground"
          >
            {currentKey}
          </span>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => handleTranspose(1)}
            aria-label="Transpose up"
          >
            ›
          </button>
          {isTransposed && (
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleReset}
              aria-label="Reset to original key"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export function SongToolbar({ originalKey }: SongToolbarProps) {
  return (
    <Suspense fallback={null}>
      <SongToolbarInner originalKey={originalKey} />
    </Suspense>
  );
}
