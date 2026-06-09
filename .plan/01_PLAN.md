# 01 — Product Plan (approved)

## Context

Build the *best-in-the-world* open-source product for the FIFA World Cup 2026 (June 11 – July 19, 2026, hosted USA/Canada/Mexico, 48 teams, 104 matches). Twin goals: **(1)** genuinely solve real fan problems worldwide, **(2)** earn GitHub stars / a launched web app (domain bought once ~80% done).

This plan is the refined version of a raw idea, shaped by deep research (see `02_RESEARCH.md`) into what already exists, what's reusable, and **what nobody does well** — so we build a moat, not the 20th fixtures app.

---

## ⚖️ The "free streaming" goal — how we actually win it

Fans want to watch **free**. That need is valid and central. But we build the version that **survives and gets starred**, not the version that gets deleted.

- **IPTV the technology is legal** (Peacock, DAZN, FIFA+ are all IPTV). **Unlicensed re-streams of the World Cup are not** — they infringe FIFA/broadcaster copyright → **DMCA takedown → GitHub deletes the repo → account at risk.** A pirate-link aggregator is the fastest way to guarantee zero stars and no web app. **So the repo will not host or link unlicensed streams.**
- **The better path to "free" (our moat):** a huge share of WC 2026 is **legally free-to-air** — BBC (UK), TF1 (France), SBS (Australia), CTV (Canada), Telemundo/Peacock free windows, **FIFA+** free matches, and many national public broadcasters (FIFA often mandates key games on free TV). We build **"Where to Watch FREE"**: per country × language, surface *every free legal option first*, then cheapest paid, with official links. This serves "free" **better** than pirate links (which die mid-match, carry malware, get geo-blocked) — and it's open, embeddable, and can't be taken down. **Free-first, legal, un-killable.**

---

## Product vision & positioning

> **"Every match in your timezone. Where to watch FREE in your country & language. Your team's road to the final. Open data, no ads, no tracking."**

The moat = four things competitors don't combine:
1. **Open, global, legal Where-to-Watch-FREE dataset** (country × language × channel × free/paid) — CC0, community-grown.
2. **Deep personalization + timezone/calendar UX** — pick your team → only your matches, your TZ, one-tap `.ics`, where *you* can watch free.
3. **Offline-first PWA** (Phase 2) — built for the global south / stadiums / patchy data, where flashy apps fail.
4. **Be the open data layer** — raw JSON (no key), embeddable widgets, optional MCP server → other devs reuse us → network-effect stars.

---

## Feature scope

### MVP (first build, ~12h) — LOCKED
- **0. Timezone schedule + calendar export** — auto-detect TZ, manual override, full 104-match schedule + group standings computed live; one-tap **Add to Calendar** (`.ics`) for a match, your team, or the whole tournament, in your local time.
- **1. Where to Watch FREE** — pick country × language → *free legal options first* (free-to-air, FIFA+, free windows), then cheapest paid, with official links. Seed ~20 countries; structure ready for community PRs. **Biggest moat.**
- **2. My Team hub** — pick country → your fixtures (your TZ), group table, squad, route to final, and where *you* can watch free.
- **3. Open data** — all `/data/*.json` consumable directly (no key) + a "use our data" section in the README.

### Phase 2+ (becomes the `good first issue` backlog — see `06_ROADMAP.md`)
Offline PWA · auto-updating results after each match · knockout bracket simulator ("predict & share") · fan-zone / watch-party map (FIFA Fan Festivals + community pubs) · host-city & travel guide (visa, transit between 16 cities) · player & historical stats (StatsBomb) · ticket-availability links (FIFA official + resale) · merch directory (official stores) · embeddable widgets · MCP server · multi-language UI (i18n/RTL) · push notifications · "dead-rubber vs must-watch" match-importance tags.

---

## Architecture (locked)

**Next.js (App Router) PWA on Vercel.** Data = **static JSON in the repo** (framework-agnostic, forkable, no server/DB → contributor-friendly, free hosting, fast). Live updates via a scheduled GitHub Action that commits JSON — **no backend to operate.**

```
kickoff26/
├─ .plan/                     # this folder (planning docs)
├─ data/                      # canonical, public-domain-derived JSON — the product's heart
│  ├─ matches.json            # from openfootball, normalized (see 04_DATA_AND_SCHEMA.md)
│  ├─ teams.json  groups.json  venues.json
│  ├─ broadcasts.json         # country→language→channel, FREE-first (see 05_BROADCASTS_SEED.md)
│  └─ i18n/                   # team / UI names per language
├─ scripts/
│  ├─ build-data.mjs          # ETL: pull openfootball → normalize → /data
│  └─ update-results.mjs      # poll live API → results + standings + bracket → commit
├─ web/  (or app/ at root)    # the Next.js PWA
├─ packages/widgets/          # embeddable schedule/standings widget (Phase 2)
├─ mcp/                       # optional MCP server over /data (Phase 2)
└─ .github/workflows/
   ├─ update-live.yml         # cron during match windows → update-results → commit
   └─ deploy.yml              # build + deploy to Vercel (free)
```

- **Timezone:** client-side `Intl.DateTimeFormat` (IANA zones) — zero data cost, every TZ on Earth, DST-correct. See `fixture-timezone-engine` skill.
- **Standings/bracket:** computed from results with **FIFA 2026 tiebreakers** incl. best-8-third-place logic (exact rules in `04_DATA_AND_SCHEMA.md`).
- **Hosting:** Vercel free tier. Domain later at ~80%.
- **Live updates:** GitHub Action cron (tight windows only, to respect free API limits), commits updated JSON, triggers redeploy. Fully serverless.

---

## The 7 skills (build FIRST — full specs in `03_SKILLS.md`)

1. `worldcup-data-pipeline` — ETL brain: all open sources, schemas, normalize → `/data`.
2. `football-broadcast-curator` — the FREE-first legal where-to-watch dataset + PR-review rules.
3. `fixture-timezone-engine` — UTC→any-TZ, DST, `.ics` generation.
4. `live-score-autoupdater` — poll APIs, recompute standings + tiebreakers + bracket, commit via Actions.
5. `worldcup-domain-expert` — FIFA 2026 format/rules/tiebreakers/bracket + historical facts (accuracy oracle).
6. `pwa-i18n-frontend` — Next.js SSG + PWA + i18n/RTL + low-bandwidth perf + Vercel deploy.
7. `oss-launch-growth` — README-as-landing-page, CONTRIBUTING, good-first-issues, launch playbook.

---

## Verification (end-to-end acceptance)

1. `node scripts/build-data.mjs` → `/data/*.json` validates against schema: **104 matches, 48 teams, 12 groups, 16 venues**.
2. `npm run dev` → schedule renders in **auto-detected** TZ; switching TZ shifts every kickoff correctly. **Spot-check: Mexico vs South Africa (opener) = 2026-06-11 15:00 ET = 2026-06-12 00:00 (12:00 AM) PKT.**
3. Pick a country in **Where to Watch FREE** → free-to-air/legal-free options listed *first*, then paid, in the chosen language.
4. Click **Add to Calendar** → downloaded `.ics` opens in Google/Apple Calendar at the correct *local* time.
5. `node scripts/update-results.mjs` with a mock result → standings + tiebreakers recompute correctly; bracket advances.
6. (Phase 2) Build PWA → DevTools "Offline" → app still loads. Lighthouse PWA + perf ≥ 90.
7. Repo opens cleanly for a contributor: README renders, `good first issue`s exist, data forkable with no key.

---

## Decisions locked

| # | Decision | Choice |
|---|---|---|
| 1 | Framework | Next.js (App Router) PWA on Vercel |
| 2 | MVP scope | TZ schedule + `.ics` · Where-to-Watch FREE · My Team · open `/data` |
| 3 | Where-to-Watch | **Free-first, legal**; no unlicensed-stream hosting |
| 4 | Data licensing | CC0 (data) + MIT (code) |
| 5 | Name | `kickoff26` |
| 6 | Data source of truth | `openfootball/worldcup.json` (public domain, no key) |
