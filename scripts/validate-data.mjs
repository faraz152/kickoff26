#!/usr/bin/env node
// Standalone integrity check for /data — runs in CI with no network and no deps. Fails loudly so a
// bad data PR can't merge. Counts are the headline (104/48/12/16); the rest catches dangling refs.
//
// Usage: node scripts/validate-data.mjs

import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const load = async (f) => JSON.parse(await readFile(join(DATA, f), 'utf8'));

const errors = [];
const warns = [];
const fail = (c, m) => { if (c) errors.push(m); };
const warn = (c, m) => { if (c) warns.push(m); };

const STAGES = new Set(['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final']);
const CONFEDS = new Set(['UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC']);
const ISO_Z = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const PLACEHOLDER = /^([12][A-L]|3[A-L](\/[A-L])+|[WL]\d{1,3})$/; // 1A, 2B, 3A/B/C/D/F, W74, L101

const [matches, teams, groups, venues, broadcasts] = await Promise.all(
  ['matches.json', 'teams.json', 'groups.json', 'venues.json', 'broadcasts.json'].map(load),
);

const teamIds = new Set(teams.map((t) => t.id));
const venueIds = new Set(venues.map((v) => v.id));

// headline counts
fail(teams.length !== 48, `teams: expected 48, got ${teams.length}`);
fail(groups.length !== 12, `groups: expected 12, got ${groups.length}`);
fail(venues.length !== 16, `venues: expected 16, got ${venues.length}`);
warn(matches.length !== 104, `matches: expected 104, got ${matches.length} (knockouts may not be filled)`);

// matches
const ids = new Set();
for (const m of matches) {
  const at = `match ${m.id}`;
  fail(ids.has(m.id), `${at}: duplicate id`);
  ids.add(m.id);
  fail(!STAGES.has(m.stage), `${at}: bad stage "${m.stage}"`);
  fail(!ISO_Z.test(m.kickoff_utc), `${at}: kickoff_utc not UTC ISO "${m.kickoff_utc}"`);
  fail(!venueIds.has(m.venue_id), `${at}: unknown venue_id "${m.venue_id}"`);
  fail(m.stage === 'group' && !/^[A-L]$/.test(m.group || ''), `${at}: group stage needs a group A–L`);
  for (const t of [m.team1, m.team2]) {
    fail(!teamIds.has(t) && !PLACEHOLDER.test(t), `${at}: "${t}" is neither a known team nor a valid placeholder`);
  }
}

// teams
const seenTeam = new Set();
for (const t of teams) {
  const at = `team ${t.id}`;
  fail(seenTeam.has(t.id), `${at}: duplicate id`);
  seenTeam.add(t.id);
  fail(!t.name || !t.code, `${at}: missing name/code`);
  fail(!CONFEDS.has(t.confederation), `${at}: bad confederation "${t.confederation}"`);
  fail(!(t.fifa_rank >= 1 && t.fifa_rank <= 210), `${at}: implausible rank ${t.fifa_rank}`);
  fail(!/^[A-L]$/.test(t.group || ''), `${at}: bad group "${t.group}"`);
}

// groups
const grouped = teams.filter((t) => t.group).length;
fail(grouped !== 48, `expected all 48 teams assigned to a group, got ${grouped}`);
for (const g of groups) {
  const at = `group ${g.id}`;
  fail(g.teams.length !== 4, `${at}: ${g.teams.length} teams (want 4)`);
  for (const id of g.teams) fail(!teamIds.has(id), `${at}: unknown team "${id}"`);
}

// venues
for (const v of venues) {
  const at = `venue ${v.id}`;
  fail(!v.name || !v.city || !v.country, `${at}: missing name/city/country`);
  fail(!/^[A-Za-z]+\/[A-Za-z_]+/.test(v.tz), `${at}: bad IANA tz "${v.tz}"`);
}

// broadcasts: ISO keys, free-first ordering, official sources, and a hard no-pirate guard
const TYPE_RANK = { 'free-tv': 0, 'free-stream': 1, 'radio': 2, 'paid-tv': 3, 'paid-stream': 4 };
const COST = new Set(['free', 'paid']);
const PIRATE = /(pirate|iptv|reddit|telegram|crackstream|sportsurge|totalsportek|rojadirecta|streameast|t\.me\/)/i;
for (const [cc, entry] of Object.entries(broadcasts)) {
  const at = `broadcasts.${cc}`;
  fail(!/^[A-Z]{2}$/.test(cc), `${at}: key must be ISO-3166 alpha-2`);
  fail(!entry.country, `${at}: missing country name`);
  fail(!Array.isArray(entry.channels) || entry.channels.length === 0, `${at}: no channels`);
  let prevRank = -1;
  for (const ch of entry.channels || []) {
    const cat = `${at} "${ch.name}"`;
    fail(!(ch.type in TYPE_RANK), `${cat}: bad type "${ch.type}"`);
    fail(!COST.has(ch.cost), `${cat}: cost must be free|paid`);
    fail(ch.type?.startsWith('free') && ch.cost !== 'free', `${cat}: free type with non-free cost`);
    fail(ch.type?.startsWith('paid') && ch.cost !== 'paid', `${cat}: paid type with non-paid cost`);
    fail(!Array.isArray(ch.languages) || !ch.languages.every((l) => /^[a-z]{2}$/.test(l)), `${cat}: languages must be ISO-639-1`);
    fail(!/^https?:\/\//.test(ch.url || ''), `${cat}: missing/invalid url`);
    warn(!ch.source, `${cat}: no official source link`);
    fail(PIRATE.test(`${ch.name} ${ch.url} ${ch.source || ''}`), `${cat}: looks like a pirate/restream link — banned`);
    fail(TYPE_RANK[ch.type] < prevRank, `${cat}: not free-first (paid listed before free)`);
    prevRank = Math.max(prevRank, TYPE_RANK[ch.type] ?? prevRank);
  }
}

if (warns.length) console.warn('⚠️  ' + warns.join('\n⚠️  '));
if (errors.length) {
  console.error(`❌ ${errors.length} problem(s):\n   ` + errors.join('\n   '));
  process.exit(1);
}
console.log(`✅ data valid — ${matches.length} matches · ${teams.length} teams · ${groups.length} groups · ${venues.length} venues · ${Object.keys(broadcasts).length} broadcast markets`);
