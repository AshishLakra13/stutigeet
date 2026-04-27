import { Suspense } from 'react';
import Link from 'next/link';
import { Music } from 'lucide-react';
import { LoginForm } from './LoginForm';

export const metadata = {
  title: 'Sign In — Stuti Geet',
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Music className="h-6 w-6" />
            <span className="font-[family-name:var(--font-crimson)] text-2xl font-semibold">
              Stuti Geet
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">Admin sign in</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <Suspense fallback={null}>
            <LoginForm next={next ?? '/admin'} />
          </Suspense>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Back to site
          </Link>
        </p>
      </div>
    </main>
  );
}
