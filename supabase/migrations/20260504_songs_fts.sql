-- =============================================================
-- Migration: full-text search for songs
-- Date:      2026-05-04
-- Context:   Adds a stored tsvector column over Hindi/English title,
--            artist, and lyrics for fast FTS with ts_rank ordering.
--            unaccent is used so Latin-script queries don't fail on
--            accented characters in artist names.
-- =============================================================

-- ── 1. Enable unaccent ───────────────────────────────────────
create extension if not exists unaccent with schema extensions;

-- Public schema wrapper so the GENERATED column can reference it
-- without schema-qualifying, and so IMMUTABLE is guaranteed.
create or replace function unaccent(text)
  returns text
  language sql immutable strict parallel safe
  as $$ select extensions.unaccent($1) $$;

-- ── 2. Generated tsvector column ─────────────────────────────
alter table songs
  add column if not exists search_tsv tsvector
    generated always as (
      setweight(to_tsvector('simple', unaccent(coalesce(title_hi, ''))), 'A') ||
      setweight(to_tsvector('simple', unaccent(coalesce(title_en, ''))), 'A') ||
      setweight(to_tsvector('simple', unaccent(coalesce(artist_original, ''))), 'B') ||
      setweight(to_tsvector('simple', unaccent(coalesce(lyrics_chordpro, ''))), 'C')
    ) stored;

-- ── 3. GIN index ─────────────────────────────────────────────
create index if not exists songs_search_tsv_idx
  on songs using gin(search_tsv);

-- Keep the existing trgm indexes as the ILIKE fallback layer.
-- (They were created in 20260428_songs_pagination_search_indexes.sql)

-- =============================================================
-- DOWN:
--   drop index if exists songs_search_tsv_idx;
--   alter table songs drop column if exists search_tsv;
--   drop function if exists unaccent(text);
--   drop extension if exists unaccent;
-- =============================================================
