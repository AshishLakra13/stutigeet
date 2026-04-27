import { transliterate } from 'transliteration';

/**
 * Converts a song title (Hindi or English) into a URL-safe slug.
 *
 * Examples:
 *   "यीशु प्यारा"  → "yisu-pyara"
 *   "Yeshu Naam Hai"  → "yeshu-naam-hai"
 *   "He Is Lord (Reprise)"  → "he-is-lord-reprise"
 */
export function slugify(text: string): string {
  return transliterate(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // strip non-alphanumeric (except spaces/hyphens)
    .replace(/[\s_]+/g, '-')         // spaces/underscores → hyphens
    .replace(/-{2,}/g, '-')          // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');        // trim leading/trailing hyphens
}
