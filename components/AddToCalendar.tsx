'use client';

import { buildCalendar, type IcsEvent } from '@kickoff26/core';

// Browser-only: trigger a .ics download. The core builds the (environment-agnostic) calendar string;
// turning it into a file lives here in the UI so the core stays DOM-free.
function downloadCalendar(events: IcsEvent[], filename = 'kickoff26.ics', reminderMin = 30): void {
  const blob = new Blob([buildCalendar(events, reminderMin)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

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
