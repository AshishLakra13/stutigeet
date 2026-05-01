'use server';

import { createClient } from '@/lib/supabase/server';
import { safeNext } from '@/lib/safe-next';
import { isAdminEmail } from '@/lib/admin-allowlist';

type SendMagicLinkState = {
  sent?: boolean;
  error?: string;
};

export async function sendMagicLink(
  _prev: SendMagicLinkState,
  formData: FormData,
): Promise<SendMagicLinkState> {
  const email = formData.get('email')?.toString().trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }

  if (!isAdminEmail(email)) {
    return { error: 'Sign-in is restricted.' };
  }

  const next = safeNext(formData.get('next')?.toString(), '/');
  const origin = resolveOrigin();

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

// Use the canonical site URL from env rather than trusting the Host header,
// which an attacker can forge to redirect magic-link clicks to evil.com.
function resolveOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
}
