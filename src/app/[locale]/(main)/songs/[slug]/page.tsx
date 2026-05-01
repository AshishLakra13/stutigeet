import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getSongBySlug } from '@/lib/songs';
import { parseChordPro, transposeToKey, songToHtml } from '@/lib/chordpro';
import { isLyricRenderingAllowed } from '@/lib/verification-gate';
import { getCurrentProfile } from '@/lib/auth';
import { SongHeader } from '@/components/SongHeader';
import { ChordSheet } from '@/components/ChordSheet';
import { SongToolbar } from '@/components/SongToolbar';
import { TrustPanel } from '@/components/TrustPanel';
import { MusicCompositionJsonLd } from '@/components/jsonld/MusicComposition';
import { BreadcrumbJsonLd } from '@/components/jsonld/Breadcrumb';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ViewTracker } from '@/components/ViewTracker';
import { Pencil, Monitor } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://stutigeet.com';

type SongPageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ key?: string }>;
};

export async function generateMetadata({ params }: SongPageProps) {
  const { locale, slug } = await params;
  const song = await getSongBySlug(slug);
  if (!song) return {};

  const title = `${song.title_en ?? song.title_hi ?? slug} — Stuti Geet`;
  const description = `Lyrics and chord sheet for ${song.title_en ?? song.title_hi ?? slug}. Christian Hindi worship song.`;
  const canonicalUrl = `${BASE_URL}/songs/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        hi: canonicalUrl,
        en: `${BASE_URL}/en/songs/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: locale === 'en' ? `${BASE_URL}/en/songs/${slug}` : canonicalUrl,
      siteName: 'Stuti Geet',
      type: 'music.song',
    },
  };
}

export default async function SongPage({ params, searchParams }: SongPageProps) {
  const { slug } = await params;
  const { key } = await searchParams;

  const [song, profile] = await Promise.all([getSongBySlug(slug), getCurrentProfile()]);
  if (!song) notFound();

  const canSuggestEdit = profile && profile.role !== 'viewer';

  const allowRender = await isLyricRenderingAllowed(song);

  let isFavorited = false;
  if (profile) {
    const supabase = await (await import('@/lib/supabase/server')).createClient();
    const { data } = await supabase
      .from('favorites')
      .select('song_id')
      .eq('user_id', profile.id)
      .eq('song_id', song.id)
      .maybeSingle();
    isFavorited = !!data;
  }
  const currentKey = key ?? song.original_key ?? undefined;

  const parsedSong = allowRender ? parseChordPro(song.lyrics_chordpro) : null;
  const transposed =
    parsedSong && currentKey && currentKey !== song.original_key
      ? transposeToKey(parsedSong, currentKey)
      : parsedSong;
  const html = transposed ? songToHtml(transposed) : null;

  const pageUrl = `${BASE_URL}/songs/${slug}`;
  const songName = song.title_en ?? song.title_hi ?? slug;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <MusicCompositionJsonLd
        name={songName}
        inLanguage={song.language?.[0] ?? 'hi'}
        lyricsExcerpt={allowRender ? song.lyrics_chordpro : null}
        composer={song.artist_original}
        datePublished={song.created_at}
        copyrightStatus={song.copyright_status}
        pageUrl={pageUrl}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Stuti Geet', url: BASE_URL },
          { name: 'Songs', url: `${BASE_URL}/songs` },
          { name: songName, url: pageUrl },
        ]}
      />

      <SongHeader song={song} currentKey={currentKey} />

      <TrustPanel
        slug={slug}
        copyrightStatus={song.copyright_status}
        sourceUrl={song.source_url}
        sourceName={song.source_name}
        verifiedAt={song.verified_at}
        allowRender={allowRender}
      />

      {allowRender && html && (
        <>
          <SongToolbar originalKey={song.original_key} />
          <div className="mt-6">
            <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
              <ChordSheet html={html} />
            </Suspense>
          </div>
        </>
      )}

      <div className="mt-8 pt-6 border-t border-border flex items-center gap-3 flex-wrap">
        {allowRender && (
          <Link href={`/songs/${slug}/project`}>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Monitor className="h-3.5 w-3.5" />
              Project
            </Button>
          </Link>
        )}
        {profile && (
          <FavoriteButton
            songId={song.id}
            initialFavorited={isFavorited}
          />
        )}
        {canSuggestEdit && (
          <Link href={`/songs/${slug}/suggest`}>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Pencil className="h-3.5 w-3.5" />
              Suggest an edit
            </Button>
          </Link>
        )}
        {allowRender && (
          <div className="flex items-center gap-2">
            <a href={`/api/pdf/song/${slug}?layout=band`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-xs">PDF (Band)</Button>
            </a>
            <a href={`/api/pdf/song/${slug}?layout=congregation`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-xs">PDF (Lyrics)</Button>
            </a>
          </div>
        )}
      </div>

      <ViewTracker songId={song.id} />
    </main>
  );
}
