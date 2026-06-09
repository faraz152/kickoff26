# Good first issues & the Phase 2 backlog

These are the open pieces, roughly easiest-first. Open an issue before starting anything bigger than a data PR so we don't double up. Labels in parentheses.

## Mass-contribution (no code, big impact)

- **Add your country's broadcasts** (`good first issue`, `data`) — one PR per missing country. Free-to-air + official channels, free-first, official sources. See [CONTRIBUTING.md](../CONTRIBUTING.md). This is the highest-value contribution and there are ~180 countries to go.
- **Translate team / UI names** (`good first issue`, `i18n`) — add a `data/i18n/<lang>.json` with team display names and the handful of UI strings. Arabic/RTL especially wanted.
- **Verify a seeded country** (`good first issue`, `data`) — pick a country already in `broadcasts.json`, confirm each free/paid flag against the broadcaster's own site for 2026, and fix or remove the `note`.

## Features

- **Auto-update results after each match** (`feature`) — implement `scripts/update-results.mjs` + a GitHub Actions cron scoped to match windows (Jun 11–Jul 19). Poll a free live-score API, recompute standings with the FIFA tiebreakers, rank the best third-placed teams, advance the bracket, commit the JSON. The `live-score-autoupdater` skill spec describes the whole pipeline; `lib/standings.ts` already has the group math.
- **Offline PWA** (`feature`) — add a service worker that caches the app shell + `/data` so it works with no connection (built for stadiums and low-bandwidth regions). The manifest is already in place.
- **Knockout bracket simulator** (`feature`) — let people pick winners through the bracket and share a result image. The placeholder encoding (`W74`, `1A`, `3A/B/C/D/F`) is already in `matches.json`.
- **Resolve knockout names once groups finish** (`feature`) — turn `1A` / `2B` / `3A/B/C/D/F` into real teams using the FIFA Annex third-place assignment table. Reference logic is in the `worldcup-domain-expert` skill.
- **Fan-zone / watch-party map** (`feature`) — FIFA Fan Festival locations + community-added pubs/venues per host city.
- **Host-city & travel guide** (`feature`) — visa notes, transit between the 16 cities. (See `jordanlyall/wc26-mcp` for the shape of this data.)
- **Player & historical stats** (`feature`) — pull from StatsBomb open-data / openfootball historical for a "previous World Cups" section.
- **Ticket links** (`feature`, link-only) — FIFA official + official resale. We link, never resell.
- **Embeddable widgets** (`feature`) — a schedule/standings widget other sites can `<iframe>`.
- **MCP server over `/data`** (`feature`) — so AI assistants can answer "when does my team play and where can I watch free."
- **Match-importance tags** (`feature`) — "dead rubber" vs "must-watch" based on qualification scenarios.

## Polish

- **PWA icon set** (`good first issue`, `design`) — replace the single `public/icon.svg` with proper 192/512 PNGs + maskable variants.
- **Lighthouse pass** (`good first issue`) — get every page to ≥90 on performance and accessibility; report numbers in the PR.
