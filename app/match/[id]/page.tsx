import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMatches, getMatch, getTeams, getVenues, getBroadcasts } from '@kickoff26/data';
import { tokenLabel, matchContext, STAGE_LABEL } from '@kickoff26/core';
import { toEvents, teamMap, venueMap } from '@kickoff26/core';
import LocalTime from '@/components/LocalTime';
import AddToCalendar from '@/components/AddToCalendar';
import WhereToWatch from '@/components/WhereToWatch';

export function generateStaticParams() {
  return getMatches().map((m) => ({ id: String(m.id) }));
}

export default function MatchPage({ params }: { params: { id: string } }) {
  const match = getMatch(Number(params.id));
  if (!match) notFound();

  const teams = getTeams();
  const venues = getVenues();
  const tMap = teamMap(teams);
  const a = tokenLabel(match.team1, tMap);
  const b = tokenLabel(match.team2, tMap);
  const venue = venues.find((v) => v.id === match.venue_id);
  const events = toEvents([match], tMap, venueMap(venues));

  return (
    <article className="match-detail">
      <p className="muted">
        <Link href="/schedule/">← Schedule</Link> · {STAGE_LABEL[match.stage]}
        {match.group ? ` · Group ${match.group}` : ''} · Match {match.id}
      </p>

      <div className="versus">
        <Side label={a} href={a.href} />
        <span className="versus-vs">vs</span>
        <Side label={b} href={b.href} />
      </div>

      <div className="match-facts">
        <div className="fact">
          <span className="muted">Kickoff</span>
          <LocalTime utc={match.kickoff_utc} className="fact-big" />
        </div>
        {venue && (
          <div className="fact">
            <span className="muted">Venue</span>
            <Link href={`/venue/${venue.id}/`} className="fact-big">
              {venue.name}
            </Link>
            <span className="muted small">
              {venue.city}, {venue.country} · {venue.capacity.toLocaleString()} seats
            </span>
          </div>
        )}
        <div className="fact">
          <span className="muted">Stage</span>
          <span className="fact-big">{matchContext(match)}</span>
        </div>
      </div>

      <AddToCalendar events={events} filename={`kickoff26-match-${match.id}.ics`} label="Add this match to Calendar" />

      <h2 className="section-h">Where to watch — free first</h2>
      <WhereToWatch broadcasts={getBroadcasts()} compact />
    </article>
  );
}

function Side({ label, href }: { label: ReturnType<typeof tokenLabel>; href?: string }) {
  const inner = (
    <>
      <span className="versus-flag">{label.flag ?? '🏳️'}</span>
      <span className="versus-name">{label.text}</span>
    </>
  );
  return href ? (
    <Link href={href} className="versus-side">
      {inner}
    </Link>
  ) : (
    <span className="versus-side">{inner}</span>
  );
}
