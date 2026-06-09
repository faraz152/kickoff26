# Progress

Status of kickoff26 against the master plan in [`.plan/`](.plan/). Last updated 2026-06-09.

**Where it stands:** MVP is built, verified, and live on GitHub. Repo: https://github.com/faraz152/kickoff26 (public, CI green). Not yet deployed to a public URL; the Phase-2 feature backlog is open for contributors.

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
- [ ] **Deployed on Vercel; Lighthouse perf ≥ 90.** ⏳ Build is deploy-ready (`out/`); deploy + Lighthouse run still to do.
- [x] README + CONTRIBUTING + good-first-issues live. *(Demo GIF still to record.)*
- [x] MIT (code) + CC0 (data).

---

## Verification checklist (`.plan/01_PLAN.md`)

1. ✅ `build-data.mjs` → `/data` validates against schema (counts correct).
2. ✅ Schedule in auto-detected TZ; switching shifts every kickoff. Spot-check: Mexico v South Africa = **Thu Jun 11, 3:00 PM ET = Fri Jun 12, 12:00 AM PKT**.
3. ✅ Where-to-Watch FREE lists free-to-air/legal-free first, then paid.
4. ✅ Add-to-Calendar `.ics` opens at correct local time.
5. ⏳ `update-results.mjs` mock → standings/bracket recompute. **Phase 2** — `lib/standings.ts` has the tiebreaker math; the polling script isn't built yet.
6. ⏳ PWA offline + Lighthouse ≥ 90. **Phase 2** — manifest shipped; service worker not yet.
7. ✅ Repo opens cleanly: README renders, good-first-issues exist, data forkable with no key.

---

## What's left — Phase 2 backlog (`.github/GOOD_FIRST_ISSUES.md`)

Contributor-driven, none started:

**Mass-contribution (drives stars):**
- ⏳ `add-broadcasts: <country>` — ~180 countries still unseeded (the main growth lever).
- ⏳ `add-i18n: <language>` — team/UI translations, Arabic/RTL especially.

**Features:**
- ⏳ Auto-update results after each match (`scripts/update-results.mjs` + GitHub Actions cron) — `live-score-autoupdater` skill.
- ⏳ Offline PWA (service worker caches shell + `/data`).
- ⏳ Resolve knockout placeholders to real teams once groups finish (FIFA Annex third-place table).
- ⏳ Knockout bracket simulator ("predict & share").
- ⏳ Fan-zone / watch-party map.
- ⏳ Host-city & travel guide (visa, transit).
- ⏳ Player & historical stats (StatsBomb / openfootball historical).
- ⏳ Ticket links (official + resale, link-only).
- ⏳ Embeddable widgets (`packages/widgets`).
- ⏳ MCP server over `/data`.
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

---

**Rough completion:** MVP ~95% (everything but the Vercel deploy + demo GIF). Phase 2 / the "100 features" long tail is the open contributor backlog.
