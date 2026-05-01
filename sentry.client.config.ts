import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  environment: process.env.NODE_ENV,
  // Strip PII from breadcrumbs and events
  beforeSend(event) {
    if (event.request) {
      event.request.cookies = {};
    }
    return event;
  },
});
