/**
 * generate-icons.mjs
 * Converts public/icon.svg into PNG icons required by the PWA manifest.
 *
 * Usage:
 *   npm install --save-dev sharp   (one-time)
 *   node scripts/generate-icons.mjs
 *
 * Output:
 *   public/icons/icon-192.png
 *   public/icons/icon-512.png
 *   public/icons/icon-maskable-512.png  (same image, purpose: maskable)
 */

import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error(
      '❌  sharp is not installed.\n' +
      '   Run: npm install --save-dev sharp\n' +
      '   Then re-run: node scripts/generate-icons.mjs',
    );
    process.exit(1);
  }

  const svgPath = resolve(root, 'public/icon.svg');
  const outDir = resolve(root, 'public/icons');
  mkdirSync(outDir, { recursive: true });

  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-maskable-512.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(resolve(outDir, name));
    console.log(`✔  public/icons/${name}`);
  }

  console.log('\n✅  Icons generated successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
