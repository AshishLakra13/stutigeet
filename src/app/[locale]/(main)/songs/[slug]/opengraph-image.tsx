import { ImageResponse } from 'next/og';
import { getSongBySlug } from '@/lib/songs';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Stuti Geet — Song';

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const song = await getSongBySlug(slug);

  const titleHi = song?.title_hi ?? '';
  const titleEn = song?.title_en ?? slug.replace(/-/g, ' ');
  const theme = song?.themes?.[0] ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1f0e 50%, #1a1a1a 100%)',
          padding: '80px',
        }}
      >
        {/* Decorative rule */}
        <div
          style={{
            width: '60px',
            height: '2px',
            background: '#c9a96e',
            marginBottom: '40px',
          }}
        />

        {/* Hindi title */}
        {titleHi && (
          <div
            style={{
              fontSize: '64px',
              fontWeight: 700,
              color: '#f5efe6',
              textAlign: 'center',
              marginBottom: '16px',
              lineHeight: 1.3,
            }}
          >
            {titleHi}
          </div>
        )}

        {/* English title */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 400,
            color: '#c9a96e',
            textAlign: 'center',
            fontStyle: 'italic',
            marginBottom: '40px',
          }}
        >
          {titleEn}
        </div>

        {theme && (
          <div
            style={{
              fontSize: '14px',
              color: '#8b7355',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '40px',
            }}
          >
            {theme}
          </div>
        )}

        {/* Decorative rule */}
        <div
          style={{
            width: '60px',
            height: '1px',
            background: '#4a3728',
            marginBottom: '40px',
          }}
        />

        {/* Wordmark */}
        <div
          style={{
            fontSize: '20px',
            color: '#6b5040',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Stuti Geet
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
