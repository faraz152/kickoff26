import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import { TimezoneProvider } from '@/components/TimezoneContext';
import TimezonePicker from '@/components/TimezonePicker';

export const metadata: Metadata = {
  title: 'kickoff26 — World Cup 2026 in your timezone, watch free',
  description:
    'Every FIFA World Cup 2026 match in your timezone, one-tap calendar export, and where to watch free in your country. Open data, no ads, no tracking.',
  manifest: '/manifest.webmanifest',
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
        <TimezoneProvider>
          <header className="site-header">
            <div className="wrap header-inner">
              <Link href="/" className="brand">
                <span className="brand-mark">⚽</span> kickoff<span className="brand-26">26</span>
              </Link>
              <nav className="nav">
                <Link href="/schedule/">Schedule</Link>
                <Link href="/groups/">Groups</Link>
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
