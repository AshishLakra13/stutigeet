import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Role = 'viewer' | 'contributor' | 'editor' | 'admin';

export type Profile = {
  id: string;
  email: string;
  role: Role;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

/** Returns the current Supabase auth user, or null if not signed in. */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Returns the current user's profile row, or null. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, email, role, display_name, avatar_url, created_at')
    .eq('id', user.id)
    .maybeSingle();

  return (data as Profile | null) ?? null;
}

/**
 * Server-side admin guard.
 * Redirects to /login if not signed in, to / if not admin.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?next=/admin');
  if (profile.role !== 'admin') redirect('/');
  return profile;
}

/**
 * Server-side editor-or-above guard.
 * Redirects to /login if not signed in, to / if below editor.
 */
export async function requireEditor(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (profile.role !== 'editor' && profile.role !== 'admin') redirect('/');
  return profile;
}

/**
 * Server-side contributor-or-above guard.
 * Redirects to /login if not signed in, to / if below contributor.
 */
export async function requireContributor(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (profile.role === 'viewer') redirect('/');
  return profile;
}
