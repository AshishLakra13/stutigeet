-- =============================================================
-- Migration: drop setlists feature
-- Date:      2026-05-09
-- Context:   The user-curated setlist feature (/sets, /me/sets) was
--            removed. Drop the now-orphaned tables and their RLS
--            policies. Favorites table is retained.
-- =============================================================

drop table if exists setlist_items cascade;
drop table if exists setlists cascade;
