'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';

export async function toggleFavorite(songId: string): Promise<{ favorited: boolean }> {
  const user = await getUser();
  if (!user) throw new Error('Not signed in');

  const supabase = await createClient();

  // Try to delete; if deleted → was favorited, now un-favorited
  const { count } = await supabase
    .from('favorites')
    .delete({ count: 'exact' })
    .eq('user_id', user.id)
    .eq('song_id', songId);

  if ((count ?? 0) > 0) {
    revalidatePath('/me/favorites');
    return { favorited: false };
  }

  // Not found → insert
  await supabase.from('favorites').insert({ user_id: user.id, song_id: songId });
  revalidatePath('/me/favorites');
  return { favorited: true };
}
