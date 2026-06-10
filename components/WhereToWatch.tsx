'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Broadcasts, Channel } from '@kickoff26/core';

const KEY = 'kickoff26-country';
const TYPE_RANK: Record<Channel['type'], number> = {
  'free-tv': 0,
  'free-stream': 1,
  radio: 2,
  'paid-tv': 3,
  'paid-stream': 4,
};
const TYPE_LABEL: Record<Channel['type'], string> = {
  'free-tv': 'Free-to-air TV',
  'free-stream': 'Free stream',
  radio: 'Radio',
  'paid-tv': 'Paid TV',
  'paid-stream': 'Paid stream',
};

function guessCountry(available: string[]): string {
  try {
    for (const loc of navigator.languages || [navigator.language]) {
      const region = new Intl.Locale(loc).maximize().region;
      if (region && available.includes(region)) return region;
    }
  } catch {
    /* ignore */
  }
  return '';
}

export default function WhereToWatch({ broadcasts, compact = false }: { broadcasts: Broadcasts; compact?: boolean }) {
  const countries = useMemo(
    () => Object.entries(broadcasts).map(([code, m]) => ({ code, name: m.country })).sort((a, b) => a.name.localeCompare(b.name)),
    [broadcasts],
  );
  const codes = useMemo(() => countries.map((c) => c.code), [countries]);
  const [country, setCountry] = useState('');

  useEffect(() => {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) || '';
    setCountry(saved && broadcasts[saved] ? saved : guessCountry(codes));
  }, [codes, broadcasts]);

  function choose(code: string) {
    setCountry(code);
    try {
      localStorage.setItem(KEY, code);
    } catch {
      /* ignore */
    }
  }

  const market = country ? broadcasts[country] : undefined;
  const channels = useMemo(
    () => (market ? [...market.channels].sort((a, b) => TYPE_RANK[a.type] - TYPE_RANK[b.type]) : []),
    [market],
  );
  const free = channels.filter((c) => c.cost === 'free');
  const paid = channels.filter((c) => c.cost === 'paid');

  return (
    <div className="watch">
      <div className="watch-pick">
        <label htmlFor="country" className="muted">
          Watch from
        </label>
        <select id="country" className="select" value={country} onChange={(e) => choose(e.target.value)}>
          <option value="">Choose your country…</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {!market && <p className="muted">Pick your country to see where to watch — free options first.</p>}

      {market && free.length > 0 && (
        <div className="watch-group">
          <h4 className="watch-head free">✅ Free {compact ? '' : `in ${market.country}`}</h4>
          <ul className="chan-list">
            {free.map((c) => (
              <ChannelRow key={c.name} c={c} />
            ))}
          </ul>
        </div>
      )}

      {market && free.length === 0 && (
        <p className="muted">No confirmed free-to-air option in {market.country} yet — paid options below.</p>
      )}

      {market && paid.length > 0 && (
        <div className="watch-group">
          <h4 className="watch-head paid">Paid {compact ? '' : 'options'}</h4>
          <ul className="chan-list">
            {paid.map((c) => (
              <ChannelRow key={c.name} c={c} />
            ))}
          </ul>
        </div>
      )}

      <p className="muted watch-note">
        Some matches also stream free worldwide on{' '}
        <a href="https://www.fifa.com/fifaplus/" target="_blank" rel="noopener noreferrer">
          FIFA+
        </a>
        . Rights can change — always confirm on the broadcaster’s own site.
      </p>
    </div>
  );
}

function ChannelRow({ c }: { c: Channel }) {
  return (
    <li className="chan">
      <a href={c.url} target="_blank" rel="noopener noreferrer" className="chan-name">
        {c.name}
      </a>
      <span className={c.cost === 'free' ? 'tag tag-free' : 'tag tag-paid'}>{TYPE_LABEL[c.type]}</span>
      <span className="chan-lang">{c.languages.map((l) => l.toUpperCase()).join(' · ')}</span>
      {c.note && <span className="chan-note muted">{c.note}</span>}
    </li>
  );
}
