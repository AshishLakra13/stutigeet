import { Link } from '@/i18n/navigation';
import type { Song } from '@/types/song';

type SongCardProps = {
  song: Pick<Song, 'slug' | 'title_hi' | 'title_en' | 'original_key' | 'bpm' | 'themes'>;
};

export function SongCard({ song }: SongCardProps) {
  const { slug, title_hi, title_en, original_key, bpm } = song;

  return (
    <Link
      href={`/songs/${slug}`}
      className="group block py-3 border-b border-[var(--border)] last:border-b-0"
    >
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          {title_hi && (
            <p
              lang="hi"
              className="font-[family-name:var(--font-devanagari)] text-lg font-medium text-foreground group-hover:text-[var(--accent)] transition-colors duration-[180ms] truncate"
            >
              {title_hi}
            </p>
          )}
          {title_en && (
            <p className="font-[family-name:var(--font-crimson)] italic text-sm text-muted-foreground truncate">
              {title_en}
            </p>
          )}
        </div>

        <div className="shrink-0 flex items-baseline gap-1 text-xs text-muted-foreground numerals-old">
          {original_key && (
            <span className="text-[var(--accent)] font-[family-name:var(--font-mono)]">
              {original_key}
            </span>
          )}
          {original_key && bpm && <span>·</span>}
          {bpm && <span>{bpm}</span>}
        </div>
      </div>
    </Link>
  );
}
