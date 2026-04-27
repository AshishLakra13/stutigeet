import { getPaginatedSongs, type SongQuery } from '@/lib/songs-query';
import { LibrarySongCard } from './LibrarySongCard';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';
import { LiveResultAnnouncer } from './LiveResultAnnouncer';
import { cn } from '@/lib/utils';

type Props = {
  query: SongQuery;
};

export async function SongGrid({ query }: Props) {
  const result = await getPaginatedSongs(query);
  const { rows, total, page, totalPages, from, to } = result;

  if (total === 0) {
    const hasFilters = Boolean(query.q || query.lang || query.tag);
    return (
      <EmptyState
        variant={hasFilters ? 'no-matches' : 'no-songs'}
        query={query.q}
      />
    );
  }

  if (rows.length === 0 && page > totalPages) {
    return <EmptyState variant="page-out-of-range" totalPages={totalPages} />;
  }

  return (
    <>
      <div
        className={cn(
          'grid gap-6',
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
        )}
      >
        {rows.map((song) => (
          <LibrarySongCard key={song.id} song={song} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-[var(--breath-section)]">
          <Pagination
            page={page}
            totalPages={totalPages}
            q={query.q}
            lang={query.lang}
            tag={query.tag}
          />
        </div>
      )}

      <LiveResultAnnouncer
        page={page}
        totalPages={totalPages}
        from={from}
        to={to}
        total={total}
      />
    </>
  );
}
