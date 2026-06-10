import { getGroups, getMatches, getTeams } from '@kickoff26/data';
import GroupTable from '@/components/GroupTable';

export const metadata = { title: 'Groups & standings — kickoff26' };

export default function GroupsPage() {
  const groups = getGroups();
  const teams = getTeams();
  const matches = getMatches();
  const teamById = new Map(teams.map((t) => [t.id, t]));

  return (
    <>
      <h1>Groups & standings</h1>
      <p className="muted">
        Top 2 from each group advance, plus the 8 best third-placed teams — 32 into the Round of 32. Standings update as
        results come in.
      </p>
      <div className="group-grid">
        {groups.map((g) => (
          <GroupTable
            key={g.id}
            id={g.id}
            teams={g.teams.map((id) => teamById.get(id)!).filter(Boolean)}
            matches={matches.filter((m) => m.group === g.id)}
          />
        ))}
      </div>
    </>
  );
}
