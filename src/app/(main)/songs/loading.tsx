import { SongGridSkeleton } from './_components/SongGridSkeleton';
import { PAGE_SIZE } from '@/lib/songs-query';

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 pt-[var(--breath-section)] pb-[var(--breath-section)]">
      <div className="mb-[var(--breath-phrase)]">
        <div
          aria-hidden="true"
          className="h-9 w-40 animate-pulse rounded-md bg-muted/50 sm:h-10 sm:w-56"
        />
        <div
          aria-hidden="true"
          className="mt-2 h-5 w-24 animate-pulse rounded-md bg-muted/40"
        />
        <div
          className="mt-[var(--breath-pause)] h-px w-16"
          style={{ backgroundColor: 'var(--accent)' }}
          aria-hidden="true"
        />
      </div>
      <div
        aria-hidden="true"
        className="mb-[var(--breath-phrase)] h-9 w-full animate-pulse rounded-md bg-muted/40"
      />
      <SongGridSkeleton count={PAGE_SIZE} />
    </main>
  );
}
