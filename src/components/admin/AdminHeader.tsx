'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Music, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

type AdminHeaderProps = {
  email: string;
};

export function AdminHeader({ email }: AdminHeaderProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSignOut() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Left: site link + admin label */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-[family-name:var(--font-crimson)] text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            Stuti Geet
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            <Settings className="h-3 w-3" />
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/admin" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/songs" className="hover:text-foreground transition-colors">
            Songs
          </Link>
          <Link href="/admin/songs/new" className="hover:text-foreground transition-colors">
            + Add song
          </Link>
        </nav>

        {/* Right: email + sign out */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[160px]">
            {email}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={handleSignOut}
            disabled={isPending}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
