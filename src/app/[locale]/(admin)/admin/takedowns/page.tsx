import { getTranslations } from 'next-intl/server';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { reviewTakedown } from './actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Takedown = {
  id: string;
  song_id: string;
  claimant_name: string;
  claimant_email: string;
  claim_text: string;
  status: string;
  received_at: string;
  reason: string | null;
  songs: { title_en: string | null; title_hi: string | null; slug: string } | null;
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  received: 'default',
  reviewing: 'secondary',
  upheld: 'destructive',
  rejected: 'outline',
};

export default async function AdminTakedownsPage() {
  await requireAdmin();
  const t = await getTranslations('Admin');

  const supabase = await createClient();
  const { data: takedowns } = await supabase
    .from('takedowns')
    .select('*, songs(title_en, title_hi, slug)')
    .order('received_at', { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="font-[family-name:var(--font-crimson)] text-3xl font-semibold">
        {t('takedownsTitle')}
      </h1>

      {!takedowns?.length ? (
        <p className="text-muted-foreground">{t('noTakedowns')}</p>
      ) : (
        <div className="space-y-4">
          {(takedowns as Takedown[]).map((td) => (
            <div key={td.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium">
                    {td.songs?.title_en ?? td.songs?.title_hi ?? td.song_id}
                    {td.songs?.slug && (
                      <span className="ml-2 text-xs text-muted-foreground font-mono">
                        {td.songs.slug}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {td.claimant_name} · {td.claimant_email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(td.received_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANTS[td.status] ?? 'secondary'}>
                  {td.status}
                </Badge>
              </div>

              <p className="text-sm border-l-2 border-border pl-3 text-muted-foreground line-clamp-4">
                {td.claim_text}
              </p>

              {td.reason && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Decision reason:</span> {td.reason}
                </p>
              )}

              {td.status === 'received' || td.status === 'reviewing' ? (
                <div className="flex gap-2 pt-1">
                  <form action={reviewTakedown}>
                    <input type="hidden" name="id" value={td.id} />
                    <input type="hidden" name="action" value="upheld" />
                    <Button type="submit" variant="destructive" size="sm">
                      {t('uphold')}
                    </Button>
                  </form>
                  <form action={reviewTakedown} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={td.id} />
                    <input type="hidden" name="action" value="rejected" />
                    <input
                      name="reason"
                      type="text"
                      placeholder={t('reason')}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs w-48 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <Button type="submit" variant="outline" size="sm">
                      {t('reject')}
                    </Button>
                  </form>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
