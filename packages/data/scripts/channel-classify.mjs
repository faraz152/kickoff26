// Free/paid classification for the broadcasters FIFA lists.
//
// FIFA's feed tells us WHO holds rights in each country but not whether a channel is free or paid — and
// this project's rule is to never ship a *guessed* free/paid flag (a wrong one erodes the trust the
// "watch free" promise is built on). So we classify only broadcasters we can identify with confidence
// and leave everything else as `unknown` — shown honestly as "official broadcaster, check their site".
// Community PRs can promote an `unknown` to free/paid with a source.
//
// Rules are ordered; the first whose pattern matches the channel name wins. Keep paid subscription
// brands and obvious public broadcasters here; when unsure, leave it out (→ unknown).

/** @type {[RegExp, 'free'|'paid', string][]} */
const RULES = [
  // ─── paid: global / regional subscription services ───
  [/be\s?in|beinsports/i, 'paid', 'paid-tv'],
  [/\bdazn\b/i, 'paid', 'paid-stream'],
  [/\bd ?sports?\b|\bdgo\b|direc\s?tv/i, 'paid', 'paid-tv'],
  [/supersport|\bdstv\b|showmax/i, 'paid', 'paid-tv'],
  [/canal\s?\+|canal\s?plus/i, 'paid', 'paid-tv'],
  [/\bsky\b|now\s?tv/i, 'paid', 'paid-tv'],
  [/star\s?\+|star\s?plus|\bespn\b|disney\s?\+/i, 'paid', 'paid-tv'],
  [/movistar/i, 'paid', 'paid-tv'],
  [/\bsony\b|ten\s?sports|sony\s?liv/i, 'paid', 'paid-tv'],
  [/\bastro\b|\bsooka\b/i, 'paid', 'paid-tv'],
  [/optus\s?sport/i, 'paid', 'paid-stream'],
  [/foxtel|\bkayo\b/i, 'paid', 'paid-stream'],
  [/starhub|\bmola\b/i, 'paid', 'paid-tv'],
  [/viaplay/i, 'paid', 'paid-stream'],
  [/tnt\s?sports|premier\s?sports|eleven\s?sports?/i, 'paid', 'paid-tv'],
  [/sport\s?tv/i, 'paid', 'paid-tv'],
  [/arena\s?sport|sportklub/i, 'paid', 'paid-tv'],
  [/tyc\s?sports/i, 'paid', 'paid-tv'],
  [/\bfs1\b|fox\s?sports|fox\s?one|fox\s?deportes/i, 'paid', 'paid-tv'],
  [/peacock/i, 'paid', 'paid-stream'],
  [/paramount\s?\+|paramount\s?plus/i, 'paid', 'paid-stream'],
  [/prime\s?video|amazon/i, 'paid', 'paid-stream'],

  // ─── free: ad-supported / broadcaster catch-up streams (no paywall) ───
  [/\btubi\b/i, 'free', 'free-stream'],
  [/pluto\s?tv/i, 'free', 'free-stream'],
  [/samsung\s?tv\s?plus/i, 'free', 'free-stream'],
  [/fifa\s?\+|fifa\s?plus/i, 'free', 'free-stream'],
  [/iplayer|\bitvx\b/i, 'free', 'free-stream'],
  [/sbs\s?on\s?demand|\babema\b|caz[eé]\s?tv|rai\s?play|\bauvio\b|vrt\s?max|\bpluzz\b/i, 'free', 'free-stream'],

  // ─── free-to-air public broadcasters (national) ───
  [/\bbbc\b|\bitv\b|\bstv\b|\bs4c\b/i, 'free', 'free-tv'],
  [/\bard\b|\bzdf\b|das\s?erste/i, 'free', 'free-tv'],
  [/\brai\b/i, 'free', 'free-tv'],
  [/\brtve\b|\btve\b|\bla\s?1\b/i, 'free', 'free-tv'],
  [/\btf1\b|france\s?(2|3|t[eé]l[eé]|tv)|\bm6\b/i, 'free', 'free-tv'],
  [/\bsbs\b/i, 'free', 'free-tv'],
  [/\bnhk\b|tv\s?asahi|fuji\s?tv/i, 'free', 'free-tv'],
  [/\bcbc\b|radio-?canada|\bctv\b/i, 'free', 'free-tv'],
  [/\bsabc\b/i, 'free', 'free-tv'],
  [/\btvp\b/i, 'free', 'free-tv'],
  [/\borf\b/i, 'free', 'free-tv'],
  [/\bvrt\b|\brtbf\b|sporza|tipik|\bla\s?une\b|\been\b|canvas/i, 'free', 'free-tv'],
  [/\bnpo\b|\bnos\b/i, 'free', 'free-tv'],
  [/\brt[eé]\b/i, 'free', 'free-tv'],
  [/\bdr\b|\btv\s?2\b/i, 'free', 'free-tv'],
  [/\bnrk\b/i, 'free', 'free-tv'],
  [/\bsvt\b|\btv4\b/i, 'free', 'free-tv'],
  [/\byle\b/i, 'free', 'free-tv'],
  [/\brtp\b/i, 'free', 'free-tv'],
  [/\bert\b/i, 'free', 'free-tv'],
  [/\bhrt\b/i, 'free', 'free-tv'],
  [/\bsrf\b|\brts\b|\brsi\b|\bsrg\b/i, 'free', 'free-tv'],
  [/\bcctv\b|\bcgtn\b/i, 'free', 'free-tv'],
  [/\bkbs\b|\bmbc\b/i, 'free', 'free-tv'],
  [/match\s?tv|channel\s?one|первый/i, 'free', 'free-tv'],
  [/servustv/i, 'free', 'free-tv'],
  [/\btrt\b/i, 'free', 'free-tv'],
  [/\bnova\s?tv\b/i, 'free', 'free-tv'],

  // ─── more national free-to-air networks (confident) ───
  // USA Spanish/OTA networks (Fox/Telemundo broadcast are free-to-air; their cable/stream siblings were
  // already caught as paid above, so the bare names land here)
  [/telemundo\s?app/i, 'free', 'free-stream'],
  [/\buniverso\b/i, 'paid', 'paid-tv'],
  [/telemundo|telexitos|telex[ií]tos|univision|unim[aá]s/i, 'free', 'free-tv'],
  [/\bfox\b/i, 'free', 'free-tv'],
  // Latin America free-to-air
  [/\bglobo\b|globoplay/i, 'free', 'free-tv'],
  [/tv\s?azteca|azteca\s?(7|uno|deportes)|canal\s?5|las\s?estrellas/i, 'free', 'free-tv'],
  [/\btelefe\b|tv\s?p[uú]blica|televisi[oó]n\s?p[uú]blica/i, 'free', 'free-tv'],
  [/chilevisi[oó]n|\bmega\b|canal\s?13|\btvn\b/i, 'free', 'free-tv'],
  [/\bcaracol\b|\brcn\b/i, 'free', 'free-tv'],
  [/\blatina\b|am[eé]rica\s?(tv|televisi)/i, 'free', 'free-tv'],
  // misc confident public broadcasters
  [/\bmbc\b|\bssc\b|saudi|\bthmanyah\b/i, 'free', 'free-tv'],
  [/\brtl\b|\bvox\b|\bsat\.?1\b|prosieben/i, 'free', 'free-tv'],
  [/\bttv\b|\bcts\b|\bftv\b|公視|\bpts\b/i, 'free', 'free-tv'],
];

export function classify(name) {
  for (const [re, cost, type] of RULES) if (re.test(name)) return { cost, type };
  return { cost: 'unknown', type: 'unknown' };
}
