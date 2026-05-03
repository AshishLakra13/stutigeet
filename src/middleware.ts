import { type NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { buildCspHeader, buildEmbedCspHeader } from '@/lib/csp';
import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Per-request CSP nonce. Server components read it via headers().get('x-nonce').
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCspHeader(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const { pathname } = request.nextUrl;

  // Embed routes: allow framing, skip intl
  if (pathname.startsWith('/embed/')) {
    const embedCsp = buildEmbedCspHeader(nonce);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set('Content-Security-Policy', embedCsp);
    response.headers.delete('X-Frame-Options');
    return response;
  }

  // API routes: skip intl and auth, just pass through
  if (pathname.startsWith('/api/')) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Strip optional locale prefix for path matching (e.g. /en/admin → /admin)
  const strippedPath = pathname.replace(/^\/(hi|en)/, '') || '/';

  // Only hit Supabase for routes that actually need auth.
  const needsAuth =
    strippedPath.startsWith('/admin') ||
    strippedPath.startsWith('/auth') ||
    strippedPath === '/login';

  if (needsAuth) {
    const { supabaseResponse, user, supabase } = await updateSession(
      request,
      requestHeaders,
    );

    if (strippedPath.startsWith('/admin')) {
      if (!user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('next', pathname);
        const redirectRes = NextResponse.redirect(loginUrl);
        redirectRes.headers.set('Content-Security-Policy', csp);
        return redirectRes;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role !== 'admin' && profile?.role !== 'editor') {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = '/';
        homeUrl.searchParams.delete('next');
        const redirectRes = NextResponse.redirect(homeUrl);
        redirectRes.headers.set('Content-Security-Policy', csp);
        return redirectRes;
      }
    }

    // Routes live under src/app/[locale]/... With localePrefix: 'as-needed',
    // a no-prefix URL like /admin must be internally rewritten to /<defaultLocale>/admin
    // so Next.js can resolve the [locale] segment. We bypass intlMiddleware in this
    // branch (it doesn't carry Supabase cookies), so handle the rewrite ourselves.
    const hasLocalePrefix = /^\/(hi|en)(\/|$)/.test(pathname);
    if (!hasLocalePrefix) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `/${routing.defaultLocale}${pathname}`;
      const rewriteRes = NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      });
      supabaseResponse.cookies.getAll().forEach((c) => {
        rewriteRes.cookies.set(c);
      });
      rewriteRes.headers.set('Content-Security-Policy', csp);
      return rewriteRes;
    }

    supabaseResponse.headers.set('Content-Security-Policy', csp);
    return supabaseResponse;
  }

  // Run next-intl locale detection + redirect on public paths
  const intlResponse = intlMiddleware(request);

  // If next-intl issued a redirect (locale negotiation), attach CSP and return
  if (intlResponse.status !== 200 && intlResponse.headers.get('location')) {
    intlResponse.headers.set('Content-Security-Policy', csp);
    return intlResponse;
  }

  // Normal public path: merge nonce into request headers and attach CSP
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
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
