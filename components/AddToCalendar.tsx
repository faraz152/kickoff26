'use client';

import { downloadCalendar, type IcsEvent } from '@/lib/ics';

export default function AddToCalendar({
  events,
  filename,
  label = 'Add to Calendar',
  small = false,
}: {
  events: IcsEvent[];
  filename: string;
  label?: string;
  small?: boolean;
}) {
  if (events.length === 0) return null;
  return (
    <button
      className={small ? 'cal-btn cal-btn-sm' : 'cal-btn'}
      onClick={() => downloadCalendar(events, filename)}
      title="Download an .ics file — opens in Google, Apple or Outlook Calendar at your local time"
    >
      📅 {label}
    </button>
  );
}
