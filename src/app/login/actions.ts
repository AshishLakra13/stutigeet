'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { safeNext } from '@/lib/safe-next';

type SendMagicLinkState = {
  sent?: boolean;
  error?: string;
};

const ALLOWED_ADMIN_EMAILS = new Set(['ashishlakra13@gmail.com']);

export async function sendMagicLink(
  _prev: SendMagicLinkState,
  formData: FormData,
): Promise<SendMagicLinkState> {
  const email = formData.get('email')?.toString().trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }

  const next = safeNext(formData.get('next')?.toString());
  const origin = await resolveOrigin();

  // Silently no-op for non-allowlisted emails so we don't reveal who is admin.
  if (!ALLOWED_ADMIN_EMAILS.has(email)) {
    return { sent: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { sent: true };
}

async function resolveOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (host) {
    const proto =
      h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}
