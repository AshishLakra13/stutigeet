-- =============================================================
-- Migration: favorites and setlists
-- Date:      2026-05-06
-- Context:   Personal favorites (heart/un-heart), personal and public
--            setlists with song ordering and per-item key/capo overrides.
-- =============================================================

-- ── 1. Favorites ─────────────────────────────────────────────
create table if not exists favorites (
  user_id    uuid not null references profiles(id) on delete cascade,
  song_id    uuid not null references songs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, song_id)
);

alter table favorites enable row level security;

create policy "owner can select favorites"
  on favorites for select
  using (auth.uid() = user_id);

create policy "owner can insert favorites"
  on favorites for insert
  with check (auth.uid() = user_id);

create policy "owner can delete favorites"
  on favorites for delete
  using (auth.uid() = user_id);

-- ── 2. Setlists ───────────────────────────────────────────────
create table if not exists setlists (
  id           uuid        primary key default gen_random_uuid(),
  slug         text        not null,
  owner_id     uuid        not null references profiles(id) on delete cascade,
  title        text        not null,
  service_date date,
  is_public    boolean     not null default false,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (owner_id, slug)
);

create index if not exists setlists_owner_idx on setlists(owner_id, created_at desc);

create or replace trigger setlists_updated_at
  before update on setlists
  for each row execute procedure update_updated_at_column();

alter table setlists enable row level security;

-- Owner can do everything
create policy "owner can manage setlist"
  on setlists for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Public can read public setlists
create policy "public can view public setlists"
  on setlists for select
  using (is_public = true);

-- ── 3. Setlist items ──────────────────────────────────────────
create table if not exists setlist_items (
  id           uuid    primary key default gen_random_uuid(),
  setlist_id   uuid    not null references setlists(id) on delete cascade,
  song_id      uuid    not null references songs(id) on delete cascade,
  position     int     not null,
  key_override text,
  capo_override int,
  notes        text,
  unique (setlist_id, position)
);

create index if not exists setlist_items_setlist_idx
  on setlist_items(setlist_id, position);

alter table setlist_items enable row level security;

-- Items inherit access from their parent setlist
create policy "owner can manage items"
  on setlist_items for all
  using (
    exists (
      select 1 from setlists
      where setlists.id = setlist_id
        and setlists.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from setlists
      where setlists.id = setlist_id
        and setlists.owner_id = auth.uid()
    )
  );

create policy "public can view items for public setlists"
  on setlist_items for select
  using (
    exists (
      select 1 from setlists
      where setlists.id = setlist_id
        and setlists.is_public = true
    )
  );

-- =============================================================
-- DOWN:
--   drop table if exists setlist_items;
--   drop table if exists setlists;
--   drop table if exists favorites;
-- =============================================================
