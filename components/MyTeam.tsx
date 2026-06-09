'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Broadcasts, Match, Team, Venue } from '@/lib/types';
import { formatKickoff } from '@/lib/tz';
import { tokenLabel, matchContext } from '@/lib/labels';
import { computeStandings } from '@/lib/standings';
import { toEvents } from '@/lib/calendar';
import { useTimezone } from './TimezoneContext';
import AddToCalendar from './AddToCalendar';
import WhereToWatch from './WhereToWatch';

const KEY = 'kickoff26-team';

export default function MyTeam({
  teams,
  matches,
  venues,
  broadcasts,
}: {
  teams: Team[];
  matches: Match[];
  venues: Venue[];
  broadcasts: Broadcasts;
}) {
  const { zone } = useTimezone();
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const venueMap = useMemo(() => new Map(venues.map((v) => [v.id, v])), [venues]);
  const [teamId, setTeamId] = useState('');

  useEffect(() => {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) || '';
    if (saved && teamMap.has(saved)) setTeamId(saved);
  }, [teamMap]);

  function choose(id: string) {
    setTeamId(id);
    try {
      localStorage.setItem(KEY, id);
    } catch {
      /* ignore */
    }
  }

  const team = teamId ? teamMap.get(teamId) : undefined;
  const fixtures = useMemo(
    () =>
      team
        ? matches
            .filter((m) => m.team1 === team.id || m.team2 === team.id)
            .sort((a, b) => a.kickoff_utc.localeCompare(b.kickoff_utc))
        : [],
    [matches, team],
  );
  const group = useMemo(() => (team?.group ? teams.filter((t) => t.group === team.group) : []), [teams, team]);
  const standings = useMemo(
    () => (team?.group ? computeStandings(group, matches.filter((m) => m.group === team.group)) : []),
    [group, matches, team],
  );
  const events = useMemo(() => toEvents(fixtures, teamMap, venueMap), [fixtures, teamMap, venueMap]);

  const byGroup = useMemo(() => {
    const m = new Map<string, Team[]>();
    for (const t of [...teams].sort((a, b) => a.fifa_rank - b.fifa_rank)) {
      const g = t.group ?? '?';
      (m.get(g) ?? m.set(g, []).get(g)!).push(t);
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [teams]);

  return (
    <div>
      <div className="myteam-pick">
        <label htmlFor="team" className="muted">
          Your team
        </label>
        <select id="team" className="select" value={teamId} onChange={(e) => choose(e.target.value)}>
          <option value="">Pick your country…</option>
          {byGroup.map(([g, ts]) => (
            <optgroup key={g} label={`Group ${g}`}>
              {ts.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.flag} {t.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {!team && <p className="muted">Pick your team to get your fixtures in your timezone, your group table, and where you can watch free.</p>}

      {team && (
        <div className="myteam">
          <header className="myteam-head">
            <span className="myteam-flag">{team.flag}</span>
            <div>
              <h2>{team.name}</h2>
              <p className="muted">
                Group {team.group} · FIFA #{team.fifa_rank} · {team.confederation}
              </p>
            </div>
            <AddToCalendar events={events} filename={`kickoff26-${team.id}.ics`} label="Add all matches" />
          </header>

          <h3 className="section-h">Fixtures</h3>
          <ul className="match-list">
            {fixtures.map((m) => {
              const opp = m.team1 === team.id ? tokenLabel(m.team2, teamMap) : tokenLabel(m.team1, teamMap);
              const v = venueMap.get(m.venue_id);
              return (
                <li key={m.id}>
                  <Link href={`/match/${m.id}/`} className="match-row">
                    <span className="m-time">{formatKickoff(m.kickoff_utc, zone)}</span>
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

          {standings.length > 0 && (
            <>
              <h3 className="section-h">Group {team.group}</h3>
              <table className="standings">
                <thead>
                  <tr>
                    <th></th>
                    <th className="ta-l">Team</th>
                    <th>P</th>
                    <th>GD</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((r, i) => (
                    <tr key={r.team.id} className={r.team.id === team.id ? 'me' : ''}>
                      <td className="pos">{i + 1}</td>
                      <td className="ta-l">
                        <span className="flag">{r.team.flag}</span>
                        {r.team.name}
                      </td>
                      <td>{r.P}</td>
                      <td>{r.GD > 0 ? `+${r.GD}` : r.GD}</td>
                      <td>
                        <strong>{r.Pts}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="muted small">Top 2 advance, plus the 8 best third-placed teams. Standings update as results come in.</p>
            </>
          )}

          <h3 className="section-h">Where to watch {team.name}</h3>
          <WhereToWatch broadcasts={broadcasts} compact />
        </div>
      )}
    </div>
  );
}
