'use client';

import { useState, useMemo, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { SongCard } from '@/components/SongCard';
import { cn } from '@/lib/utils';
import { createFuseIndex, searchSongs } from '@/lib/search';
import type { SongSearchRecord } from '@/lib/search';

type SongSearchProps = {
  songs: SongSearchRecord[];
};

export function SongSearch({ songs }: SongSearchProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(() => createFuseIndex(songs), [songs]);

  const results = useMemo(
    () => (query.trim().length >= 2 ? searchSongs(fuse, query) : songs),
    [fuse, query, songs],
  );

  const isSearching = query.trim().length >= 2;

  function clearSearch() {
    setQuery('');
    inputRef.current?.focus();
  }

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs…"
          className={cn(
            'w-full rounded-xl border border-border bg-background',
            'pl-9 pr-10 py-2.5 text-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'transition-colors',
          )}
          aria-label="Search songs"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        isSearching ? (
          <p className="text-center text-muted-foreground py-16 text-sm">
            No songs found for &ldquo;{query}&rdquo;
          </p>
        ) : (
          <p className="text-center text-muted-foreground py-16 text-sm">
            No songs yet — run{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">supabase/seed.sql</code> in
            Supabase Studio to get started.
          </p>
        )
      ) : (
        <>
          {isSearching && (
            <p className="text-xs text-muted-foreground mb-3">
              {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </p>
          )}
          <div className="flex flex-col gap-3">
            {results.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
