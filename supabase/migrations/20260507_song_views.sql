-- Song view tracking: one row per (song, day), idempotent increments
create table if not exists song_views (
  song_id uuid not null references songs(id) on delete cascade,
  day     date not null default current_date,
  count   int  not null default 1,
  primary key (song_id, day)
);

-- Index for trending query: last N days ordered by total views
create index if not exists song_views_day_idx on song_views (day desc, count desc);

-- RLS: public can read (for trending), only the service role writes
alter table song_views enable row level security;

create policy "public_read_song_views"
  on song_views for select
  using (true);

-- No INSERT/UPDATE policy: writes go through a server action / route handler
-- using the service-role key or a SECURITY DEFINER function.

-- Helper function: upsert a view count increment atomically
create or replace function increment_song_view(p_song_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into song_views (song_id, day, count)
  values (p_song_id, current_date, 1)
  on conflict (song_id, day)
  do update set count = song_views.count + 1;
end;
$$;

-- Grant execute to both roles so unauthenticated API calls work
grant execute on function increment_song_view(uuid) to anon, authenticated;
