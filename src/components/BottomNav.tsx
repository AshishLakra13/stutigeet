'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Music, ListMusic, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/songs' as const, labelKey: 'songs' as const, Icon: Music },
  { href: '/sets' as const, labelKey: 'sets' as const, Icon: ListMusic },
  { href: '/admin' as const, labelKey: 'admin' as const, Icon: Settings },
];

export function BottomNav() {
  const t = useTranslations('Nav');
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ href, labelKey, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors',
                isActive
                  ? 'text-[var(--accent)]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon
                className={cn('h-5 w-5', isActive && 'stroke-[2.5]')}
                aria-hidden="true"
              />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
