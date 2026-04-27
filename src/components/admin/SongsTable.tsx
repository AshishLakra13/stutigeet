'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { deleteSong } from '@/app/(admin)/admin/songs/actions';
import type { Song } from '@/types/song';
import { cn } from '@/lib/utils';

type SongsTableProps = {
  songs: Pick<Song, 'id' | 'slug' | 'title_hi' | 'title_en' | 'original_key' | 'copyright_status' | 'updated_at'>[];
};

export function SongsTable({ songs }: SongsTableProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(slug: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(() => deleteSong(slug));
  }

  if (songs.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-16 text-sm">
        No songs yet.{' '}
        <Link href="/admin/songs/new" className="underline hover:text-foreground">
          Add the first one.
        </Link>
      </p>
    );
  }

  return (
    <div className={cn('rounded-xl border border-border overflow-hidden', isPending && 'opacity-60')}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="hidden sm:table-cell w-20">Key</TableHead>
            <TableHead className="hidden md:table-cell">Copyright</TableHead>
            <TableHead className="hidden lg:table-cell w-28">Updated</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {songs.map((song) => {
            const displayTitle = song.title_hi ?? song.title_en ?? song.slug;
            return (
              <TableRow key={song.id}>
                <TableCell>
                  <div className="min-w-0">
                    {song.title_hi && (
                      <p lang="hi" className="font-[family-name:var(--font-devanagari)] text-sm font-medium truncate">
                        {song.title_hi}
                      </p>
                    )}
                    {song.title_en && (
                      <p className="text-xs text-muted-foreground truncate">{song.title_en}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">{song.slug}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {song.original_key && (
                    <Badge variant="secondary" className="text-xs font-mono">
                      {song.original_key}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {song.copyright_status && (
                    <span className="text-xs text-muted-foreground capitalize">
                      {song.copyright_status.replace('_', ' ')}
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {new Date(song.updated_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit',
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/songs/${song.slug}`}
                      target="_blank"
                      title="View on site"
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                    <Link href={`/admin/songs/${song.slug}/edit`} title="Edit">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(song.slug, displayTitle)}
                      disabled={isPending}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
