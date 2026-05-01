import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { Heart } from 'lucide-react';
import { FavoriteButton } from '@/components/FavoriteButton';

export const metadata = { title: 'Favorites — Stuti Geet' };

type FavRow = {
  song_id: string;
  songs: {
    id: string;
    slug: string;
    title_hi: string | null;
    title_en: string | null;
    original_key: string | null;
    themes: string[] | null;
  };
};

export default async function FavoritesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?next=/me/favorites');

  const supabase = await createClient();
  const { data } = await supabase
    .from('favorites')
    .select('song_id, songs(id, slug, title_hi, title_en, original_key, themes)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  const favorites = (data ?? []) as unknown as FavRow[];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Heart className="h-6 w-6 text-rose-500 fill-current" />
        <h1 className="text-2xl font-semibold">Favorites</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">No favorites yet.</p>
          <Link href="/songs" className="text-sm underline text-muted-foreground hover:text-foreground mt-2 inline-block">
            Browse songs
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {favorites.map(({ song_id, songs }) => (
            <div key={song_id} className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 transition-colors">
              <FavoriteButton songId={songs.id} initialFavorited={true} />
              <Link href={`/songs/${songs.slug}`} className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 min-w-0">
                  {songs.title_hi && (
                    <span className="font-[family-name:var(--font-devanagari)] text-base font-medium truncate">
                      {songs.title_hi}
                    </span>
                  )}
                  {songs.title_en && (
                    <span className="text-sm text-muted-foreground italic truncate">
                      {songs.title_en}
                    </span>
                  )}
                </div>
              </Link>
              {songs.original_key && (
                <span className="font-mono text-xs text-muted-foreground shrink-0">
                  {songs.original_key}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
