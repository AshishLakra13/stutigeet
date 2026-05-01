'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  languages: string[];
  themes: string[];
  activeLang?: string;
  activeTag?: string;
};

const LANG_LABELS: Record<string, string> = {
  hi: 'हिंदी',
  en: 'English',
};

export function FilterChips({ languages, themes, activeLang, activeTag }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function buildHref(key: 'lang' | 'tag', value: string | null): string {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');
    const qs = params.toString();
    return qs ? `/songs?${qs}` : '/songs';
  }

  function go(href: string) {
    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  return (
    <div
      className={cn(
        'space-y-3 lg:sticky lg:top-14 lg:z-10 lg:bg-background/85 lg:py-3 lg:backdrop-blur',
        isPending && 'opacity-80',
      )}
      data-pending={isPending ? 'true' : undefined}
    >
      {languages.length > 0 && (
        <ChipRow label="Language">
          <Chip
            href={buildHref('lang', null)}
            active={!activeLang}
            onClick={(e, href) => {
              e.preventDefault();
              go(href);
            }}
          >
            All
          </Chip>
          {languages.map((l) => (
            <Chip
              key={l}
              href={buildHref('lang', l)}
              active={activeLang === l}
              onClick={(e, href) => {
                e.preventDefault();
                go(href);
              }}
            >
              {LANG_LABELS[l] ?? l}
            </Chip>
          ))}
        </ChipRow>
      )}

      {themes.length > 0 && (
        <ChipRow label="Theme">
          <Chip
            href={buildHref('tag', null)}
            active={!activeTag}
            onClick={(e, href) => {
              e.preventDefault();
              go(href);
            }}
          >
            All
          </Chip>
          {themes.map((t) => (
            <Chip
              key={t}
              href={buildHref('tag', t)}
              active={activeTag === t}
              onClick={(e, href) => {
                e.preventDefault();
                go(href);
              }}
            >
              <span className="capitalize">{t}</span>
            </Chip>
          ))}
        </ChipRow>
      )}
    </div>
  );
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="hidden shrink-0 font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:inline"
        aria-hidden="true"
      >
        {label}
      </span>
      <span className="sr-only">{label} filter</span>
      <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1 scroll-smooth snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}

function Chip({
  href,
  active,
  children,
  onClick,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      onClick={(e) => onClick(e, href)}
      aria-pressed={active}
      className={cn(
        'snap-start whitespace-nowrap rounded-full border px-3 py-1 text-xs',
        'font-[family-name:var(--font-inter)] tracking-wide',
        'transition-colors duration-[180ms]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        active
          ? 'border-[var(--accent)] text-[var(--accent)]'
          : 'border-[var(--border)] text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </Link>
  );
}
