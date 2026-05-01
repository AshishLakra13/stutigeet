'use server';

import { revalidatePath } from 'next/cache';
import { requireContributor } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { parseSongFormData } from '@/lib/song-schema';

export type RevisionActionState = {
  errors?: Record<string, string>;
  ok?: boolean;
};

export async function submitRevision(
  songId: string,
  slug: string,
  _prev: RevisionActionState,
  formData: FormData,
): Promise<RevisionActionState> {
  const profile = await requireContributor();

  const notes = formData.get('notes')?.toString().trim() || null;

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
  const { error } = await supabase.from('song_revisions').insert({
    song_id: songId,
    payload: result.data,
    notes,
    author_id: profile.id,
    status: 'pending',
  });

  if (error) return { errors: { form: error.message } };

  revalidatePath(`/songs/${slug}`);
  return { ok: true };
}
