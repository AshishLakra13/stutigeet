import { ChordProParser, HtmlDivFormatter } from 'chordsheetjs';
import type { Song } from 'chordsheetjs';
import DOMPurify from 'isomorphic-dompurify';

export function parseChordPro(text: string): Song {
  return new ChordProParser().parse(text);
}

export function transposeToKey(song: Song, targetKey: string): Song {
  return song.changeKey(targetKey);
}

export function songToHtml(song: Song): string {
  const raw = new HtmlDivFormatter().format(song);
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'div', 'span', 'br', 'p', 'b', 'i', 'em', 'strong', 'table', 'tr', 'td', 'tbody', 'thead'],
    ALLOWED_ATTR: ['class'],
  });
}

// Chromatic key list — flats preferred (friendlier for guitar/keys)
export const MAJOR_KEYS = [
  'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B',
];
export const MINOR_KEYS = MAJOR_KEYS.map((k) => `${k}m`);

/** Step the key up (+1) or down (-1) by one semitone */
export function nextKey(current: string, direction: 1 | -1): string {
  const isMinor = current.endsWith('m');
  const root = isMinor ? current.slice(0, -1) : current;
  const list = isMinor ? MINOR_KEYS : MAJOR_KEYS;
  const majorRoot = root;
  const majorIdx = MAJOR_KEYS.indexOf(majorRoot);
  if (majorIdx === -1) return current;
  const nextMajorIdx = (majorIdx + direction + MAJOR_KEYS.length) % MAJOR_KEYS.length;
  return isMinor ? `${MAJOR_KEYS[nextMajorIdx]}m` : MAJOR_KEYS[nextMajorIdx];
}
