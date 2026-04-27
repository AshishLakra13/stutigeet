import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { getCurrentProfile } from '@/lib/auth';
import { BrandMark } from '@/components/BrandMark';
import { cn } from '@/lib/utils';

export async function TopHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <BrandMark size={24} className="shrink-0" />
          <span className="font-[family-name:var(--font-crimson)] text-xl font-semibold tracking-tight">
            Stuti Geet
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/songs" className="hover:text-foreground transition-colors">
            Songs
          </Link>
          <Link href="/sets" className="hover:text-foreground transition-colors">
            Sets
          </Link>
          {profile?.role === 'admin' ? (
            <Link href="/admin" className="hover:text-foreground transition-colors">
              Admin
            </Link>
          ) : (
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
          )}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
