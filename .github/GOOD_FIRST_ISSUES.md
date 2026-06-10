# Good first issues & the Phase 2 backlog

These are the open pieces, roughly easiest-first. Open an issue before starting anything bigger than a data PR so we don't double up. Labels in parentheses.

## Mass-contribution (no code, big impact)

- **Add your country's broadcasts** (`good first issue`, `data`) — one PR per missing country. Free-to-air + official channels, free-first, official sources. See [CONTRIBUTING.md](../CONTRIBUTING.md). This is the highest-value contribution and there are ~180 countries to go.
- **Translate team / UI names** (`good first issue`, `i18n`) — add a `packages/data/data/i18n/<lang>.json` with team display names and the handful of UI strings. Arabic/RTL especially wanted.
- **Verify a seeded country** (`good first issue`, `data`) — pick a country already in `broadcasts.json`, confirm each free/paid flag against the broadcaster's own site for 2026, and fix or remove the `note`.

## Features

- **Third-place Annex table** (`feature`, `data`) — `packages/data/scripts/update-results.mjs` already polls live scores, patches `matches.json`, and resolves group winners/runners-up (`1X`/`2X`) and knockout winners/losers (`W##`/`L##`). The one missing piece is the eight `3A/B/C/D/F` slots: encode FIFA's 495-combination Annex (sorted-8-group key → which third fills which R32 slot) as `packages/data/data/thirds-annex.json` and wire it into `resolvePlaceholders()`. Get this wrong and the whole bracket is wrong, so source it from the official regulations, not memory.
- **Confirm live-score API shapes** (`good first issue`) — the providers in `update-results.mjs` (balldontlie FIFA, TheSportsDB) are parsed best-effort. On matchday, check a real response and fix the field mapping / status strings if they differ.
- **Knockout bracket simulator** (`feature`) — the read-only bracket view at `/bracket` ([app/bracket/page.tsx](../app/bracket/page.tsx)) is the foundation; make it interactive — let people pick winners through the tree and share a result image. The placeholder encoding (`W74`, `1A`, `3A/B/C/D/F`) is already in `matches.json`.
- **Fan-zone / watch-party map** (`feature`) — FIFA Fan Festival locations + community-added pubs/venues per host city.
- **Host-city & travel guide** (`feature`) — visa notes, transit between the 16 cities. (See `jordanlyall/wc26-mcp` for the shape of this data.)
- **Player & historical stats** (`feature`) — pull from StatsBomb open-data / openfootball historical for a "previous World Cups" section.
- **Ticket links** (`feature`, link-only) — FIFA official + official resale. We link, never resell.
- **Embeddable widgets** (`feature`) — a schedule/standings widget other sites can `<iframe>`.
- **Extend the MCP server** (`feature`) — `mcp/server.mjs` exposes 5 read-only tools over `/data`. Add more (e.g. venue info, head-to-head, a knockout-bracket view) or MCP resources/prompts.
- **Match-importance tags** (`feature`) — "dead rubber" vs "must-watch" based on qualification scenarios.

## Polish

- **PWA icon set** (`good first issue`, `design`) — replace the single `public/icon.svg` with proper 192/512 PNGs + maskable variants.
- **PNG social image** (`good first issue`, `design`) — the OG/Twitter card currently points at `public/og.svg`; some scrapers (Facebook, older Twitter) don't render SVG. Export a 1200×630 `og.png` from it and update the `images` URLs in `app/layout.tsx`.
- **Schedule LCP/CLS** (`good first issue`, `perf`) — local Lighthouse: home 93, bracket 94, **schedule 82**. The schedule's drag is LCP ~3.6s + CLS ~0.18 from the UTC→local re-render regrouping the 104-match list on hydration (FCP/TBT/SI are all green). Reduce the layout shift (e.g. reserve list height, or stabilise day-section structure across the reflow) **without** breaking timezone accuracy or no-JS rendering. Re-measure on the deployed URL — the local cache penalty (`cache-insight`) disappears on Vercel.
