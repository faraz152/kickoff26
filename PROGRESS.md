# Progress

Status of kickoff26 against the master plan in [`.plan/`](.plan/). Last updated 2026-06-10.

**Where it stands:** MVP is built, verified, and live on GitHub. Repo: https://github.com/faraz152/kickoff26 (public, CI green). Dev server runs via `npm run dev` (port 3000). Not yet deployed to a public URL; the Phase-2 feature backlog is open for contributors.

---

## Build order (`.plan/06_ROADMAP.md`)

| Step | Status | Notes |
|---|---|---|
| **0 — 7 skills** | ✅ Done | All seven in `~/.claude/skills/` (`worldcup-data-pipeline`, `football-broadcast-curator`, `fixture-timezone-engine`, `live-score-autoupdater`, `worldcup-domain-expert`, `pwa-i18n-frontend`, `oss-launch-growth`) with reference code/subfiles. |
| **1 — Repo + data spine** | ✅ Done | `git init`, MIT + CC0 licenses, `.gitignore`. `scripts/build-data.mjs` (openfootball → `/data`), `scripts/validate-data.mjs`. Counts verified 104/48/12/16. |
| **2 — Broadcasts seed** | ✅ Done | `data/broadcasts.json` (21 markets, free-first), `data/broadcasts.template.json`, contributor note. |
| **3 — Next.js MVP** | ✅ Built | Schedule, match detail, groups, team pages, My Team, Where-to-Watch, `.ics` export. Static export, 161 pages. ⏳ **Not deployed to Vercel yet.** |
| **4 — Launch scaffolding** | ◐ Mostly | README, CONTRIBUTING, SECURITY, good-first-issues, CI, issue/PR templates done. ⏳ **Demo GIF + soft-launch not done.** |
| **5 — Verify** | ✅ Done | Acceptance checks pass against the real `lib/` code (see below). |

---

## MVP feature scope (`.plan/01_PLAN.md`) — all delivered

- ✅ **Timezone schedule + calendar export** — auto-detect + manual override (any IANA zone), full 104-match schedule, live-computed standings, one-tap `.ics` for a match / team / whole tournament.
- ✅ **Where to Watch FREE** — country picker, legal free options sorted before paid, official source links. 21 markets seeded, structure ready for community PRs.
- ✅ **My Team hub** — pick country → your fixtures (your TZ), group table, where to watch, add-all-to-calendar.
- ✅ **Open data** — all `/data/*.json` consumable with no key; "use our data" section in the README.

---

## Definition of Done (`.plan/06_ROADMAP.md`)

- [x] `/data/*.json` builds & validates (104 / 48 / 12 / 16).
- [x] Schedule renders in auto-detected TZ; manual override works; opener shows **12:00 AM PKT (Jun 12)** for a Karachi user.
- [x] Where-to-Watch lists free before paid for **≥20** seeded countries (21 seeded).
- [x] Add-to-Calendar `.ics` opens at the correct local time (valid RFC 5545, UTC `Z`).
- ◐ **Deployed on Vercel; Lighthouse perf ≥ 90.** Lighthouse measured locally (mobile, throttled, against the static build): **home 93 · bracket 94 · schedule 82** (a11y 90–95, best-practices 96, SEO 100 across the board). Home + bracket clear ≥90; the data-heavy schedule is dragged by LCP/CLS from the intentional UTC→local re-render (and a local-server cache penalty Vercel won't have). ⏳ Vercel deploy (needs credentials) + a re-run on the live URL still to do.
- [x] README + CONTRIBUTING + good-first-issues live. *(Demo GIF still to record.)*
- [x] MIT (code) + CC0 (data).

---

## Verification checklist (`.plan/01_PLAN.md`)

1. ✅ `build-data.mjs` → `/data` validates against schema (counts correct).
2. ✅ Schedule in auto-detected TZ; switching shifts every kickoff. Spot-check: Mexico v South Africa = **Thu Jun 11, 3:00 PM ET = Fri Jun 12, 12:00 AM PKT**.
3. ✅ Where-to-Watch FREE lists free-to-air/legal-free first, then paid.
4. ✅ Add-to-Calendar `.ics` opens at correct local time.
5. ✅ `update-results.mjs` mock → standings/bracket recompute. `scripts/update-results.mjs` + `.github/workflows/update-live.yml` ship; mock cascade resolves group winners/runners-up and `W##`/`L##` knockout slots, idempotent re-run. *(Third-place `3A/B/C/D/F` slots still need FIFA's Annex table — see backlog.)*
6. ◐ PWA offline + Lighthouse ≥ 90. Service worker shipped (`public/sw.js` + `components/ServiceWorker.tsx`): precaches the core navigations, stale-while-revalidate for `/_next` assets, network-first nav with offline fallback to the cached home. Data is baked into each page, so visited content works fully offline. Lighthouse measured locally: home 93 / bracket 94 / schedule 82 (see DoD above). ⏳ Re-run on the deployed URL.
7. ✅ Repo opens cleanly: README renders, good-first-issues exist, data forkable with no key.

---

## What's left — Phase 2 backlog (`.github/GOOD_FIRST_ISSUES.md`)

Contributor-driven, none started:

**Mass-contribution (drives stars):**
- ✅ **Where-to-watch now covers 115 countries** — `build-broadcasts.mjs` pulls FIFA's official where-to-watch feed (`api.fifa.com/api/v3/watch/season/285023`, 112 countries) + 3 seeded (IN/ZA/NG), classified by `channel-classify.mjs` into free/paid/unknown (~36% confidently classified; the rest shown honestly as "official broadcaster — check the site"). The contributor lever shifts from "add your country" to **"confirm an `unknown` channel's free/paid"** (edit the classifier with a source).
- ⏳ `add-i18n: <language>` — team/UI translations, Arabic/RTL especially. **Blocked on an architecture decision:** the app prerenders English server-side (static export), so i18n needs either build-time per-locale routing (`/es/…`, `/ar/…`, more pages + SEO) or a client re-render layer (like the TZ swap). Pick the approach before building the `data/i18n/<lang>.json` framework.

**Features:**
- ◐ Auto-update results after each match — `update-results.mjs` + `update-live.yml` cron **done**, now wired to a **verified** live source: TheSportsDB's FIFA World Cup feed (league 4429, keyless), whose team names all map to our slugs and whose schedule matches our fixtures (confirmed against the real API — the opener resolves correctly). Self-gates to live windows, robust status map (NS/FT/AET/PEN/1H…), patches scores, resolves `1X`/`2X` + `W##`/`L##`. ⏳ Remaining: source FIFA's 495-row third-place Annex table → `thirds-annex.json` for the eight `3A/B/C/D/F` slots.
- ✅ Offline PWA — service worker caches the app shell + visited pages (data is baked into each page, so no separate `/data` caching needed). Manifest already in place.
- ◐ Resolve knockout placeholders to real teams once groups finish — group + winner/loser slots done in the updater; third-place Annex assignment still open.
- ✅ Knockout bracket simulator ("predict & share") — `/predict` ([components/BracketSimulator.tsx](components/BracketSimulator.tsx)): pick winners through the tree, picks propagate via the `W##`/`L##` graph, shareable via URL hash (verified: propagation → champion, and a shared link restores the exact bracket on reload). Minimal UI by design — the polished version lives in the private app.
- ⏳ Fan-zone / watch-party map.
- ⏳ Host-city & travel guide (visa, transit).
- ⏳ Player & historical stats (StatsBomb / openfootball historical).
- ⏳ Ticket links (official + resale, link-only).
- ⏳ Embeddable widgets (`packages/widgets`).
- ✅ MCP server over `/data` — zero-dep stdio JSON-RPC server (`mcp/server.mjs`) with 5 read-only tools (`list_matches`, `team_schedule`, `where_to_watch`, `group_standings`, `next_matches`). Verified end-to-end (initialize → tools/list → tools/call).
- ⏳ Match-importance tags ("dead rubber" vs "must-watch").
- ⏳ Push notifications.

**Launch tasks:**
- ⏳ Deploy to Vercel → public URL.
- ⏳ Record demo GIF (TZ switch → add-to-calendar → free-stream lookup).
- ⏳ Soft-launch (Show HN / r/soccer / awesome-list submission via third party) — `oss-launch-growth` skill.

---

## Delivered beyond the plan

- ✅ Pushed to a public GitHub repo with discovery topics; **CI green** (`validate:data` + `build` on every PR).
- ✅ Pirate-link guard + free-first ordering enforced in CI, not just by convention.
- ✅ `SECURITY.md` documenting why static-export makes the Next.js server-side advisories non-applicable.
- ✅ Project `CLAUDE.md` so future sessions pick up the data-model gotchas fast.
- ✅ **Open-core monorepo split** — refactored into npm workspaces: `@kickoff26/core` (framework-free engine) + `@kickoff26/data` (CC0 dataset + loaders + ETL/live scripts), with the OSS app + MCP server consuming them. Enables a separate private app to reuse the engine/data via versioned packages while contributor fixes flow one-way (public→private) and private code never touches the public repo. Pure refactor — verified byte-identical rendered output across 14 key pages, 181-page build, MCP + validator green. `publish.yml` ships the packages on a `v*` tag. Plan: `~/.claude/plans/do-you-have-a-merry-koala.md`.
- ✅ **Knockout bracket view** (`/bracket`) — R32 → Final + third-place tree rendered from `matches.json`, TZ-aware kickoffs, winner highlight. Placeholders (`Winner Group A`, `Winner of Match 74`) resolve to real teams automatically as the live updater fills the bracket. Visually verified (mobile stacked / desktop horizontal columns).
- ✅ **Venue / host-city pages** (`/venue`, `/venue/[id]`) — 16 stadiums grouped by country with match counts; each venue page lists its matches (TZ-aware) + add-all-to-calendar. Linked from match detail and the home cards. Lays the groundwork for the host-city travel guide.
- ✅ **Launch SEO/social** — `app/sitemap.ts` (175 URLs), `app/robots.ts`, OpenGraph + Twitter card metadata with a branded `public/og.svg`, canonical URLs, `metadataBase` from `lib/site.ts`. *(PNG OG for SVG-averse scrapers is a polish follow-up.)*

---

**Rough completion:** MVP ~95% (everything but the Vercel deploy + demo GIF). Phase 2 / the "100 features" long tail is the open contributor backlog.
