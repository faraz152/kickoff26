# ⚽ kickoff26

**Every World Cup 2026 match in your timezone. Where to watch it free in your country. Your team's road to the final.** Open data, no ads, no tracking.

[![CI](https://github.com/faraz152/kickoff26/actions/workflows/ci.yml/badge.svg)](https://github.com/faraz152/kickoff26/actions/workflows/ci.yml)
![code: MIT](https://img.shields.io/badge/code-MIT-blue)
![data: CC0](https://img.shields.io/badge/data-CC0-green)

The 2026 World Cup is 104 matches across 16 cities in three countries and a dozen timezones. Every fixtures app shows you kickoff times in *some* timezone, makes you do the maths, and then leaves you googling "how do I actually watch this." kickoff26 fixes both: it shows every match in **your** local time, lets you drop any match (or your whole team's run, or the entire tournament) straight into your calendar, and tells you the **free, legal** ways to watch in your country before the paid ones.

It's a static site built entirely from open data — no backend, no API keys, no account. Fork it and it just runs.

> 📹 _Demo GIF coming at launch: timezone switch → add-to-calendar → free-stream lookup._

## What makes it different

- **Free-first "where to watch."** Pick your country and you get the free-to-air channels and official free streams first (BBC, TF1, SBS, CazéTV, Tubi, ABEMA…), paid options after. We never link pirate streams — just the legal free options nobody else bothers to sort to the top.
- **Actually your timezone.** Auto-detected, switchable to any IANA zone, DST-correct. A match that kicks off Thursday afternoon in New York shows as Friday 12:00 AM if you're in Karachi — and lands in your calendar at the right moment.
- **Open data layer.** Everything lives in [`packages/data/data`](packages/data/data/) as plain JSON (CC0), also published as `@kickoff26/data`. No key, no rate limit. Build your own bot, widget, or app on top of it.

## Quickstart

```bash
git clone https://github.com/faraz152/kickoff26
cd kickoff26
npm install
npm run dev          # http://localhost:3000
```

Rebuild the dataset from source (openfootball) any time:

```bash
npm run build:data       # fetch + normalize -> /data/*.json
npm run validate:data    # 104 matches / 48 teams / 12 groups / 16 venues, free-first checks
```

## Use our data

The whole product is plain JSON, public domain — `npm i @kickoff26/data` for typed loaders, or grab any file directly:

| File | What's in it |
|---|---|
| [`matches.json`](packages/data/data/matches.json) | All 104 matches — FIFA match number as `id`, `kickoff_utc`, stage, venue, teams (slugs + knockout placeholders) |
| [`teams.json`](packages/data/data/teams.json) | 48 teams — slug `id`, name, code, flag, FIFA rank, group, confederation |
| [`groups.json`](packages/data/data/groups.json) | The 12 groups A–L |
| [`venues.json`](packages/data/data/venues.json) | 16 stadiums — city, country, capacity, IANA timezone |
| [`broadcasts.json`](packages/data/data/broadcasts.json) | Where to watch per country, free options first |

The domain logic (timezone math, `.ics`, FIFA standings, label rendering) is the framework-free [`@kickoff26/core`](packages/core/) package — usable in any JS runtime, no React required.

Kickoffs are stored as UTC ISO (`2026-06-11T19:00:00Z`) — convert to any timezone at render time with `Intl.DateTimeFormat`. Knockout matches reference earlier ones by FIFA number (`W74` = winner of match 74, `L101` = loser of match 101) and group slots by position (`1A`, `2B`, `3A/B/C/D/F`).

There's also a zero-dependency **[MCP server](mcp/)** over the same data, so AI assistants can answer "when does my team play in my timezone?" and "where can I watch free?" — `node mcp/server.mjs`.

## Contributing

The biggest way to help: **confirm whether a broadcaster in your country is free or paid.** Where-to-watch covers 115 countries from FIFA's official feed, but most channels aren't flagged free vs paid yet — pick one you know, verify on its own site, and add a one-line rule to [`channel-classify.mjs`](packages/data/scripts/channel-classify.mjs). It's a 5-minute PR. See [CONTRIBUTING.md](CONTRIBUTING.md) and the [`good first issue`](https://github.com/faraz152/kickoff26/labels/good%20first%20issue) list.

Other open work: the knockout bracket simulator, fan-zone map, more languages, the third-place Annex table. All in [.github/GOOD_FIRST_ISSUES.md](.github/GOOD_FIRST_ISSUES.md).

## Stack

Next.js (App Router) static export, hand-written CSS, zero runtime dependencies beyond React. Data is built from [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) (public domain). Deploys to any static host — Vercel auto-detects it.

## License

Code is [MIT](LICENSE). Data in `/data` is [CC0](LICENSE-data) (public domain) — same as openfootball, so it stays maximally reusable.
