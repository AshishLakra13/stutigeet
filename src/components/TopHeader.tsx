import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export function TopHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-crimson)] text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          Stuti Geet
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/songs" className="hover:text-foreground transition-colors">
            Songs
          </Link>
          <Link href="/sets" className="hover:text-foreground transition-colors">
            Sets
          </Link>
          <Link href="/admin" className="hover:text-foreground transition-colors">
            Admin
          </Link>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
