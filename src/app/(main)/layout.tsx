import { TopHeader } from '@/components/TopHeader';
import { BottomNav } from '@/components/BottomNav';
import { CommandPaletteTrigger } from '@/components/CommandPaletteTrigger';
import { getSongsForSearch } from '@/lib/songs';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const songs = await getSongsForSearch();

  return (
    <div className="flex flex-col min-h-screen">
      <TopHeader />
      <CommandPaletteTrigger songs={songs} />
      <div className="flex-1 pb-20 md:pb-0">{children}</div>
      <BottomNav />
    </div>
  );
}
