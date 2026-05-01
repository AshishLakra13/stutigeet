import type { Song } from 'chordsheetjs';

export type Slide = {
  type: string;
  lines: string[];
};

/**
 * Extracts lyric-only slides from a parsed chordsheetjs Song.
 * Each ChordPro paragraph becomes one slide. Chords are stripped.
 */
export function songToSlides(song: Song): Slide[] {
  return song.paragraphs
    .map((paragraph) => {
      const lines = paragraph.lines
        .map((line) =>
          line.items
            .map((item) => {
              // ChordLyricsPair has a lyrics property
              const l = (item as { lyrics?: string }).lyrics;
              return l ?? '';
            })
            .join('')
            .trim(),
        )
        .filter(Boolean);
      return { type: (paragraph as { type?: string }).type ?? 'verse', lines };
    })
    .filter((s) => s.lines.length > 0);
}
