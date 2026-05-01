import { Suspense } from 'react';
import { Music } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LoginForm } from './LoginForm';

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return { title: t('loginTitle') };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ next }, t] = await Promise.all([searchParams, getTranslations('Login')]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Music className="h-6 w-6" />
            <span className="font-[family-name:var(--font-crimson)] text-2xl font-semibold">
              {t('title')}
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <Suspense fallback={null}>
            <LoginForm next={next ?? '/'} />
          </Suspense>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            {t('backToSite')}
          </Link>
        </p>
      </div>
    </main>
  );
}
