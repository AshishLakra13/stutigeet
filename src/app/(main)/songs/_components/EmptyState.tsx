import Link from 'next/link';

type Props = {
  variant: 'no-songs' | 'no-matches' | 'page-out-of-range';
  query?: string;
  totalPages?: number;
};

export function EmptyState({ variant, query, totalPages }: Props) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div
        className="mb-[var(--breath-pause)] h-px w-12"
        style={{ backgroundColor: 'var(--accent)' }}
        aria-hidden="true"
      />
      {variant === 'no-songs' && (
        <p className="font-[family-name:var(--font-crimson)] italic text-muted-foreground">
          No songs yet.
        </p>
      )}
      {variant === 'no-matches' && (
        <>
          <p className="font-[family-name:var(--font-crimson)] italic text-muted-foreground">
            {query ? (
              <>No songs found for &ldquo;{query}&rdquo;.</>
            ) : (
              <>No songs match your filters.</>
            )}
          </p>
          <Link
            href="/songs"
            className="mt-[var(--breath-pause)] font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-[var(--accent)] hover:underline"
          >
            Clear filters
          </Link>
        </>
      )}
      {variant === 'page-out-of-range' && (
        <>
          <p className="font-[family-name:var(--font-crimson)] italic text-muted-foreground">
            That page is empty.
          </p>
          <Link
            href={totalPages && totalPages > 1 ? `/songs?page=${totalPages}` : '/songs'}
            className="mt-[var(--breath-pause)] font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-[var(--accent)] hover:underline"
          >
            Go to last page
          </Link>
        </>
      )}
    </div>
  );
}
