import { notFound } from 'next/navigation';
import { getSongBySlug } from '@/lib/songs';
import { parseChordPro } from '@/lib/chordpro';
import { songToSlides } from '@/lib/song-slides';
import { ProjectionView } from './ProjectionView';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ key?: string }>;
};

export const metadata = { robots: { index: false } };

export default async function ProjectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { key } = await searchParams;

  const song = await getSongBySlug(slug);
  if (!song) notFound();

  const parsed = parseChordPro(song.lyrics_chordpro);
  const transposed = key && key !== song.original_key
    ? parsed.changeKey(key)
    : parsed;

  const slides = songToSlides(transposed);

  const title = song.title_hi ?? song.title_en ?? slug;

  return (
    <ProjectionView
      slug={slug}
      slides={slides}
      songTitle={title}
    />
  );
}
