-- =============================================================
-- Migration: song revisions (contribution workflow)
-- Date:      2026-05-05
-- Context:   Versioned, non-destructive edit suggestions.
--            Contributors submit revisions; editors approve/reject.
--            On approval, payload merges into songs and the song is
--            marked published + verified.
-- =============================================================

create table if not exists song_revisions (
  id          uuid        primary key default gen_random_uuid(),
  song_id     uuid        not null references songs(id) on delete cascade,
  payload     jsonb       not null,
  notes       text,
  author_id   uuid        references profiles(id) on delete set null,
  status      text        not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  reviewer_id uuid        references profiles(id) on delete set null,
  reviewed_at timestamptz,
  reason      text,
  created_at  timestamptz not null default now()
);

create index if not exists song_revisions_song_id_idx
  on song_revisions(song_id, created_at desc);

create index if not exists song_revisions_status_idx
  on song_revisions(status, created_at desc);

alter table song_revisions enable row level security;

-- Contributors see own revisions; editors see all
create policy "contributor sees own or editor sees all"
  on song_revisions for select
  using (
    (author_id = auth.uid() and is_contributor_or_above())
    or is_editor_or_above()
  );

create policy "contributor inserts own revision"
  on song_revisions for insert
  with check (
    author_id = auth.uid() and is_contributor_or_above()
  );

create policy "editor updates revision status"
  on song_revisions for update
  using (is_editor_or_above());

create policy "admin deletes revisions"
  on song_revisions for delete
  using (is_admin());

-- =============================================================
-- DOWN:
--   drop table if exists song_revisions;
-- =============================================================
