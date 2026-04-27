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
      {/* Search input — minimal, bottom-border only */}
      <div className="relative mb-[var(--breath-phrase)]">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs…"
          className={cn(
            'w-full border-0 border-b bg-transparent',
            'pl-6 pr-8 py-2 text-base',
            'placeholder:text-muted-foreground placeholder:font-[family-name:var(--font-crimson)] placeholder:italic',
            'focus:outline-none focus:border-[var(--accent)]',
            'transition-colors duration-[180ms]',
          )}
          style={{ borderColor: 'var(--border)' }}
          aria-label="Search songs"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results count */}
      {isSearching && results.length > 0 && (
        <p className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-muted-foreground mb-3">
          {results.length} result{results.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Results */}
      {results.length === 0 ? (
        isSearching ? (
          <p className="font-[family-name:var(--font-crimson)] italic text-center text-muted-foreground py-16">
            No songs found for &ldquo;{query}&rdquo;
          </p>
        ) : (
          <p className="font-[family-name:var(--font-crimson)] italic text-center text-muted-foreground py-16">
            No songs yet.
          </p>
        )
      ) : (
        <div>
          {results.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  );
}
