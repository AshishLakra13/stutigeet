import { Suspense } from 'react';
import { parseSongsSearchParams } from '@/lib/songs-search-params';
import { PAGE_SIZE } from '@/lib/songs-query';
import { getDistinctLanguages, getDistinctThemes, getSongCount } from '@/lib/songs';
import { PageHeader } from './_components/PageHeader';
import { SearchInput } from './_components/SearchInput';
import { FilterChips } from './_components/FilterChips';
import { SongGrid } from './_components/SongGrid';
import { SongGridSkeleton } from './_components/SongGridSkeleton';

export const metadata = {
  title: 'All Songs — Stuti Geet',
  description: 'Browse all Christian Hindi worship songs with chord sheets',
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function SongsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await searchParams;
  const parsed = parseSongsSearchParams(raw);

  const [languages, themes, total] = await Promise.all([
    getDistinctLanguages(),
    getDistinctThemes(),
    getSongCount(),
  ]);

  const from = total > 0 ? (parsed.page - 1) * PAGE_SIZE + 1 : 0;
  const to = total > 0 ? Math.min(parsed.page * PAGE_SIZE, total) : 0;

  const suspenseKey = `${parsed.page}-${parsed.q ?? ''}-${parsed.lang ?? ''}-${parsed.tag ?? ''}`;

  return (
    <main className="mx-auto max-w-7xl px-4 pt-[var(--breath-section)] pb-[var(--breath-section)]">
      <PageHeader total={total} from={from} to={to} />

      <div className="mb-[var(--breath-phrase)]">
        <SearchInput defaultValue={parsed.q} />
      </div>

      <div className="mb-[var(--breath-phrase)]">
        <FilterChips
          languages={languages}
          themes={themes}
          activeLang={parsed.lang}
          activeTag={parsed.tag}
        />
      </div>

      <Suspense key={suspenseKey} fallback={<SongGridSkeleton count={PAGE_SIZE} />}>
        <SongGrid query={parsed} />
      </Suspense>
    </main>
  );
}
