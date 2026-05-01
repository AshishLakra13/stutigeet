-- =============================================================
-- Migration: copyright provenance, takedowns, verification gate
-- Date:      2026-05-03
-- Context:   Extends songs with provenance metadata; adds takedown
--            workflow; adds site_settings for the verification gate.
--
--            Key decision: scraped 'unverified' rows now render
--            publicly with a trust-panel banner.  The gate (strict
--            mode) is feature-flag–controlled via site_settings and/or
--            the STRICT_VERIFICATION_GATE env var.
-- =============================================================

-- ── 1. Extend copyright_status CHECK ─────────────────────────
alter table songs drop constraint if exists songs_copyright_status_check;
alter table songs
  add constraint songs_copyright_status_check
  check (
    copyright_status is null
    or copyright_status in (
      'public_domain', 'original', 'licensed',
      'permission_granted', 'placeholder', 'unverified',
      'cc_by', 'cc_by_sa'
    )
  );

-- ── 2. Add provenance columns to songs ───────────────────────
alter table songs
  add column if not exists source_url       text,
  add column if not exists source_name      text,
  add column if not exists contributor_id   uuid references profiles(id) on delete set null,
  add column if not exists verified_at      timestamptz,
  add column if not exists verified_by      uuid references profiles(id) on delete set null,
  add column if not exists is_published     boolean not null default true;

-- ── 3. Update public-read RLS: hide only takedown'd songs ────
-- Previously filtered out 'unverified'. New design shows all
-- songs with a banner; only is_published=false rows are hidden.
drop policy if exists "songs are publicly readable" on songs;
create policy "songs are publicly readable"
  on songs for select
  using (is_published = true or is_admin());

-- ── 4. Backfill verified_at for already-known-clean songs ────
update songs
  set verified_at = now()
  where copyright_status in ('public_domain', 'original', 'licensed', 'permission_granted')
    and verified_at is null;

-- ── 5. takedowns table ───────────────────────────────────────
create table if not exists takedowns (
  id             uuid        primary key default gen_random_uuid(),
  song_id        uuid        not null references songs(id) on delete cascade,
  claimant_name  text        not null,
  claimant_email text        not null,
  claim_text     text        not null,
  status         text        not null default 'received'
                               check (status in ('received','reviewing','upheld','rejected')),
  received_at    timestamptz not null default now(),
  reviewer_id    uuid        references profiles(id) on delete set null,
  reviewed_at    timestamptz,
  reason         text
);

alter table takedowns enable row level security;

create policy "takedowns admin read"   on takedowns for select using (is_admin());
create policy "takedowns public insert" on takedowns for insert with check (true);
create policy "takedowns admin update" on takedowns for update using (is_admin());
create policy "takedowns admin delete" on takedowns for delete using (is_admin());

-- ── 6. Trigger: auto-unpublish song on takedown receipt ──────
create or replace function handle_new_takedown()
  returns trigger language plpgsql security definer as $$
begin
  update songs
    set is_published     = false,
        copyright_status = 'unverified',
        verified_at      = null
    where id = new.song_id;
  return new;
end;
$$;

drop trigger if exists on_takedown_insert on takedowns;
create trigger on_takedown_insert
  after insert on takedowns
  for each row execute procedure handle_new_takedown();

-- ── 7. site_settings table ───────────────────────────────────
create table if not exists site_settings (
  key        text        primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now(),
  updated_by uuid        references profiles(id) on delete set null
);

alter table site_settings enable row level security;

create policy "site_settings admin only"
  on site_settings
  using (is_admin())
  with check (is_admin());

-- ── 8. Seed default gate settings ───────────────────────────
insert into site_settings (key, value)
  values ('strict_verification_gate', '{"enabled": false, "grace_days": 30}')
  on conflict (key) do nothing;

-- =============================================================
-- DOWN (for reference — never edit an applied migration):
--   drop trigger if exists on_takedown_insert on takedowns;
--   drop function if exists handle_new_takedown();
--   drop table if exists site_settings;
--   drop table if exists takedowns;
--   alter table songs
--     drop column if exists is_published,
--     drop column if exists verified_by,
--     drop column if exists verified_at,
--     drop column if exists contributor_id,
--     drop column if exists source_name,
--     drop column if exists source_url;
--   drop policy if exists "songs are publicly readable" on songs;
--   create policy "songs are publicly readable" on songs for select
--     using (copyright_status is distinct from 'unverified' or is_admin());
--   alter table songs drop constraint if exists songs_copyright_status_check;
--   alter table songs add constraint songs_copyright_status_check
--     check (copyright_status is null or copyright_status in (
--       'public_domain','original','licensed','permission_granted','placeholder','unverified'));
-- =============================================================
