'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateGateSettings, type SettingsState } from '../actions';

type SettingsFormProps = {
  enabled: boolean;
  graceDays: number;
};

const initialState: SettingsState = {};

export function SettingsForm({ enabled, graceDays }: SettingsFormProps) {
  const t = useTranslations('Admin');
  const [state, formAction, isPending] = useActionState(updateGateSettings, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="flex items-start gap-3">
        <input
          id="enabled"
          name="enabled"
          type="checkbox"
          value="true"
          defaultChecked={enabled}
          className="mt-0.5 h-4 w-4 rounded border-border accent-[var(--accent)]"
        />
        <div>
          <Label htmlFor="enabled" className="font-medium cursor-pointer">
            {t('strictGateLabel')}
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">{t('strictGateDescription')}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="grace_days">{t('graceDaysLabel')}</Label>
        <Input
          id="grace_days"
          name="grace_days"
          type="number"
          min={1}
          max={365}
          defaultValue={graceDays}
          className="w-28"
          disabled={isPending}
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-muted-foreground">{t('settingsSaved')}</p>}

      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t('saving')}
          </>
        ) : (
          t('saveSettings')
        )}
      </Button>
    </form>
  );
}
