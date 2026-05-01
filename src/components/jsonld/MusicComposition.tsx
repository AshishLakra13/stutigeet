const LICENSE_URL: Record<string, string> = {
  public_domain: 'https://creativecommons.org/publicdomain/zero/1.0/',
  cc_by: 'https://creativecommons.org/licenses/by/4.0/',
  cc_by_sa: 'https://creativecommons.org/licenses/by-sa/4.0/',
};

type Props = {
  name: string;
  inLanguage: string;
  lyricsExcerpt?: string | null;
  composer?: string | null;
  datePublished: string;
  copyrightStatus?: string | null;
  pageUrl: string;
};

function safeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function MusicCompositionJsonLd({
  name,
  inLanguage,
  lyricsExcerpt,
  composer,
  datePublished,
  copyrightStatus,
  pageUrl,
}: Props) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MusicComposition',
    name,
    inLanguage,
    url: pageUrl,
    datePublished: datePublished.slice(0, 10),
  };

  if (lyricsExcerpt) {
    schema.lyrics = { '@type': 'CreativeWork', text: lyricsExcerpt.slice(0, 500) };
  }
  if (composer) {
    schema.composer = { '@type': 'Organization', name: composer };
  }
  if (copyrightStatus && LICENSE_URL[copyrightStatus]) {
    schema.license = LICENSE_URL[copyrightStatus];
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
