'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEBOUNCE_MS = 300;

export function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = defaultValue ?? '';
  const [value, setValue] = useState(initial);
  const [syncedDefault, setSyncedDefault] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Adjust state during render when an external prop (the URL-driven default)
  // changes — e.g. back/forward navigation. Only adopt the new URL value if
  // the user hasn't typed since the last sync; otherwise their input wins
  // and the next debounced effect pushes it.
  if (initial !== syncedDefault) {
    if (value === syncedDefault) {
      setValue(initial);
    }
    setSyncedDefault(initial);
  }

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === syncedDefault.trim()) return;

    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed.length >= 2) {
        params.set('q', trimmed);
      } else {
        params.delete('q');
      }
      params.delete('page');

      const qs = params.toString();
      const href = qs ? `/songs?${qs}` : '/songs';

      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [value, syncedDefault, router, searchParams]);

  function clearSearch() {
    setValue('');
    inputRef.current?.focus();
  }

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search songs…"
        className={cn(
          'w-full border-0 border-b bg-transparent',
          'pl-6 pr-12 py-2 text-base',
          'placeholder:font-[family-name:var(--font-crimson)] placeholder:italic placeholder:text-muted-foreground',
          'focus:border-[var(--accent)] focus:outline-none',
          'transition-colors duration-[180ms]',
        )}
        style={{ borderColor: 'var(--border)' }}
        aria-label="Search songs"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
      />
      <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {isPending && (
          <Loader2
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-label="Searching"
          />
        )}
        {value && (
          <button
            type="button"
            onClick={clearSearch}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
