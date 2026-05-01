import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer API — Stuti Geet',
  description: 'Public REST API for Stuti Geet Christian Hindi worship songs. Free, read-only, rate-limited.',
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://stutigeet.com';

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono text-foreground leading-relaxed">
      <code>{code}</code>
    </pre>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-3 text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export default function DevelopersPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Developer API</h1>
      <p className="text-muted-foreground mb-8">
        A free, read-only REST API for accessing Stuti Geet&apos;s canon of Christian Hindi worship songs.
        No authentication required. Rate-limited to 60 requests per minute per IP.
      </p>

      <Section title="Base URL">
        <CodeBlock code={`${BASE_URL}/api/v1`} />
      </Section>

      <Section title="Response Envelope">
        <p className="text-sm text-muted-foreground mb-3">All endpoints return the same JSON shape:</p>
        <CodeBlock
          code={`{
  "data":  <object | array | null>,
  "error": <string | null>,
  "meta":  <object | null>   // pagination info where applicable
}`}
        />
      </Section>

      <Section title="Rate Limiting">
        <p className="text-sm text-muted-foreground mb-3">
          Anonymous requests are limited to <strong>60 per minute</strong> per IP address.
          When the limit is exceeded, the API returns HTTP <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">429</code> with a{' '}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Retry-After</code> header.
        </p>
        <CodeBlock
          code={`X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1746000000000
Retry-After: 37`}
        />
      </Section>

      <Section title="Endpoints">
        <div className="space-y-8">

          <div>
            <h3 className="font-mono text-sm font-semibold mb-1">GET /api/v1/songs</h3>
            <p className="text-sm text-muted-foreground mb-2">Paginated list of published songs.</p>
            <p className="text-sm mb-2">
              <span className="font-medium">Query params:</span>{' '}
              <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">page</code> (default 1),{' '}
              <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">limit</code> (default 20, max 100)
            </p>
            <CodeBlock
              code={`curl ${BASE_URL}/api/v1/songs?page=1&limit=5`}
            />
          </div>

          <div>
            <h3 className="font-mono text-sm font-semibold mb-1">GET /api/v1/songs/:slug</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Full song detail including ChordPro lyrics (when available).
            </p>
            <p className="text-sm mb-2">
              The <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">lyrics_chordpro</code> field is{' '}
              <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">null</code> for songs pending
              copyright verification. Check{' '}
              <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">lyrics_available</code> before
              rendering.
            </p>
            <CodeBlock
              code={`curl ${BASE_URL}/api/v1/songs/yeshu-masih-mera`}
            />
          </div>

          <div>
            <h3 className="font-mono text-sm font-semibold mb-1">GET /api/v1/search?q=</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Full-text search across Devanagari and Roman transliteration.
              Supports Hindi script (<span className="font-devanagari">यीशु</span>) and romanized input (yeshu).
            </p>
            <CodeBlock
              code={`curl "${BASE_URL}/api/v1/search?q=yeshu"`}
            />
          </div>

        </div>
      </Section>

      <Section title="Embed Widget">
        <p className="text-sm text-muted-foreground mb-3">
          Embed a song chord sheet on any website. The widget adapts to light/dark system preference
          and supports transpose controls.
        </p>
        <CodeBlock
          code={`<iframe
  src="${BASE_URL}/embed/songs/yeshu-masih-mera"
  width="100%"
  height="600"
  style="border:none;border-radius:8px"
  title="Yeshu Masih Mera — Stuti Geet"
></iframe>`}
        />
        <p className="text-sm text-muted-foreground mt-3">
          Add <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">?key=D</code> to the embed URL
          to preset the transposition key.
        </p>
      </Section>

      <Section title="CORS">
        <p className="text-sm text-muted-foreground">
          All <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">/api/v1/*</code> endpoints include{' '}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Access-Control-Allow-Origin: *</code>{' '}
          and support preflight <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">OPTIONS</code>{' '}
          requests. You can call the API directly from browser JavaScript on any domain.
        </p>
      </Section>

      <Section title="License">
        <p className="text-sm text-muted-foreground">
          The API is free for non-commercial use. Each song&apos;s{' '}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">copyright_status</code> field
          indicates the license (
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">public_domain</code>,{' '}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">cc_by</code>,{' '}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">cc_by_sa</code>, etc.).
          Respect per-song licensing before reproducing lyrics.
        </p>
      </Section>

    </main>
  );
}
