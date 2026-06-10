'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { tokenLabel } from '@kickoff26/core';
import type { Match, Team } from '@kickoff26/core';

type Picks = Record<number, 1 | 2>;
type Side = 1 | 2;

const ROUNDS: [Match['stage'], string][] = [
  ['r32', 'Round of 32'],
  ['r16', 'Round of 16'],
  ['qf', 'Quarter-finals'],
  ['sf', 'Semi-finals'],
  ['final', 'Final'],
];

// Pick winners through the knockout tree. Slots reference earlier matches by FIFA number (`W74`,
// `L101`), so picks propagate up the graph. Everything is client-side; the picks live in the URL hash
// so a predicted bracket is shareable with no backend. Works on the placeholder slots now and shows
// real teams as the groups resolve them. (Minimal UI by design — the polished version is elsewhere.)
export default function BracketSimulator({ matches, teams }: { matches: Match[]; teams: Team[] }) {
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const matchById = useMemo(() => new Map(matches.map((m) => [m.id, m])), [matches]);
  const koIds = useMemo(() => matches.map((m) => m.id).sort((a, b) => a - b), [matches]);

  // where each match's winner (W) / loser (L) flows next, so we can clear stale downstream picks
  const parents = useMemo(() => {
    const p: Record<number, { W?: number; L?: number }> = {};
    for (const m of matches) {
      for (const tok of [m.team1, m.team2]) {
        const g = tok.match(/^([WL])(\d+)$/);
        if (g) ((p[+g[2]] ??= {}) as Record<string, number>)[g[1]] = m.id;
      }
    }
    return p;
  }, [matches]);

  const [picks, setPicks] = useState<Picks>({});

  // load a shared bracket from the URL on mount
  useEffect(() => {
    const m = location.hash.match(/p=([012]+)/);
    if (!m) return;
    const next: Picks = {};
    koIds.forEach((id, i) => {
      const c = m[1][i];
      if (c === '1' || c === '2') next[id] = Number(c) as Side;
    });
    setPicks(next);
  }, [koIds]);

  // keep the URL in sync so the current bracket is always shareable
  useEffect(() => {
    const s = koIds.map((id) => picks[id] ?? 0).join('');
    history.replaceState(null, '', /[12]/.test(s) ? `#p=${s}` : location.pathname);
  }, [picks, koIds]);

  // resolve a slot token to a leaf token (real slug or group placeholder), or null if undecided
  const resolve = useCallback(
    (token: string, p: Picks): string | null => {
      const g = token.match(/^([WL])(\d+)$/);
      if (!g) return token; // leaf: a team slug or a group placeholder
      const n = +g[2];
      const s = p[n];
      if (!s) return null;
      const mm = matchById.get(n)!;
      const winnerToken = s === 1 ? mm.team1 : mm.team2;
      const loserToken = s === 1 ? mm.team2 : mm.team1;
      return resolve(g[1] === 'W' ? winnerToken : loserToken, p);
    },
    [matchById],
  );

  const choose = (matchId: number, side: Side) =>
    setPicks((prev) => {
      const next: Picks = { ...prev, [matchId]: side };
      const clearAbove = (id: number) => {
        for (const pid of [parents[id]?.W, parents[id]?.L]) {
          if (pid != null && next[pid] != null) {
            delete next[pid];
            clearAbove(pid);
          }
        }
      };
      clearAbove(matchId);
      return next;
    });

  const champion = resolve('W104', picks);
  const champ = champion ? tokenLabel(champion, teamMap) : null;
  const third = matches.find((m) => m.stage === 'third');

  return (
    <div>
      <div className="sim-bar">
        <span className="muted small">Click a team to send them through. Your bracket saves to the URL — copy it to share.</span>
        <span className="sim-actions">
          {champ && (
            <strong className="sim-champ">🏆 {champ.flag} {champ.text}</strong>
          )}
          <button className="btn" onClick={() => navigator.clipboard?.writeText(location.href)}>Copy link</button>
          <button className="btn" onClick={() => setPicks({})}>Reset</button>
        </span>
      </div>

      <div className="bracket">
        {ROUNDS.map(([stage, label]) => (
          <section className="bk-round" key={stage} aria-label={label}>
            <h2 className="bk-round-title">{label}</h2>
            {matches
              .filter((m) => m.stage === stage)
              .sort((a, b) => a.id - b.id)
              .map((m) => (
                <Tie key={m.id} m={m} picks={picks} resolve={resolve} teamMap={teamMap} onPick={choose} />
              ))}
            {stage === 'final' && third && (
              <>
                <h2 className="bk-round-title bk-third-title">Third place</h2>
                <Tie m={third} picks={picks} resolve={resolve} teamMap={teamMap} onPick={choose} />
              </>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function Tie({
  m,
  picks,
  resolve,
  teamMap,
  onPick,
}: {
  m: Match;
  picks: Picks;
  resolve: (t: string, p: Picks) => string | null;
  teamMap: Map<string, Team>;
  onPick: (matchId: number, side: Side) => void;
}) {
  const t1 = resolve(m.team1, picks);
  const t2 = resolve(m.team2, picks);
  return (
    <div className="bk-match">
      <SideButton token={t1} picked={picks[m.id] === 1} teamMap={teamMap} onPick={() => t1 && onPick(m.id, 1)} />
      <SideButton token={t2} picked={picks[m.id] === 2} teamMap={teamMap} onPick={() => t2 && onPick(m.id, 2)} />
      <span className="bk-meta">#{m.id}</span>
    </div>
  );
}

function SideButton({
  token,
  picked,
  teamMap,
  onPick,
}: {
  token: string | null;
  picked: boolean;
  teamMap: Map<string, Team>;
  onPick: () => void;
}) {
  const label = token ? tokenLabel(token, teamMap) : null;
  return (
    <button className={`sim-side${picked ? ' picked' : ''}`} onClick={onPick} disabled={!token} type="button">
      <span className="bk-flag">{label?.flag ?? '·'}</span>
      <span className="bk-name">{label?.text ?? 'TBD'}</span>
    </button>
  );
}
