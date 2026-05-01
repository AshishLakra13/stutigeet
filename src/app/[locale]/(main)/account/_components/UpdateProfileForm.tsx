'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile } from '../actions';

type UpdateProfileFormProps = {
  currentDisplayName: string | null;
};

const initialState: { error?: string; success?: boolean } = {};

export function UpdateProfileForm({ currentDisplayName }: UpdateProfileFormProps) {
  const t = useTranslations('Account');
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="display_name">{t('displayNameLabel')}</Label>
        <Input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={currentDisplayName ?? ''}
          placeholder={t('displayNamePlaceholder')}
          maxLength={60}
          required
          disabled={isPending}
        />
        {state.error && <p className="text-xs text-destructive">{state.error}</p>}
        {state.success && (
          <p className="text-xs text-muted-foreground">{t('nameSaved')}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t('saving')}
          </>
        ) : (
          t('saveButton')
        )}
      </Button>
    </form>
  );
}
