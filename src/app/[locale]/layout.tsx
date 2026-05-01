import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { crimsonPro, inter, devanagari, devanagarSerif } from '@/lib/fonts';
import { ThemeProvider } from '@/components/theme-provider';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { Analytics } from '@vercel/analytics/next';
import { routing } from '@/i18n/routing';

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? 'stutigeet.com';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://stutigeet.com';

const SITE_TITLE = 'Stuti Geet — Christian Hindi Worship Songs';
const SITE_DESCRIPTION = 'Chord sheets and lyrics for Christian Hindi worship songs';

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  manifest: '/manifest.json',
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: BASE_URL,
    languages: { hi: BASE_URL, en: `${BASE_URL}/en/` },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Stuti Geet',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'Stuti Geet',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stuti Geet',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const nonce = (await headers()).get('x-nonce') ?? '';

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${crimsonPro.variable} ${inter.variable} ${devanagari.variable} ${devanagarSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
        <ServiceWorkerRegister />
        <Analytics />
        {/* Plausible privacy-respecting analytics — no cookie banner needed */}
        {PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            nonce={nonce || undefined}
          />
        )}
      </body>
    </html>
  );
}
