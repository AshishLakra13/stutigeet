'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, Loader2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendMagicLink } from './actions';
import { createClient } from '@/lib/supabase/client';
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

  async function handleGoogleSignIn() {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
  }

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

      {/* Google OAuth */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={handleGoogleSignIn}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {t('continueWithGoogle')}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">{t('or')}</span>
        </div>
      </div>

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
