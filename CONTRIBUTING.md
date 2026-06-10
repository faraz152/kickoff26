# Contributing to kickoff26

Thanks for helping out. The single most useful thing you can do is **confirm whether a broadcaster in your country is free or paid** — we now list FIFA's official broadcasters for 115 countries, but most aren't yet flagged free vs paid, and that's the one thing a maintainer in another country can't get right alone.

## The one hard rule: no pirate streams

We only ever list **official rights-holders** — free-to-air TV, official free streams (FIFA+, broadcaster apps), public broadcasters, and official paid services. We do **not** link unlicensed IPTV or "free stream" restream sites, ever. They infringe FIFA/broadcaster copyright, which means a DMCA takedown, which means GitHub deletes the repo and the whole project dies. A PR with a pirate link gets closed on sight. The CI validator also rejects obvious restream domains.

The promise — "watch free" — is delivered by surfacing every *legal* free option first. That's the actual gap nobody fills well, and it's the part that can't be taken down.

## How the broadcast data works

`broadcasts.json` is **generated** — don't hand-edit it. It's built by [`build-broadcasts.mjs`](packages/data/scripts/build-broadcasts.mjs) from FIFA's official where-to-watch feed (the authoritative rights-holder list), then [`channel-classify.mjs`](packages/data/scripts/channel-classify.mjs) tags each channel `free` / `paid` / `unknown`. FIFA's feed doesn't say free or paid, so anything we can't confidently identify shows honestly as "official broadcaster — check the site".

## Confirm a broadcaster's free/paid (5-minute PR)

1. Open the watch page, pick a country, and find a channel tagged **"Official broadcaster"** (unconfirmed) that you know.
2. Verify free vs paid on the broadcaster's **own** site (not an aggregator or blog).
3. Add a rule to [`channel-classify.mjs`](packages/data/scripts/channel-classify.mjs) — an ordered `[pattern, cost, type]` entry. Match the channel name; pick `free`/`paid` and a `type` (`free-tv`, `free-stream`, `paid-tv`, `paid-stream`).
4. Re-run `npm run build:broadcasts` then `npm run validate:data` (checks ISO codes, free→unknown→paid ordering, no pirate links).
5. **A wrong free/paid flag is the one thing that breaks trust here** — if you're not certain, leave it `unknown` rather than guess.

For a country FIFA's feed omits, add it to [`broadcasts.seed.json`](packages/data/scripts/broadcasts.seed.json) (same channel shape, keyed by ISO-3166 alpha-2).

```js
// in channel-classify.mjs RULES — first match wins
[/\bnta\b/i, 'free', 'free-tv'],            // Nigeria: NTA is free-to-air
[/supersport|\bdstv\b/i, 'paid', 'paid-tv'], // SuperSport/DStv is subscription
```

## Dev setup

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # static export to out/
npm run validate:data  # data integrity checks
```

The site is a Next.js static export in an npm-workspaces monorepo. Pages live in `app/`, components in `components/`; the shared framework-free logic is the `@kickoff26/core` package (`packages/core/`) and the data is `@kickoff26/data` (`packages/data/`). The data is built from openfootball by `packages/data/scripts/build-data.mjs`; don't hand-edit `matches.json` / `teams.json` / `groups.json` / `venues.json` — change the script and re-run `npm run build:data`. `broadcasts.json` is hand-maintained (that's the community part).

## PRs and commits

- Branch off `main`: `git checkout -b add-broadcasts-nigeria` (or `fix-...`, `feat-...`).
- Keep the change focused — one country, one fix, one feature per PR. No drive-by refactors.
- Commit messages: `type: short present-tense summary`, e.g. `data: add Nigeria broadcasts`. Reference an issue with `Fixes #12` when there is one.
- **Sign off your commits** with `git commit -s` — it appends a `Signed-off-by: Your Name <you@email>` line. By signing off you agree to the [Developer Certificate of Origin](https://developercertificate.org): a simple statement that you wrote the change (or have the right to submit it) and that it's contributed under this project's MIT (code) / CC0 (data) licenses. No forms to fill in.
- CI runs `validate:data` and `build` on every PR; both need to pass.
- Match the existing code style. Code should read on its own — only comment the *why* when it isn't obvious.

## Bigger pieces

Want to build a feature instead of adding data? See [.github/GOOD_FIRST_ISSUES.md](.github/GOOD_FIRST_ISSUES.md) — offline PWA, auto-updating results, the bracket simulator, the fan-zone map, more languages, an MCP server over `/data`, and more. Open an issue first so we don't double up.
