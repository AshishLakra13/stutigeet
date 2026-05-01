-- ============================================================
-- Phase 6.1 — Profiles RBAC + Google OAuth support
-- ============================================================
-- Adds display_name and avatar_url to profiles, expands role
-- enum to viewer|contributor|editor|admin, updates
-- handle_new_user() to seed Google OAuth metadata, and adds
-- is_editor_or_above() / is_contributor_or_above() helpers.
-- Songs write policies now allow editor+ (not admin-only).
-- ============================================================

-- 1. Add new columns to profiles (idempotent with IF NOT EXISTS workaround)
alter table profiles
  add column if not exists display_name text,
  add column if not exists avatar_url   text;

-- 2. Expand role constraint to include contributor and editor
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles
  add constraint profiles_role_check
  check (role in ('viewer', 'contributor', 'editor', 'admin'));

-- 3. Update handle_new_user() to seed display_name + avatar_url from OAuth metadata
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 4. is_editor_or_above(): true for editor or admin
create or replace function is_editor_or_above()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and role in ('editor', 'admin')
  );
$$;

-- 5. is_contributor_or_above(): true for contributor, editor, or admin
create or replace function is_contributor_or_above()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and role in ('contributor', 'editor', 'admin')
  );
$$;

-- 6. Update songs write policies: editor+ can insert/update; admin-only for delete
drop policy if exists "admins insert songs" on songs;
create policy "editors insert songs"
  on songs for insert
  with check (is_editor_or_above());

drop policy if exists "admins update songs" on songs;
create policy "editors update songs"
  on songs for update
  using (is_editor_or_above());

-- delete stays admin-only (no change needed to existing policy)

-- 7. Allow users to update their own profile display_name and avatar_url
drop policy if exists "users update own profile" on profiles;
create policy "users update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
