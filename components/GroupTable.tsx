import Link from 'next/link';
import type { Match, Team } from '@/lib/types';
import { computeStandings } from '@/lib/standings';

// Server component — standings are computed at build (and rebuilt when results commit). No TZ needed.
export default function GroupTable({ id, teams, matches }: { id: string; teams: Team[]; matches: Match[] }) {
  const rows = computeStandings(teams, matches);
  return (
    <div className="group-card">
      <h3 className="group-title">Group {id}</h3>
      <table className="standings">
        <thead>
          <tr>
            <th></th>
            <th className="ta-l">Team</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GD</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.team.id} className={i < 2 ? 'qualify' : i === 2 ? 'maybe' : ''}>
              <td className="pos">{i + 1}</td>
              <td className="ta-l">
                <Link href={`/team/${r.team.id}/`} className="team-link">
                  <span className="flag">{r.team.flag}</span>
                  {r.team.name}
                </Link>
              </td>
              <td>{r.P}</td>
              <td>{r.W}</td>
              <td>{r.D}</td>
              <td>{r.L}</td>
              <td>{r.GD > 0 ? `+${r.GD}` : r.GD}</td>
              <td>
                <strong>{r.Pts}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
