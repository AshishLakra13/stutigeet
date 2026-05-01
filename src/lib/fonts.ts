import { Crimson_Pro, Inter, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from 'next/font/google';

export const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-crimson',
  weight: ['400', '500', '600', '700'],
});

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500'],
});

export const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  display: 'swap',
  variable: '--font-devanagari',
  weight: ['400', '500', '700'],
});

/** Used for lyrics display — more readable at large sizes than Sans. */
export const devanagarSerif = Noto_Serif_Devanagari({
  subsets: ['devanagari'],
  display: 'swap',
  variable: '--font-devanagari-serif',
  weight: ['400', '500', '700'],
});
