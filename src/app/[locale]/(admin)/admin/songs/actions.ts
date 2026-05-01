'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { parseSongFormData } from '@/lib/song-schema';

export type ActionState = {
  errors?: Record<string, string>;
  ok?: boolean;
};

// ── Create ────────────────────────────────────────────────────────────────────

export async function createSong(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const result = parseSongFormData(formData);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0]?.toString() ?? 'form';
      errors[key] = issue.message;
    }
    return { errors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('songs').insert(result.data);

  if (error) {
    if (error.code === '23505') {
      return { errors: { slug: 'A song with this slug already exists.' } };
    }
    return { errors: { form: error.message } };
  }

  revalidatePath('/songs');
  revalidatePath('/admin/songs');
  redirect('/admin/songs');
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateSong(
  slug: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const result = parseSongFormData(formData);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0]?.toString() ?? 'form';
      errors[key] = issue.message;
    }
    return { errors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('songs')
    .update(result.data)
    .eq('slug', slug);

  if (error) {
    if (error.code === '23505') {
      return { errors: { slug: 'A song with this slug already exists.' } };
    }
    return { errors: { form: error.message } };
  }

  revalidatePath('/songs');
  revalidatePath('/admin/songs');
  revalidatePath('/songs/[slug]', 'page');
  redirect('/admin/songs');
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteSong(slug: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  await supabase.from('songs').delete().eq('slug', slug);

  revalidatePath('/songs');
  revalidatePath('/admin/songs');
  redirect('/admin/songs');
}
