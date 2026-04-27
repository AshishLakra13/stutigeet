-- =============================================================
-- Migration: indexes for paginated /songs library
-- Date:      2026-04-28
-- Context:   The /songs page moves from "fetch everything, search
--            client-side with Fuse.js" to server-side pagination
--            with .range() + count and bilingual fuzzy search.
--            These indexes make that pattern cheap.
--
--            Note: the original brief asked for a composite
--            (language, created_at desc) index. `language` is a
--            text[] array column, so a composite B-tree is the
--            wrong shape. The idiomatic equivalent is:
--              - B-tree on created_at desc (default sort)
--              - GIN on language          (array containment)
--              - GIN on themes            (array containment)
--              - GIN trgm on title_hi/_en (fuzzy ILIKE)
-- =============================================================

create extension if not exists pg_trgm;

-- 1. Default sort + LIMIT/OFFSET pagination.
create index if not exists songs_created_at_desc_idx
  on songs (created_at desc);

-- 2. Array containment filters: ?lang=hi, ?tag=worship.
create index if not exists songs_language_gin_idx
  on songs using gin (language);

create index if not exists songs_themes_gin_idx
  on songs using gin (themes);

-- 3. Fuzzy bilingual search via ILIKE %q% (and similarity() if we
--    later switch to similarity-ranked search).
create index if not exists songs_title_hi_trgm_idx
  on songs using gin (title_hi gin_trgm_ops);

create index if not exists songs_title_en_trgm_idx
  on songs using gin (title_en gin_trgm_ops);

-- =============================================================
-- Verification:
--   explain analyze
--     select id, slug, title_hi from songs
--     where language @> array['hi']
--     order by created_at desc
--     limit 20 offset 40;
--   -- Expect: Index Scan on songs_created_at_desc_idx
--   --         + Bitmap Index Scan on songs_language_gin_idx
--
--   explain analyze
--     select id, slug from songs
--     where title_hi ilike '%यीशु%' or title_en ilike '%yeshu%';
--   -- Expect: Bitmap Index Scan on songs_title_hi_trgm_idx
--   --         and songs_title_en_trgm_idx
-- =============================================================
