import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Song } from '@/types/song';
import { isRomanScript, toDevanagariCandidates } from '@/lib/translit';

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

type QueryResult = { rows: SongListItem[]; total: number; outOfRange: boolean };

function formatResult(result: QueryResult, page: number): PaginatedSongs {
  const { rows, total } = result;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeFrom = (page - 1) * PAGE_SIZE;
  return {
    rows,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
    from: rows.length === 0 ? 0 : rangeFrom + 1,
    to: rows.length === 0 ? 0 : rangeFrom + rows.length,
  };
}

// TODO: switch to count: 'estimated' once total exceeds ~10k rows.
export async function getPaginatedSongs(input: SongQuery): Promise<PaginatedSongs> {
  const supabase = await createClient();
  const page = Math.max(1, input.page);
  const rangeFrom = (page - 1) * PAGE_SIZE;
  const rangeTo = rangeFrom + PAGE_SIZE - 1;

  const trimmed = input.q?.trim();
  const hasSearch = !!trimmed && trimmed.length >= 2;

  function buildBase() {
    let q = supabase
      .from('songs')
      .select(SELECT_COLS, { count: 'exact' })
      .order('created_at', { ascending: false });
    if (input.lang) q = q.contains('language', [input.lang]);
    if (input.tag) q = q.contains('themes', [input.tag]);
    return q;
  }

  async function runPaginated(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    baseQuery: any,
  ): Promise<QueryResult> {
    const { data, count, error } = await baseQuery.range(rangeFrom, rangeTo);
    if (error?.code === 'PGRST103') {
      // Page is beyond the last row — do a count-only call for the empty state UI.
      const { count: total } = await baseQuery.range(0, 0);
      return { rows: [], total: total ?? 0, outOfRange: true };
    }
    if (error) throw new Error(`getPaginatedSongs: ${error.message}`);
    return { rows: (data ?? []) as SongListItem[], total: count ?? 0, outOfRange: false };
  }

  if (!hasSearch) {
    return formatResult(await runPaginated(buildBase()), page);
  }

  // ── Tier 1: Full-text search via stored tsvector ──────────────────────────
  // Falls back gracefully if the search_tsv column doesn't exist yet
  // (pre-migration environment).
  try {
    const ftsResult = await runPaginated(
      buildBase().textSearch('search_tsv', trimmed, { type: 'websearch', config: 'simple' }),
    );
    if (ftsResult.total > 0) return formatResult(ftsResult, page);
  } catch {
    // search_tsv column not yet migrated — continue to ILIKE fallback
  }

  // ── Tier 2: ILIKE on title columns ───────────────────────────────────────
  const escaped = trimmed.replace(/[%_\\]/g, '\\$&');
  const ilikeResult = await runPaginated(
    buildBase().or(`title_hi.ilike.%${escaped}%,title_en.ilike.%${escaped}%`),
  );
  if (ilikeResult.total > 0) return formatResult(ilikeResult, page);

  // ── Tier 3: Transliteration (Roman → Devanagari candidates) ──────────────
  if (isRomanScript(trimmed)) {
    const candidates = toDevanagariCandidates(trimmed);
    if (candidates.length > 0) {
      const filter = candidates
        .map((c) => `title_hi.ilike.%${c.replace(/[%_\\]/g, '\\$&')}%`)
        .join(',');
      const translitResult = await runPaginated(buildBase().or(filter));
      if (translitResult.total > 0) return formatResult(translitResult, page);
    }
  }

  return formatResult({ rows: [], total: 0, outOfRange: false }, page);
}
