#!/usr/bin/env node
// ETL: openfootball/worldcup.json (2026) -> kickoff26 canonical /data/*.json.
// openfootball is the public-domain source of truth (no API key). We derive a real UTC kickoff from
// its "local time + offset", slugify teams, attach venue/IANA-tz + rank metadata, number matches to
// FIFA's scheme, then validate counts. Re-runnable: same input -> byte-identical output.
//
// Usage: node scripts/build-data.mjs [--offline]
//   --offline   use the cached openfootball snapshot instead of fetching.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');
const CACHE = join(ROOT, 'scripts', '.cache', 'worldcup-2026.json');
const SOURCE = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

// --- reference metadata openfootball doesn't carry (ranks ~Apr 2026; verify on build) -------------
// keyed by the EXACT openfootball token so matches.json slugs line up with teams.json ids.
const TEAMS_META = {
  'Mexico':                { name: 'Mexico', code: 'MEX', flag: '🇲🇽', rank: 15, confed: 'CONCACAF' },
  'South Korea':           { name: 'South Korea', code: 'KOR', flag: '🇰🇷', rank: 27, confed: 'AFC' },
  'Czech Republic':        { name: 'Czechia', code: 'CZE', flag: '🇨🇿', rank: 34, confed: 'UEFA' },
  'South Africa':          { name: 'South Africa', code: 'RSA', flag: '🇿🇦', rank: 63, confed: 'CAF' },
  'Switzerland':           { name: 'Switzerland', code: 'SUI', flag: '🇨🇭', rank: 19, confed: 'UEFA' },
  'Canada':                { name: 'Canada', code: 'CAN', flag: '🇨🇦', rank: 40, confed: 'CONCACAF' },
  'Qatar':                 { name: 'Qatar', code: 'QAT', flag: '🇶🇦', rank: 48, confed: 'AFC' },
  'Bosnia & Herzegovina':  { name: 'Bosnia & Herzegovina', code: 'BIH', flag: '🇧🇦', rank: 52, confed: 'UEFA' },
  'Brazil':                { name: 'Brazil', code: 'BRA', flag: '🇧🇷', rank: 6, confed: 'CONMEBOL' },
  'Morocco':               { name: 'Morocco', code: 'MAR', flag: '🇲🇦', rank: 8, confed: 'CAF' },
  'Scotland':              { name: 'Scotland', code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', rank: 36, confed: 'UEFA' },
  'Haiti':                 { name: 'Haiti', code: 'HAI', flag: '🇭🇹', rank: 115, confed: 'CONCACAF' },
  'USA':                   { name: 'United States', code: 'USA', flag: '🇺🇸', rank: 16, confed: 'CONCACAF' },
  'Australia':             { name: 'Australia', code: 'AUS', flag: '🇦🇺', rank: 24, confed: 'AFC' },
  'Turkey':                { name: 'Türkiye', code: 'TUR', flag: '🇹🇷', rank: 37, confed: 'UEFA' },
  'Paraguay':              { name: 'Paraguay', code: 'PAR', flag: '🇵🇾', rank: 61, confed: 'CONMEBOL' },
  'Germany':               { name: 'Germany', code: 'GER', flag: '🇩🇪', rank: 10, confed: 'UEFA' },
  'Ecuador':               { name: 'Ecuador', code: 'ECU', flag: '🇪🇨', rank: 32, confed: 'CONMEBOL' },
  'Ivory Coast':           { name: 'Ivory Coast', code: 'CIV', flag: '🇨🇮', rank: 53, confed: 'CAF' },
  'Curaçao':               { name: 'Curaçao', code: 'CUW', flag: '🇨🇼', rank: 103, confed: 'CONCACAF' },
  'Netherlands':           { name: 'Netherlands', code: 'NED', flag: '🇳🇱', rank: 7, confed: 'UEFA' },
  'Japan':                 { name: 'Japan', code: 'JPN', flag: '🇯🇵', rank: 18, confed: 'AFC' },
  'Sweden':                { name: 'Sweden', code: 'SWE', flag: '🇸🇪', rank: 38, confed: 'UEFA' },
  'Tunisia':               { name: 'Tunisia', code: 'TUN', flag: '🇹🇳', rank: 44, confed: 'CAF' },
  'Belgium':               { name: 'Belgium', code: 'BEL', flag: '🇧🇪', rank: 9, confed: 'UEFA' },
  'Iran':                  { name: 'Iran', code: 'IRN', flag: '🇮🇷', rank: 23, confed: 'AFC' },
  'Egypt':                 { name: 'Egypt', code: 'EGY', flag: '🇪🇬', rank: 49, confed: 'CAF' },
  'New Zealand':           { name: 'New Zealand', code: 'NZL', flag: '🇳🇿', rank: 105, confed: 'OFC' },
  'Spain':                 { name: 'Spain', code: 'ESP', flag: '🇪🇸', rank: 2, confed: 'UEFA' },
  'Uruguay':               { name: 'Uruguay', code: 'URU', flag: '🇺🇾', rank: 17, confed: 'CONMEBOL' },
  'Saudi Arabia':          { name: 'Saudi Arabia', code: 'KSA', flag: '🇸🇦', rank: 57, confed: 'AFC' },
  'Cape Verde':            { name: 'Cape Verde', code: 'CPV', flag: '🇨🇻', rank: 73, confed: 'CAF' },
  'France':                { name: 'France', code: 'FRA', flag: '🇫🇷', rank: 1, confed: 'UEFA' },
  'Senegal':               { name: 'Senegal', code: 'SEN', flag: '🇸🇳', rank: 14, confed: 'CAF' },
  'Norway':                { name: 'Norway', code: 'NOR', flag: '🇳🇴', rank: 28, confed: 'UEFA' },
  'Iraq':                  { name: 'Iraq', code: 'IRQ', flag: '🇮🇶', rank: 66, confed: 'AFC' },
  'Argentina':             { name: 'Argentina', code: 'ARG', flag: '🇦🇷', rank: 3, confed: 'CONMEBOL' },
  'Austria':               { name: 'Austria', code: 'AUT', flag: '🇦🇹', rank: 25, confed: 'UEFA' },
  'Algeria':               { name: 'Algeria', code: 'ALG', flag: '🇩🇿', rank: 69, confed: 'CAF' },
  'Jordan':                { name: 'Jordan', code: 'JOR', flag: '🇯🇴', rank: 89, confed: 'AFC' },
  'Portugal':              { name: 'Portugal', code: 'POR', flag: '🇵🇹', rank: 5, confed: 'UEFA' },
  'Colombia':              { name: 'Colombia', code: 'COL', flag: '🇨🇴', rank: 13, confed: 'CONMEBOL' },
  'DR Congo':              { name: 'DR Congo', code: 'COD', flag: '🇨🇩', rank: 72, confed: 'CAF' },
  'Uzbekistan':            { name: 'Uzbekistan', code: 'UZB', flag: '🇺🇿', rank: 100, confed: 'AFC' },
  'England':               { name: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', rank: 4, confed: 'UEFA' },
  'Croatia':               { name: 'Croatia', code: 'CRO', flag: '🇭🇷', rank: 12, confed: 'UEFA' },
  'Ghana':                 { name: 'Ghana', code: 'GHA', flag: '🇬🇭', rank: 65, confed: 'CAF' },
  'Panama':                { name: 'Panama', code: 'PAN', flag: '🇵🇦', rank: 78, confed: 'CONCACAF' },
};

const VENUES_META = {
  'Mexico City':                            { id: 'estadio-azteca', name: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico', tz: 'America/Mexico_City', capacity: 87523 },
  'Guadalajara (Zapopan)':                  { id: 'estadio-akron', name: 'Estadio Akron', city: 'Guadalajara', country: 'Mexico', tz: 'America/Mexico_City', capacity: 49850 },
  'Monterrey (Guadalupe)':                  { id: 'estadio-bbva', name: 'Estadio BBVA', city: 'Monterrey', country: 'Mexico', tz: 'America/Monterrey', capacity: 53500 },
  'Atlanta':                                { id: 'mercedes-benz-stadium', name: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'USA', tz: 'America/New_York', capacity: 71000 },
  'Boston (Foxborough)':                    { id: 'gillette-stadium', name: 'Gillette Stadium', city: 'Foxborough', country: 'USA', tz: 'America/New_York', capacity: 65878 },
  'Dallas (Arlington)':                     { id: 'att-stadium', name: 'AT&T Stadium', city: 'Arlington', country: 'USA', tz: 'America/Chicago', capacity: 80000 },
  'Houston':                                { id: 'nrg-stadium', name: 'NRG Stadium', city: 'Houston', country: 'USA', tz: 'America/Chicago', capacity: 72220 },
  'Kansas City':                            { id: 'arrowhead-stadium', name: 'Arrowhead Stadium', city: 'Kansas City', country: 'USA', tz: 'America/Chicago', capacity: 76416 },
  'Los Angeles (Inglewood)':                { id: 'sofi-stadium', name: 'SoFi Stadium', city: 'Inglewood', country: 'USA', tz: 'America/Los_Angeles', capacity: 70240 },
  'Miami (Miami Gardens)':                  { id: 'hard-rock-stadium', name: 'Hard Rock Stadium', city: 'Miami Gardens', country: 'USA', tz: 'America/New_York', capacity: 65326 },
  'New York/New Jersey (East Rutherford)':  { id: 'metlife-stadium', name: 'MetLife Stadium', city: 'East Rutherford', country: 'USA', tz: 'America/New_York', capacity: 82500 },
  'Philadelphia':                           { id: 'lincoln-financial-field', name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA', tz: 'America/New_York', capacity: 69176 },
  'San Francisco Bay Area (Santa Clara)':   { id: 'levis-stadium', name: "Levi's Stadium", city: 'Santa Clara', country: 'USA', tz: 'America/Los_Angeles', capacity: 68500 },
  'Seattle':                                { id: 'lumen-field', name: 'Lumen Field', city: 'Seattle', country: 'USA', tz: 'America/Los_Angeles', capacity: 68740 },
  'Toronto':                                { id: 'bmo-field', name: 'BMO Field', city: 'Toronto', country: 'Canada', tz: 'America/Toronto', capacity: 45000 },
  'Vancouver':                              { id: 'bc-place', name: 'BC Place', city: 'Vancouver', country: 'Canada', tz: 'America/Vancouver', capacity: 54500 },
};

const STAGE_BY_ROUND = {
  'Round of 32': 'r32', 'Round of 16': 'r16', 'Quarter-final': 'qf',
  'Semi-final': 'sf', 'Match for third place': 'third', 'Final': 'final',
};

// --- helpers --------------------------------------------------------------------------------------
function slugify(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// "13:00 UTC-6" + "2026-06-11" -> "2026-06-11T19:00:00Z". The whole pipeline hinges on this.
function toUtcIso(date, timeWithOffset) {
  const [time, off] = timeWithOffset.trim().split(/\s+/);
  const m = off.match(/^UTC([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (!m) throw new Error(`unparseable offset in "${timeWithOffset}"`);
  const sign = m[1] === '-' ? -1 : 1;
  const offMin = sign * (Number(m[2]) * 60 + Number(m[3] || 0));
  const [Y, Mo, D] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  const utcMs = Date.UTC(Y, Mo - 1, D, h, min) - offMin * 60000;
  return new Date(utcMs).toISOString().replace('.000Z', 'Z');
}

// real team -> slug; FIFA placeholders (1A, 2B, 3A/B/C/D/F, W74, L101) pass through verbatim.
function resolveTeam(token) {
  return TEAMS_META[token] ? slugify(token) : token;
}

async function loadSource(offline) {
  await mkdir(dirname(CACHE), { recursive: true });
  if (!offline) {
    try {
      const res = await fetch(SOURCE);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      await writeFile(CACHE, text);
      return JSON.parse(text);
    } catch (e) {
      console.warn(`⚠️  fetch failed (${e.message}); falling back to cache`);
    }
  }
  if (!existsSync(CACHE)) throw new Error('no cached snapshot; run online once without --offline');
  return JSON.parse(await readFile(CACHE, 'utf8'));
}

// stable JSON: 2-space indent, trailing newline (clean git diffs)
function writeJson(file, obj) {
  return writeFile(join(DATA, file), JSON.stringify(obj, null, 2) + '\n');
}

// --- build ----------------------------------------------------------------------------------------
async function main() {
  const offline = process.argv.includes('--offline');
  const src = await loadSource(offline);
  const raw = src.matches;
  if (!Array.isArray(raw)) throw new Error('source has no matches[]');

  // matches: id = file index + 1 reproduces FIFA's match numbers, so W##/L## placeholders resolve
  // (group 1–72, R32 73–88, R16 89–96, QF 97–100, SF 101–102, third 103, final 104).
  const matches = raw.map((m, i) => {
    const stage = STAGE_BY_ROUND[m.round] ?? 'group';
    const venue = VENUES_META[m.ground];
    if (!venue) throw new Error(`unknown venue "${m.ground}" (match ${i + 1})`);
    return {
      id: i + 1,
      stage,
      round: m.round,
      group: m.group ? m.group.replace('Group ', '') : null,
      kickoff_utc: toUtcIso(m.date, m.time),
      venue_id: venue.id,
      team1: resolveTeam(m.team1),
      team2: resolveTeam(m.team2),
      score: { ft: [null, null], ht: [null, null], et: null, pens: null },
      status: 'scheduled',
    };
  });

  // teams: from metadata, group derived from openfootball membership (source of truth)
  const groupOf = {};
  for (const m of raw) {
    if (!m.group) continue;
    const g = m.group.replace('Group ', '');
    for (const t of [m.team1, m.team2]) if (TEAMS_META[t]) groupOf[t] = g;
  }
  const teams = Object.entries(TEAMS_META).map(([token, meta]) => ({
    id: slugify(token),
    name: meta.name,
    code: meta.code,
    flag: meta.flag,
    fifa_rank: meta.rank,
    group: groupOf[token] ?? null,
    confederation: meta.confed,
  })).sort((a, b) => a.id.localeCompare(b.id));

  // groups: A–L with their four team slugs (sorted for stable output)
  const groups = [...new Set(teams.map((t) => t.group).filter(Boolean))].sort().map((id) => ({
    id,
    teams: teams.filter((t) => t.group === id).map((t) => t.id).sort(),
  }));

  // venues: the 16 grounds, sorted by id
  const venues = Object.values(VENUES_META)
    .map((v) => ({ ...v }))
    .sort((a, b) => a.id.localeCompare(b.id));

  await mkdir(DATA, { recursive: true });
  await Promise.all([
    writeJson('matches.json', matches),
    writeJson('teams.json', teams),
    writeJson('groups.json', groups),
    writeJson('venues.json', venues),
  ]);

  report(matches, teams, groups, venues);
}

function report(matches, teams, groups, venues) {
  const byStage = matches.reduce((a, m) => ((a[m.stage] = (a[m.stage] || 0) + 1), a), {});
  console.log('✅ wrote data/{matches,teams,groups,venues}.json');
  console.log(`   matches ${matches.length}  teams ${teams.length}  groups ${groups.length}  venues ${venues.length}`);
  console.log('   by stage:', JSON.stringify(byStage));

  // Validate loudly. Hard-fail on the invariants; only WARN on knockouts (openfootball may back-fill).
  const problems = [];
  if (teams.length !== 48) problems.push(`expected 48 teams, got ${teams.length}`);
  if (groups.length !== 12) problems.push(`expected 12 groups, got ${groups.length}`);
  if (venues.length !== 16) problems.push(`expected 16 venues, got ${venues.length}`);
  for (const g of groups) if (g.teams.length !== 4) problems.push(`group ${g.id} has ${g.teams.length} teams`);
  if (problems.length) { console.error('❌ ' + problems.join('\n❌ ')); process.exit(1); }

  if (matches.length !== 104) console.warn(`⚠️  expected 104 matches, got ${matches.length} (knockouts may not be filled yet)`);
  const opener = matches.find((m) => m.id === 1);
  if (opener?.kickoff_utc !== '2026-06-11T19:00:00Z')
    console.warn(`⚠️  opener kickoff is ${opener?.kickoff_utc}, expected 2026-06-11T19:00:00Z`);
  else console.log('   opener UTC check ✓ (2026-06-11T19:00:00Z = 12:00 AM PKT Jun 12)');
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
