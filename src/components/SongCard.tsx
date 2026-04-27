import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Song } from '@/types/song';

type SongCardProps = {
  song: Pick<Song, 'slug' | 'title_hi' | 'title_en' | 'original_key' | 'bpm' | 'themes'>;
};

export function SongCard({ song }: SongCardProps) {
  const { slug, title_hi, title_en, original_key, bpm, themes } = song;

  return (
    <Link href={`/songs/${slug}`} className="block group">
      <div
        className={cn(
          'rounded-xl border border-border bg-card px-5 py-4',
          'transition-all duration-200',
          'hover:border-foreground/20 hover:bg-accent/50 hover:shadow-sm',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {title_hi && (
              <h2
                lang="hi"
                className="font-[family-name:var(--font-devanagari)] text-lg font-medium leading-tight truncate"
              >
                {title_hi}
              </h2>
            )}
            {title_en && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{title_en}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            {original_key && (
              <Badge variant="secondary" className="text-xs font-mono">
                {original_key}
              </Badge>
            )}
            {bpm && (
              <Badge variant="outline" className="text-xs">
                {bpm} bpm
              </Badge>
            )}
          </div>
        </div>

        {themes && themes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {themes
              .filter((t) => t !== 'demo')
              .slice(0, 3)
              .map((theme) => (
                <span
                  key={theme}
                  className="text-[10px] text-muted-foreground capitalize"
                >
                  #{theme}
                </span>
              ))}
          </div>
        )}
      </div>
    </Link>
  );
}
