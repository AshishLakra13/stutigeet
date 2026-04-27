import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { getSongBySlug } from '@/lib/songs';
import { SongForm } from '@/components/admin/SongForm';

type EditSongPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EditSongPageProps) {
  const { slug } = await params;
  const song = await getSongBySlug(slug);
  if (!song) return {};
  return {
    title: `Edit "${song.title_en ?? song.title_hi ?? slug}" — Admin — Stuti Geet`,
  };
}

export default async function EditSongPage({ params }: EditSongPageProps) {
  const { slug } = await params;
  const song = await getSongBySlug(slug);
  if (!song) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/songs"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          All songs
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-crimson)] text-3xl font-semibold">
              Edit song
            </h1>
            {song.title_hi && (
              <p lang="hi" className="font-[family-name:var(--font-devanagari)] text-muted-foreground mt-1">
                {song.title_hi}
              </p>
            )}
          </div>
          <Link
            href={`/songs/${slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-2"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on site
          </Link>
        </div>
      </div>
      <SongForm song={song} />
    </div>
  );
}
