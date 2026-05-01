import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['hi', 'en'],
  defaultLocale: 'hi',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
