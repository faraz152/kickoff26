'use client';

import { formatKickoff } from '@/lib/tz';
import { useTimezone } from './TimezoneContext';

/** Renders a kickoff in the user's timezone once detected; shows UTC as a labelled fallback first. */
export default function LocalTime({ utc, className }: { utc: string; className?: string }) {
  const { zone, ready } = useTimezone();
  return (
    <time dateTime={utc} className={className} suppressHydrationWarning>
      {formatKickoff(utc, zone)}
      {ready ? '' : ' UTC'}
    </time>
  );
}
