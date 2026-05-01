'use server';

import { revalidatePath } from 'next/cache';
import { requireEditor } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export type ReviewActionState = {
  error?: string;
  ok?: boolean;
};

// Allowlist: only these editor-visible fields may be applied from a revision payload.
// Never spread the full payload — a contributor controls its contents.
const ALLOWED_REVISION_FIELDS = [
  'title_hi', 'title_en', 'lyrics_chordpro', 'lyrics_chordpro_en',
  'original_key', 'bpm', 'tempo', 'themes', 'language',
  'artist_original', 'youtube_url', 'source_url', 'source_name',
  'copyright_notes', 'copyright_status',
] as const;

export async function approveRevision(
  revisionId: string,
  songId: string,
  _prev: ReviewActionState,
  _formData: FormData,
): Promise<ReviewActionState> {
  const profile = await requireEditor();
  const supabase = await createClient();

  // Fetch revision and verify it belongs to the given song (prevents cross-song splicing)
  const { data: revision, error: revErr } = await supabase
    .from('song_revisions')
    .select('payload, song_id')
    .eq('id', revisionId)
    .single();

  if (revErr || !revision) return { error: 'Revision not found.' };
  if (revision.song_id !== songId) return { error: 'Revision does not belong to this song.' };

  const rawPayload = revision.payload as Record<string, unknown>;

  // Extract only allowed fields from the contributor-controlled payload
  const safePayload = Object.fromEntries(
    ALLOWED_REVISION_FIELDS
      .filter((k) => k in rawPayload && rawPayload[k] !== undefined)
      .map((k) => [k, rawPayload[k]]),
  );

  const { error: songErr } = await supabase
    .from('songs')
    .update({
      ...safePayload,
      is_published: true,
      verified_at: new Date().toISOString(),
      verified_by: profile.id,
    })
    .eq('id', songId);

  if (songErr) {
    console.error('[review/approve] song update error:', songErr.message);
    return { error: 'Failed to apply revision.' };
  }

  const { error: statusErr } = await supabase
    .from('song_revisions')
    .update({
      status: 'approved',
      reviewer_id: profile.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', revisionId);

  if (statusErr) {
    console.error('[review/approve] status update error:', statusErr.message);
    return { error: 'Failed to mark revision approved.' };
  }

  revalidatePath('/admin/review');
  revalidatePath('/songs');
  return { ok: true };
}

export async function rejectRevision(
  revisionId: string,
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const profile = await requireEditor();
  const reason = formData.get('reason')?.toString().trim() || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from('song_revisions')
    .update({
      status: 'rejected',
      reviewer_id: profile.id,
      reviewed_at: new Date().toISOString(),
      reason,
    })
    .eq('id', revisionId);

  if (error) {
    console.error('[review/reject] error:', error.message);
    return { error: 'Failed to reject revision.' };
  }

  revalidatePath('/admin/review');
  return { ok: true };
}
