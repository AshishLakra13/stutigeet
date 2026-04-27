-- =============================================================
-- Migration: hide scraped 'unverified' songs from public reads
-- Date:      2026-04-27
-- Context:   The scraper writes copyright_status='unverified' for
--            every scraped row. We don't want those rendering on
--            the public site until an admin reviews them.
--
--            copyright_status is a plain text column (no PG enum),
--            so no type alteration is needed — just an RLS policy
--            update plus an optional CHECK constraint to keep the
--            allowed-values list explicit.
-- =============================================================

-- 1. Allowed-values check (additive — keeps existing rows valid).
alter table songs drop constraint if exists songs_copyright_status_check;
alter table songs
  add constraint songs_copyright_status_check
  check (
    copyright_status is null
    or copyright_status in (
      'public_domain',
      'original',
      'licensed',
      'permission_granted',
      'placeholder',
      'unverified'
    )
  );

-- 2. Replace the public-read policy with one that filters out
--    'unverified' rows. Admins (via is_admin()) still see everything.
drop policy if exists "songs are publicly readable" on songs;
create policy "songs are publicly readable"
  on songs for select
  using (
    copyright_status is distinct from 'unverified'
    or is_admin()
  );

-- =============================================================
-- Verification:
--   select unnest(array[
--     'public_domain', 'original', 'licensed',
--     'permission_granted', 'placeholder', 'unverified'
--   ]) as allowed;
--
--   -- As anon: should return 0 rows for an 'unverified' song.
--   set role anon;
--   select count(*) from songs where copyright_status = 'unverified';
--   reset role;
-- =============================================================
