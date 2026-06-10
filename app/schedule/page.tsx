import { getMatches, getTeams, getVenues } from '@kickoff26/data';
import { toEvents, teamMap, venueMap } from '@kickoff26/core';
import ScheduleView from '@/components/ScheduleView';
import AddToCalendar from '@/components/AddToCalendar';

export const metadata = { title: 'Schedule — kickoff26' };

export default function SchedulePage() {
  const matches = getMatches();
  const teams = getTeams();
  const venues = getVenues();
  const allEvents = toEvents(matches, teamMap(teams), venueMap(venues));

  return (
    <>
      <div className="section-head">
        <h1>Schedule</h1>
        <AddToCalendar events={allEvents} filename="kickoff26-all.ics" label="Add whole tournament" small />
      </div>
      <ScheduleView matches={matches} teams={teams} venues={venues} />
    </>
  );
}
