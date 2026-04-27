'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { nextKey } from '@/lib/chordpro';
import { cn } from '@/lib/utils';

type TransposeControlsProps = {
  originalKey: string | null;
};

export function TransposeControls({ originalKey }: TransposeControlsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentKey = searchParams.get('key') ?? originalKey ?? 'G';
  const isTransposed = currentKey !== originalKey;

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
    const newKey = nextKey(currentKey, direction);
    updateKey(newKey);
  }

  function handleReset() {
    if (originalKey) updateKey(originalKey);
  }

  return (
    <div
      className={cn(
        'sticky top-14 z-30 -mx-4 px-4 py-2',
        'bg-background/95 backdrop-blur border-b border-border',
        'flex items-center gap-3',
      )}
      data-no-print
    >
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
    </div>
  );
}
