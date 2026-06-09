import type { Match, Team } from './types';

export interface Row {
  team: Team;
  P: number;
  W: number;
  D: number;
  L: number;
  GF: number;
  GA: number;
  GD: number;
  Pts: number;
}

function blank(team: Team): Row {
  return { team, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0 };
}

function applyResult(row: Row, gf: number, ga: number) {
  row.P += 1;
  row.GF += gf;
  row.GA += ga;
  row.GD = row.GF - row.GA;
  if (gf > ga) {
    row.W += 1;
    row.Pts += 3;
  } else if (gf === ga) {
    row.D += 1;
    row.Pts += 1;
  } else {
    row.L += 1;
  }
}

// Head-to-head re-rank over ONLY the matches between the tied teams (FIFA steps 4–6).
function headToHead(tied: Row[], matches: Match[]): Row[] {
  const ids = new Set(tied.map((r) => r.team.id));
  const mini = new Map(tied.map((r) => [r.team.id, blank(r.team)]));
  for (const m of matches) {
    if (m.status !== 'finished') continue;
    if (!ids.has(m.team1) || !ids.has(m.team2)) continue;
    const [g1, g2] = m.score.ft;
    if (g1 == null || g2 == null) continue;
    applyResult(mini.get(m.team1)!, g1, g2);
    applyResult(mini.get(m.team2)!, g2, g1);
  }
  return [...mini.values()].sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF);
}

/**
 * Standings for a group. `teams` are the four group teams; `matches` their group matches.
 * Sort: Pts → GD → GF, then head-to-head among the still-tied, then FIFA rank as the final
 * (deterministic, no-results) fallback. Pre-tournament every row is zeros → pure rank order.
 */
export function computeStandings(teams: Team[], matches: Match[]): Row[] {
  const rows = new Map(teams.map((t) => [t.id, blank(t)]));
  for (const m of matches) {
    if (m.status !== 'finished') continue;
    const [g1, g2] = m.score.ft;
    if (g1 == null || g2 == null) continue;
    if (rows.has(m.team1)) applyResult(rows.get(m.team1)!, g1, g2);
    if (rows.has(m.team2)) applyResult(rows.get(m.team2)!, g2, g1);
  }

  const ordered = [...rows.values()].sort(
    (a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.team.fifa_rank - b.team.fifa_rank,
  );

  // Break exact Pts/GD/GF ties with head-to-head, preserving block position.
  const out: Row[] = [];
  for (let i = 0; i < ordered.length; ) {
    let j = i + 1;
    while (
      j < ordered.length &&
      ordered[j].Pts === ordered[i].Pts &&
      ordered[j].GD === ordered[i].GD &&
      ordered[j].GF === ordered[i].GF
    )
      j++;
    const block = ordered.slice(i, j);
    out.push(...(block.length > 1 && block[0].P > 0 ? headToHead(block, matches) : block));
    i = j;
  }
  return out;
}
