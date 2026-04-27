import { Badge } from '@/components/ui/badge';
import type { Song } from '@/types/song';

type SongHeaderProps = {
  song: Pick<Song, 'title_hi' | 'title_en' | 'original_key' | 'bpm' | 'artist_original'>;
  currentKey?: string;
};

export function SongHeader({ song, currentKey }: SongHeaderProps) {
  const { title_hi, title_en, original_key, bpm, artist_original } = song;
  const isTransposed = currentKey && currentKey !== original_key;

  return (
    <div className="space-y-1 mb-8">
      {title_hi && (
        <h1
          lang="hi"
          className="font-[family-name:var(--font-devanagari)] text-3xl font-semibold leading-tight sm:text-4xl"
        >
          {title_hi}
        </h1>
      )}
      {title_en && (
        <h2 className="font-[family-name:var(--font-crimson)] text-xl text-muted-foreground sm:text-2xl">
          {title_en}
        </h2>
      )}
      {artist_original && (
        <p className="text-xs text-muted-foreground">{artist_original}</p>
      )}

      <div className="flex items-center gap-2 pt-2 flex-wrap">
        {isTransposed ? (
          <>
            <Badge variant="secondary" className="font-mono">
              {currentKey}
            </Badge>
            <span className="text-xs text-muted-foreground">
              (original: {original_key})
            </span>
          </>
        ) : original_key ? (
          <Badge variant="secondary" className="font-mono">
            {original_key}
          </Badge>
        ) : null}

        {bpm && (
          <Badge variant="outline" className="text-xs">
            {bpm} bpm
          </Badge>
        )}
      </div>
    </div>
  );
}
