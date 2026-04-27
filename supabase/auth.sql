-- =============================================================
-- Stuti Geet — Auth & Admin SQL (Phase 3)
-- Run AFTER supabase/schema.sql in Supabase Studio → SQL Editor
-- =============================================================

-- ── Profiles table (1:1 with auth.users) ─────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  created_at timestamptz default now()
);

-- ── Trigger: auto-create profile row on first sign-in ────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── is_admin() helper ─────────────────────────────────────────
-- SECURITY DEFINER so it runs without RLS on profiles,
-- preventing infinite recursion when song policies call it.
create or replace function is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── RLS on profiles ───────────────────────────────────────────
alter table profiles enable row level security;

drop policy if exists "users read own profile" on profiles;
create policy "users read own profile"
  on profiles for select
  using (auth.uid() = id);

-- ── Write policies on songs ───────────────────────────────────
drop policy if exists "admins insert songs" on songs;
create policy "admins insert songs"
  on songs for insert
  with check (is_admin());

drop policy if exists "admins update songs" on songs;
create policy "admins update songs"
  on songs for update
  using (is_admin());

drop policy if exists "admins delete songs" on songs;
create policy "admins delete songs"
  on songs for delete
  using (is_admin());

-- =============================================================
-- One-time: after your first magic-link sign-in, run this to
-- promote yourself to admin:
--
--   update profiles
--   set role = 'admin'
--   where email = 'ashishlakra13@gmail.com';
--
-- =============================================================
