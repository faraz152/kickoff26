# 🚀 START HERE — kickoff26

> **You are picking up a fresh session to build `kickoff26` — the open, fan-first FIFA World Cup 2026 companion.**
> This `.plan/` folder is fully self-contained. Read it in order, then start building. No prior conversation context is needed.

---

## What this project is (one paragraph)

`kickoff26` is an **open-source, ad-free, no-tracking web app + open dataset** that helps football fans worldwide during the 2026 World Cup (June 11 – July 19, 2026). The killer combo nobody else offers in one place: **(1)** the full 104-match schedule in *your* timezone with one-tap calendar export, **(2)** "Where to Watch **FREE**" — every legal free-to-air / FIFA+ / free-streaming option per country & language (paid options shown after), and **(3)** a personalized "My Team" hub. It's built on **public-domain open data** (no API keys) and designed to be the **open data layer** other devs reuse → which is how it earns GitHub stars.

The goal is twofold: genuinely help fans, and earn stars / a launched web app (domain bought once ~80% done).

---

## 📖 Reading order

1. **`01_PLAN.md`** — the full approved product plan: vision, the moat, MVP scope, architecture, decisions locked. **Read this first.**
2. **`02_RESEARCH.md`** — what already exists, reusable open data (with URLs + schemas), competitor gaps, how OSS repos get stars. So you don't re-research.
3. **`03_SKILLS.md`** — specs for the **7 reusable Claude skills to create as STEP 1** (the user's explicit first ask). Full frontmatter + body for each.
4. **`04_DATA_AND_SCHEMA.md`** — openfootball JSON shape, our canonical `/data` schema, FIFA 2026 format + exact tiebreakers, the 12 groups + FIFA ranks, and a full PKT schedule reference for sanity-checking.
5. **`05_BROADCASTS_SEED.md`** — the free-first "Where to Watch" dataset schema, the legal boundary, and seed data for ~20 countries.
6. **`06_ROADMAP.md`** — phased build order, time budget, and the `good first issue` backlog for contributors.

---

## ⚡ First actions when you start the build session

Paste this as your kickoff prompt (or just say "execute the plan in .plan/"):

```
Read everything in ./.plan/ then execute in this order:
1. Create the 7 skills from .plan/03_SKILLS.md into ~/.claude/skills/
2. git init + scaffold the repo per .plan/06_ROADMAP.md
3. Write scripts/build-data.mjs to pull openfootball/worldcup.json 2026 → /data/*.json (see 04_DATA_AND_SCHEMA.md)
4. Seed /data/broadcasts.json from .plan/05_BROADCASTS_SEED.md
5. Build the Next.js MVP (schedule + TZ + .ics + Where-to-Watch FREE + My Team)
6. README + CONTRIBUTING + licenses (MIT code / CC0 data) + good-first-issues
7. Verify per the checklist in 01_PLAN.md
Use the skills you just created as you build.
```

---

## 🔒 Decisions already locked (do not re-litigate)

- **Name:** `kickoff26`. (Alt considered: `freekick26` — double meaning free-to-watch + free kick. `OpenWC` rejected: collides with the open-wc web-components project.)
- **Stack:** **Next.js (App Router) PWA on Vercel.** Data = static JSON in repo (no DB, no backend). Live updates via GitHub Actions cron that commits JSON.
- **MVP scope:** TZ schedule + `.ics` export · Where-to-Watch **FREE** · My Team hub · open `/data`. (Offline PWA, bracket sim, fan-zone map, stats → Phase 2.)
- **Where-to-Watch is FREE-FIRST and LEGAL.** Surface every *legal* free option (free-to-air, FIFA+, free windows) first, then cheapest paid. **The repo does NOT host or link unlicensed/pirate re-streams** — that triggers DMCA → GitHub deletes the repo → the stars goal dies. The legal free-access map is the bigger, un-killable moat. (Full reasoning in `01_PLAN.md`.)
- **Licensing:** MIT for code, CC0 for the `/data` datasets (matches openfootball, keeps data maximally reusable).

---

## 🧠 Identity / voice note

Per the workspace `CLAUDE.md`, the GitHub persona is **Faraz Ahmed (`faraz152`)** — an intermediate Android/Kotlin dev who writes like a real human, never like a marketing doc or AI. All commits, PRs, README copy, and issues should sound like a real developer. No bold-header-everything, no "Key insight:", no AI trailers in commits.

---

## ⏱️ Time reality

~12 working hrs/week, MVP within a week. **Reuse open data, don't recreate it.** Ship a thin, genuinely-useful, beautiful slice first; let contributors fan out the 100-feature long tail.
