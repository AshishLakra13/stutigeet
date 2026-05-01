import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { CopyrightStatus } from '@/types/song';

type TrustPanelProps = {
  slug: string;
  copyrightStatus: CopyrightStatus | null;
  sourceUrl: string | null;
  sourceName: string | null;
  verifiedAt: string | null;
  allowRender: boolean;
};

const LICENSE_COLORS: Record<string, string> = {
  public_domain: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950 dark:border-emerald-800',
  original: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-800',
  licensed: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-950 dark:border-sky-800',
  permission_granted: 'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-300 dark:bg-teal-950 dark:border-teal-800',
  cc_by: 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-950 dark:border-green-800',
  cc_by_sa: 'text-lime-700 bg-lime-50 border-lime-200 dark:text-lime-300 dark:bg-lime-950 dark:border-lime-800',
  unverified: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950 dark:border-amber-800',
  placeholder: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950 dark:border-amber-800',
};

const UNVERIFIED = new Set(['unverified', 'placeholder']);

export async function TrustPanel({
  slug,
  copyrightStatus,
  sourceUrl,
  sourceName,
  verifiedAt,
  allowRender,
}: TrustPanelProps) {
  const t = await getTranslations('TrustPanel');
  const status = copyrightStatus ?? 'unverified';
  const isUnverified = UNVERIFIED.has(status);
  const colorClass = LICENSE_COLORS[status] ?? LICENSE_COLORS.unverified;

  if (!allowRender) {
    return (
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        {t('pendingStub')}
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-2">
      {isUnverified && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-800 dark:bg-amber-950">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            {t('unverifiedBanner')}
          </p>
          <Link
            href={`/legal/dmca?song=${slug}`}
            className="text-xs text-amber-700 underline hover:no-underline dark:text-amber-300"
          >
            {t('reportConcern')}
          </Link>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium ${colorClass}`}
        >
          {t(`licenseLabels.${status}`)}
        </span>

        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            {t('sourceLabel')}: {sourceName ?? new URL(sourceUrl).hostname}
          </a>
        )}

        {verifiedAt && !isUnverified && (
          <span>{t('verifiedLabel')}</span>
        )}
      </div>
    </div>
  );
}
