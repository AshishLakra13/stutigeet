import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type Props = { count?: number };

export function SongGridSkeleton({ count = 20 }: Props) {
  return (
    <div
      role="status"
      aria-label="Loading songs"
      className={cn(
        'grid gap-6',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex min-h-[140px] flex-col justify-between rounded-lg border border-[var(--border)] bg-card p-5"
        >
          <div className="space-y-2">
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Skeleton className="h-5 w-16 rounded-4xl" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}
