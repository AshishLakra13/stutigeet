import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Profile = {
  id: string;
  email: string;
  role: 'viewer' | 'admin';
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
    .select('id, email, role, created_at')
    .eq('id', user.id)
    .maybeSingle();

  return (data as Profile | null) ?? null;
}

/**
 * Server-side admin guard.
 * Call at the top of any admin Server Component or Server Action.
 * Redirects to /login if not signed in, to / if signed in but not admin.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login?next=/admin');
  }

  if (profile.role !== 'admin') {
    redirect('/');
  }

  return profile;
}
