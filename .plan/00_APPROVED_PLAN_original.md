# Plan: The Open, Global, Fan-First World Cup 2026 Companion

## Context

You want to build the *best-in-the-world* open-source product for the FIFA World Cup 2026 (kicks off **June 11, 2026** — 3 days away). The goal is twofold: (1) genuinely help fans worldwide solve real problems during the tournament, and (2) earn GitHub stars / a launched web app. The seed ideas: per-timezone schedule, "where to watch" globally, tickets, auto-updating results, merch, player stats, historical stats — plus "100 more."

This plan refines that raw idea using deep research into **what already exists**, **what's reusable (open data)**, and crucially **what nobody does well** — so we build something with a real moat instead of the 20th World Cup fixtures app. It also delivers the **set of reusable Skills** you asked for, which make building *and continuously maintaining* this project (and future tournaments) repeatable.

**Timeline reality:** ~12 working hrs/week, MVP within a week. This forces a ruthless rule — **reuse open data, don't recreate it**; ship a thin, beautiful, genuinely-useful slice first; let contributors fan out the long tail.

---

## Research Findings (what's out there)

### Reusable open data (the foundation — no need to build a data team)
- **`openfootball/worldcup.json`** — ⭐ the keystone. CC0 / public domain, **no API key**, already ships **2026** matches, teams, groups, venues, kickoff times (UTC offsets). This is our base dataset. ([repo](https://github.com/openfootball/worldcup.json))
- **`balldontlie` FIFA API** + **TheSportsDB** (free) — live scores / results for auto-updates. **API-Football** free tier (100 req/day) as backup. ([balldontlie](https://fifa.balldontlie.io/), [TheSportsDB](https://www.thesportsdb.com/league/4429-fifa-world-cup))
- **`statsbomb/open-data`** — free event-level player/match data (historical WCs) for the "stats" features. ([repo](https://github.com/statsbomb/open-data))
- **FIFA official** for tickets (`FIFA.com/tickets`, official Resale Marketplace, On Location hospitality) — we *link*, never resell.

### Competitors (and their gaps — this is where we win)
| Project | What it does | Key gaps we exploit |
|---|---|---|
| [`jordanlyall/wc26-mcp`](https://github.com/jordanlyall/wc26-mcp) | MCP AI companion, 18 tools (teams, venues, visa, city guides, fan zones, bracket) | **No live scores, no where-to-watch-by-country/language, no calendar export, no web UI, no tickets** |
| NestJS companion backend | REST/WS API: fixtures, squads, standings, broadcasts, 30+ langs | Backend-only (no fan-facing app), Postgres/Docker = high friction for contributors |
| [`martinsmdnuno/wc26`](https://github.com/martinsmdnuno/wc26) | React+Firebase PWA, betting pool, leaderboard | Closed data, betting-focused, not a global utility |
| ESPN predictor / Sky guides | Bracket sim / editorial | Walled, ad-heavy, not open, not personalized |
| LiveSoccerTV | Legal broadcaster listings by country | **No open API/dataset**, ad-heavy, cluttered, not embeddable |

### The honest gap nobody fills
There is **no open, structured, community-maintained, LEGAL "where to watch in YOUR country and YOUR language" dataset** — combined with **one-tap calendar export in your timezone**, **offline-first** delivery for low-bandwidth regions, and a **reusable open data layer** (raw JSON + widgets + MCP) others build on.

---

## ⚖️ The "free streaming" goal — how we actually win it

**Your real need is valid and central:** fans want to watch the World Cup *for free*. We build for that. But we do it with the version that **survives and gets starred**, not the version that gets the repo deleted.

The line: **IPTV the technology is legal** (Peacock, DAZN, FIFA+ are all IPTV). **Unlicensed re-streams of the World Cup are not** — they're copyright infringement of FIFA/broadcasters, which means **DMCA takedown → GitHub deletes the repo → account at risk.** A pirate-link aggregator is the single fastest way to guarantee zero stars and no web app. So the repo will **not** host/aggregate unlicensed streams.

**The better path to "free" (this is our moat):** a huge share of WC 2026 is **legally free-to-air** — BBC (UK), TF1 (France), SBS (Australia), CTV (Canada), Telemundo/Peacock free windows, **FIFA+** free matches, and many national public broadcasters (FIFA often mandates key games on free TV). We build **"Where to Watch FREE"**: per country × language, surface *every free legal option first*, then cheapest paid, with official links. This serves the "free" goal **better** than pirate links (which die mid-match, carry malware, and get geo-blocked) — and it's open, embeddable, and can't be taken down. **Free-first, legal, un-killable.**

---

## Product Vision & Unique Positioning

> **"Every match in your timezone. Where to watch legally in your country & language. Your team's road to the final. Works offline. No ads, no tracking, fully open."**

The moat = four things competitors don't combine:
1. **Open, global, LEGAL where-to-watch dataset** (country × language × channel × free/paid) — CC0, community-grown.
2. **Deep personalization + timezone/calendar UX** — pick your team → only your matches, your TZ, one-tap `.ics`, where *you* can watch.
3. **Offline-first PWA** — built for the global south / stadiums / patchy data, where flashy apps fail.
4. **Be the open data layer** — raw JSON (no key), embeddable widgets, optional MCP server → other devs reuse us → network-effect stars.

### Feature set — MVP vs. later (contributor long-tail)
**MVP (first build, ~12h) — confirmed scope:**
- 0. **Timezone schedule + calendar export** — auto-detect TZ, manual override, full 104-match schedule + group standings computed live; one-tap **Add to Calendar** (`.ics`) for a match, your team, or the whole tournament, in your local time.
- 1. **"Where to Watch FREE"** — pick country × language → *free legal options first* (free-to-air, FIFA+, free windows), then cheapest paid, with official links. Seed top ~20 countries; structure ready for community PRs to fill the rest. **Our biggest moat.**
- 2. **My Team hub** — pick country → your fixtures (your TZ), group table, squad, route to final, and where *you* can watch free.
- 3. **Open data** — all `/data/*.json` consumable directly (no key) + a "use our data" section.

**Phase 2+ (issues labeled `good first issue` for contributors):**
**Offline PWA** (installable, works with no connection) • auto-updating results after each match • knockout bracket simulator ("predict & share") • fan-zone / watch-party map (FIFA Fan Festivals + community pubs) • host-city & travel guide (visa, transit between 16 cities) • player & historical stats (StatsBomb) • ticket-availability links (FIFA official + resale) • merch directory (official stores) • embeddable widgets • MCP server • multi-language UI (i18n/RTL) • notifications • "dead-rubber vs must-watch" match-importance tags.

---

## Architecture & Tech Stack

**Stack (locked): Next.js (App Router) PWA on Vercel.** Biggest React contributor pool → best for stars. Data is **static JSON in the repo** (framework-agnostic, forkable, no server/DB → contributor-friendly, free hosting, fast). Live updates via scheduled GitHub Action that commits JSON — **no backend to operate.**

```
repo/
├─ data/                      # canonical, public-domain-derived JSON (the product's heart)
│   ├─ matches.json           # from openfootball, normalized
│   ├─ teams.json  groups.json  venues.json
│   ├─ broadcasts.json        # country→language→channel (LEGAL, community-grown)
│   └─ i18n/                  # team/UI names per language
├─ scripts/
│   ├─ build-data.mjs         # ETL: pull openfootball → normalize → /data
│   └─ update-results.mjs     # poll live API → results + standings + bracket → commit
├─ web/                       # the PWA (Next.js or Astro — see Q1)
├─ packages/widgets/          # embeddable schedule/standings widget (Phase 2)
├─ mcp/                       # optional MCP server over /data (Phase 2)
└─ .github/workflows/
    ├─ update-live.yml        # cron during match windows → runs update-results, commits
    └─ deploy.yml             # build + deploy to Vercel/Cloudflare Pages (free)
```

- **Timezone:** client-side `Intl.DateTimeFormat` / `Temporal` — zero data cost, every TZ on Earth.
- **Standings/bracket:** computed from results with **FIFA 2026 tiebreakers** (incl. best-8-third-place logic) in `update-results.mjs`.
- **Hosting:** Vercel or Cloudflare Pages free tier. Domain bought later at 80% (as you planned).
- **Live updates:** GitHub Action cron (tight schedule only during match windows to respect free API limits), commits updated JSON, triggers redeploy. Fully serverless.

---

## 🧰 Skills to Create (your primary ask — a solid, reusable set)

These live in `~/.claude/skills/` and make this project (and the next tournament) repeatable. Seven, scoped to not overlap:

1. **`worldcup-data-pipeline`** — The ETL brain. Knows every open source (openfootball, TheSportsDB, balldontlie, API-Football free tier), their schemas, and how to fetch → normalize → merge → validate into our canonical `/data/*.json`. Invoked whenever ingesting or refreshing data.
2. **`football-broadcast-curator`** — The legal where-to-watch dataset: the country×language×channel×free/paid schema, trusted sources, the **legal boundary** (official rights-holders only — never piracy/IPTV), and how to review community broadcast PRs.
3. **`fixture-timezone-engine`** — UTC→any-timezone conversion, DST correctness, per-TZ schedule rendering, and `.ics` calendar generation in the user's local time. The "your timezone" + "add to calendar" brain.
4. **`live-score-autoupdater`** — Polls free live-score APIs during match windows, recomputes **standings + FIFA tiebreakers + best-third-place + knockout bracket**, and commits JSON via GitHub Actions. The "schedule updates after each match" engine.
5. **`worldcup-domain-expert`** — FIFA 2026 format/rules/tiebreakers/bracket-derivation (495 combos), plus historical World Cup facts and squad knowledge. The football-knowledge oracle that keeps content accurate and human.
6. **`pwa-i18n-frontend`** — Web build patterns: SSG + PWA (offline service worker), i18n/RTL, low-bandwidth performance budget, and consuming `/data` JSON. Deploy to Vercel/Cloudflare Pages.
7. **`oss-launch-growth`** — README-as-landing-page (the 20-second star decision), CONTRIBUTING + `good first issue` seeding + labels, and the launch playbook (awesome-lists via 3rd-party submit, HN/Reddit/ProductHunt, X amplification, GitHub Trending, demo GIF). Turns a good repo into a *starred* repo.

*(I'll build these first, since several encode the exact knowledge needed to build the app correctly — e.g. the timezone engine and the tiebreaker logic.)*

---

## Phased Roadmap

- **Skills first (~2h):** scaffold the 7 SKILL.md files above (data pipeline, broadcast curator, timezone engine, autoupdater, domain expert, frontend, OSS growth).
- **Build 1 — Data spine (~2h):** `build-data.mjs` pulls openfootball → `/data`. Seed `broadcasts.json` for ~20 countries. Data-validation script.
- **Build 2 — MVP web (~5h):** Next.js — TZ-aware schedule + group standings + team pages + Where-to-Watch FREE + `.ics` export + My Team hub. Deploy to Vercel.
- **Build 3 — Polish + launch prep (~3h):** killer README + demo GIF, CONTRIBUTING, `good first issue`s for the long-tail features, MIT (code) + CC0 (data) licensing. Soft-launch.
- **Then:** auto-update Action, bracket simulator, fan-zone map, stats, widgets, MCP — driven by contributors + your weekly 12h.

---

## Naming (proposals — pick or veto)
- **Kickoff26** / `kickoff26.com` — memorable, brandable, tournament-scoped.
- **OpenWC** / **OpenWorldCup** — leans into the open-data positioning (good for dev stars).
- **PitchSide**, **GoalGlobe**, **The Global Touchline** — fan-brand options.
*(My lean: `Kickoff26` for fans + position the data layer as "OpenWC data".)*

---

## Verification (how we'll know it works, end-to-end)
1. `node scripts/build-data.mjs` → `/data/*.json` validates against schema (count = 104 matches, 48 teams, 12 groups).
2. `npm run dev` → schedule renders in **auto-detected** TZ; switching TZ shifts every kickoff correctly (spot-check Mexico vs South Africa = 12:00 AM PKT Jun 12).
3. Pick a country in **Where to Watch FREE** → free-to-air/legal-free options listed first, then paid, in the chosen language.
4. Click **Add to Calendar** → downloaded `.ics` opens in Google/Apple Calendar at the correct *local* time.
5. `node scripts/update-results.mjs` with a mock result → standings + tiebreakers recompute correctly; bracket advances.
6. Build PWA → Chrome DevTools "Offline" → app still loads and navigates. Lighthouse PWA + perf ≥ 90.
7. Repo opens cleanly for a contributor: README renders, `good first issue`s exist, data is forkable with no key.

---

## Decisions locked
1. **Framework:** Next.js (App Router) PWA on Vercel. ✓
2. **MVP scope:** TZ schedule + calendar export, Where-to-Watch FREE, My Team hub, open `/data`. (Offline PWA → Phase 2.) ✓
3. **Where-to-Watch:** **free-first, legal** — maximize free-to-air/FIFA+/free-window coverage per country+language; no unlicensed-stream hosting (keeps the repo + your account alive to actually earn stars). ✓
