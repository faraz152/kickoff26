import Link from 'next/link';
import { getMatches, getTeams, getVenues } from '@/lib/data';
import { tokenLabel, matchContext } from '@/lib/labels';
import LocalTime from '@/components/LocalTime';

export default function Home() {
  const matches = getMatches();
  const teams = getTeams();
  const venues = getVenues();
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const venueMap = new Map(venues.map((v) => [v.id, v]));
  const upcoming = [...matches].sort((a, b) => a.kickoff_utc.localeCompare(b.kickoff_utc)).slice(0, 6);

  return (
    <>
      <section className="hero">
        <h1>
          The World Cup 2026,<br />in <span className="hl">your</span> timezone.
        </h1>
        <p className="lede">
          Every one of the 104 matches in your local time, one-tap calendar export, and where to watch{' '}
          <strong>free</strong> in your country. Open data, no ads, no tracking.
        </p>
        <div className="hero-cta">
          <Link href="/schedule/" className="btn btn-primary">
            See the schedule
          </Link>
          <Link href="/my-team/" className="btn">
            Pick my team
          </Link>
        </div>
      </section>

      <section className="cards">
        <Link href="/schedule/" className="card">
          <h3>🕑 Your timezone</h3>
          <p>Auto-detected, switchable to any zone on Earth. DST-correct. Add any match to your calendar.</p>
        </Link>
        <Link href="/watch/" className="card">
          <h3>📺 Watch free</h3>
          <p>Legal free-to-air & free streams first, paid after — for your country and language.</p>
        </Link>
        <Link href="/my-team/" className="card">
          <h3>⭐ My team</h3>
          <p>Your fixtures, your group table, and where you can watch — all personalised.</p>
        </Link>
      </section>

      <section>
        <div className="section-head">
          <h2>First up</h2>
          <Link href="/schedule/" className="muted">
            Full schedule →
          </Link>
        </div>
        <ul className="match-list">
          {upcoming.map((m) => {
            const a = tokenLabel(m.team1, teamMap);
            const b = tokenLabel(m.team2, teamMap);
            const v = venueMap.get(m.venue_id);
            return (
              <li key={m.id}>
                <Link href={`/match/${m.id}/`} className="match-row">
                  <LocalTime utc={m.kickoff_utc} className="m-time" />
                  <span className="m-teams">
                    <span className="m-team">
                      {a.flag && <span className="flag">{a.flag}</span>}
                      {a.text}
                    </span>
                    <span className="m-vs">v</span>
                    <span className="m-team">
                      {b.flag && <span className="flag">{b.flag}</span>}
                      {b.text}
                    </span>
                  </span>
                  <span className="m-meta">
                    <span className="chip">{matchContext(m)}</span>
                    {v && <span className="m-venue">{v.city}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
