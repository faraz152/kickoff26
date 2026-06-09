// Typed, build-time accessors over the canonical /data JSON. Imported by Server Components only —
// the data is baked into the static export, so there's no runtime fetch.
import matchesJson from '@/data/matches.json';
import teamsJson from '@/data/teams.json';
import groupsJson from '@/data/groups.json';
import venuesJson from '@/data/venues.json';
import broadcastsJson from '@/data/broadcasts.json';
import type { Match, Team, Group, Venue, Broadcasts } from './types';

const matches = matchesJson as Match[];
const teams = teamsJson as Team[];
const groups = groupsJson as Group[];
const venues = venuesJson as Venue[];
const broadcasts = broadcastsJson as Broadcasts;

const teamById = new Map(teams.map((t) => [t.id, t]));
const venueById = new Map(venues.map((v) => [v.id, v]));

export const getMatches = () => matches;
export const getMatch = (id: number) => matches.find((m) => m.id === id);
export const getTeams = () => teams;
export const getTeam = (id: string) => teamById.get(id);
export const getGroups = () => groups;
export const getGroup = (id: string) => groups.find((g) => g.id === id);
export const getVenues = () => venues;
export const getVenue = (id: string) => venueById.get(id);
export const getBroadcasts = () => broadcasts;

/** All matches a team appears in by slug (group stage; knockouts use placeholders). */
export const matchesForTeam = (teamId: string) =>
  matches.filter((m) => m.team1 === teamId || m.team2 === teamId).sort((a, b) => a.kickoff_utc.localeCompare(b.kickoff_utc));
