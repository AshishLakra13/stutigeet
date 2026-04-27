'use client';

import { useEffect } from 'react';

export default function SongsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[/songs] route error:', error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl px-4 pt-[var(--breath-section)] pb-[var(--breath-section)] text-center">
      <h1
        lang="hi"
        className="font-[family-name:var(--font-devanagari)] text-2xl font-medium"
      >
        कुछ गड़बड़ हो गई
      </h1>
      <p className="mt-1 font-[family-name:var(--font-crimson)] italic text-muted-foreground">
        We couldn&rsquo;t load the songs. Please try again.
      </p>
      <div
        className="mx-auto mt-[var(--breath-pause)] h-px w-12"
        style={{ backgroundColor: 'var(--accent)' }}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => reset()}
        className="mt-[var(--breath-phrase)] inline-flex items-center rounded-md border border-[var(--accent)] px-4 py-2 font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-[var(--accent)] hover:bg-[var(--accent)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Try again
      </button>
    </main>
  );
}
