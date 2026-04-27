import { TopHeader } from '@/components/TopHeader';
import { BottomNav } from '@/components/BottomNav';
import { CommandPalette } from '@/components/CommandPalette';
import { getAllSongs } from '@/lib/songs';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
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
    <div className="flex flex-col min-h-screen">
      <TopHeader />
      <CommandPalette songs={searchRecords} />
      <div className="flex-1 pb-20 md:pb-0">{children}</div>
      <BottomNav />
    </div>
  );
}
