import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Stuti Geet — Christian Hindi Worship Songs';

export default function OgImage() {
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
          background:
            'linear-gradient(135deg, #1a1a1a 0%, #2d1f0e 50%, #1a1a1a 100%)',
          padding: '80px',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '2px',
            background: '#c9a96e',
            marginBottom: '40px',
          }}
        />

        <div
          style={{
            fontSize: '88px',
            fontWeight: 700,
            color: '#f5efe6',
            textAlign: 'center',
            marginBottom: '16px',
            lineHeight: 1.2,
          }}
        >
          स्तुति गीत
        </div>

        <div
          style={{
            fontSize: '40px',
            fontWeight: 400,
            color: '#c9a96e',
            textAlign: 'center',
            fontStyle: 'italic',
            marginBottom: '40px',
          }}
        >
          Stuti Geet
        </div>

        <div
          style={{
            fontSize: '16px',
            color: '#8b7355',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            marginBottom: '40px',
          }}
        >
          Christian Hindi Worship Songs
        </div>

        <div
          style={{
            width: '60px',
            height: '1px',
            background: '#4a3728',
            marginBottom: '40px',
          }}
        />

        <div
          style={{
            fontSize: '20px',
            color: '#6b5040',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          chord sheets &amp; lyrics
        </div>
      </div>
    ),
    { ...size },
  );
}
