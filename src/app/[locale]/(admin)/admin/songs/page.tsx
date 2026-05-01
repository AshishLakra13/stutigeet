import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { getAllSongs } from '@/lib/songs';
import { SongsTable } from '@/components/admin/SongsTable';

export const metadata = {
  title: 'Songs — Admin — Stuti Geet',
};

export default async function AdminSongsPage() {
  const songs = await getAllSongs();

  const tableData = songs.map(
    ({ id, slug, title_hi, title_en, original_key, copyright_status, updated_at }) => ({
      id, slug, title_hi, title_en, original_key, copyright_status, updated_at,
    }),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-crimson)] text-3xl font-semibold">
            Songs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {songs.length} song{songs.length !== 1 ? 's' : ''} in the library
          </p>
        </div>
        <Link
          href="/admin/songs/new"
          className={cn(buttonVariants({ variant: 'default' }), 'gap-2')}
        >
          <PlusCircle className="h-4 w-4" />
          Add song
        </Link>
      </div>

      <SongsTable songs={tableData} />
    </div>
  );
}
