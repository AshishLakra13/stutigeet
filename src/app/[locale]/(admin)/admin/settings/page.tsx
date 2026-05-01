import { getTranslations } from 'next-intl/server';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from './_components/SettingsForm';

export default async function AdminSettingsPage() {
  await requireAdmin();
  const t = await getTranslations('Admin');

  const supabase = await createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'strict_verification_gate')
    .single();

  const settings = (data?.value ?? { enabled: false, grace_days: 30 }) as {
    enabled: boolean;
    grace_days: number;
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <h1 className="font-[family-name:var(--font-crimson)] text-3xl font-semibold">
        {t('settingsTitle')}
      </h1>

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <SettingsForm enabled={settings.enabled} graceDays={settings.grace_days} />
      </section>
    </main>
  );
}
