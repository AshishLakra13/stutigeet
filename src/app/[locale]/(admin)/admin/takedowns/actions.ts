'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin, getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const reviewSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(['upheld', 'rejected']),
  reason: z.string().max(500).optional(),
});

export async function reviewTakedown(formData: FormData): Promise<void> {
  const profile = await requireAdmin();

  const result = reviewSchema.safeParse({
    id: formData.get('id'),
    action: formData.get('action'),
    reason: formData.get('reason') || undefined,
  });

  if (!result.success) return;
  const { id, action, reason } = result.data;

  const supabase = await createClient();

  await supabase
    .from('takedowns')
    .update({
      status: action,
      reviewer_id: profile.id,
      reviewed_at: new Date().toISOString(),
      reason: reason ?? null,
    })
    .eq('id', id);

  // If rejected: re-publish the song
  if (action === 'rejected') {
    const { data: takedown } = await supabase
      .from('takedowns')
      .select('song_id')
      .eq('id', id)
      .single();

    if (takedown?.song_id) {
      await supabase
        .from('songs')
        .update({ is_published: true })
        .eq('id', takedown.song_id);
    }
  }

  revalidatePath('/admin/takedowns');
}
