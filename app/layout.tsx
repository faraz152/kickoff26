import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import { TimezoneProvider } from '@/components/TimezoneContext';
import TimezonePicker from '@/components/TimezonePicker';
import ServiceWorker from '@/components/ServiceWorker';
import { SITE_URL } from '@kickoff26/core';

const description =
  'Every FIFA World Cup 2026 match in your timezone, one-tap calendar export, and where to watch free in your country. Open data, no ads, no tracking.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'kickoff26 — World Cup 2026 in your timezone, watch free',
  description,
  manifest: '/manifest.webmanifest',
  applicationName: 'kickoff26',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'kickoff26',
    title: 'kickoff26 — World Cup 2026 in your timezone, watch free',
    description,
    url: '/',
    images: [{ url: '/og.svg', width: 1200, height: 630, alt: 'kickoff26 — World Cup 2026 companion' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'kickoff26 — World Cup 2026 in your timezone, watch free',
    description,
    images: ['/og.svg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0b7a3b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ServiceWorker />
        <TimezoneProvider>
          <header className="site-header">
            <div className="wrap header-inner">
              <Link href="/" className="brand">
                <span className="brand-mark">⚽</span> kickoff<span className="brand-26">26</span>
              </Link>
              <nav className="nav">
                <Link href="/schedule/">Schedule</Link>
                <Link href="/groups/">Groups</Link>
                <Link href="/bracket/">Bracket</Link>
                <Link href="/watch/">Where to Watch</Link>
                <Link href="/my-team/">My Team</Link>
              </nav>
              <TimezonePicker />
            </div>
          </header>

          <main className="wrap main">{children}</main>

          <footer className="site-footer">
            <div className="wrap">
              <p>
                Open data · no ads · no tracking. Code <a href="https://opensource.org/license/mit">MIT</a>, data{' '}
                <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0</a>. Fixtures from{' '}
                <a href="https://github.com/openfootball/worldcup.json">openfootball</a>.
              </p>
              <p className="muted small">
                We never link unlicensed streams. Broadcast info is community-maintained — confirm on the broadcaster’s
                own site.
              </p>
            </div>
          </footer>
        </TimezoneProvider>
      </body>
    </html>
  );
}
