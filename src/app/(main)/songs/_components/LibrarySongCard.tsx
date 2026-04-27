import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SongListItem } from '@/lib/songs-query';

type Props = {
  song: SongListItem;
  priority?: boolean;
};

export function LibrarySongCard({ song }: Props) {
  const { slug, title_hi, title_en, original_key, bpm, themes } = song;
  const hasChords = original_key !== null;
  const primaryTheme = themes?.[0] ?? null;

  return (
    <Link
      href={`/songs/${slug}`}
      className={cn(
        'group relative flex min-h-[140px] flex-col justify-between',
        'rounded-lg border border-[var(--border)] bg-card p-5',
        'song-card-lift',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      <div className="min-w-0">
        {title_hi && (
          <p
            lang="hi"
            style={{ viewTransitionName: `song-title-${slug}` }}
            className={cn(
              'font-[family-name:var(--font-devanagari)]',
              'text-xl md:text-2xl font-medium leading-snug text-foreground',
              'group-hover:text-[var(--accent)] transition-colors duration-[180ms]',
              'line-clamp-2',
            )}
          >
            {title_hi}
          </p>
        )}
        {title_en && (
          <p
            className={cn(
              'mt-1 font-[family-name:var(--font-crimson)] italic',
              'text-sm text-muted-foreground line-clamp-1',
            )}
          >
            {title_en}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {primaryTheme && (
            <Badge variant="secondary" className="shrink-0 capitalize">
              {primaryTheme}
            </Badge>
          )}
          <span
            aria-label={hasChords ? 'Chords available' : 'Lyrics only'}
            title={hasChords ? 'Chords available' : 'Lyrics only'}
            className={cn(
              'inline-block h-1.5 w-1.5 shrink-0 rounded-full',
              hasChords
                ? 'bg-[var(--accent)]'
                : 'border border-[var(--border)] bg-transparent',
            )}
          />
        </div>

        <div className="flex shrink-0 items-baseline gap-1 text-xs text-muted-foreground numerals-old">
          {original_key && (
            <span className="font-[family-name:var(--font-mono)] text-[var(--accent)]">
              {original_key}
            </span>
          )}
          {original_key && bpm ? <span aria-hidden="true">·</span> : null}
          {bpm ? <span>{bpm}</span> : null}
        </div>
      </div>
    </Link>
  );
}
