# 06 — Roadmap, Build Order & Contributor Backlog

## Build order (the new session executes top-to-bottom)

### Step 0 — Skills (~2h)
Create the 7 skills from `03_SKILLS.md` into `~/.claude/skills/`. Several encode logic you need next (timezone math, tiebreakers, data schema), so build them first and use them as you go.

### Step 1 — Repo + data spine (~2h)
- `git init`; add `.gitignore` (node), `LICENSE` (MIT), `LICENSE-data` (CC0).
- `scripts/build-data.mjs`: fetch openfootball raw → normalize to `/data/*.json` per `04_DATA_AND_SCHEMA.md` (derive `kickoff_utc` from `time`+offset; slugify teams; map venues→IANA tz). Validate counts (104/48/12/16; warn if knockouts not yet filled).
- `scripts/validate-data.mjs` (or inline): zod/JSON-schema check.
- Commit `/data` to the repo (it's the product — must be forkable without running anything).

### Step 2 — Broadcasts seed (~1h)
- `data/broadcasts.json` from `05_BROADCASTS_SEED.md` (verify the free/paid flags against official sites as you add each).
- Add `data/broadcasts.template.json` + a CONTRIBUTING note for "add your country".

### Step 3 — Next.js MVP (~5h) — use `pwa-i18n-frontend` + `fixture-timezone-engine`
- Scaffold Next.js (App Router, TS). Read `/data` at build.
- **Pages/views:** Schedule (TZ-aware, group + day filters) · Match detail (with Where-to-Watch FREE panel + Add-to-Calendar) · Group standings · Team page · My Team hub (country picker → personalized) · Country picker for Where-to-Watch.
- **TZ:** auto-detect + manual override; render every kickoff in user TZ.
- **.ics export:** single match / whole team / whole tournament (UTC `DTSTART...Z`).
- **Where-to-Watch FREE:** pick country (+language) → free options first, paid after.
- Deploy to Vercel.

### Step 4 — Launch scaffolding (~3h) — use `oss-launch-growth`
- README as landing page (hero, demo GIF, "why different", quickstart, "use our data", badges).
- CONTRIBUTING.md + labels + the good-first-issues below.
- Record a demo GIF (TZ switch → add-to-calendar → free-stream lookup).
- Soft launch when stable.

### Step 5 — Verify (per `01_PLAN.md` checklist)

> Total MVP ≈ 13h. Fits "~12h/week, within a week."

---

## Phase 2+ backlog = `good first issue`s (the "100 features", contributor-driven)

**Mass-contribution (drives stars):**
- `add-broadcasts: <country>` — one issue per missing country (free-first, official sources). High volume, low skill bar.
- `add-i18n: <language>` — translate team/UI names.

**Features:**
- Auto-update results after each match (GitHub Action + `update-results.mjs`) — uses `live-score-autoupdater`.
- Offline PWA (service worker caches shell + `/data`).
- Knockout bracket simulator ("predict & share" image).
- Fan-zone / watch-party map (FIFA Fan Festivals + community-added venues).
- Host-city & travel guide (visa, transit between 16 cities) — borrow shape from `wc26-mcp`.
- Player stats + previous-World-Cup stats (StatsBomb / openfootball historical).
- Ticket-availability links (FIFA official + resale) — link only.
- Official merch directory (official stores only).
- Embeddable widgets (`packages/widgets`) — schedule/standings `<iframe>`/web component.
- MCP server over `/data` (so AI assistants can answer "when does my team play, where can I watch free").
- Match-importance tags ("dead rubber" vs "must-watch" / qualification scenarios).
- Push notifications / "notify me before my team plays".

---

## Definition of done for the MVP launch
- [ ] `/data/*.json` builds & validates (104/48/12/16).
- [ ] Schedule renders in auto-detected TZ; manual override works; opener shows 12:00 AM PKT (Jun 12) for a Karachi user.
- [ ] Where-to-Watch FREE lists free options before paid for ≥20 seeded countries.
- [ ] Add-to-Calendar `.ics` opens at correct local time.
- [ ] Deployed on Vercel; Lighthouse perf ≥ 90.
- [ ] README + demo GIF + CONTRIBUTING + good-first-issues live.
- [ ] MIT (code) + CC0 (data).

## Naming / domain (when ~80% done)
`kickoff26` → check `kickoff26.com` / `.app` / `.gg`. Alt: `freekick26` (free-to-watch pun). Position the dataset as "kickoff26 open data".
