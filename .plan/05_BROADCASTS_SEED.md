# 05 — Where to Watch FREE: schema, boundary & seed

## The boundary (restate in the skill + CONTRIBUTING)

✅ **Allowed:** official rights-holders only — free-to-air TV, official free streams, public broadcasters, FIFA+ free matches, official radio, and official paid services (shown after free).
❌ **Banned:** unlicensed/pirate IPTV or "free stream" restream links of any kind. They infringe FIFA/broadcaster copyright → DMCA → GitHub deletes the repo. **Zero pirate links, ever.** This is what keeps the project alive to earn stars.

The product promise — "watch FREE" — is delivered by **surfacing every *legal* free option first**, which is genuinely the bigger, defensible gap (LiveSoccerTV has the data but it's closed, ad-heavy, and not free-sorted).

## `broadcasts.json` schema (country-keyed)

```json
{
  "GB": {
    "country": "United Kingdom",
    "channels": [
      { "name": "BBC One / iPlayer", "type": "free-tv",     "languages": ["en"], "cost": "free", "url": "https://www.bbc.co.uk/iplayer", "note": "free-to-air, no login" },
      { "name": "ITV1 / ITVX",        "type": "free-stream", "languages": ["en"], "cost": "free", "url": "https://www.itv.com/watch" }
    ]
  }
}
```
- `type` ∈ `free-tv` | `free-stream` | `radio` | `paid-tv` | `paid-stream`.
- **Free-first sort:** render `free-tv`, `free-stream`, `radio` (all `cost:"free"`) **before** any `paid-*`.
- Optional `matches: [ids]` if a channel carries only some games (omit = all). Per-match coverage can be a Phase-2 refinement.
- Country keys = ISO-3166 alpha-2. Language tags = ISO-639-1.
- Every entry SHOULD carry a `source` URL (official) in PRs; the curator skill enforces this.

## ⚠️ Accuracy rule

**2026 rights deals change and get announced over time — VERIFY each entry against the official broadcaster before publishing.** The seed below is best-known as of mid-2026 and is a starting scaffold, not gospel. Mark unverified rows and confirm via the broadcaster's own site (cross-check LiveSoccerTV). Getting a free/paid flag wrong erodes trust — the one thing this feature sells.

## Seed (~20 markets — the highest-value FREE options to confirm first)

| Country | FREE options (verify) | Paid (after free) |
|---|---|---|
| 🇬🇧 UK | BBC (One/iPlayer) + ITV (ITVX) — both free-to-air | — |
| 🇧🇷 Brazil | TV Globo (free-tv) · **CazéTV (YouTube, free-stream)** · FIFA+ (some) | SporTV, Globoplay |
| 🇯🇵 Japan | NHK (free-tv) · **ABEMA (free-stream)** | (commercial paid tiers) |
| 🇦🇺 Australia | **SBS (free-tv + SBS On Demand)** | Optus Sport |
| 🇫🇷 France | **TF1 (free-tv + TF1+)** | beIN Sports |
| 🇩🇪 Germany | ARD / ZDF (free public) | Telekom/MagentaTV |
| 🇪🇸 Spain | RTVE / La1 (free public) | (cable) |
| 🇮🇹 Italy | RAI (free public) | (cable) |
| 🇲🇽 Mexico | Televisa Canal 5 + TV Azteca (free-tv) | Sky/Izzi |
| 🇦🇷 Argentina | TV Pública (free-tv) | TyC Sports, DirecTV |
| 🇺🇸 USA | FOX/FS1 (en) · Telemundo (es) · **Tubi (free-stream, en)** | Peacock (es), Fubo |
| 🇨🇦 Canada | CTV (some free-tv) | TSN/RDS, DAZN |
| 🇮🇳 India | (JioHotstar — some free-stream historically) | Sony Sports / paid |
| 🇰🇷 South Korea | KBS/MBC/SBS (free public) | (cable) |
| 🇸🇦 Saudi/MENA | (national FTA where applicable) | beIN Sports (dominant) |
| 🇿🇦 South Africa | SABC (free public) | SuperSport (DStv) |
| 🇳🇬 Nigeria | (NTA where applicable) | SuperSport (DStv) |
| 🇳🇱 Netherlands | NOS (free public) | (cable) |
| 🇵🇹 Portugal | RTP (free public) | Sport TV |
| 🌍 Global | **FIFA+ (selected matches free in some territories)** | — |

**Free-streaming standouts to highlight in the README demo:** CazéTV (Brazil/YouTube), ABEMA (Japan), Tubi (USA), SBS On Demand (Australia), BBC iPlayer/ITVX (UK). These prove the "watch free, legally" promise.

## "Add your country" = the mass-contribution good-first-issue

Most countries aren't seeded. Ship a template + an open issue inviting fans to add their country's official broadcasters (with the schema above). This is how `broadcasts.json` reaches global coverage — and every contributor PR = a stargazer. The `football-broadcast-curator` skill defines the PR-review checklist.
