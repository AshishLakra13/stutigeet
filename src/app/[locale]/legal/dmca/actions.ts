'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

const takedownSchema = z.object({
  claimant_name: z.string().min(2).max(120),
  claimant_email: z.string().email(),
  claim_text: z.string().min(20).max(5000),
  song_id: z.string().uuid(),
  // Honeypot: must be empty
  website: z.literal(''),
});

export type TakedownState = {
  success?: boolean;
  error?: string;
};

export async function submitTakedown(
  _prev: TakedownState,
  formData: FormData,
): Promise<TakedownState> {
  // Rate limit: 3 takedown submissions per hour per IP
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() ?? h.get('x-real-ip') ?? 'unknown';
  const { allowed } = await checkRateLimit(`dmca:${ip}`);
  if (!allowed) {
    return { error: 'Too many submissions. Please try again later.' };
  }

  const raw = {
    claimant_name: formData.get('claimant_name'),
    claimant_email: formData.get('claimant_email'),
    claim_text: formData.get('claim_text'),
    song_id: formData.get('song_id'),
    website: formData.get('website') ?? '',
  };

  const result = takedownSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid submission.' };
  }

  const { claimant_name, claimant_email, claim_text, song_id } = result.data;

  const supabase = await createClient();
  const { error } = await supabase.from('takedowns').insert({
    song_id,
    claimant_name,
    claimant_email,
    claim_text,
  });

  if (error) return { error: 'Failed to submit report. Please try again.' };

  return { success: true };
}
