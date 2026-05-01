import { ChordProParser, HtmlDivFormatter } from 'chordsheetjs';
import type { Song } from 'chordsheetjs';
import sanitizeHtml from 'sanitize-html';

export function parseChordPro(text: string): Song {
  return new ChordProParser().parse(text);
}

export function transposeToKey(song: Song, targetKey: string): Song {
  return song.changeKey(targetKey);
}

export function songToHtml(song: Song): string {
  const raw = new HtmlDivFormatter().format(song);
  return sanitizeHtml(raw, {
    allowedTags: ['h1', 'h2', 'h3', 'div', 'span', 'br', 'p', 'b', 'i', 'em', 'strong', 'table', 'tr', 'td', 'tbody', 'thead'],
    allowedAttributes: { '*': ['class'] },
  });
}

export { MAJOR_KEYS, MINOR_KEYS, nextKey } from './keys';
