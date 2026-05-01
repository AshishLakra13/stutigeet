type Props = {
  baseUrl: string;
};

function safeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export function OrganizationJsonLd({ baseUrl }: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Stuti Geet',
    url: baseUrl,
    description: 'Chord sheets and lyrics for Christian Hindi worship songs',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
