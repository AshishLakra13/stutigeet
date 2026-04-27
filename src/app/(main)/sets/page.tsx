import Link from 'next/link';
import { ListMusic } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Sets — Stuti Geet',
};

export default function SetsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 flex flex-col items-center text-center gap-4">
      <ListMusic className="h-12 w-12 text-muted-foreground" />
      <h1 className="font-[family-name:var(--font-crimson)] text-3xl font-semibold">
        Set Lists
      </h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        Build Sunday&apos;s set list, share with your team, and navigate songs on stage.
        Coming in Phase 4.
      </p>
      <Link href="/songs" className={cn(buttonVariants({ variant: 'outline' }))}>
        Browse Songs
      </Link>
    </main>
  );
}
