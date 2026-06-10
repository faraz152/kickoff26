import Link from 'next/link';
import { getMatches, getTeams } from '@kickoff26/data';
import BracketSimulator from '@/components/BracketSimulator';

export const metadata = { title: 'Predict the bracket — kickoff26' };

export default function PredictPage() {
  const knockouts = getMatches().filter((m) => m.stage !== 'group');
  return (
    <>
      <h1>Predict the bracket</h1>
      <p className="muted">
        Click your winners through to the final and share the result. It works on the slots now and fills in real teams
        as the groups finish. <Link href="/bracket/">See the live bracket →</Link>
      </p>
      <BracketSimulator matches={knockouts} teams={getTeams()} />
    </>
  );
}
