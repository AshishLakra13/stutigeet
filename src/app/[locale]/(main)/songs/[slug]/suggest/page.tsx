import { notFound, redirect } from 'next/navigation';
import { getSongBySlug } from '@/lib/songs';
import { getCurrentProfile } from '@/lib/auth';
import { SuggestEditForm } from './SuggestEditForm';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const song = await getSongBySlug(slug);
  if (!song) return {};
  return {
    title: `Suggest edit — ${song.title_en ?? song.title_hi ?? slug} — Stuti Geet`,
  };
}

export default async function SuggestEditPage({ params }: Props) {
  const { slug } = await params;

  const [song, profile] = await Promise.all([getSongBySlug(slug), getCurrentProfile()]);

  if (!song) notFound();
  if (!profile) redirect(`/login?next=/songs/${slug}/suggest`);
  if (profile.role === 'viewer') redirect(`/songs/${slug}`);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Suggest an edit</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {song.title_hi && (
            <span className="font-[family-name:var(--font-devanagari)] mr-2">{song.title_hi}</span>
          )}
          {song.title_en && <span className="text-muted-foreground">{song.title_en}</span>}
        </p>
      </div>
      <SuggestEditForm song={song} />
    </main>
  );
}
