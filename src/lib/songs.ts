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

export async function getRecentSongs(limit = 5): Promise<Song[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to fetch recent songs: ${error.message}`);
  return (data ?? []) as Song[];
}

export async function getSongCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('songs')
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(`Failed to count songs: ${error.message}`);
  return count ?? 0;
}

// Distinct values for the /songs library filter chips. RLS already
// hides unverified rows, so anon users see only the public set.
export async function getDistinctLanguages(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('songs').select('language');
  if (error) throw new Error(`getDistinctLanguages: ${error.message}`);
  const seen = new Set<string>();
  for (const row of data ?? []) {
    for (const value of (row.language as string[] | null) ?? []) {
      if (value) seen.add(value);
    }
  }
  return Array.from(seen).sort();
}

export async function getDistinctThemes(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('songs').select('themes');
  if (error) throw new Error(`getDistinctThemes: ${error.message}`);
  const seen = new Set<string>();
  for (const row of data ?? []) {
    for (const value of (row.themes as string[] | null) ?? []) {
      if (value) seen.add(value);
    }
  }
  return Array.from(seen).sort();
}
