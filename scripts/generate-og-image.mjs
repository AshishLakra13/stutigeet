/**
 * generate-og-image.mjs
 * Builds public/og-image.png — the 1200×630 Open Graph card used by
 * WhatsApp / iMessage / Twitter / Facebook when the site is shared.
 *
 * Usage:
 *   npm install --save-dev sharp   (one-time)
 *   npm run og:generate
 *
 * Output:
 *   public/og-image.png
 *
 * Design:
 *   - Dark #1a1a1a background to match public/icon.svg.
 *   - Icon (360×360) on the left.
 *   - Wordmark + tagline on the right, with a gold accent rule.
 *   - Fonts use SVG font-family fallbacks (Crimson Pro / Georgia /
 *     Inter / system-ui). librsvg inside sharp resolves whichever is
 *     installed on the build host — Vercel's image and macOS dev
 *     machines both have Georgia and a sans fallback.
 */

import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const WIDTH = 1200;
const HEIGHT = 630;
const ICON_SIZE = 360;
const ICON_X = 80;
const ICON_Y = (HEIGHT - ICON_SIZE) / 2; // 135

const TEXT_X = ICON_X + ICON_SIZE + 40; // 480
const ACCENT = '#c9a96e';
const FG = '#ffffff';
const FG_DIM = '#d4c5a8';
const BG = '#1a1a1a';

const TITLE = 'Stuti Geet';
const TAGLINE_LINE_1 = 'Christian Hindi Worship Songs';
const TAGLINE_LINE_2 = 'Chord sheets & lyrics';

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildCanvasSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>
  <rect x="${TEXT_X}" y="200" width="80" height="2" fill="${ACCENT}"/>
  <text x="${TEXT_X}" y="300"
        font-family="'Crimson Pro', Georgia, 'Times New Roman', serif"
        font-size="96" font-weight="700" fill="${FG}">${escapeXml(TITLE)}</text>
  <text x="${TEXT_X}" y="380"
        font-family="'Inter', system-ui, -apple-system, 'Helvetica Neue', sans-serif"
        font-size="32" font-weight="500" fill="${ACCENT}">${escapeXml(TAGLINE_LINE_1)}</text>
  <text x="${TEXT_X}" y="425"
        font-family="'Inter', system-ui, -apple-system, 'Helvetica Neue', sans-serif"
        font-size="32" font-weight="400" fill="${FG_DIM}">${escapeXml(TAGLINE_LINE_2)}</text>
</svg>`;
}

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error(
      'sharp is not installed.\n' +
        '  Run: npm install --save-dev sharp\n' +
        '  Then re-run: npm run og:generate',
    );
    process.exit(1);
  }

  const iconSvgPath = resolve(root, 'public/icon.svg');
  const outDir = resolve(root, 'public');
  const outPath = resolve(outDir, 'og-image.png');
  mkdirSync(outDir, { recursive: true });

  const iconBuffer = await sharp(iconSvgPath)
    .resize(ICON_SIZE, ICON_SIZE)
    .png()
    .toBuffer();

  const canvasSvg = Buffer.from(buildCanvasSvg());

  await sharp(canvasSvg)
    .composite([{ input: iconBuffer, left: ICON_X, top: Math.round(ICON_Y) }])
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log(`public/og-image.png  (${WIDTH}x${HEIGHT})`);
  console.log('OG image generated successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
