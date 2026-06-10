#!/usr/bin/env node
// ETL: FIFA's official "where to watch" feed -> packages/data/data/broadcasts.json, covering every
// country FIFA lists. api.fifa.com/api/v3/watch/season/<id> is the authoritative official-rights-holder
// list per country — exactly the data this project surfaces, straight from the source. FIFA does NOT
// flag free vs paid, so channel-classify.mjs adds that (confident only; the rest stay `unknown`).
//
// Re-runnable: same input -> byte-identical output. Usage: node build-broadcasts.mjs [--offline]

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classify } from './channel-classify.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');
const CACHE = join(ROOT, 'scripts', '.cache', 'fifa-watch-2026.json');
const SEASON = '285023'; // FIFA World Cup 2026
const SOURCE = `https://api.fifa.com/api/v3/watch/season/${SEASON}?count=400&language=en`;
const WTW = (cc) =>
  `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=${cc}`;

// FIFA language names -> ISO-639-1 (the 41 values its feed actually uses).
const LANG = {
  french: 'fr', spanish: 'es', english: 'en', arabic: 'ar', chinese: 'zh', dutch: 'nl', russian: 'ru',
  albanian: 'sq', german: 'de', bulgarian: 'bg', italian: 'it', romanian: 'ro', 'portuguese brazil': 'pt',
  hebrew: 'he', greek: 'el', 'modern (1453-)': 'el', maltese: 'mt', portuguese: 'pt', estonian: 'et',
  czech: 'cs', japanese: 'ja', kazakh: 'kk', swedish: 'sv', finnish: 'fi', armenian: 'hy', slovenian: 'sl',
  indonesian: 'id', nepali: 'ne', icelandic: 'is', turkmen: 'tk', ukrainian: 'uk', vietnamese: 'vi',
  croatian: 'hr', persian: 'fa', slovak: 'sk', hungarian: 'hu', norwegian: 'no', montenegrin: 'sr',
  serbian: 'sr', danish: 'da', korean: 'ko', turkish: 'tr',
};
const iso = (w) => LANG[(w || '').toLowerCase().trim()] || null;

// free first, then official-but-unknown, then paid (the validator enforces this too)
const TYPE_RANK = { 'free-tv': 0, 'free-stream': 1, radio: 2, unknown: 3, 'paid-tv': 4, 'paid-stream': 5 };

const enName = (arr) =>
  Array.isArray(arr) ? (arr.find((x) => /^en/i.test(x.Locale))?.Description ?? arr[0]?.Description) : null;

async function loadSource(offline) {
  await mkdir(dirname(CACHE), { recursive: true });
  if (!offline) {
    try {
      const res = await fetch(SOURCE, { headers: { 'User-Agent': 'kickoff26-data/1.0', accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      await writeFile(CACHE, text);
      return JSON.parse(text);
    } catch (e) {
      console.warn(`⚠️  fetch failed (${e.message}); falling back to cache`);
    }
  }
  if (!existsSync(CACHE)) throw new Error('no cached FIFA snapshot; run online once without --offline');
  return JSON.parse(await readFile(CACHE, 'utf8'));
}

function main() {
  return loadSource(process.argv.includes('--offline')).then(async (src) => {
    const out = {};
    const tally = { 'free-tv': 0, 'free-stream': 0, 'paid-tv': 0, 'paid-stream': 0, unknown: 0 };

    for (const c of src.Results || []) {
      const cc = c.IdCountryIso3166Alpha2;
      if (!cc || !/^[A-Z]{2}$/.test(cc)) continue;

      // aggregate a country's broadcasters across all its matches; dedupe by channel, union languages
      const byChannel = new Map();
      for (const m of c.Matches || []) {
        for (const s of m.Sources || []) {
          const url = s.Url || s.TvChannelUrl || WTW(cc);
          const e = byChannel.get(s.IdChannel) || { name: s.Name, url, idChannel: s.IdChannel, logo: s.Logo || '', langs: new Set() };
          const l = iso(s.Language);
          if (l) e.langs.add(l);
          byChannel.set(s.IdChannel, e);
        }
      }
      if (byChannel.size === 0) continue;

      const channels = [...byChannel.values()]
        .map((e) => {
          const { cost, type } = classify(e.name);
          tally[type] = (tally[type] || 0) + 1;
          const ch = { name: e.name, type, languages: [...e.langs].sort(), cost, url: /^https?:\/\//.test(e.url) ? e.url : WTW(cc), source: WTW(cc), idChannel: e.idChannel };
          if (e.logo) ch.logo = e.logo;
          return ch;
        })
        .sort((a, b) => TYPE_RANK[a.type] - TYPE_RANK[b.type] || a.name.localeCompare(b.name));

      out[cc] = { country: enName(c.CountryName) || cc, channels };
    }

    // Merge the hand-curated seed for countries FIFA's feed omits (e.g. IN, ZA, NG). FIFA is
    // authoritative for what it covers; the seed only fills gaps.
    const SEED = join(ROOT, 'scripts', 'broadcasts.seed.json');
    let seeded = 0;
    if (existsSync(SEED)) {
      const seed = JSON.parse(await readFile(SEED, 'utf8'));
      for (const [cc, market] of Object.entries(seed)) if (!out[cc]) { out[cc] = market; seeded++; }
    }

    const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
    await mkdir(DATA, { recursive: true });
    await writeFile(join(DATA, 'broadcasts.json'), JSON.stringify(sorted, null, 2) + '\n');

    const total = Object.values(tally).reduce((a, b) => a + b, 0);
    const classified = total - tally.unknown;
    console.log(`✅ wrote broadcasts.json — ${Object.keys(sorted).length} countries (${seeded} seeded), ${total} channel rows`);
    console.log(`   classified ${classified} (${Math.round((classified / total) * 100)}%) · unknown ${tally.unknown}`);
    console.log('   by type:', JSON.stringify(tally));
  });
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
