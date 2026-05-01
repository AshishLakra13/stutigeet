import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { DmcaForm } from './DmcaForm';

type DmcaPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ song?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Legal' });
  return { title: `${t('dmcaTitle')} — Stuti Geet` };
}

export default async function DmcaPage({ searchParams }: DmcaPageProps) {
  const { song: songSlug } = await searchParams;
  const t = await getTranslations('Legal');

  // Resolve the slug to a song id
  let songId: string | null = null;
  if (songSlug) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('songs')
      .select('id')
      .eq('slug', songSlug)
      .maybeSingle();
    songId = data?.id ?? null;
  }

  if (!songSlug || !songId) notFound();

  return (
    <main className="mx-auto max-w-lg px-4 py-12 space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-crimson)] text-3xl font-semibold">
          {t('dmcaTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('dmcaSubtitle')}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <DmcaForm songId={songId} songSlug={songSlug} />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        <Link href={`/songs/${songSlug}`} className="hover:text-foreground transition-colors">
          {t('backToSong')}
        </Link>
      </p>
    </main>
  );
}
