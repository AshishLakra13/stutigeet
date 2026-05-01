import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type TrendingSong = {
  song_id: string;
  total: number;
  slug: string;
  title_hi: string | null;
  title_en: string | null;
  original_key: string | null;
};

export async function getTrendingSongs(days = 7, limit = 10): Promise<TrendingSong[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('song_views')
    .select('song_id, count, songs(slug, title_hi, title_en, original_key)')
    .gte('day', since)
    .order('count', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  type ViewRow = {
    song_id: string;
    count: number;
    songs: { slug: string; title_hi: string | null; title_en: string | null; original_key: string | null } | null;
  };

  const rows = data as unknown as ViewRow[];
  const byId = new Map<string, TrendingSong>();
  for (const row of rows) {
    if (!row.songs) continue;
    const existing = byId.get(row.song_id);
    if (existing) {
      existing.total += row.count;
    } else {
      byId.set(row.song_id, {
        song_id: row.song_id,
        total: row.count,
        ...row.songs,
      });
    }
  }

  return Array.from(byId.values()).sort((a, b) => b.total - a.total).slice(0, limit);
}
