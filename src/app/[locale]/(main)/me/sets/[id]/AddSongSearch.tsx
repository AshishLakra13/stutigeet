'use client';

import { useState, useTransition } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addSongToSetlist } from '../actions';

type SongResult = {
  id: string;
  slug: string;
  title_hi: string | null;
  title_en: string | null;
  original_key: string | null;
};

type AddSongSearchProps = {
  setlistId: string;
};

export function AddSongSearch({ setlistId }: AddSongSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SongResult[]>([]);
  const [searching, startSearch] = useTransition();
  const [adding, startAdd] = useTransition();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  async function search(q: string) {
    if (q.trim().length < 2) { setResults([]); return; }
    startSearch(async () => {
      const res = await fetch(`/api/songs/search?q=${encodeURIComponent(q)}&limit=8`);
      if (res.ok) setResults(await res.json());
    });
  }

  function handleAdd(song: SongResult) {
    startAdd(async () => {
      setError(null);
      const result = await addSongToSetlist(setlistId, song.id);
      if (result.error) { setError(result.error); return; }
      setAddedIds((prev) => new Set(prev).add(song.id));
    });
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search songs to add…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            search(e.target.value);
          }}
          className="pl-9"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {results.length > 0 && (
        <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
          {results.map((song) => {
            const added = addedIds.has(song.id);
            return (
              <div key={song.id} className="flex items-center gap-3 px-4 py-2.5 bg-card">
                <div className="flex-1 min-w-0">
                  {song.title_hi && (
                    <span className="font-[family-name:var(--font-devanagari)] text-sm mr-2">
                      {song.title_hi}
                    </span>
                  )}
                  {song.title_en && (
                    <span className="text-xs text-muted-foreground italic">{song.title_en}</span>
                  )}
                </div>
                {song.original_key && (
                  <span className="font-mono text-xs text-muted-foreground">{song.original_key}</span>
                )}
                <Button
                  size="sm"
                  variant={added ? 'secondary' : 'outline'}
                  className="h-7 text-xs gap-1 shrink-0"
                  onClick={() => !added && handleAdd(song)}
                  disabled={added || adding}
                >
                  {adding && !added ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                  {added ? 'Added' : 'Add'}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
