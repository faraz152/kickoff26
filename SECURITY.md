# Security

## Reporting

Found something? Open a [private security advisory](https://github.com/faraz152/kickoff26/security/advisories/new) or email the maintainer listed on the GitHub profile. Please don't open a public issue for anything exploitable.

## On `npm audit`

`npm audit` flags Next.js server-side advisories (Image Optimizer, RSC streaming, middleware, rewrites, request smuggling, SSRF on WebSocket upgrades, cache poisoning). **kickoff26 is a static export** (`output: 'export'`, `images.unoptimized`, no middleware, no rewrites, no Node server at runtime) — those code paths don't exist in what we ship. The output is plain static HTML/JS on a CDN, so none of them are reachable here.

We track the Next.js 14.2.x patch line and bump within it. We don't force the `next@16` major just to silence the audit, because it's a breaking change for a non-issue in this deployment model. If you find a path that *is* reachable, report it.

## Data integrity

Broadcast PRs are checked by `npm run validate:data` in CI: ISO codes, free-first ordering, and a guard that rejects obvious pirate/restream domains. We list official rights-holders only — no unlicensed streams, ever.
