'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

type Props = {
  variant: 'no-songs' | 'no-matches' | 'page-out-of-range';
  query?: string;
  totalPages?: number;
};

export function EmptyState({ variant, query, totalPages }: Props) {
  const t = useTranslations('SongLibrary');

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div
        className="mb-[var(--breath-pause)] h-px w-12"
        style={{ backgroundColor: 'var(--accent)' }}
        aria-hidden="true"
      />
      {variant === 'no-songs' && (
        <p className="font-[family-name:var(--font-crimson)] italic text-muted-foreground">
          {t('noSongs')}
        </p>
      )}
      {variant === 'no-matches' && (
        <>
          <p className="font-[family-name:var(--font-crimson)] italic text-muted-foreground">
            {query ? t('noMatches', { query }) : t('noFilters')}
          </p>
          <Link
            href="/songs"
            className="mt-[var(--breath-pause)] font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-[var(--accent)] hover:underline"
          >
            {t('clearFilters')}
          </Link>
        </>
      )}
      {variant === 'page-out-of-range' && (
        <>
          <p className="font-[family-name:var(--font-crimson)] italic text-muted-foreground">
            {t('pageEmpty')}
          </p>
          <Link
            href={totalPages && totalPages > 1 ? `/songs?page=${totalPages}` : '/songs'}
            className="mt-[var(--breath-pause)] font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-[var(--accent)] hover:underline"
          >
            {t('goToLastPage')}
          </Link>
        </>
      )}
    </div>
  );
}
