import { ChevronDown } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getRecentSongs } from '@/lib/songs';
import { SongCard } from '@/components/SongCard';
import { BrandMark } from '@/components/BrandMark';
import { VerseCallout } from '@/components/VerseCallout';
import { WebSiteJsonLd } from '@/components/jsonld/WebSite';
import { OrganizationJsonLd } from '@/components/jsonld/Organization';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://stutigeet.com';

export default async function HomePage() {
  const [songs, t] = await Promise.all([getRecentSongs(20), getTranslations('Home')]);

  return (
    <main className="mx-auto max-w-4xl px-4">
      <WebSiteJsonLd baseUrl={BASE_URL} />
      <OrganizationJsonLd baseUrl={BASE_URL} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center pt-[var(--breath-page)] pb-[var(--breath-section)]">
        <BrandMark size={64} className="text-foreground mb-6" animate />

        <h1
          lang="hi"
          className="font-[family-name:var(--font-devanagari)] text-4xl font-medium sm:text-5xl"
        >
          स्तुति गीत
        </h1>
        <p className="font-[family-name:var(--font-crimson)] italic text-xl text-muted-foreground mt-1">
          Stuti Geet
        </p>

        <hr
          className="w-20 border-0 h-px mt-[var(--breath-phrase)] mb-[var(--breath-phrase)]"
          style={{ backgroundColor: 'var(--accent)' }}
        />

        <VerseCallout />

        <ChevronDown
          className="mt-[var(--breath-phrase)]"
          style={{ color: 'var(--accent)', opacity: 0.6 }}
          size={24}
          aria-hidden="true"
        />
      </div>

      {/* ── Songs ────────────────────────────────────────────── */}
      <section className="pb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-muted-foreground">
            {t('songsSection')}
          </span>
          <div className="w-6 h-px" style={{ backgroundColor: 'var(--accent)' }} />
        </div>

        {songs.length === 0 ? (
          <p className="font-[family-name:var(--font-crimson)] italic text-center text-muted-foreground py-16">
            {t('noSongs')}
          </p>
        ) : (
          <div>
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
