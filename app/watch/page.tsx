import { getBroadcasts } from '@/lib/data';
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
        free streams — then paid. {count} countries seeded so far.{' '}
        <a href="https://github.com/faraz152/kickoff26/blob/main/CONTRIBUTING.md">Add yours →</a>
      </p>
      <WhereToWatch broadcasts={broadcasts} />
    </>
  );
}
