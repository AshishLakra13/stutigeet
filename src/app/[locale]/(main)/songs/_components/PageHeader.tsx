import { getTranslations } from 'next-intl/server';

type Props = {
  total: number;
  from: number;
  to: number;
};

export async function PageHeader({ total, from, to }: Props) {
  const t = await getTranslations('SongLibrary');
  const showRange = total > 0 && from > 0 && to > 0 && from <= total;

  return (
    <div className="mb-[var(--breath-phrase)]">
      <h1
        lang="hi"
        className="font-[family-name:var(--font-devanagari)] text-3xl font-medium sm:text-4xl"
      >
        {t('titleHi')}
      </h1>
      <p className="mt-1 font-[family-name:var(--font-crimson)] italic text-lg text-muted-foreground">
        {t('titleEn')}
      </p>
      <div
        className="mt-[var(--breath-pause)] h-px w-16"
        style={{ backgroundColor: 'var(--accent)' }}
        aria-hidden="true"
      />
      {total > 0 && (
        <p className="mt-[var(--breath-pause)] font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-muted-foreground numerals-old">
          {showRange
            ? t('showing', { from, to, total })
            : t('totalCount', { total })}
        </p>
      )}
    </div>
  );
}
