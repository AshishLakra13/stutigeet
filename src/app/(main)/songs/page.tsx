import { getAllSongs } from '@/lib/songs';
import { SongCard } from '@/components/SongCard';

export const metadata = {
  title: 'All Songs — Stuti Geet',
  description: 'Browse all Christian Hindi worship songs with chord sheets',
};

export default async function SongsPage() {
  const songs = await getAllSongs();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-[family-name:var(--font-crimson)] text-3xl font-semibold mb-6">
        All Songs
      </h1>

      {songs.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 text-sm">
          No songs yet — run{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">supabase/seed.sql</code> in
          Supabase Studio to get started.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </main>
  );
}
