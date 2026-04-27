import { getAllSongs } from '@/lib/songs';
import { SongCard } from '@/components/SongCard';

export default async function HomePage() {
  const songs = await getAllSongs();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="font-[family-name:var(--font-crimson)] text-4xl font-semibold tracking-tight sm:text-5xl">
          Stuti Geet
        </h1>
        <p
          lang="hi"
          className="font-[family-name:var(--font-devanagari)] text-2xl text-muted-foreground mt-1"
        >
          स्तुति गीत
        </p>
        <p className="text-sm text-muted-foreground mt-3">
          Christian Hindi worship songs — chord sheets for your worship team
        </p>
      </div>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Songs ({songs.length})
        </h2>

        {songs.length === 0 ? (
          <p className="text-center text-muted-foreground py-16 text-sm">
            No songs yet. Run{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">supabase/seed.sql</code>{' '}
            in Supabase Studio to add the demo song.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
