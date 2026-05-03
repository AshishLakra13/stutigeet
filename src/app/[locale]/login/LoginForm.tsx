'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, Loader2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendMagicLink } from './actions';
import { cn } from '@/lib/utils';

type LoginFormProps = {
  next?: string;
};

const initialState = { sent: false, error: undefined };

export function LoginForm({ next = '/' }: LoginFormProps) {
  const t = useTranslations('Login');
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  const [state, formAction, isPending] = useActionState(sendMagicLink, initialState);

  if (state.sent) {
    return (
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Mail className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="font-[family-name:var(--font-crimson)] text-xl font-semibold">
          {t('checkInboxTitle')}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          {t('checkInboxBody')}
        </p>
        <p className="text-xs text-muted-foreground">{t('linkExpiry')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {urlError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {urlError === 'not_allowed' ? t('restrictedError') : t('genericAuthError')}
          </span>
        </div>
      )}

      {/* Magic link */}
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />

        <div className="space-y-1.5">
          <Label htmlFor="email">{t('emailLabel')}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            autoComplete="email"
            autoFocus
            required
            disabled={isPending}
            className={cn(state.error && 'border-destructive')}
          />
          {state.error && <p className="text-xs text-destructive">{state.error}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('sending')}
            </>
          ) : (
            t('sendMagicLink')
          )}
        </Button>
      </form>
    </div>
  );
}
