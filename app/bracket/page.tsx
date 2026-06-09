import Link from 'next/link';
import { getMatches, getTeams } from '@/lib/data';
import { tokenLabel } from '@/lib/labels';
import { teamMap } from '@/lib/calendar';
import LocalTime from '@/components/LocalTime';
import type { Match, Stage } from '@/lib/types';

export const metadata = { title: 'Knockout bracket — kickoff26' };

const ROUNDS: { stage: Stage; label: string }[] = [
  { stage: 'r32', label: 'Round of 32' },
  { stage: 'r16', label: 'Round of 16' },
  { stage: 'qf', label: 'Quarter-finals' },
  { stage: 'sf', label: 'Semi-finals' },
  { stage: 'final', label: 'Final' },
];

// Which side won, once a knockout match is decided (pens, then extra time, then full time).
function winnerSide(m: Match): 1 | 2 | null {
  if (m.status !== 'finished') return null;
  for (const s of [m.score.pens, m.score.et, m.score.ft] as [number | null, number | null][]) {
    if (Array.isArray(s) && s[0] != null && s[1] != null && s[0] !== s[1]) return s[0] > s[1] ? 1 : 2;
  }
  return null;
}

export default function BracketPage() {
  const matches = getMatches();
  const tMap = teamMap(getTeams());
  const byStage = (stage: Stage) => matches.filter((m) => m.stage === stage).sort((a, b) => a.id - b.id);
  const third = matches.find((m) => m.stage === 'third');

  return (
    <>
      <h1>Knockout bracket</h1>
      <p className="muted">
        The road to the final on <strong>July 19</strong> at MetLife Stadium. Slots fill in as the groups finish and
        each tie is decided — kickoffs are in your timezone.
      </p>

      <div className="bracket">
        {ROUNDS.map(({ stage, label }) => (
          <section className="bk-round" key={stage} aria-label={label}>
            <h2 className="bk-round-title">{label}</h2>
            {byStage(stage).map((m) => (
              <BracketMatch key={m.id} m={m} tMap={tMap} />
            ))}
            {stage === 'final' && third && (
              <>
                <h2 className="bk-round-title bk-third-title">Third place</h2>
                <BracketMatch m={third} tMap={tMap} />
              </>
            )}
          </section>
        ))}
      </div>
    </>
  );
}

function BracketMatch({ m, tMap }: { m: Match; tMap: ReturnType<typeof teamMap> }) {
  const win = winnerSide(m);
  return (
    <Link href={`/match/${m.id}/`} className="bk-match" aria-label={`Match ${m.id}`}>
      <BracketSide token={m.team1} tMap={tMap} score={m.score.ft[0]} won={win === 1} />
      <BracketSide token={m.team2} tMap={tMap} score={m.score.ft[1]} won={win === 2} />
      <span className="bk-meta">
        <LocalTime utc={m.kickoff_utc} /> · #{m.id}
      </span>
    </Link>
  );
}

function BracketSide({
  token,
  tMap,
  score,
  won,
}: {
  token: string;
  tMap: ReturnType<typeof teamMap>;
  score: number | null;
  won: boolean;
}) {
  const label = tokenLabel(token, tMap);
  return (
    <span className={`bk-side${won ? ' bk-won' : ''}${label.known ? '' : ' bk-tbd'}`}>
      <span className="bk-flag">{label.flag ?? '🏳️'}</span>
      <span className="bk-name">{label.text}</span>
      {score != null && <span className="bk-score">{score}</span>}
    </span>
  );
}
