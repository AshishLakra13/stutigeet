'use server';

import { revalidatePath } from 'next/cache';
import { requireContributor } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { parseSongFormData } from '@/lib/song-schema';

export type ContributeActionState = {
  errors?: Record<string, string>;
  ok?: boolean;
};

export async function submitNewSong(
  _prev: ContributeActionState,
  formData: FormData,
): Promise<ContributeActionState> {
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

  // Insert song as unpublished placeholder; contributor becomes the owner
  const { data: song, error: songError } = await supabase
    .from('songs')
    .insert({
      ...result.data,
      copyright_status: 'placeholder',
      is_published: false,
      contributor_id: profile.id,
    })
    .select('id, slug')
    .single();

  if (songError) {
    if (songError.code === '23505') {
      return { errors: { slug: 'A song with this slug already exists.' } };
    }
    return { errors: { form: songError.message } };
  }

  // Create revision snapshot for editor review
  const { error: revError } = await supabase.from('song_revisions').insert({
    song_id: song.id,
    payload: result.data,
    notes,
    author_id: profile.id,
    status: 'pending',
  });

  if (revError) {
    // Best-effort: song was created but revision failed — still show success
    console.error('song_revisions insert failed:', revError.message);
  }

  revalidatePath('/songs');
  return { ok: true };
}
