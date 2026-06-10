'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Match, Team, Venue } from '@kickoff26/core';
import { formatTime, formatDayHeading, groupByLocalDate } from '@kickoff26/core';
import { tokenLabel, matchContext } from '@kickoff26/core';
import { useTimezone } from './TimezoneContext';

type StageFilter = 'all' | 'group' | 'ko';

export default function ScheduleView({
  matches,
  teams,
  venues,
}: {
  matches: Match[];
  teams: Team[];
  venues: Venue[];
}) {
  const { zone, ready } = useTimezone();
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const venueMap = useMemo(() => new Map(venues.map((v) => [v.id, v])), [venues]);

  const [stage, setStage] = useState<StageFilter>('all');
  const [group, setGroup] = useState('');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return matches.filter((m) => {
      if (stage === 'group' && m.stage !== 'group') return false;
      if (stage === 'ko' && m.stage === 'group') return false;
      if (group && m.group !== group) return false;
      if (needle) {
        const a = tokenLabel(m.team1, teamMap).text.toLowerCase();
        const b = tokenLabel(m.team2, teamMap).text.toLowerCase();
        if (!a.includes(needle) && !b.includes(needle)) return false;
      }
      return true;
    });
  }, [matches, stage, group, q, teamMap]);

  const days = useMemo(() => groupByLocalDate(filtered, zone), [filtered, zone]);

  return (
    <div>
      <div className="toolbar">
        <div className="seg" role="tablist" aria-label="Stage">
          {(['all', 'group', 'ko'] as StageFilter[]).map((s) => (
            <button key={s} className={stage === s ? 'seg-btn active' : 'seg-btn'} onClick={() => setStage(s)}>
              {s === 'all' ? 'All' : s === 'group' ? 'Groups' : 'Knockouts'}
            </button>
          ))}
        </div>
        <select className="select" value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Group">
          <option value="">All groups</option>
          {'ABCDEFGHIJKL'.split('').map((g) => (
            <option key={g} value={g}>
              Group {g}
            </option>
          ))}
        </select>
        <input
          className="search"
          placeholder="Search a team…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search team"
        />
      </div>

      <p className="muted tzline">
        {ready ? (
          <>
            Times shown in <strong>{zone.replace(/_/g, ' ')}</strong> · {filtered.length} matches
          </>
        ) : (
          <>Detecting your timezone…</>
        )}
      </p>

      {days.map(([date, dayMatches]) => (
        <section key={date} className="day">
          <h3 className="day-head">{formatDayHeading(dayMatches[0].kickoff_utc, zone)}</h3>
          <ul className="match-list">
            {dayMatches.map((m) => {
              const a = tokenLabel(m.team1, teamMap);
              const b = tokenLabel(m.team2, teamMap);
              const v = venueMap.get(m.venue_id);
              return (
                <li key={m.id}>
                  <Link href={`/match/${m.id}/`} className="match-row">
                    <span className="m-time">{formatTime(m.kickoff_utc, zone)}</span>
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
      ))}

      {filtered.length === 0 && <p className="empty">No matches match those filters.</p>}
    </div>
  );
}
