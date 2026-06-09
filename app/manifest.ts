import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'kickoff26 — World Cup 2026 companion',
    short_name: 'kickoff26',
    description: 'Every World Cup 2026 match in your timezone. Where to watch free in your country.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f1115',
    theme_color: '#0b7a3b',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
