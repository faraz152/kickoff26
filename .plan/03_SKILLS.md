# 03 — The 7 Skills to Create (STEP 1 of the build)

> Create each as `~/.claude/skills/<name>/SKILL.md` with the YAML frontmatter shown, then a body covering the bullets. Add `references/` or `code/` subfiles where noted. The user's original #1 ask was "first create skills" — do this before scaffolding the repo, then *use* these skills as you build.
>
> Format reminder (matches existing skills in `~/.claude/skills/`):
> ```
> ---
> name: skill-name
> description: <what it does + WHEN to trigger — this string is what makes the skill fire>
> ---
> # Title
> body...
> ```

---

## 1. `worldcup-data-pipeline`
**description:** `Ingest, normalize, and validate FIFA World Cup football data into the project's canonical /data JSON. Use whenever fetching, refreshing, merging, or schema-checking match/team/group/venue data — primarily from openfootball/worldcup.json (public domain, no key), with TheSportsDB, balldontlie, and API-Football as live/secondary sources.`

Body must cover:
- The source list + raw URLs (copy from `02_RESEARCH.md` §A). openfootball is source of truth.
- The **openfootball match schema** and how to parse `time` + UTC offset into a real UTC ISO timestamp (see `04_DATA_AND_SCHEMA.md`).
- The **canonical `/data` schema** we normalize to (`04_DATA_AND_SCHEMA.md`).
- ETL steps: fetch → parse → map team names to a stable `teamId` (slug) → derive UTC kickoff → attach venue/group → write `/data/*.json` → validate (counts: 104/48/12/16) → fail loudly on mismatch.
- Idempotency (re-runnable), dedup, and how to merge a live-score update without clobbering curated fields.
- A tiny JSON-schema or zod validator pattern.

---

## 2. `football-broadcast-curator`
**description:** `Build and maintain the FREE-first, LEGAL "where to watch" dataset for football (country × language × channel × free/paid). Use when adding/reviewing broadcast entries, sorting free-to-air before paid, or reviewing community PRs. Enforces the legal boundary: official rights-holders and legitimate free options only — never unlicensed/pirate re-streams (which get the repo DMCA'd).`

Body must cover:
- The **`broadcasts.json` schema** + the **free-first sort rule** (`05_BROADCASTS_SEED.md`).
- The legal boundary, stated plainly, and WHY (DMCA → repo deletion → kills the project). What's allowed: free-to-air TV, official free streams, FIFA+, public broadcasters, official paid services. What's banned: unlicensed IPTV/restream links, "free stream" aggregators.
- The "maximize FREE" research method: for each country, find which matches are free-to-air + any official free stream + radio; mark FIFA+ free matches; note geo-restrictions and VPN-legality caveats (informational only).
- Trusted sources to cite per entry (official broadcaster site, LiveSoccerTV as a cross-check, national press releases).
- **PR-review checklist** for community broadcast contributions (official source linked? free/paid correct? language tagged? no pirate links?).

---

## 3. `fixture-timezone-engine`
**description:** `Convert football fixture kickoff times from UTC to any user timezone (DST-correct via IANA zones) and generate downloadable .ics calendar files in the user's local time. Use for schedule rendering, "your timezone" UX, "add to calendar" (single match / team / whole tournament), and any date math on fixtures.`

Body must cover:
- Always store kickoff as **UTC ISO** in `/data`; convert at render time with `Intl.DateTimeFormat(locale, { timeZone, ... })`. Never use fixed offsets for the user side (DST bugs).
- Auto-detect the user TZ via `Intl.DateTimeFormat().resolvedOptions().timeZone`; allow manual override (searchable list).
- Handling matches that cross midnight in the user's zone (show the correct local date).
- **`.ics` (RFC 5545) generation spec:** `VCALENDAR`/`VEVENT`, `UID`, `DTSTAMP`, `DTSTART`/`DTEND` in UTC (`...Z`), `SUMMARY` ("🇲🇽 Mexico vs South Africa — WC26 Group A"), `LOCATION` (venue), `DESCRIPTION` (where-to-watch link), optional `VALARM` reminder. One event per match; a "whole team" / "whole tournament" export bundles many VEVENTs.
- Provide a small reference implementation in `code/ics.mjs` and `code/tz.mjs`.

---

## 4. `live-score-autoupdater`
**description:** `Keep tournament results, standings, and the knockout bracket current by polling free live-score APIs during match windows and committing updated JSON via GitHub Actions. Use when building the auto-update pipeline, computing group standings with FIFA tiebreakers, ranking best third-placed teams, or advancing the bracket.`

Body must cover:
- The poll sources + fallbacks (balldontlie / TheSportsDB / API-Football) and **rate-limit discipline** (only poll during live windows; cache; backoff).
- **GitHub Actions cron pattern** scoped to June 11–July 19 match windows; the job runs `update-results.mjs`, commits changed JSON, triggers redeploy. Include a sample `update-live.yml`.
- **Standings computation** with exact FIFA 2026 tiebreakers (pull the ordered list from `worldcup-domain-expert`): points → GD → GF → head-to-head(pts, GD, GF) → fair-play → drawing of lots.
- **Best-third-placed ranking** across the 12 groups (top 8 advance) and the **R32 bracket assignment** (Annex permutation table).
- Idempotent commits; never overwrite curated data; only touch result/standings fields.

---

## 5. `worldcup-domain-expert`
**description:** `Authoritative reference for FIFA World Cup 2026 format, rules, and history — used to keep all content accurate and human-sounding. Use when computing standings/tiebreakers, deriving the knockout bracket, writing team/match copy, or answering "how does X work" about the tournament. Covers the 48-team/12-group format, exact tiebreaker order, best-third-place logic, the 495-combination bracket, venues, and historical World Cup facts.`

Body must cover:
- **Format:** 48 teams, 12 groups (A–L) of 4, 104 matches; top 2 + 8 best thirds → R32 → R16 → QF → SF → Final.
- **Exact tiebreaker order** (group stage) and **best-third-placed** ranking criteria.
- The **R32 bracket-assignment table** for which third-place combinations slot where (FIFA's 495-permutation Annex) — or a clear algorithm/reference link to implement it.
- **16 host cities + venues** (and that final = MetLife, July 19).
- Historical World Cup facts for the "previous World Cups" feature (winners, records) — point to openfootball historical repos.
- Voice rule: keep all generated copy human, casual, accurate — never marketing-speak.

---

## 6. `pwa-i18n-frontend`
**description:** `Build the kickoff26 web UI: Next.js (App Router) static-export + PWA, reading the /data JSON at build time, with i18n/RTL, a low-bandwidth performance budget, and Vercel deploy. Use when scaffolding pages, wiring data, adding languages, implementing offline support, or optimizing load on slow connections.`

Body must cover:
- Next.js App Router + static data loading from `/data/*.json`; server components for data, client components for TZ/interactivity.
- **PWA**: manifest, service worker (cache `/data` + shell for offline), installability.
- **i18n/RTL**: language switch, Arabic/RTL support, team/UI names from `/data/i18n`.
- **Performance budget** for the global south: small JS, no heavy deps, lazy images, system fonts; target Lighthouse ≥ 90.
- Component patterns: schedule list (TZ-aware), group standings table, team page, country picker, Where-to-Watch panel (free-first), "Add to calendar" button.
- Vercel deploy config + the GitHub Action.

---

## 7. `oss-launch-growth`
**description:** `Turn a good repo into a starred one. Use when writing the README/CONTRIBUTING, seeding good-first-issues and labels, preparing a demo GIF, or planning a launch. Covers README-as-landing-page, awesome-list inclusion (via third-party submit), Show HN / Reddit / Product Hunt / X timing, GitHub Trending mechanics, and CC0/MIT licensing.`

Body must cover:
- **README structure** that converts in 20s: hero + one-line value prop, demo GIF, "why it's different" (free-first where-to-watch, your-timezone, open data), 1-command quickstart, "use our data" section, badges, contributing CTA.
- **CONTRIBUTING.md** + label scheme + a batch of `good first issue`s (the Phase-2 backlog in `06_ROADMAP.md`) written so newcomers can pick them up — especially "add your country's broadcasts" (mass-contributable).
- **Launch playbook**: which channels, what to post, timing, and the third-party awesome-list submission tactic.
- Licensing: MIT (code) + CC0 (data); how to state it.
- Voice: human dev, not marketing (matches workspace `CLAUDE.md`).
