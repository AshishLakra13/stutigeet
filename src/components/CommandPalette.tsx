'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Music } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { createFuseIndex, searchSongs } from '@/lib/search';
import type { SongSearchRecord } from '@/lib/search';

type CommandPaletteProps = {
  songs: SongSearchRecord[];
};

export function CommandPalette({ songs }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  const fuse = useMemo(() => createFuseIndex(songs), [songs]);

  const results = useMemo(
    () => (query.trim().length >= 1 ? searchSongs(fuse, query) : songs.slice(0, 8)),
    [fuse, query, songs],
  );

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Open via mobile search button
  useEffect(() => {
    function handleOpen() { setOpen(true); }
    document.addEventListener('command-palette:open', handleOpen);
    return () => document.removeEventListener('command-palette:open', handleOpen);
  }, []);

  function handleSelect(slug: string) {
    setOpen(false);
    setQuery('');
    router.push(`/songs/${slug}`);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setQuery('');
      }}
      title="Search songs"
      description="Type to search all songs by title or artist"
    >
      <CommandInput
        placeholder="Search songs…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No songs found.</CommandEmpty>
        <CommandGroup heading={query ? 'Results' : 'Songs'}>
          {results.map((song) => (
            <CommandItem
              key={song.slug}
              value={`${song.title_hi ?? ''} ${song.title_en ?? ''} ${song.slug}`}
              onSelect={() => handleSelect(song.slug)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <Music className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col min-w-0">
                {song.title_hi && (
                  <span lang="hi" className="font-[family-name:var(--font-devanagari)] text-sm leading-tight">
                    {song.title_hi}
                  </span>
                )}
                {song.title_en && (
                  <span className="text-xs text-muted-foreground truncate">{song.title_en}</span>
                )}
              </div>
              {song.original_key && (
                <span className="ml-auto text-xs font-mono text-muted-foreground shrink-0">
                  {song.original_key}
                </span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
