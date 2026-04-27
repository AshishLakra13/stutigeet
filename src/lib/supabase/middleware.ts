import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase session on every request and forwards the
 * updated cookies to both the request and the response.
 * This is the canonical @supabase/ssr middleware pattern.
 *
 * Pass `requestHeaders` to inject extra headers (e.g. an `x-nonce` for CSP)
 * that should be visible to server components via `next/headers`.
 */
export async function updateSession(
  request: NextRequest,
  requestHeaders?: Headers,
) {
  const nextOptions = requestHeaders
    ? { request: { headers: requestHeaders } }
    : { request };

  let supabaseResponse = NextResponse.next(nextOptions);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next(nextOptions);
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — IMPORTANT: do not remove this call.
  // It keeps the session alive and writes updated tokens to cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user, supabase };
}
