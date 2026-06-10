import { getBroadcasts, getMatches, getTeams, getVenues } from '@kickoff26/data';
import MyTeam from '@/components/MyTeam';

export const metadata = { title: 'My Team — kickoff26' };

export default function MyTeamPage() {
  return (
    <>
      <h1>My Team</h1>
      <MyTeam teams={getTeams()} matches={getMatches()} venues={getVenues()} broadcasts={getBroadcasts()} />
    </>
  );
}
