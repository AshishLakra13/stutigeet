import type { Song } from '@/types/song';

type SongHeaderProps = {
  song: Pick<Song, 'title_hi' | 'title_en' | 'original_key' | 'bpm' | 'artist_original'>;
  currentKey?: string;
};

export function SongHeader({ song, currentKey }: SongHeaderProps) {
  const { title_hi, title_en, original_key, bpm, artist_original } = song;
  const isTransposed = currentKey && currentKey !== original_key;
  const displayKey = currentKey ?? original_key;

  return (
    <div className="mb-[var(--breath-section)]">
      {title_hi && (
        <h1
          lang="hi"
          className="font-[family-name:var(--font-devanagari)] text-3xl font-medium leading-tight sm:text-4xl"
        >
          {title_hi}
        </h1>
      )}
      {title_en && (
        <h2 className="font-[family-name:var(--font-crimson)] italic text-lg text-muted-foreground sm:text-xl mt-1">
          {title_en}
        </h2>
      )}

      {/* Gilt rule */}
      <div
        className="w-28 h-px my-[var(--breath-pause)]"
        style={{ backgroundColor: 'var(--accent)' }}
      />

      {/* Meta line — key · bpm · artist */}
      <p className="text-sm text-muted-foreground numerals-old flex items-center gap-1.5 flex-wrap">
        {displayKey && (
          <span
            className="font-[family-name:var(--font-mono)]"
            style={{ color: 'var(--accent)' }}
          >
            {displayKey}
          </span>
        )}
        {isTransposed && original_key && (
          <>
            <span style={{ color: 'var(--accent)' }}>·</span>
            <span className="text-xs">original: {original_key}</span>
          </>
        )}
        {displayKey && bpm && <span style={{ color: 'var(--accent)' }}>·</span>}
        {bpm && <span>{bpm} bpm</span>}
        {(displayKey || bpm) && artist_original && (
          <span style={{ color: 'var(--accent)' }}>·</span>
        )}
        {artist_original && <span>{artist_original}</span>}
      </p>
    </div>
  );
}
