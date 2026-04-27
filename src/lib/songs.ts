import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Song } from '@/types/song';

export async function getAllSongs(): Promise<Song[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to fetch songs: ${error.message}`);
  return (data ?? []) as Song[];
}

export async function getSongBySlug(slug: string): Promise<Song | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new Error(`Failed to fetch song "${slug}": ${error.message}`);
  return (data as Song | null) ?? null;
}
