import { z } from 'zod';

export const SongsSearchParams = z.object({
  page: z.coerce.number().int().positive().catch(1),
  q: z.string().trim().min(1).max(100).optional(),
  lang: z.string().trim().min(1).max(8).optional(),
  tag: z.string().trim().min(1).max(40).optional(),
});

export type SongsSearchParamsInput = z.input<typeof SongsSearchParams>;
export type SongsSearchParamsParsed = z.output<typeof SongsSearchParams>;

export function parseSongsSearchParams(
  raw: Record<string, string | string[] | undefined>,
): SongsSearchParamsParsed {
  const flat: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(raw)) {
    flat[k] = Array.isArray(v) ? v[0] : v;
  }
  return SongsSearchParams.parse(flat);
}

export function buildSongsHref(
  next: Partial<SongsSearchParamsParsed>,
  base: SongsSearchParamsParsed,
): string {
  const merged: SongsSearchParamsParsed = { ...base, ...next };
  const params = new URLSearchParams();
  if (merged.page && merged.page > 1) params.set('page', String(merged.page));
  if (merged.q) params.set('q', merged.q);
  if (merged.lang) params.set('lang', merged.lang);
  if (merged.tag) params.set('tag', merged.tag);
  const qs = params.toString();
  return qs ? `/songs?${qs}` : '/songs';
}
