#!/usr/bin/env node
// Live results updater — runs as a GitHub Action during the tournament (see
// .github/workflows/update-live.yml). It self-gates to live windows so an idle run spends zero API
// quota, fetches scores for in-progress matches, patches `score` + `status` into matches.json, and
// resolves the knockout placeholders it now can (group winners/runners-up and match winners/losers).
//
// Single source of truth: the site computes standings live from matches.json (lib/standings.ts), so
// this script writes ONLY matches.json — there is no standings.json to keep in sync. Curated fields
// (kickoff_utc, venue_id, broadcasts, i18n) are never touched.
//
// Idempotent: same matches.json + same API state -> byte-identical output, so the workflow commits
// only on a real result change.
//
// Usage:
//   node scripts/update-results.mjs                 # poll live windows, patch + resolve
//   node scripts/update-results.mjs --mock f.json   # apply results from a local file (no network)
//   node scripts/update-results.mjs --now <iso>     # override "now" (window testing)
//   node scripts/update-results.mjs --dry           # compute but don't write

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = process.env.KICKOFF_DATA_DIR || join(ROOT, 'data');
const load = async (f) => JSON.parse(await readFile(join(DATA, f), 'utf8'));
const writeJson = (f, o) => writeFile(join(DATA, f), JSON.stringify(o, null, 2) + '\n');

// Poll window: a match is "pollable" from 5 min before kickoff until 6 h after — wide enough to catch
// one that finished while the cron wasn't firing. Already-finished matches are skipped.
const PRE_MS = 5 * 60_000;
const POST_MS = 6 * 60 * 60_000;

const argFlag = (n) => process.argv.includes(n);
const argVal = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };

// --- team-name → slug ----------------------------------------------------------------------------
// APIs spell countries every which way; normalise hard, then resolve via id/name/code plus a small
// alias table for the genuinely different spellings. Unknown name -> null (we skip, never guess).
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

const ALIASES = {
  unitedstatesofamerica: 'usa', us: 'usa', usmnt: 'usa',
  korearepublic: 'south-korea', republicofkorea: 'south-korea', koreasouth: 'south-korea',
  czechrepublic: 'czech-republic', czechia: 'czech-republic',
  turkiye: 'turkey',
  cotedivoire: 'ivory-coast', ivorycoast: 'ivory-coast',
  caboverde: 'cape-verde',
  iriran: 'iran', islamicrepublicofiran: 'iran',
  congodr: 'dr-congo', drcongo: 'dr-congo', democraticrepublicofthecongo: 'dr-congo',
  bosniaandherzegovina: 'bosnia-herzegovina',
};

function buildResolver(teams) {
  const map = new Map();
  for (const t of teams) {
    map.set(norm(t.id), t.id);
    map.set(norm(t.name), t.id);
    map.set(norm(t.code), t.id);
  }
  for (const [k, v] of Object.entries(ALIASES)) map.set(k, v);
  return (name) => map.get(norm(name)) ?? null;
}

// --- standings (port of lib/standings.ts; FIFA 2026 order) ----------------------------------------
const blank = (id) => ({ id, P: 0, GF: 0, GA: 0, GD: 0, Pts: 0 });
function tally(row, gf, ga) {
  row.P++; row.GF += gf; row.GA += ga; row.GD = row.GF - row.GA;
  if (gf > ga) row.Pts += 3; else if (gf === ga) row.Pts += 1;
}
function headToHead(tied, matches) {
  const ids = new Set(tied.map((r) => r.id));
  const mini = new Map(tied.map((r) => [r.id, blank(r.id)]));
  for (const m of matches) {
    if (m.status !== 'finished' || !ids.has(m.team1) || !ids.has(m.team2)) continue;
    const [a, b] = m.score.ft; if (a == null || b == null) continue;
    tally(mini.get(m.team1), a, b); tally(mini.get(m.team2), b, a);
  }
  return [...mini.values()].sort((x, y) => y.Pts - x.Pts || y.GD - x.GD || y.GF - x.GF);
}
// Returns team ids best→worst. `rankOf` (FIFA rank) is the deterministic final fallback.
function standings(teamIds, matches, rankOf) {
  const rows = new Map(teamIds.map((id) => [id, blank(id)]));
  for (const m of matches) {
    if (m.status !== 'finished' || !rows.has(m.team1) || !rows.has(m.team2)) continue;
    const [a, b] = m.score.ft; if (a == null || b == null) continue;
    tally(rows.get(m.team1), a, b); tally(rows.get(m.team2), b, a);
  }
  const ordered = [...rows.values()].sort(
    (a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || rankOf(a.id) - rankOf(b.id),
  );
  const out = [];
  for (let i = 0; i < ordered.length;) {
    let j = i + 1;
    while (j < ordered.length && ordered[j].Pts === ordered[i].Pts && ordered[j].GD === ordered[i].GD && ordered[j].GF === ordered[i].GF) j++;
    const block = ordered.slice(i, j);
    out.push(...(block.length > 1 && block[0].P > 0 ? headToHead(block, matches) : block));
    i = j;
  }
  return out.map((r) => r.id);
}

// --- knockout winner/loser ------------------------------------------------------------------------
// Pens decide, else extra time, else full time. Returns null until the match is finished & decided.
function decide(m) {
  if (m.status !== 'finished') return null;
  const isReal = (t) => !/^([12][A-L]|3[A-L](\/[A-L])+|[WL]\d{1,3})$/.test(t);
  if (!isReal(m.team1) || !isReal(m.team2)) return null;
  const pick = ([a, b]) => (a == null || b == null ? null : a > b ? m.team1 : a < b ? m.team2 : null);
  const s = m.score;
  let win = (s.pens && pick(s.pens)) || (s.et && pick(s.et)) || (s.ft && pick(s.ft)) || null;
  if (!win) return null;
  return { win, lose: win === m.team1 ? m.team2 : m.team1 };
}

// Replace every exact occurrence of placeholder `token` with team `slug` across both sides.
function substitute(matches, token, slug) {
  let n = 0;
  for (const m of matches) {
    if (m.team1 === token) { m.team1 = slug; n++; }
    if (m.team2 === token) { m.team2 = slug; n++; }
  }
  return n;
}

// Resolve 1X/2X (completed groups) and W##/L## (decided knockouts) to a fixed point. Third-place
// slots (3A/B/C/D/F …) need FIFA's 495-row Annex table — loaded from data/thirds-annex.json if
// present, otherwise left as placeholders (never fabricate the bracket).
function resolvePlaceholders(matches, teams, groups, log) {
  const rankOf = (() => { const r = new Map(teams.map((t) => [t.id, t.fifa_rank])); return (id) => r.get(id) ?? 999; })();
  let changed = true;
  while (changed) {
    changed = false;

    // group winners / runners-up
    for (const g of groups) {
      const gm = matches.filter((m) => m.stage === 'group' && m.group === g.id);
      if (gm.length === 0 || !gm.every((m) => m.status === 'finished')) continue;
      const order = standings(g.teams, gm, rankOf);
      for (const [token, slug] of [[`1${g.id}`, order[0]], [`2${g.id}`, order[1]]]) {
        const n = substitute(matches, token, slug);
        if (n) { changed = true; log.push(`resolved ${token} → ${slug}`); }
      }
    }

    // knockout winners / losers
    for (const m of matches) {
      if (m.stage === 'group') continue;
      const d = decide(m);
      if (!d) continue;
      for (const [token, slug] of [[`W${m.id}`, d.win], [`L${m.id}`, d.lose]]) {
        const n = substitute(matches, token, slug);
        if (n) { changed = true; log.push(`resolved ${token} → ${slug}`); }
      }
    }
  }

  // third-place Annex (optional)
  const annexPath = join(DATA, 'thirds-annex.json');
  if (existsSync(annexPath)) log.push('note: thirds-annex.json present — third-place resolution TODO (not yet wired)');
}

// --- result patching ------------------------------------------------------------------------------
// A result: { id?, team1?, team2?, ft:[a,b], ht?, et?, pens?, status }. Match by id (scores assumed in
// our team1/team2 orientation), else by the two resolved team slugs — in which case scores are flipped
// when the source lists the teams the other way round. Patches only score/status, only when changed.
function applyResults(matches, results, resolve, log) {
  const byId = new Map(matches.map((m) => [m.id, m]));
  const flip = (p) => (Array.isArray(p) ? [p[1], p[0]] : p);
  let changed = false;
  for (const r of results) {
    let m = r.id != null ? byId.get(r.id) : null;
    let swapped = false;
    if (!m && r.team1 && r.team2) {
      const s1 = resolve(r.team1), s2 = resolve(r.team2);
      m = matches.find((x) => x.team1 === s1 && x.team2 === s2) ||
          matches.find((x) => x.team1 === s2 && x.team2 === s1) || null;
      swapped = m != null && m.team1 === s2; // source home == our away
    }
    if (!m) { log.push(`skip: no match for ${r.id ?? `${r.team1} v ${r.team2}`}`); continue; }

    const orient = swapped ? flip : (p) => p;
    const next = {
      ft: r.ft ? orient(r.ft) : m.score.ft,
      ht: r.ht ? orient(r.ht) : m.score.ht,
      et: r.et ? orient(r.et) : m.score.et,
      pens: r.pens ? orient(r.pens) : m.score.pens,
    };
    const status = r.status ?? m.status;
    if (JSON.stringify(m.score) === JSON.stringify(next) && m.status === status) continue;
    m.score = next; m.status = status;
    changed = true;
    log.push(`match ${m.id}: ${m.team1} ${next.ft[0]}–${next.ft[1]} ${m.team2} [${status}]`);
  }
  return changed;
}

// --- providers ------------------------------------------------------------------------------------
// Network is isolated here so the engine above is fully testable offline (--mock). The free tiers are
// tiny: poll only when something is live, cache, and fall through on failure. NOTE: confirm each
// provider's exact response shape against a live fixture on matchday — parsing is best-effort.
async function fetchLive(pollable, resolve, log) {
  const want = new Set();
  for (const m of pollable) { want.add(`${m.team1}|${m.team2}`); want.add(`${m.team2}|${m.team1}`); }

  const providers = [
    async () => { // balldontlie FIFA
      const res = await fetch('https://fifa.balldontlie.io/v1/games?per_page=100', {
        headers: process.env.LIVE_API_KEY ? { Authorization: process.env.LIVE_API_KEY } : {},
      });
      if (!res.ok) throw new Error(`balldontlie HTTP ${res.status}`);
      const { data = [] } = await res.json();
      return data.map((g) => ({
        team1: resolve(g.home_team?.name), team2: resolve(g.visitor_team?.name),
        ft: [g.home_team_score ?? null, g.visitor_team_score ?? null],
        status: /final|finished|ft/i.test(g.status) ? 'finished' : /live|in/i.test(g.status) ? 'live' : 'scheduled',
      }));
    },
    async () => { // TheSportsDB fallback (free key "3")
      const res = await fetch('https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=' +
        new Date().toISOString().slice(0, 10) + '&s=Soccer');
      if (!res.ok) throw new Error(`thesportsdb HTTP ${res.status}`);
      const { events = [] } = await res.json();
      return events.map((e) => ({
        team1: resolve(e.strHomeTeam), team2: resolve(e.strAwayTeam),
        ft: [e.intHomeScore != null ? Number(e.intHomeScore) : null, e.intAwayScore != null ? Number(e.intAwayScore) : null],
        status: e.strStatus === 'Match Finished' ? 'finished' : e.strStatus === 'Not Started' ? 'scheduled' : 'live',
      }));
    },
  ];

  for (const get of providers) {
    try {
      const all = await get();
      const hits = all.filter((r) => r.team1 && r.team2 && want.has(`${r.team1}|${r.team2}`));
      if (hits.length) return hits;
    } catch (e) { log.push(`provider failed: ${e.message}`); }
  }
  return [];
}

// --- main -----------------------------------------------------------------------------------------
async function main() {
  const now = new Date(argVal('--now') ?? Date.now());
  const [matches, teams, groups] = await Promise.all([load('matches.json'), load('teams.json'), load('groups.json')]);
  const resolve = buildResolver(teams);
  const log = [];

  const pollable = matches.filter((m) => {
    if (m.status === 'finished') return false;
    const k = new Date(m.kickoff_utc).getTime();
    return now.getTime() >= k - PRE_MS && now.getTime() <= k + POST_MS;
  });

  let results = [];
  const mock = argVal('--mock');
  if (mock) {
    results = JSON.parse(await readFile(mock, 'utf8'));
    log.push(`mock: ${results.length} result(s) from ${mock}`);
  } else if (pollable.length === 0) {
    console.log(`no live matches at ${now.toISOString()} — skipping (0 API calls)`);
    return;
  } else {
    log.push(`${pollable.length} match(es) in window`);
    results = await fetchLive(pollable, resolve, log);
  }

  const scored = applyResults(matches, results, resolve, log);
  resolvePlaceholders(matches, teams, groups, log);

  // Did anything actually change vs disk? (covers both scores and placeholder resolution)
  const before = JSON.stringify(JSON.parse(await readFile(join(DATA, 'matches.json'), 'utf8')));
  const after = JSON.stringify(matches);
  const dirty = before !== after;

  console.log(log.join('\n') || '(no log)');
  if (!dirty) { console.log('no changes'); return; }
  if (argFlag('--dry')) { console.log('--dry: not writing'); return; }
  await writeJson('matches.json', matches);
  console.log(`✅ wrote matches.json${scored ? '' : ' (placeholder resolution only)'}`);
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
