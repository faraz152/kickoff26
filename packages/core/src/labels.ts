import type { Match, Team } from './types';

export type TeamLookup = Map<string, Team> | Record<string, Team>;

function lookup(map: TeamLookup, id: string): Team | undefined {
  return map instanceof Map ? map.get(id) : map[id];
}

export interface TokenLabel {
  text: string;
  flag?: string;
  href?: string;
  known: boolean; // true when it resolves to a real team
}

// A match team1/team2 is either a team slug or a FIFA placeholder. Render both nicely.
export function tokenLabel(token: string, teams: TeamLookup): TokenLabel {
  const team = lookup(teams, token);
  if (team) return { text: team.name, flag: team.flag, href: `/team/${team.id}/`, known: true };

  let m: RegExpMatchArray | null;
  if ((m = token.match(/^([12])([A-L])$/))) {
    return { text: `${m[1] === '1' ? 'Winner' : 'Runner-up'} Group ${m[2]}`, known: false };
  }
  if ((m = token.match(/^3([A-L](?:\/[A-L])+)$/))) {
    return { text: `3rd place (${m[1]})`, known: false };
  }
  if ((m = token.match(/^W(\d+)$/))) {
    return { text: `Winner of Match ${m[1]}`, known: false };
  }
  if ((m = token.match(/^L(\d+)$/))) {
    return { text: `Loser of Match ${m[1]}`, known: false };
  }
  return { text: token, known: false };
}

export const STAGE_LABEL: Record<Match['stage'], string> = {
  group: 'Group Stage',
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Quarter-final',
  sf: 'Semi-final',
  third: 'Third-place Play-off',
  final: 'Final',
};

/** Short context line for a match, e.g. "Group A" or "Round of 16". */
export function matchContext(m: Match): string {
  return m.stage === 'group' ? `Group ${m.group}` : STAGE_LABEL[m.stage];
}

/** Plain-text title for headings, calendar SUMMARY, etc. */
export function matchTitle(m: Match, teams: TeamLookup, withFlags = true): string {
  const a = tokenLabel(m.team1, teams);
  const b = tokenLabel(m.team2, teams);
  const fa = withFlags && a.flag ? `${a.flag} ` : '';
  const fb = withFlags && b.flag ? `${b.flag} ` : '';
  return `${fa}${a.text} vs ${fb}${b.text} — WC26 ${matchContext(m)}`;
}
