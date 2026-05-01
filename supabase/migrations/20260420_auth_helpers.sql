-- Bootstrap auth helpers so the migration chain is self-contained.
-- These objects are also defined in supabase/auth.sql (the manual setup script).
-- Using CREATE OR REPLACE / IF NOT EXISTS makes both paths idempotent.

-- Profiles table (idempotent — schema.sql may have already created it)
create table if not exists profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  email     text not null,
  role      text not null default 'viewer'
              check (role in ('viewer', 'contributor', 'editor', 'admin')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy if not exists "users read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Auto-create profile row on first sign-in
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

-- updated_at trigger helper (used by songs and setlists)
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- is_admin() — SECURITY DEFINER to avoid RLS recursion on profiles
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
