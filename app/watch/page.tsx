import { getBroadcasts } from '@kickoff26/data';
import WhereToWatch from '@/components/WhereToWatch';

export const metadata = { title: 'Where to watch free — kickoff26' };

export default function WatchPage() {
  const broadcasts = getBroadcasts();
  const count = Object.keys(broadcasts).length;

  return (
    <>
      <h1>Where to watch — free first</h1>
      <p className="muted">
        Pick your country and we’ll show every <strong>legal free</strong> option first — free-to-air TV and official
        free streams — then paid. Official broadcasters for {count} countries, from FIFA’s own list; help us confirm
        which are free.{' '}
        <a href="https://github.com/faraz152/kickoff26/blob/main/CONTRIBUTING.md">Contribute →</a>
      </p>
      <WhereToWatch broadcasts={broadcasts} />
    </>
  );
}
