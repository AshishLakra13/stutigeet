import Link from 'next/link';
import { Settings } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Admin — Stuti Geet',
};

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 flex flex-col items-center text-center gap-4">
      <Settings className="h-12 w-12 text-muted-foreground" />
      <h1 className="font-[family-name:var(--font-crimson)] text-3xl font-semibold">
        Admin
      </h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        Add and edit songs, manage set lists, and control site settings.
        Coming in Phase 3.
      </p>
      <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
        Go Home
      </Link>
    </main>
  );
}
