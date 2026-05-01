'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitTakedown, type TakedownState } from './actions';

type DmcaFormProps = {
  songId: string;
  songSlug: string;
};

const initialState: TakedownState = {};

export function DmcaForm({ songId, songSlug }: DmcaFormProps) {
  const t = useTranslations('Legal');
  const [state, formAction, isPending] = useActionState(submitTakedown, initialState);

  if (state.success) {
    return (
      <div className="space-y-3 text-center py-8">
        <h2 className="font-[family-name:var(--font-crimson)] text-2xl font-semibold">
          {t('successTitle')}
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">{t('successBody')}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="song_id" value={songId} />

      {/* Honeypot — bots fill this, humans don't */}
      <div aria-hidden="true" className="hidden">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="claimant_name">{t('nameLabel')}</Label>
        <Input
          id="claimant_name"
          name="claimant_name"
          type="text"
          autoComplete="name"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="claimant_email">{t('emailLabel')}</Label>
        <Input
          id="claimant_email"
          name="claimant_email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="claim_text">{t('claimLabel')}</Label>
        <textarea
          id="claim_text"
          name="claim_text"
          rows={6}
          placeholder={t('claimPlaceholder')}
          required
          disabled={isPending}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 resize-y"
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Song: <span className="font-mono">{songSlug}</span>
      </p>
    </form>
  );
}
