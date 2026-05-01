import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

// Server-only: not prefixed NEXT_PUBLIC_ so it stays out of client bundles.
// Default: open to all origins (public read-only API). Set a comma-separated
// list in production to restrict to known consumers, e.g. "https://stutigeet.com".
const ALLOWED_ORIGINS_RAW = process.env.API_ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) ?? [];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  let allowOrigin: string;
  if (ALLOWED_ORIGINS_RAW.length === 0) {
    // No restriction configured — public API, allow any origin
    allowOrigin = '*';
  } else if (origin && ALLOWED_ORIGINS_RAW.includes(origin)) {
    allowOrigin = origin;
  } else {
    allowOrigin = ALLOWED_ORIGINS_RAW[0];
  }
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function applyRateLimit(
  request: NextRequest,
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const { allowed, remaining, reset } = await checkRateLimit(ip);
  if (!allowed) {
    const origin = request.headers.get('origin');
    return NextResponse.json(
      { data: null, error: 'Rate limit exceeded', meta: null },
      {
        status: 429,
        headers: {
          ...getCorsHeaders(origin),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      },
    );
  }
  return null;
}

export function apiResponse<T>(
  data: T,
  meta: Record<string, unknown> | null,
  origin: string | null,
  cacheSeconds = 3600,
): NextResponse {
  return NextResponse.json(
    { data, error: null, meta },
    {
      headers: {
        ...getCorsHeaders(origin),
        'Cache-Control': `public, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`,
      },
    },
  );
}
