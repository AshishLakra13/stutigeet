'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker once the page loads.
 * Rendered in the root layout — no visible UI.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('SW registration failed:', err);
        });
      });
    }
  }, []);

  return null;
}
