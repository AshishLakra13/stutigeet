'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import { nextKey } from '@/lib/keys';

type Props = { originalKey: string | null; currentKey: string };

export function EmbedTranspose({ originalKey, currentKey }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [key, setKey] = useState(currentKey);

  function updateKey(newKey: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newKey === originalKey) {
      params.delete('key');
    } else {
      params.set('key', newKey);
    }
    setKey(newKey);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const isTransposed = key !== originalKey;

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 shadow-sm text-sm">
      <button
        className="h-7 w-7 flex items-center justify-center text-base text-muted-foreground hover:text-foreground"
        onClick={() => updateKey(nextKey(key, -1))}
        aria-label="Transpose down"
      >
        ‹
      </button>
      <span className="font-mono w-6 text-center text-foreground">{key}</span>
      <button
        className="h-7 w-7 flex items-center justify-center text-base text-muted-foreground hover:text-foreground"
        onClick={() => updateKey(nextKey(key, 1))}
        aria-label="Transpose up"
      >
        ›
      </button>
      {isTransposed && originalKey && (
        <button
          className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
          onClick={() => updateKey(originalKey)}
          aria-label="Reset key"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
