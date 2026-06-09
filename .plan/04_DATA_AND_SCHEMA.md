# 04 — Data Sources, Schemas & Tournament Reference

## A. openfootball raw schema (verified June 2026)

Top-level: `{ "name": "...", "matches": [ ... ] }`

Group-stage match object:
```json
{
  "round": "Matchday 1",
  "date": "2026-06-11",
  "time": "13:00 UTC-6",
  "team1": "Mexico",
  "team2": "South Africa",
  "group": "Group A",
  "ground": "Mexico City"
}
```
- `time` is **local venue time WITH its UTC offset** (`"13:00 UTC-6"`). Finished matches add a `score` object (`ft`,`ht`,`et`,`p`) + goal details.
- **Knockout** matches reference teams by placeholder: `W74` = winner of match 74, `L101` = loser of match 101.
- ⚠️ **Validate the match count on every build.** WC2026 = **104** total (72 group + 16 R32 + 8 R16 + 4 QF + 2 SF + 1 third-place + 1 final). openfootball may still be back-filling knockout rows; if count ≠ 104, log a warning, don't crash.
- ⚠️ **Team names differ from FIFA display** (openfootball: "Czech Republic", FIFA: "Czechia"). Map to stable slugs + display names in `/data/i18n`.

### The one transformation that matters (UTC derivation)
`"date":"2026-06-11"` + `"time":"13:00 UTC-6"` → kickoff is 13:00 at UTC−6 → **`2026-06-11T19:00:00Z`**.
Sanity chain (proves correctness end-to-end):
`19:00 UTC` = **3:00 PM ET** (EDT, UTC−4) = **12:00 AM PKT next day** (UTC+5 → 00:00 Jun 12). ✅ matches the published opener time.

**Rule:** store kickoff as UTC ISO in `/data`; convert to user TZ at render time only.

## B. Canonical `/data` schema (what build-data.mjs writes)

**`matches.json`** — `[{ id:1, stage:"group"|"r32"|"r16"|"qf"|"sf"|"third"|"final", round:"Matchday 1", group:"A"|null, kickoff_utc:"2026-06-11T19:00:00Z", venue_id:"estadio-azteca", team1:"mexico"|"W74", team2:"south-africa"|"L101", score:{ft:[null,null],ht:[null,null],et:null,pens:null}, status:"scheduled"|"live"|"finished" }]`

**`teams.json`** — `[{ id:"mexico", name:"Mexico", code:"MEX", flag:"🇲🇽", fifa_rank:15, group:"A", confederation:"CONCACAF" }]`

**`groups.json`** — `[{ id:"A", teams:["mexico","south-korea","czechia","south-africa"] }]` (standings computed at runtime / by update-results.mjs into `standings.json`).

**`venues.json`** — `[{ id:"estadio-azteca", name:"Estadio Azteca", city:"Mexico City", country:"Mexico", tz:"America/Mexico_City", capacity:87523 }]`

**`broadcasts.json`** — see `05_BROADCASTS_SEED.md`.

**`/data/i18n/<lang>.json`** — team display names + UI strings per language.

## C. FIFA 2026 format & EXACT tiebreakers (for standings/bracket)

**Format:** 48 teams → 12 groups (A–L) ×4 → each plays 3 → **top 2 of each group (24) + 8 best third-placed (8) = 32** → Round of 32 → R16 → QF → SF → Final.

**Group ranking tiebreakers, in order:**
1. Points (all group matches)
2. Goal difference (all)
3. Goals scored (all)
— if still level between the tied teams only:
4. Points in head-to-head among tied teams
5. Goal difference in head-to-head
6. Goals scored in head-to-head
7. Fair-play points (fewer cards better: yellow −1, indirect red −3, direct red −4, yellow+red −5)
8. Drawing of lots (FIFA)

**Best-third-placed ranking** (rank all 12 third-place teams; **top 8 advance**): points → goal difference → goals scored → fewer disciplinary points → drawing of lots.

**R32 bracket assignment:** the 8 advancing thirds slot into **predetermined R32 positions depending on which groups they came from** — FIFA's Annex table (**495 combinations**). Implement from the published table; `worldcup-domain-expert` skill should carry it (or a link + algorithm). Until results exist, keep `W##`/`L##`/third placeholders.

## D. The 12 groups + approx FIFA ranks (Apr 2026 — verify on build)

> ⚠️ Group assignments were aggregated from press sources; **treat openfootball as source of truth** for fixtures/groups and cross-check team membership when building. Ranks are approximate (Apr 2026); pull authoritative ranks via API or FIFA.

| Grp | Teams (FIFA rank) |
|---|---|
| A | Mexico (15), South Korea (27), Czechia (34), South Africa (63) |
| B | Switzerland (19), Canada (40), Qatar (48), Bosnia & Herzegovina (52) |
| C | Brazil (6), Morocco (8), Scotland (36), Haiti (115) |
| D | USA (16), Australia (24), Türkiye (37), Paraguay (61) |
| E | Germany (10), Ecuador (32), Ivory Coast (53), Curaçao (103) |
| F | Netherlands (7), Japan (18), Sweden (38), Tunisia (44) |
| G | Belgium (9), Iran (23), Egypt (49), New Zealand (105) |
| H | Spain (2), Uruguay (17), Saudi Arabia (57), Cape Verde (73) |
| I | France (1), Senegal (14), Norway (28), Iraq (66) |
| J | Argentina (3), Austria (25), Algeria (69), Jordan (89) |
| K | Portugal (5), Colombia (13), DR Congo (72), Uzbekistan (100) |
| L | England (4), Croatia (12), Ghana (65), Panama (78) |

## E. Schedule sanity-reference (Matchday 1, ET → PKT)

> openfootball is authoritative; this is only to eyeball that the TZ pipeline is right. PKT = UTC+5 = ET + 9h (June EDT). Times ET.

| Match | ET | PKT |
|---|---|---|
| Mexico v South Africa (A) | Thu Jun 11, 3:00 PM | Fri Jun 12, 12:00 AM |
| South Korea v Czechia (A) | Thu Jun 11, 10:00 PM | Fri Jun 12, 7:00 AM |
| Canada v Bosnia (B) | Fri Jun 12, 3:00 PM | Sat Jun 13, 12:00 AM |
| USA v Paraguay (D) | Fri Jun 12, 9:00 PM | Sat Jun 13, 6:00 AM |
| Brazil v Morocco (C) | Sat Jun 13, 6:00 PM | Sun Jun 14, 3:00 AM |

**Final:** Sun Jul 19, 3:00 PM ET = Mon Jul 20, 12:00 AM PKT, MetLife Stadium (East Rutherford, NJ).

## F. Live / secondary sources (Phase 2 autoupdater)
- balldontlie FIFA: https://fifa.balldontlie.io/
- TheSportsDB (crests/art): https://www.thesportsdb.com/league/4429-fifa-world-cup
- API-Football (free ~100/day): https://www.api-football.com/
- Historical WCs (previous-tournaments feature): https://github.com/openfootball/worldcup.json (older years) + statsbomb/open-data.
