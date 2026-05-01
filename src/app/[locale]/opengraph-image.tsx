import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const fontkit = require('fontkit') as any;

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Stuti Geet — Christian Hindi Worship Songs';

const devanagariTtf = readFileSync(
  join(process.cwd(), 'public/fonts/NotoSansDevanagari-Bold.ttf'),
);
const crimsonItalic = readFileSync(
  join(process.cwd(), 'public/fonts/CrimsonPro-Italic.ttf'),
);

// Satori's layout engine does not apply Indic pre-base reordering (the rule
// that places the ि matra visually before its consonant). We bypass it by
// using fontkit (which does full HarfBuzz-equivalent shaping) to convert the
// Devanagari string to SVG path data, then embed the paths directly.
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
const fkFont = fontkit.create(devanagariTtf);

function devanagariToSvgPaths(
  text: string,
  fontSize: number,
  fill: string,
): { paths: { d: string; transform: string }[]; width: number; height: number; fill: string } {
  const scale = fontSize / (fkFont as { unitsPerEm: number }).unitsPerEm;
  const f = fkFont as {
    ascent: number;
    descent: number;
    layout: (t: string) => {
      glyphs: { path: { toSVG: () => string } }[];
      positions: { xAdvance: number; xOffset: number; yOffset: number }[];
    };
  };
  const baseline = f.ascent * scale;
  const run = f.layout(text);
  const paths: { d: string; transform: string }[] = [];
  let x = 0;
  for (let i = 0; i < run.glyphs.length; i++) {
    const g = run.glyphs[i];
    const pos = run.positions[i];
    const svgD = g.path.toSVG();
    if (svgD) {
      const gx = (x + pos.xOffset * scale).toFixed(2);
      const gy = (baseline - pos.yOffset * scale).toFixed(2);
      const s = scale.toFixed(6);
      paths.push({ d: svgD, transform: `translate(${gx},${gy}) scale(${s},-${s})` });
    }
    x += pos.xAdvance * scale;
  }
  return {
    paths,
    width: Math.ceil(x),
    height: Math.ceil((f.ascent - f.descent) * scale),
    fill,
  };
}

// Pre-compute at module load so cold starts pay once, not per request.
const brandPaths = devanagariToSvgPaths('स्तुति गीत', 88, '#f5efe6');

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

        {/* Devanagari rendered via fontkit SVG paths — correct ि positioning */}
        <div style={{ display: 'flex', marginBottom: '16px' }}>
          <svg
            width={brandPaths.width}
            height={brandPaths.height}
            viewBox={`0 0 ${brandPaths.width} ${brandPaths.height}`}
          >
            {brandPaths.paths.map((p, i) => (
              <path key={i} d={p.d} transform={p.transform} fill={brandPaths.fill} />
            ))}
          </svg>
        </div>

        <div
          style={{
            fontFamily: 'CrimsonPro',
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
    {
      ...size,
      fonts: [
        { name: 'CrimsonPro', data: crimsonItalic, weight: 400, style: 'italic' },
      ],
    },
  );
}
