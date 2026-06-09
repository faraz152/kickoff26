import type { Match, Team, Venue } from './types';
import { matchTitle, type TeamLookup } from './labels';
import type { IcsEvent } from './ics';

export const SITE = 'https://kickoff26.app'; // public site (domain registered near launch)

/** Convert matches into calendar events, resolving team names + venue for each. */
export function toEvents(matches: Match[], teams: TeamLookup, venues: Map<string, Venue>): IcsEvent[] {
  return matches.map((m) => {
    const v = venues.get(m.venue_id);
    return {
      id: m.id,
      kickoff_utc: m.kickoff_utc,
      summary: matchTitle(m, teams),
      location: v ? `${v.name}, ${v.city}` : undefined,
      url: `${SITE}/match/${m.id}/`,
    };
  });
}

export const teamMap = (teams: Team[]) => new Map(teams.map((t) => [t.id, t]));
export const venueMap = (venues: Venue[]) => new Map(venues.map((v) => [v.id, v]));
