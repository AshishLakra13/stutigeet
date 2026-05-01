/**
 * Builds the Content-Security-Policy header value for a given per-request
 * nonce. Called from middleware on every request so the nonce changes each
 * time. Use 'strict-dynamic' so any script Next.js injects with the nonce
 * can in turn load other scripts it needs without a host whitelist.
 *
 * style-src keeps 'unsafe-inline' because Radix and @floating-ui (used by
 * the command palette and admin dropdowns) inject inline styles for
 * positioning and don't accept nonces. Style-based XSS is a much smaller
 * attack vector than script-based — the script-src lockdown is the prize.
 */
export function buildCspHeader(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.ingest.sentry.io https://plausible.io",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

export function buildEmbedCspHeader(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-src 'none'",
    "frame-ancestors *",
    "base-uri 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}
