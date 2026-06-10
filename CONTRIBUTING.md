# Contributing to kickoff26

Thanks for helping out. The single most useful thing you can do is **add where-to-watch info for your country** — that's the dataset that makes this project worth using, and it's the one thing a maintainer in another country can't get right alone.

## The one hard rule: no pirate streams

We only ever list **official rights-holders** — free-to-air TV, official free streams (FIFA+, broadcaster apps), public broadcasters, and official paid services. We do **not** link unlicensed IPTV or "free stream" restream sites, ever. They infringe FIFA/broadcaster copyright, which means a DMCA takedown, which means GitHub deletes the repo and the whole project dies. A PR with a pirate link gets closed on sight. The CI validator also rejects obvious restream domains.

The promise — "watch free" — is delivered by surfacing every *legal* free option first. That's the actual gap nobody fills well, and it's the part that can't be taken down.

## Add your country (5-minute PR)

1. Open [`broadcasts.json`](packages/data/data/broadcasts.json).
2. Copy the shape from [`broadcasts.template.json`](packages/data/data/broadcasts.template.json), keyed by your ISO-3166 alpha-2 code (`GB`, `BR`, `IN`…).
3. List **free options first**: `free-tv`, then `free-stream`, then `radio`. Put any `paid-tv` / `paid-stream` after them.
4. Every channel needs a `source` — the broadcaster's **own** page, not an aggregator or a blog.
5. Language tags are ISO-639-1 (`en`, `pt`, `ar`).
6. **Verify the free/paid flag** against the broadcaster before you submit. Rights deals for 2026 are still being announced; a wrong flag is the one thing that breaks trust in this feature. If you're not sure, add a `note` saying so.
7. Run `npm run validate:data` — it checks ISO codes, free-first ordering, and that nothing looks like a pirate link.

```jsonc
"NG": {
  "country": "Nigeria",
  "channels": [
    { "name": "NTA", "type": "free-tv", "languages": ["en"], "cost": "free",
      "url": "https://www.nta.ng/", "source": "https://www.nta.ng/", "note": "selected matches" },
    { "name": "SuperSport (DStv)", "type": "paid-tv", "languages": ["en"], "cost": "paid",
      "url": "https://supersport.com/", "source": "https://supersport.com/" }
  ]
}
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
- CI runs `validate:data` and `build` on every PR; both need to pass.
- Match the existing code style. Code should read on its own — only comment the *why* when it isn't obvious.

## Bigger pieces

Want to build a feature instead of adding data? See [.github/GOOD_FIRST_ISSUES.md](.github/GOOD_FIRST_ISSUES.md) — offline PWA, auto-updating results, the bracket simulator, the fan-zone map, more languages, an MCP server over `/data`, and more. Open an issue first so we don't double up.
