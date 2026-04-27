import { getAllSongs } from '@/lib/songs';
import { SongSearch } from '@/components/SongSearch';

export const metadata = {
  title: 'All Songs — Stuti Geet',
  description: 'Browse all Christian Hindi worship songs with chord sheets',
};

export default async function SongsPage() {
  const songs = await getAllSongs();

  const searchRecords = songs.map(
    ({ id, slug, title_hi, title_en, original_key, bpm, themes, artist_original }) => ({
      id,
      slug,
      title_hi,
      title_en,
      original_key,
      bpm,
      themes,
      artist_original,
    }),
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-[family-name:var(--font-crimson)] text-3xl font-semibold mb-6">
        All Songs
      </h1>
      <SongSearch songs={searchRecords} />
    </main>
  );
}
