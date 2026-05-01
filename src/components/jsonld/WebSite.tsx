type Props = {
  baseUrl: string;
};

function safeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export function WebSiteJsonLd({ baseUrl }: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Stuti Geet',
    url: baseUrl,
    inLanguage: ['hi', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/songs?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
