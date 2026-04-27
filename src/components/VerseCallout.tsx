import { getCurrentSeason, VERSES_BY_SEASON } from '@/lib/liturgical';

export function VerseCallout() {
  const season = getCurrentSeason(new Date());
  const verse = VERSES_BY_SEASON[season];

  return (
    <div className="space-y-1 max-w-xs">
      <p
        lang="hi"
        className="font-[family-name:var(--font-devanagari)] text-base leading-relaxed tracking-wide text-foreground"
      >
        {verse.hi}
      </p>
      <p className="font-[family-name:var(--font-crimson)] italic text-sm text-muted-foreground">
        {verse.en}
      </p>
      <p className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-muted-foreground mt-2">
        {verse.citation_hi}{' '}
        <span style={{ color: 'var(--accent)' }}>·</span>{' '}
        {verse.citation_en}
      </p>
    </div>
  );
}
