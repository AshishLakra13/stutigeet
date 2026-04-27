'use client';

import { useActionState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendMagicLink } from './actions';
import { cn } from '@/lib/utils';

type LoginFormProps = {
  next?: string;
};

const initialState = { sent: false, error: undefined };

export function LoginForm({ next = '/admin' }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(sendMagicLink, initialState);

  if (state.sent) {
    return (
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Mail className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="font-[family-name:var(--font-crimson)] text-xl font-semibold">
          Check your inbox
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          We sent a sign-in link to your email. Click it to continue — no password needed.
        </p>
        <p className="text-xs text-muted-foreground">
          The link expires in 15 minutes.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          required
          disabled={isPending}
          className={cn(state.error && 'border-destructive')}
        />
        {state.error && (
          <p className="text-xs text-destructive">{state.error}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          'Send magic link'
        )}
      </Button>
    </form>
  );
}
