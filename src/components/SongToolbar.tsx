'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Minus, Plus, RotateCcw, Tv2, X, PlayCircle, PauseCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { nextKey } from '@/lib/chordpro';
import { cn } from '@/lib/utils';
import { StageMode, useStageMode } from '@/components/StageMode';
import { AutoScroll } from '@/components/AutoScroll';

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

      {/* Stage-mode exit button (visible only when stage-mode CSS class is active) */}
      <button
        data-stage-exit
        onClick={toggleStage}
        className={cn(
          'fixed top-4 right-4 z-[100]',
          'flex items-center gap-1.5 rounded-full',
          'bg-background/90 backdrop-blur px-3 py-2 text-xs font-medium',
          'border border-border shadow-md',
          'hover:bg-accent transition-colors',
        )}
        aria-label="Exit stage mode"
      >
        <X className="h-3.5 w-3.5" />
        Exit stage
      </button>

      {/* Toolbar bar */}
      <div
        className={cn(
          'sticky top-14 z-30 -mx-4 px-4 py-2',
          'bg-background/95 backdrop-blur border-b border-border',
          'flex items-center gap-3 flex-wrap',
        )}
        data-no-print
      >
        {/* ── Transpose ── */}
        <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium select-none">
          Key
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => handleTranspose(-1)}
            aria-label="Transpose down"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <span
            aria-live="polite"
            aria-label={`Current key: ${currentKey}`}
            className="font-[family-name:var(--font-crimson)] text-2xl font-semibold w-14 text-center tabular-nums"
          >
            {currentKey}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => handleTranspose(1)}
            aria-label="Transpose up"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isTransposed && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground gap-1.5 h-8"
            onClick={handleReset}
            aria-label="Reset to original key"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        )}

        {/* Divider */}
        <div className="ml-auto flex items-center gap-2">
          {/* ── Auto-scroll ── */}
          <Button
            variant={autoScrollOn ? 'default' : 'outline'}
            size="sm"
            className="h-8 gap-1.5 text-xs rounded-xl"
            onClick={() => setAutoScrollOn((v) => !v)}
            aria-label={autoScrollOn ? 'Pause auto-scroll' : 'Start auto-scroll'}
          >
            {autoScrollOn ? (
              <PauseCircle className="h-3.5 w-3.5" />
            ) : (
              <PlayCircle className="h-3.5 w-3.5" />
            )}
            Scroll
          </Button>

          {autoScrollOn && (
            <div className="flex items-center gap-2 w-24">
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

          {/* ── Stage mode ── */}
          <Button
            variant={isStage ? 'default' : 'outline'}
            size="sm"
            className="h-8 gap-1.5 text-xs rounded-xl"
            onClick={toggleStage}
            aria-label={isStage ? 'Exit stage mode' : 'Enter stage mode'}
          >
            <Tv2 className="h-3.5 w-3.5" />
            Stage
          </Button>
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
