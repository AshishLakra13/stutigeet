import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getSongBySlug } from '@/lib/songs';
import { parseChordPro, transposeToKey, songToHtml } from '@/lib/chordpro';
import { SongHeader } from '@/components/SongHeader';
import { ChordSheet } from '@/components/ChordSheet';
import { SongToolbar } from '@/components/SongToolbar';

type SongPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ key?: string }>;
};

export async function generateMetadata({ params }: SongPageProps) {
  const { slug } = await params;
  const song = await getSongBySlug(slug);
  if (!song) return {};
  return {
    title: `${song.title_en ?? song.title_hi ?? slug} — Stuti Geet`,
    description: `Chord sheet for ${song.title_en ?? song.title_hi ?? slug}`,
  };
}

export default async function SongPage({ params, searchParams }: SongPageProps) {
  const { slug } = await params;
  const { key } = await searchParams;

  const song = await getSongBySlug(slug);
  if (!song) notFound();

  const currentKey = key ?? song.original_key ?? undefined;

  const parsedSong = parseChordPro(song.lyrics_chordpro);
  const transposed =
    currentKey && currentKey !== song.original_key
      ? transposeToKey(parsedSong, currentKey)
      : parsedSong;
  const html = songToHtml(transposed);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <SongHeader song={song} currentKey={currentKey} />

      <SongToolbar originalKey={song.original_key} />

      <div className="mt-6">
        <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
          <ChordSheet html={html} />
        </Suspense>
      </div>
    </main>
  );
}
