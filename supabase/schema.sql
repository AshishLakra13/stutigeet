-- =============================================================
-- Stuti Geet — Database Schema
-- Run this in Supabase Studio → SQL Editor
-- =============================================================

-- Songs table
create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_hi text,
  title_en text,
  lyrics_chordpro text not null,
  lyrics_chordpro_en text,
  original_key text,
  bpm int,
  tempo text,                        -- 'slow' | 'mid' | 'fast'
  themes text[],                     -- e.g. ['praise', 'communion', 'christmas']
  language text[],                   -- e.g. ['hi', 'en']
  artist_original text,
  youtube_url text,
  copyright_status text,             -- 'public_domain' | 'original' | 'licensed' | 'permission_granted' | 'placeholder'
  copyright_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_sung_at date
);

-- Indexes for common queries
create index if not exists songs_slug_idx on songs(slug);
create index if not exists songs_themes_idx on songs using gin(themes);
create index if not exists songs_language_idx on songs using gin(language);
create index if not exists songs_created_at_idx on songs(created_at desc);

-- Auto-update updated_at on row changes
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_songs_updated_at on songs;
create trigger set_songs_updated_at
  before update on songs
  for each row
  execute function update_updated_at_column();

-- RLS: public read, no public write (admin write policies added in Phase 3)
alter table songs enable row level security;

drop policy if exists "songs are publicly readable" on songs;
create policy "songs are publicly readable"
  on songs for select
  using (true);
