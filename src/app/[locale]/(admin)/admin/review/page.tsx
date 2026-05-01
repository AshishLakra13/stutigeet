import { requireEditor } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { RevisionCard } from './_components/RevisionCard';

type RevisionRow = {
  id: string;
  notes: string | null;
  created_at: string;
  payload: Record<string, unknown>;
  author: { display_name: string | null; email: string } | null;
  song: {
    id: string;
    slug: string;
    title_hi: string | null;
    title_en: string | null;
    is_published: boolean;
    lyrics_chordpro: string;
    original_key: string | null;
    artist_original: string | null;
    themes: string[] | null;
    language: string[] | null;
    youtube_url: string | null;
    bpm: number | null;
    tempo: string | null;
    source_url: string | null;
    source_name: string | null;
  };
};

export const metadata = { title: 'Review Queue — Stuti Geet Admin' };

export default async function ReviewPage() {
  const profile = await requireEditor();
  const supabase = await createClient();

  const { data } = await supabase
    .from('song_revisions')
    .select(
      `id, notes, created_at, payload,
       author:profiles!author_id(display_name, email),
       song:songs!song_id(id, slug, title_hi, title_en, is_published, lyrics_chordpro, original_key, artist_original, themes, language, youtube_url, bpm, tempo, source_url, source_name)`,
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  const revisions = (data ?? []) as unknown as RevisionRow[];

  return (
    <>
      <AdminHeader email={profile.email} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Review queue</h1>
          <span className="text-sm text-muted-foreground">
            {revisions.length} pending
          </span>
        </div>

        {revisions.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center">
            No pending revisions.
          </p>
        ) : (
          <div className="space-y-6">
            {revisions.map((rev) => (
              <RevisionCard key={rev.id} revision={rev} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
