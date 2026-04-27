import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getSongBySlug } from '@/lib/songs';
import { SongHeader } from '@/components/SongHeader';
import { ChordSheet } from '@/components/ChordSheet';
import { TransposeControls } from '@/components/TransposeControls';

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

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <SongHeader song={song} currentKey={currentKey} />

      <Suspense fallback={null}>
        <TransposeControls originalKey={song.original_key} />
      </Suspense>

      <div className="mt-6">
        <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
          <ChordSheet
            chordpro={song.lyrics_chordpro}
            originalKey={song.original_key}
          />
        </Suspense>
      </div>
    </main>
  );
}
