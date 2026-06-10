import Link from 'next/link';
import { getVenues, getMatches } from '@kickoff26/data';

export const metadata = { title: 'Venues & host cities — kickoff26' };

const COUNTRY_ORDER = ['USA', 'Mexico', 'Canada'];

export default function VenuesPage() {
  const venues = getVenues();
  const matches = getMatches();
  const countAt = (id: string) => matches.filter((m) => m.venue_id === id).length;

  const byCountry = COUNTRY_ORDER.map((country) => ({
    country,
    venues: venues.filter((v) => v.country === country).sort((a, b) => b.capacity - a.capacity),
  })).filter((g) => g.venues.length);

  return (
    <>
      <h1>Venues & host cities</h1>
      <p className="muted">
        16 stadiums across 3 countries host the first 48-team World Cup. The final is at MetLife Stadium, New Jersey, on
        July 19.
      </p>

      {byCountry.map(({ country, venues }) => (
        <section key={country}>
          <h2 className="section-h">
            {country} · {venues.length} {venues.length === 1 ? 'venue' : 'venues'}
          </h2>
          <div className="cards">
            {venues.map((v) => (
              <Link key={v.id} href={`/venue/${v.id}/`} className="card">
                <h3>🏟️ {v.name}</h3>
                <p>
                  {v.city} · {v.capacity.toLocaleString()} seats · {countAt(v.id)} matches
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
