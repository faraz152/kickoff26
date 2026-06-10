#!/usr/bin/env node
// kickoff26 MCP server — read-only Model Context Protocol access to the open World Cup 2026 dataset,
// so an AI assistant can answer "when does my team play (in my timezone)" and "where can I watch free
// in my country." No MCP SDK: it speaks the stdio wire protocol directly (newline-delimited JSON-RPC
// 2.0). The dataset comes from the @kickoff26/data package (the same data the website is built from).
//
// Run it with `node mcp/server.mjs` and wire it into an MCP client (see mcp/README.md).

import { matches, teams, groups, venues, broadcasts } from '@kickoff26/data';

const teamById = new Map(teams.map((t) => [t.id, t]));
const venueById = new Map(venues.map((v) => [v.id, v]));
const rankOf = (id) => teamById.get(id)?.fifa_rank ?? 999;

// --- team / token resolution ----------------------------------------------------------------------
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const teamLookup = new Map();
for (const t of teams) { teamLookup.set(norm(t.id), t.id); teamLookup.set(norm(t.name), t.id); teamLookup.set(norm(t.code), t.id); }
const resolveTeam = (s) => teamLookup.get(norm(s)) ?? null;

// Render a team1/team2 token (slug or FIFA placeholder) as a human label — mirror of lib/labels.ts.
function tokenLabel(token) {
  const t = teamById.get(token);
  if (t) return `${t.flag} ${t.name}`;
  let m;
  if ((m = token.match(/^([12])([A-L])$/))) return `${m[1] === '1' ? 'Winner' : 'Runner-up'} Group ${m[2]}`;
  if ((m = token.match(/^3([A-L](?:\/[A-L])+)$/))) return `3rd place (${m[1]})`;
  if ((m = token.match(/^W(\d+)$/))) return `Winner of Match ${m[1]}`;
  if ((m = token.match(/^L(\d+)$/))) return `Loser of Match ${m[1]}`;
  return token;
}

const STAGE_LABEL = { group: 'Group Stage', r32: 'Round of 32', r16: 'Round of 16', qf: 'Quarter-final', sf: 'Semi-final', third: 'Third-place Play-off', final: 'Final' };
const matchContext = (m) => (m.stage === 'group' ? `Group ${m.group}` : STAGE_LABEL[m.stage]);

function localTime(iso, timezone) {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: timezone, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return null; // invalid IANA zone -> caller falls back to UTC
  }
}

function matchView(m, timezone) {
  const v = venueById.get(m.venue_id);
  const out = {
    id: m.id,
    title: `${tokenLabel(m.team1)} vs ${tokenLabel(m.team2)}`,
    stage: matchContext(m),
    kickoff_utc: m.kickoff_utc,
    venue: v ? `${v.name}, ${v.city}, ${v.country}` : m.venue_id,
    status: m.status,
  };
  if (m.status === 'finished' || m.status === 'live') out.score = `${m.score.ft[0] ?? '-'}–${m.score.ft[1] ?? '-'}`;
  if (timezone) { const lt = localTime(m.kickoff_utc, timezone); if (lt) out.kickoff_local = `${lt} (${timezone})`; }
  return out;
}

// --- standings (FIFA 2026 order; port of lib/standings.ts) ----------------------------------------
const blank = (id) => ({ id, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0 });
function applyResult(r, gf, ga) {
  r.P++; r.GF += gf; r.GA += ga; r.GD = r.GF - r.GA;
  if (gf > ga) { r.W++; r.Pts += 3; } else if (gf === ga) { r.D++; r.Pts++; } else r.L++;
}
function headToHead(tied, ms) {
  const ids = new Set(tied.map((r) => r.id));
  const mini = new Map(tied.map((r) => [r.id, blank(r.id)]));
  for (const m of ms) {
    if (m.status !== 'finished' || !ids.has(m.team1) || !ids.has(m.team2)) continue;
    const [a, b] = m.score.ft; if (a == null || b == null) continue;
    applyResult(mini.get(m.team1), a, b); applyResult(mini.get(m.team2), b, a);
  }
  return [...mini.values()].sort((x, y) => y.Pts - x.Pts || y.GD - x.GD || y.GF - x.GF);
}
function computeStandings(teamIds, ms) {
  const rows = new Map(teamIds.map((id) => [id, blank(id)]));
  for (const m of ms) {
    if (m.status !== 'finished' || !rows.has(m.team1) || !rows.has(m.team2)) continue;
    const [a, b] = m.score.ft; if (a == null || b == null) continue;
    applyResult(rows.get(m.team1), a, b); applyResult(rows.get(m.team2), b, a);
  }
  const ordered = [...rows.values()].sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || rankOf(a.id) - rankOf(b.id));
  const out = [];
  for (let i = 0; i < ordered.length;) {
    let j = i + 1;
    while (j < ordered.length && ordered[j].Pts === ordered[i].Pts && ordered[j].GD === ordered[i].GD && ordered[j].GF === ordered[i].GF) j++;
    const block = ordered.slice(i, j);
    out.push(...(block.length > 1 && block[0].P > 0 ? headToHead(block, ms) : block));
    i = j;
  }
  return out;
}

// --- tools ----------------------------------------------------------------------------------------
const RANK = { 'free-tv': 0, 'free-stream': 1, radio: 2, 'paid-tv': 3, 'paid-stream': 4 };

const TOOLS = [
  {
    name: 'list_matches',
    description: 'List World Cup 2026 matches, filtered by team, group, stage, status, or UTC date. Kickoffs are UTC ISO; pass a timezone to also get local time.',
    inputSchema: {
      type: 'object',
      properties: {
        team: { type: 'string', description: 'Team slug, name, or 3-letter code (e.g. "brazil", "Brazil", "BRA")' },
        group: { type: 'string', description: 'Group letter A–L' },
        stage: { type: 'string', enum: ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'] },
        status: { type: 'string', enum: ['scheduled', 'live', 'finished'] },
        date: { type: 'string', description: 'UTC date YYYY-MM-DD' },
        timezone: { type: 'string', description: 'IANA timezone for local kickoff, e.g. "Asia/Karachi"' },
        limit: { type: 'number', description: 'Max results (default 50)' },
      },
    },
    run: ({ team, group, stage, status, date, timezone, limit = 50 }) => {
      const slug = team ? resolveTeam(team) : null;
      if (team && !slug) return text(`No team matches "${team}".`);
      let out = matches.filter((m) =>
        (!slug || m.team1 === slug || m.team2 === slug) &&
        (!group || m.group === group.toUpperCase()) &&
        (!stage || m.stage === stage) &&
        (!status || m.status === status) &&
        (!date || m.kickoff_utc.startsWith(date)));
      out = out.sort((a, b) => a.kickoff_utc.localeCompare(b.kickoff_utc)).slice(0, limit).map((m) => matchView(m, timezone));
      return json({ count: out.length, matches: out });
    },
  },
  {
    name: 'team_schedule',
    description: 'Every match a team plays, in UTC and (optionally) a given timezone. Group-stage fixtures resolve by team; knockout slots show as placeholders until the bracket fills.',
    inputSchema: {
      type: 'object',
      properties: {
        team: { type: 'string', description: 'Team slug, name, or 3-letter code' },
        timezone: { type: 'string', description: 'IANA timezone, e.g. "Asia/Karachi" (default UTC)' },
      },
      required: ['team'],
    },
    run: ({ team, timezone }) => {
      const slug = resolveTeam(team);
      if (!slug) return text(`No team matches "${team}". Try a slug like "south-korea", a name, or a code.`);
      const t = teamById.get(slug);
      const fixtures = matches
        .filter((m) => m.team1 === slug || m.team2 === slug)
        .sort((a, b) => a.kickoff_utc.localeCompare(b.kickoff_utc))
        .map((m) => matchView(m, timezone));
      return json({ team: `${t.flag} ${t.name}`, group: t.group, fifa_rank: t.fifa_rank, fixtures });
    },
  },
  {
    name: 'where_to_watch',
    description: 'Official, legal ways to watch in a country — free-to-air and free streams listed before paid. Never lists unlicensed/pirate streams.',
    inputSchema: {
      type: 'object',
      properties: { country: { type: 'string', description: 'ISO-3166 alpha-2 code (e.g. "GB", "BR") or country name' } },
      required: ['country'],
    },
    run: ({ country }) => {
      const key = Object.keys(broadcasts).find((cc) =>
        cc.toLowerCase() === country.toLowerCase() || norm(broadcasts[cc].country) === norm(country));
      if (!key) return text(`No broadcast data for "${country}" yet. Coverage is community-maintained — contributions welcome.`);
      const entry = broadcasts[key];
      const channels = entry.channels.slice().sort((a, b) => RANK[a.type] - RANK[b.type]);
      const free = channels.filter((c) => c.cost === 'free');
      return json({
        country: entry.country,
        free_options: free.length ? free.map(chView) : 'No free-to-air option listed — cheapest legal paid option below.',
        all_channels: channels.map(chView),
      });
    },
  },
  {
    name: 'group_standings',
    description: 'Computed group table using the FIFA 2026 tiebreakers (points, GD, GF, head-to-head, then seed). Pre-tournament it shows seed order (all zeros).',
    inputSchema: {
      type: 'object',
      properties: { group: { type: 'string', description: 'Group letter A–L' } },
      required: ['group'],
    },
    run: ({ group }) => {
      const g = groups.find((x) => x.id === (group || '').toUpperCase());
      if (!g) return text(`No group "${group}". Groups are A–L.`);
      const gm = matches.filter((m) => m.stage === 'group' && m.group === g.id);
      const table = computeStandings(g.teams, gm).map((r, i) => {
        const t = teamById.get(r.id);
        return { pos: i + 1, team: `${t.flag} ${t.name}`, P: r.P, W: r.W, D: r.D, L: r.L, GF: r.GF, GA: r.GA, GD: r.GD, Pts: r.Pts };
      });
      return json({ group: g.id, complete: gm.every((m) => m.status === 'finished'), table });
    },
  },
  {
    name: 'next_matches',
    description: 'The next upcoming (not-yet-finished) matches from a given time.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'ISO datetime to count from (default now)' },
        limit: { type: 'number', description: 'How many (default 5)' },
        timezone: { type: 'string', description: 'IANA timezone for local kickoff' },
      },
    },
    run: ({ from, limit = 5, timezone }) => {
      const t0 = new Date(from || Date.now()).getTime();
      const out = matches
        .filter((m) => m.status !== 'finished' && new Date(m.kickoff_utc).getTime() >= t0)
        .sort((a, b) => a.kickoff_utc.localeCompare(b.kickoff_utc))
        .slice(0, limit)
        .map((m) => matchView(m, timezone));
      return json({ count: out.length, matches: out });
    },
  },
];

const chView = (c) => ({ name: c.name, type: c.type, cost: c.cost, languages: c.languages, url: c.url, ...(c.note ? { note: c.note } : {}) });
const json = (obj) => ({ content: [{ type: 'text', text: JSON.stringify(obj, null, 2) }], structuredContent: obj });
const text = (s) => ({ content: [{ type: 'text', text: s }] });

// --- MCP wire protocol (newline-delimited JSON-RPC 2.0 over stdio) --------------------------------
const SERVER_INFO = { name: 'kickoff26', version: '0.1.0' };
const send = (msg) => process.stdout.write(JSON.stringify(msg) + '\n');
const reply = (id, result) => send({ jsonrpc: '2.0', id, result });
const replyError = (id, code, message) => send({ jsonrpc: '2.0', id, error: { code, message } });

function handle(msg) {
  const { id, method, params } = msg;
  const isRequest = id !== undefined && id !== null;

  switch (method) {
    case 'initialize':
      return reply(id, {
        protocolVersion: params?.protocolVersion || '2025-06-18',
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: 'Open World Cup 2026 data: schedules in any timezone and legal free-first "where to watch" by country.',
      });
    case 'notifications/initialized':
    case 'notifications/cancelled':
      return; // notifications: no response
    case 'ping':
      return reply(id, {});
    case 'tools/list':
      return reply(id, { tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) });
    case 'tools/call': {
      const tool = TOOLS.find((t) => t.name === params?.name);
      if (!tool) return replyError(id, -32602, `Unknown tool: ${params?.name}`);
      try {
        return reply(id, tool.run(params.arguments || {}));
      } catch (e) {
        return reply(id, { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true });
      }
    }
    default:
      if (isRequest) return replyError(id, -32601, `Method not found: ${method}`);
  }
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    handle(msg);
  }
});
process.stdin.on('end', () => process.exit(0));
process.stderr.write(`kickoff26 MCP server ready — ${TOOLS.length} tools over ${matches.length} matches\n`);
