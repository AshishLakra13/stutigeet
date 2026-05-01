import { getCurrentProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ListMusic } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Sets — Stuti Geet' };

export default async function SetsPage() {
  const profile = await getCurrentProfile();
  if (profile) redirect('/me/sets');

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 flex flex-col items-center text-center gap-4">
      <ListMusic className="h-12 w-12 text-muted-foreground" />
      <h1 className="font-[family-name:var(--font-crimson)] text-3xl font-semibold">
        Set Lists
      </h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        Build your worship set, share with your team, and navigate songs on stage.
        Sign in to get started.
      </p>
      <Link href="/login?next=/me/sets" className={cn(buttonVariants({ variant: 'default' }))}>
        Sign in to create sets
      </Link>
    </main>
  );
}
