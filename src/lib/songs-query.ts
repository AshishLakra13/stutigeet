import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Song } from '@/types/song';

export const PAGE_SIZE = 20;

export type SongListItem = Pick<
  Song,
  'id' | 'slug' | 'title_hi' | 'title_en' | 'original_key' | 'bpm' | 'themes' | 'language'
>;

export type PaginatedSongs = {
  rows: SongListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  from: number;
  to: number;
};

export type SongQuery = {
  page: number;
  q?: string;
  lang?: string;
  tag?: string;
};

const SELECT_COLS =
  'id, slug, title_hi, title_en, original_key, bpm, themes, language';

// TODO: switch to count: 'estimated' once total exceeds ~10k rows.
export async function getPaginatedSongs(input: SongQuery): Promise<PaginatedSongs> {
  const supabase = await createClient();
  const page = Math.max(1, input.page);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('songs')
    .select(SELECT_COLS, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (input.lang) query = query.contains('language', [input.lang]);
  if (input.tag) query = query.contains('themes', [input.tag]);

  const trimmed = input.q?.trim();
  if (trimmed && trimmed.length >= 2) {
    const escaped = trimmed.replace(/[%_\\]/g, '\\$&');
    const needle = `%${escaped}%`;
    query = query.or(`title_hi.ilike.${needle},title_en.ilike.${needle}`);
  }

  const { data, error, count } = await query;

  if (error) {
    // PGRST103: offset is beyond the last row — not a fatal error, just an
    // out-of-range page. Do a count-only query to return the real total so
    // the caller can show the "Go to last page" empty state.
    if (error.code === 'PGRST103') {
      let countQuery = supabase
        .from('songs')
        .select(SELECT_COLS, { count: 'exact', head: true });
      if (input.lang) countQuery = countQuery.contains('language', [input.lang]);
      if (input.tag) countQuery = countQuery.contains('themes', [input.tag]);
      const trimmed2 = input.q?.trim();
      if (trimmed2 && trimmed2.length >= 2) {
        const escaped2 = trimmed2.replace(/[%_\\]/g, '\\$&');
        countQuery = countQuery.or(
          `title_hi.ilike.%${escaped2}%,title_en.ilike.%${escaped2}%`,
        );
      }
      const { count: fallbackCount } = await countQuery;
      const total2 = fallbackCount ?? 0;
      return {
        rows: [],
        total: total2,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.max(1, Math.ceil(total2 / PAGE_SIZE)),
        from: 0,
        to: 0,
      };
    }
    throw new Error(`getPaginatedSongs: ${error.message}`);
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = (data ?? []) as SongListItem[];

  return {
    rows,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
    from: rows.length === 0 ? 0 : from + 1,
    to: rows.length === 0 ? 0 : from + rows.length,
  };
}
