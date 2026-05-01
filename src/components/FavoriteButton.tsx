'use client';

import { useOptimistic, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleFavorite } from '@/app/[locale]/(main)/me/favorites/actions';

type FavoriteButtonProps = {
  songId: string;
  initialFavorited: boolean;
  className?: string;
};

export function FavoriteButton({ songId, initialFavorited, className }: FavoriteButtonProps) {
  const [optimisticFav, setOptimisticFav] = useOptimistic(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      setOptimisticFav((prev) => !prev);
      await toggleFavorite(songId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={optimisticFav ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={optimisticFav}
      className={cn(
        'rounded-full p-1.5 transition-colors',
        'text-muted-foreground hover:text-rose-500',
        optimisticFav && 'text-rose-500',
        className,
      )}
    >
      <Heart
        className={cn('h-4 w-4', optimisticFav && 'fill-current')}
        aria-hidden="true"
      />
    </button>
  );
}
