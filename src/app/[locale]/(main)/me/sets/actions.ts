'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/slug';

export type SetlistActionState = {
  error?: string;
  ok?: boolean;
};

// Verifies the setlist exists and is owned by the current user.
// Returns null if ownership check fails.
async function requireSetlistOwner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  setlistId: string,
  userId: string,
) {
  const { data } = await supabase
    .from('setlists')
    .select('id')
    .eq('id', setlistId)
    .eq('owner_id', userId)
    .single();
  return data;
}

// ── Create ────────────────────────────────────────────────────

export async function createSetlist(formData: FormData): Promise<void> {
  const user = await getUser();
  if (!user) return;

  const title = formData.get('title')?.toString().trim();
  if (!title) return;

  const serviceDate = formData.get('service_date')?.toString().trim() || null;
  const slug = slugify(title) || `set-${Date.now()}`;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('setlists')
    .insert({ owner_id: user.id, title, slug, service_date: serviceDate })
    .select('id')
    .single();

  if (error || !data) return;

  revalidatePath('/me/sets');
  redirect(`/me/sets/${data.id}`);
}

// ── Update metadata ───────────────────────────────────────────

export async function updateSetlist(setlistId: string, formData: FormData): Promise<void> {
  const user = await getUser();
  if (!user) return;

  const title = formData.get('title')?.toString().trim();
  const isPublic = formData.get('is_public') === 'true';
  const serviceDate = formData.get('service_date')?.toString().trim() || null;
  const notes = formData.get('notes')?.toString().trim() || null;

  if (!title) return;

  const supabase = await createClient();
  await supabase
    .from('setlists')
    .update({ title, is_public: isPublic, service_date: serviceDate, notes })
    .eq('id', setlistId)
    .eq('owner_id', user.id);

  revalidatePath(`/me/sets/${setlistId}`);
  revalidatePath('/me/sets');
}

// ── Delete ────────────────────────────────────────────────────

export async function deleteSetlist(setlistId: string): Promise<void> {
  const user = await getUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from('setlists').delete().eq('id', setlistId).eq('owner_id', user.id);

  revalidatePath('/me/sets');
  redirect('/me/sets');
}

// ── Add song to setlist ───────────────────────────────────────

export async function addSongToSetlist(
  setlistId: string,
  songId: string,
): Promise<SetlistActionState> {
  const user = await getUser();
  if (!user) return { error: 'Not signed in.' };

  const supabase = await createClient();

  const owned = await requireSetlistOwner(supabase, setlistId, user.id);
  if (!owned) return { error: 'Setlist not found.' };

  const { data: items } = await supabase
    .from('setlist_items')
    .select('position')
    .eq('setlist_id', setlistId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = (items?.[0]?.position ?? 0) + 1;

  const { error } = await supabase.from('setlist_items').insert({
    setlist_id: setlistId,
    song_id: songId,
    position: nextPosition,
  });

  if (error) {
    if (error.code === '23505') return { error: 'This song is already in the setlist.' };
    return { error: 'Failed to add song.' };
  }

  revalidatePath(`/me/sets/${setlistId}`);
  return { ok: true };
}

// ── Remove song from setlist ──────────────────────────────────

export async function removeSongFromSetlist(
  itemId: string,
  setlistId: string,
): Promise<void> {
  const user = await getUser();
  if (!user) return;

  const supabase = await createClient();

  // Verify ownership at query level — never rely solely on RLS for mutation safety
  const owned = await requireSetlistOwner(supabase, setlistId, user.id);
  if (!owned) return;

  await supabase
    .from('setlist_items')
    .delete()
    .eq('id', itemId)
    .eq('setlist_id', setlistId);

  revalidatePath(`/me/sets/${setlistId}`);
}

// ── Update item overrides ─────────────────────────────────────

export async function updateSetlistItem(
  itemId: string,
  setlistId: string,
  updates: { key_override?: string | null; capo_override?: number | null; notes?: string | null },
): Promise<SetlistActionState> {
  const user = await getUser();
  if (!user) return { error: 'Not signed in.' };

  const supabase = await createClient();

  const owned = await requireSetlistOwner(supabase, setlistId, user.id);
  if (!owned) return { error: 'Setlist not found.' };

  const { error } = await supabase
    .from('setlist_items')
    .update(updates)
    .eq('id', itemId)
    .eq('setlist_id', setlistId);

  if (error) return { error: 'Failed to update item.' };

  revalidatePath(`/me/sets/${setlistId}`);
  return { ok: true };
}

// ── Reorder items ─────────────────────────────────────────────

export async function reorderSetlistItems(
  setlistId: string,
  orderedIds: string[],
): Promise<SetlistActionState> {
  const user = await getUser();
  if (!user) return { error: 'Not signed in.' };

  const supabase = await createClient();

  const owned = await requireSetlistOwner(supabase, setlistId, user.id);
  if (!owned) return { error: 'Setlist not found.' };

  // Batch update positions — use temp negative positions first to avoid UNIQUE violations
  const negUpdates = orderedIds.map((id, idx) =>
    supabase
      .from('setlist_items')
      .update({ position: -(idx + 1) })
      .eq('id', id)
      .eq('setlist_id', setlistId),
  );
  await Promise.all(negUpdates);

  const posUpdates = orderedIds.map((id, idx) =>
    supabase
      .from('setlist_items')
      .update({ position: idx + 1 })
      .eq('id', id)
      .eq('setlist_id', setlistId),
  );
  await Promise.all(posUpdates);

  revalidatePath(`/me/sets/${setlistId}`);
  return { ok: true };
}
