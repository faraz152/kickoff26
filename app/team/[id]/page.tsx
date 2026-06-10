import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTeams, getTeam, getMatches, getVenues, getBroadcasts, matchesForTeam } from '@kickoff26/data';
import { tokenLabel, matchContext } from '@kickoff26/core';
import { toEvents, teamMap, venueMap } from '@kickoff26/core';
import LocalTime from '@/components/LocalTime';
import AddToCalendar from '@/components/AddToCalendar';
import WhereToWatch from '@/components/WhereToWatch';
import GroupTable from '@/components/GroupTable';

export function generateStaticParams() {
  return getTeams().map((t) => ({ id: t.id }));
}

export default function TeamPage({ params }: { params: { id: string } }) {
  const team = getTeam(params.id);
  if (!team) notFound();

  const teams = getTeams();
  const venues = getVenues();
  const tMap = teamMap(teams);
  const fixtures = matchesForTeam(team.id);
  const events = toEvents(fixtures, tMap, venueMap(venues));
  const groupTeams = teams.filter((t) => t.group === team.group);
  const groupMatches = getMatches().filter((m) => m.group === team.group);

  return (
    <article>
      <p className="muted">
        <Link href="/groups/">← Groups</Link>
      </p>
      <header className="team-head">
        <span className="team-flag">{team.flag}</span>
        <div className="team-head-info">
          <h1>{team.name}</h1>
          <p className="muted">
            Group {team.group} · FIFA #{team.fifa_rank} · {team.confederation}
          </p>
        </div>
        <AddToCalendar events={events} filename={`kickoff26-${team.id}.ics`} label="Add all matches" />
      </header>

      <h2 className="section-h">Group-stage fixtures</h2>
      <ul className="match-list">
        {fixtures.map((m) => {
          const opp = m.team1 === team.id ? tokenLabel(m.team2, tMap) : tokenLabel(m.team1, tMap);
          const v = venues.find((x) => x.id === m.venue_id);
          return (
            <li key={m.id}>
              <Link href={`/match/${m.id}/`} className="match-row">
                <LocalTime utc={m.kickoff_utc} className="m-time" />
                <span className="m-teams">
                  <span className="muted">vs</span>
                  <span className="m-team">
                    {opp.flag && <span className="flag">{opp.flag}</span>}
                    {opp.text}
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

      {team.group && (
        <>
          <h2 className="section-h">Group {team.group} table</h2>
          <GroupTable id={team.group} teams={groupTeams} matches={groupMatches} />
          <p className="muted small">
            Finish top 2 to reach the Round of 32 directly; the 8 best third-placed teams also advance.
          </p>
        </>
      )}

      <h2 className="section-h">Where to watch</h2>
      <WhereToWatch broadcasts={getBroadcasts()} compact />
    </article>
  );
}
