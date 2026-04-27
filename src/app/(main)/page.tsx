import { ChevronDown } from 'lucide-react';
import { getAllSongs } from '@/lib/songs';
import { SongCard } from '@/components/SongCard';
import { BrandMark } from '@/components/BrandMark';
import { VerseCallout } from '@/components/VerseCallout';

export default async function HomePage() {
  const songs = await getAllSongs();

  return (
    <main className="mx-auto max-w-4xl px-4">
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
            Songs
          </span>
          <div className="w-6 h-px" style={{ backgroundColor: 'var(--accent)' }} />
        </div>

        {songs.length === 0 ? (
          <p className="font-[family-name:var(--font-crimson)] italic text-center text-muted-foreground py-16">
            No songs yet.
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
