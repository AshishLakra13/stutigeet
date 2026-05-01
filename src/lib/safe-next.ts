/**
 * Validate the `next` redirect parameter from auth flows. Only accepts
 * same-origin absolute paths starting with a single '/'. Rejects
 * protocol-relative URLs (`//evil.com`), backslash tricks (`/\evil.com`),
 * and anything that doesn't start with '/'.
 */
export function safeNext(
  next: string | null | undefined,
  fallback = '/',
): string {
  if (!next || typeof next !== 'string') return fallback;
  if (!next.startsWith('/')) return fallback;
  if (next.startsWith('//')) return fallback;
  if (next.startsWith('/\\')) return fallback;
  return next;
}
