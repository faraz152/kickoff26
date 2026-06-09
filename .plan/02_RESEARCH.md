# 02 — Research Findings

> Done June 2026. Saves the build session from re-researching. All sources are free/open unless noted.

## A. Reusable open data (the foundation — DON'T rebuild this)

### ⭐ openfootball/worldcup.json — THE keystone (source of truth)
- Repo: https://github.com/openfootball/worldcup.json — **CC0 / public domain, NO API key.**
- 2026 file: https://github.com/openfootball/worldcup.json/blob/master/2026/worldcup.json
- Raw (use this in build-data.mjs): `https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json`
- Ships **2026** matches, teams, groups, venues, kickoff times. Auto-generated from `2026--usa/cup.txt` (group stage) + `cup_finals.txt` (knockouts).
- Match record fields: `round`, `date`, `time` (e.g. `"13:00"` with a UTC offset like `"UTC-6"`), `team1`, `team2`, `group`, `ground` (venue), `score` objects (`ft`,`ht`,`et`,`p`), goal details. Knockout slots use placeholders (`W101`, etc.). **Full schema details in `04_DATA_AND_SCHEMA.md`.**
- Sister repos: `openfootball/worldcup` (Football.TXT source format), `openfootball/football.json` (club leagues). Historical World Cups available for the "previous World Cups" feature.

### Live scores / results (for the auto-updater — Phase 2)
- **balldontlie FIFA API** — https://fifa.balldontlie.io/ — teams, stadiums, players, rosters, matches, standings, lineups, events. Free tier (check current limits).
- **TheSportsDB** — https://www.thesportsdb.com/league/4429-fifa-world-cup — free fixtures/results/artwork/logos. Good for crests/images.
- **API-Football (API-SPORTS)** — https://www.api-football.com/ — free tier ~100 req/day; very complete (fixtures, events, lineups, stats, standings, top scorers, injuries, predictions, odds). Backup live source.
- **rezarahiminia/worldcup2026** — https://github.com/rezarahiminia/worldcup2026 — free OSS REST API (teams, groups, matches, stadiums, live scores, standings). Possible mirror/fallback.

### Player & historical stats (Phase 2 "stats" features)
- **statsbomb/open-data** — https://github.com/statsbomb/open-data — free event-level data (some World Cups), JSON. Python helper: `statsbombpy`. Great for deep stats / viz.

### Tickets (we LINK, never resell — Phase 2)
- FIFA official: https://www.fifa.com/en/tickets · Official Resale/Exchange Marketplace · On Location (only official hospitality). Last-Minute Sales Phase is first-come-first-served, needs a FIFA ID.

## B. Competitors & their gaps (where we win)

| Project | What it does | Gaps we exploit |
|---|---|---|
| `jordanlyall/wc26-mcp` (https://github.com/jordanlyall/wc26-mcp) | MCP AI companion, 18 tools: teams, venues, weather, city guides, visa, fan zones, head-to-head, bracket, injuries, odds, news | **No live scores, no where-to-watch by country/language, no calendar export, no web UI, no tickets.** Great reference for city-guide/visa data we add later. |
| NestJS WC2026 companion backend | REST/WS API: fixtures, squads, venues, standings, broadcasts, 30+ langs | Backend only (no fan UI); Postgres+Docker = high contributor friction. We're frontend+static-data = lower friction. |
| `martinsmdnuno/wc26` (https://github.com/martinsmdnuno/wc26) | React+Firebase PWA: schedule, betting pool, leaderboard | Closed data, betting-focused, not a global utility. |
| ESPN predictor / Sky/NBC guides | Bracket sim / editorial | Walled, ad-heavy, not open, not personalized. |
| LiveSoccerTV (https://www.livesoccertv.com/) | Legal broadcaster listings by country | **No open API/dataset**, ad-heavy, cluttered, not embeddable, not free-first-sorted. This is exactly the gap our `broadcasts.json` fills openly. |
| `Adya84/ha-world-cup-2026` | Home Assistant integration | Niche (HA users only). |

**The honest gap nobody fills:** an *open, structured, community-maintained, FREE-first legal* "where to watch in YOUR country & language" dataset — combined with one-tap timezone calendar export, offline-first delivery, and a reusable open data layer (JSON + widgets + MCP).

## C. How OSS repos actually get stars (apply at launch — see `oss-launch-growth` skill)

- **README is the landing page** — visitors decide to star within ~20 seconds. Hero line, demo GIF, value-in-one-sentence, badges, 1-command quickstart.
- **Awesome-lists** — get listed in `awesome-football` / `awesome-soccer` / `awesome-sports` etc. **Have a third party submit you** (many maintainers reject self-submissions). Borrowed long-tail traffic forever.
- **GitHub Trending** — a burst of stars in a day can land you there → compounding visibility.
- **Launch channels (only relevant ones):** Show HN (timing matters), r/soccer + r/webdev + r/opensource + country subs, Product Hunt, X/Twitter (one well-followed dev quote-tweet ≈ hundreds of stars).
- **Solve a real, sharp problem** ("watch the WC free in my country, in my timezone") beats "another dashboard."
- **Demo GIF** of the timezone switch + "add to calendar" + free-stream lookup is the single highest-converting asset.

## D. Useful facts captured during research (so they're not lost)

- WC2026: **48 teams, 12 groups (A–L) of 4, 104 matches, 16 host cities, 39 days.** Top 2 per group + **8 best third-placed** → **Round of 32** (new) → R16 → QF → SF → Final (MetLife Stadium, NJ, **Sun July 19, 3pm ET**).
- Opener: **Mexico vs South Africa, Estadio Azteca, Thu June 11, 3pm ET.**
- FIFA ranking top 10 (Apr 2026): France 1, Spain 2, Argentina 3, England 4, Portugal 5, Brazil 6, Netherlands 7, Morocco 8, Belgium 9, Germany 10. (Full group+rank table in `04_DATA_AND_SCHEMA.md`.)
- Knockout bracket has **495 possible third-place permutations** (FIFA Annex) — the autoupdater must implement the assignment table. (Detail in `worldcup-domain-expert` skill.)
