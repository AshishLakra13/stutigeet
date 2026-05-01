import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { SongForm } from '@/components/admin/SongForm';

export const metadata = {
  title: 'Add Song — Admin — Stuti Geet',
};

export default function NewSongPage() {
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
        <h1 className="font-[family-name:var(--font-crimson)] text-3xl font-semibold">
          Add song
        </h1>
      </div>
      <SongForm />
    </div>
  );
}
