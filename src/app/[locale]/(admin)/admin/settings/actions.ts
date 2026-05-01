'use server';

import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const settingsSchema = z.object({
  enabled: z.preprocess((v) => v === 'true' || v === true, z.boolean()),
  grace_days: z.preprocess(Number, z.number().int().min(1).max(365)),
});

export type SettingsState = { error?: string; success?: boolean };

export async function updateGateSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireAdmin();

  const result = settingsSchema.safeParse({
    enabled: formData.get('enabled'),
    grace_days: formData.get('grace_days'),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('site_settings')
    .upsert({
      key: 'strict_verification_gate',
      value: result.data,
      updated_at: new Date().toISOString(),
    });

  if (error) return { error: 'Failed to save settings.' };
  return { success: true };
}
