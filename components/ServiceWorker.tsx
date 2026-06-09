'use client';

import { useEffect } from 'react';

// Registers the offline service worker (public/sw.js). Production only — during `next dev` a cached
// shell would mask code changes. Renders nothing.
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support is best-effort — a registration failure must never break the page */
    });
  }, []);
  return null;
}
