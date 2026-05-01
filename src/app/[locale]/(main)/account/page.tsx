import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { signOut } from './actions';
import { UpdateProfileForm } from './_components/UpdateProfileForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type AccountPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account' });
  return { title: t('metaTitle') };
}

export default async function AccountPage() {
  const [profile, t] = await Promise.all([getCurrentProfile(), getTranslations('Account')]);
  if (!profile) redirect('/login?next=/account');

  return (
    <main className="mx-auto max-w-lg px-4 py-12 space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-crimson)] text-3xl font-semibold">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
      </div>

      {/* Role badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t('roleLabel')}</span>
        <Badge variant="secondary">{t(`roles.${profile.role}`)}</Badge>
      </div>

      {/* Profile section */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-medium">{t('profileSection')}</h2>
        <UpdateProfileForm currentDisplayName={profile.display_name} />
      </section>

      {/* Links */}
      {(profile.role === 'editor' || profile.role === 'admin') && (
        <Link
          href="/admin"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('adminLink')}
        </Link>
      )}

      {/* Sign out */}
      <form action={signOut}>
        <Button type="submit" variant="outline" size="sm">
          {t('signOut')}
        </Button>
      </form>
    </main>
  );
}
