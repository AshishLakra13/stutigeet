'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  page: number;
  totalPages: number;
  q?: string;
  lang?: string;
  tag?: string;
};

export function Pagination({ page, totalPages, q, lang, tag }: Props) {
  const router = useRouter();

  function buildHref(target: number): string {
    const params = new URLSearchParams();
    if (target > 1) params.set('page', String(target));
    if (q) params.set('q', q);
    if (lang) params.set('lang', lang);
    if (tag) params.set('tag', tag);
    const qs = params.toString();
    return qs ? `/songs?${qs}` : '/songs';
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;

      if (e.key === 'ArrowLeft' && page > 1) {
        e.preventDefault();
        router.replace(buildHref(page - 1), { scroll: false });
      } else if (e.key === 'ArrowRight' && page < totalPages) {
        e.preventDefault();
        router.replace(buildHref(page + 1), { scroll: false });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, totalPages, q, lang, tag, router]);

  const items = buildPaginationWindow(page, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center">
      {/* Mobile: Prev · Page X of Y · Next */}
      <div className="flex w-full items-center justify-between sm:hidden">
        <NavLink
          href={page > 1 ? buildHref(page - 1) : null}
          rel="prev"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>Prev</span>
        </NavLink>
        <span
          className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-muted-foreground numerals-old"
          aria-live="off"
        >
          Page {page} of {totalPages}
        </span>
        <NavLink
          href={page < totalPages ? buildHref(page + 1) : null}
          rel="next"
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </NavLink>
      </div>

      {/* Desktop: Prev · 1 · 2 … 17 · Next */}
      <ul className="hidden items-center gap-1 sm:flex">
        <li>
          <NavLink
            href={page > 1 ? buildHref(page - 1) : null}
            rel="prev"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>Prev</span>
          </NavLink>
        </li>
        {items.map((item, idx) =>
          item === 'ellipsis' ? (
            <li
              key={`e-${idx}`}
              aria-hidden="true"
              className="px-2 text-muted-foreground"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <PageLink
                href={buildHref(item)}
                active={item === page}
                pageNumber={item}
              />
            </li>
          ),
        )}
        <li>
          <NavLink
            href={page < totalPages ? buildHref(page + 1) : null}
            rel="next"
            aria-label="Next page"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

function NavLink({
  href,
  children,
  rel,
  ...rest
}: {
  href: string | null;
  children: React.ReactNode;
  rel?: 'prev' | 'next';
} & React.AriaAttributes) {
  const className = cn(
    'inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm',
    'font-[family-name:var(--font-inter)]',
    'transition-colors duration-[180ms]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    href
      ? 'text-foreground hover:text-[var(--accent)]'
      : 'cursor-not-allowed text-muted-foreground/50',
  );

  if (!href) {
    return (
      <button type="button" disabled className={className} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <Link href={href} scroll={false} rel={rel} className={className} {...rest}>
      {children}
    </Link>
  );
}

function PageLink({
  href,
  active,
  pageNumber,
}: {
  href: string;
  active: boolean;
  pageNumber: number;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'page' : undefined}
      aria-label={`Page ${pageNumber}`}
      className={cn(
        'inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-md px-2 text-sm',
        'font-[family-name:var(--font-inter)] numerals-old',
        'transition-colors duration-[180ms]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        active
          ? 'border border-[var(--accent)] text-[var(--accent)]'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {pageNumber}
    </Link>
  );
}

// Window: first, last, current ± 1, with ellipses bridging gaps.
function buildPaginationWindow(
  page: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const items: Array<number | 'ellipsis'> = [];
  const left = Math.max(2, page - 1);
  const right = Math.min(totalPages - 1, page + 1);

  items.push(1);
  if (left > 2) items.push('ellipsis');
  for (let i = left; i <= right; i++) items.push(i);
  if (right < totalPages - 1) items.push('ellipsis');
  items.push(totalPages);
  return items;
}
