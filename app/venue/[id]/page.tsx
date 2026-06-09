import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getVenues, getVenue, getMatches, getTeams } from '@/lib/data';
import { tokenLabel, matchContext } from '@/lib/labels';
import { toEvents, teamMap, venueMap } from '@/lib/calendar';
import LocalTime from '@/components/LocalTime';
import AddToCalendar from '@/components/AddToCalendar';

export function generateStaticParams() {
  return getVenues().map((v) => ({ id: v.id }));
}

export default function VenuePage({ params }: { params: { id: string } }) {
  const venue = getVenue(params.id);
  if (!venue) notFound();

  const teams = getTeams();
  const venues = getVenues();
  const tMap = teamMap(teams);
  const fixtures = getMatches()
    .filter((m) => m.venue_id === venue.id)
    .sort((a, b) => a.kickoff_utc.localeCompare(b.kickoff_utc));
  const events = toEvents(fixtures, tMap, venueMap(venues));

  return (
    <article>
      <p className="muted">
        <Link href="/venue/">← All venues</Link>
      </p>
      <header className="team-head">
        <span className="team-flag">🏟️</span>
        <div className="team-head-info">
          <h1>{venue.name}</h1>
          <p className="muted">
            {venue.city}, {venue.country} · {venue.capacity.toLocaleString()} seats · {venue.tz.replace(/_/g, ' ')}
          </p>
        </div>
        {events.length > 0 && (
          <AddToCalendar events={events} filename={`kickoff26-${venue.id}.ics`} label="Add all matches" />
        )}
      </header>

      <h2 className="section-h">
        {fixtures.length} {fixtures.length === 1 ? 'match' : 'matches'} here
      </h2>
      <ul className="match-list">
        {fixtures.map((m) => {
          const a = tokenLabel(m.team1, tMap);
          const b = tokenLabel(m.team2, tMap);
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
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
