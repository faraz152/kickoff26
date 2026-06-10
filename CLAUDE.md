# kickoff26 — project guide

Open, ad-free FIFA World Cup 2026 companion: every match in the user's timezone, one-tap calendar export, and a free-first "where to watch" map per country. Static Next.js site built entirely from open data — no backend, no API keys, no DB.

**Open-core monorepo (npm workspaces).** The shared engine + data are published packages so a separate private app can reuse them; the public app dogfoods them. See [`.plan/`](.plan/) and the open-core plan. The split point: `@kickoff26/core` is **framework-free** (no React/Next) — keep it that way (browser-only helpers belong in the app, e.g. `downloadCalendar` lives in `AddToCalendar.tsx`).

## Commands

```bash
npm run dev             # build packages, then local dev server (http://localhost:3000)
npm run build           # build packages, then static export -> out/
npm run build:packages  # tsup-build @kickoff26/core then @kickoff26/data (run before app)
npm run build:data      # fetch openfootball -> normalize -> packages/data/data/*.json
npm run build:data:offline   # same, from the cached snapshot (packages/data/scripts/.cache/)
npm run validate:data   # integrity + free-first + no-pirate checks (runs in CI)
```

Root data scripts delegate to the `@kickoff26/data` workspace. CI (`.github/workflows/ci.yml`) runs `validate:data` then `build` (which builds the packages) on every push/PR. `publish.yml` ships both packages to npm on a `v*` tag; `update-live.yml` calls the scripts at `packages/data/scripts/`.

## Layout

- `packages/core/` → **`@kickoff26/core`** — framework-free engine: `tz.ts` (Intl timezone + date math), `ics.ts` (RFC 5545 .ics string), `labels.ts` (team/placeholder display), `standings.ts` (FIFA tiebreakers), `calendar.ts` (matches→.ics events), `types.ts`, `site.ts`. No DOM/React. Built with tsup → `dist/` (gitignored).
- `packages/data/` → **`@kickoff26/data`** — the CC0 dataset + typed loaders (`getMatches`, …) + the ETL/validate/live scripts.
  - `packages/data/data/*.json` — the product's heart. `matches/teams/groups/venues.json` are **generated** (don't hand-edit; change `packages/data/scripts/build-data.mjs` and rebuild). `broadcasts.json` is **hand-maintained** — the community part.
  - `packages/data/scripts/` — `build-data.mjs` (openfootball ETL, embeds team/venue metadata), `validate-data.mjs` (zero-dep validator: counts 104/48/12/16, schema, free-first, pirate guard), `update-results.mjs` (live score updater + placeholder resolution).
- `app/` + `components/` — the **OSS web app**, consuming the two packages via `@kickoff26/core` / `@kickoff26/data` (only `@/components/*` stays a local alias). Pages: `/`, `/schedule`, `/groups`, `/bracket`, `/watch`, `/my-team`, `/venue`, `/match/[id]`, `/team/[id]`, `/venue/[id]`.
- `mcp/` — MCP server over `@kickoff26/data`.

## Data model — the things that bite

- **Kickoffs are stored as UTC ISO** (`2026-06-11T19:00:00Z`). Convert to the user's zone at render time only, via `Intl.DateTimeFormat({ timeZone })`. Never bake a fixed offset into stored data. openfootball gives venue-local time + offset (`"13:00 UTC-6"`); `toUtcIso()` derives the UTC.
- **Match `id` = FIFA match number.** Group 1–72, R32 73–88, R16 89–96, QF 97–100, SF 101–102, third 103, final 104. This is what makes the knockout placeholders resolve, so don't renumber.
- **Team tokens** in `matches.json` are either a team slug (`mexico`, `czech-republic`) or a FIFA placeholder: `1A`/`2B` (group winner/runner-up), `3A/B/C/D/F` (one of those groups' 3rd), `W74` (winner match 74), `L101` (loser match 101). `labels.ts` in `@kickoff26/core` renders both.
- **Slugs** come from the openfootball token (diacritics stripped): `Curaçao`→`curacao`, openfootball `Czech Republic`→slug `czech-republic` but display name `Czechia`. `teams.json.id` must match the slug used in `matches.json`.
- **Standings** are computed (`standings.ts` in `@kickoff26/core`) with the FIFA order: Pts → GD → GF → head-to-head → FIFA-rank fallback. Pre-tournament everything is zeros, so it shows seed order.

## Timezone rendering note

Static export prerenders with zone `UTC` (server can't know the user's zone), then the client detects and re-renders local on mount (`TimezoneContext`). So SSR HTML shows UTC times with the correct `datetime="...Z"` attribute; the visible time switches to local after hydration. This is intentional — don't "fix" the UTC-looking prerender.

## The legal boundary (non-negotiable)

`broadcasts.json` lists **official rights-holders only** — free-to-air, official free streams, FIFA+, public broadcasters, official paid. **Never** unlicensed IPTV / restream links. Pirate links → DMCA → repo deleted → project dead. The validator rejects obvious restream domains; reviewers reject the rest. Free options always sort before paid.

## Conventions

- Code explains itself — comment the *why*, not the *what*. Match existing style.
- Focused changes only; no drive-by refactors. One country / one fix / one feature per PR.
- Commits: `type: short present-tense summary` (e.g. `data: add Nigeria broadcasts`).
- `npm audit` flags Next.js **server-side** CVEs that don't apply to a static export — see SECURITY.md. Track the 14.2.x patch line; don't force `next@16`.

## Knowledge lives in skills

Seven `~/.claude/skills/` encode the deeper logic and are worth loading for related work: `worldcup-data-pipeline`, `football-broadcast-curator`, `fixture-timezone-engine`, `live-score-autoupdater`, `worldcup-domain-expert`, `pwa-i18n-frontend`, `oss-launch-growth`. The original product plan is in `.plan/`.
