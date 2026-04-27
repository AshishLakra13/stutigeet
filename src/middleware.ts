import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { buildCspHeader } from '@/lib/csp';

export async function middleware(request: NextRequest) {
  // Per-request CSP nonce. Server components read it via headers().get('x-nonce').
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCspHeader(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const { supabaseResponse, user, supabase } = await updateSession(
    request,
    requestHeaders,
  );

  const { pathname } = request.nextUrl;

  // Gate all /admin/* routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('next', pathname);
      const redirect = NextResponse.redirect(loginUrl);
      redirect.headers.set('Content-Security-Policy', csp);
      return redirect;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = '/';
      homeUrl.searchParams.delete('next');
      const redirect = NextResponse.redirect(homeUrl);
      redirect.headers.set('Content-Security-Policy', csp);
      return redirect;
    }
  }

  supabaseResponse.headers.set('Content-Security-Policy', csp);
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico, manifest.json, sw.js, icons/*
     */
    '/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icons/).*)',
  ],
};
