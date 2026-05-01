import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getSongBySlug } from '@/lib/songs';
import { parseChordPro, transposeToKey, songToHtml } from '@/lib/chordpro';
import { isLyricRenderingAllowed } from '@/lib/verification-gate';
import { ChordSheet } from '@/components/ChordSheet';
import { EmbedTranspose } from './EmbedTranspose';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ key?: string }>;
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://stutigeet.com';

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const song = await getSongBySlug(slug);
  if (!song) return {};
  return { title: song.title_en ?? song.title_hi ?? slug, robots: { index: false } };
}

export default async function EmbedSongPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { key } = await searchParams;

  const song = await getSongBySlug(slug);
  if (!song) notFound();

  const allowed = await isLyricRenderingAllowed(song);
  if (!allowed) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Lyrics not available for this song.
      </div>
    );
  }

  const currentKey = key ?? song.original_key ?? undefined;
  const parsed = parseChordPro(song.lyrics_chordpro);
  const transposed =
    parsed && currentKey && currentKey !== song.original_key
      ? transposeToKey(parsed, currentKey)
      : parsed;
  const html = transposed ? songToHtml(transposed) : null;

  const songUrl = `${BASE_URL}/songs/${slug}`;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            {song.title_hi && (
              <h1 className="font-devanagari text-xl font-semibold leading-tight">{song.title_hi}</h1>
            )}
            {song.title_en && (
              <p className="text-sm text-muted-foreground italic">{song.title_en}</p>
            )}
          </div>
          <Suspense fallback={null}>
            <EmbedTranspose
              originalKey={song.original_key}
              currentKey={currentKey ?? song.original_key ?? 'G'}
            />
          </Suspense>
        </div>

        {html && (
          <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
            <ChordSheet html={html} />
          </Suspense>
        )}

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>{song.copyright_notes ?? song.source_name ?? 'Stuti Geet'}</span>
          <a
            href={songUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            stutigeet.com ↗
          </a>
        </div>
      </div>
    </div>
  );
}
