// RFC 5545 .ics generation. Times emitted in UTC (Z) so the file is correct on any device. Handles
// line-folding (>75 octets) and text escaping — our SUMMARY fields carry multi-byte flag emoji.
// (Ported from the fixture-timezone-engine skill.)

const CRLF = '\r\n';
const pad = (n: number) => String(n).padStart(2, '0');

function icsDate(d: Date): string {
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function esc(text: string): string {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function fold(line: string): string {
  if (new TextEncoder().encode(line).length <= 75) return line;
  let out = '';
  let cur = '';
  let curBytes = 0;
  for (const ch of line) {
    const chBytes = new TextEncoder().encode(ch).length;
    if (curBytes + chBytes > 73) {
      out += (out ? CRLF + ' ' : '') + cur;
      cur = ch;
      curBytes = chBytes;
    } else {
      cur += ch;
      curBytes += chBytes;
    }
  }
  return out + (out ? CRLF + ' ' : '') + cur;
}

export interface IcsEvent {
  id: number;
  kickoff_utc: string;
  summary: string;
  location?: string;
  url?: string;
  durationMin?: number;
}

function eventLines(ev: IcsEvent, reminderMin: number): string[] {
  const start = new Date(ev.kickoff_utc);
  const end = new Date(start.getTime() + (ev.durationMin ?? 120) * 60000);
  const lines = [
    'BEGIN:VEVENT',
    `UID:kickoff26-match-${ev.id}@kickoff26`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${esc(ev.summary)}`,
  ];
  if (ev.location) lines.push(`LOCATION:${esc(ev.location)}`);
  if (ev.url) lines.push(`DESCRIPTION:${esc('Where to watch (free-first): ' + ev.url)}`);
  if (reminderMin > 0) {
    lines.push('BEGIN:VALARM', `TRIGGER:-PT${reminderMin}M`, 'ACTION:DISPLAY', 'DESCRIPTION:Kickoff soon', 'END:VALARM');
  }
  lines.push('END:VEVENT');
  return lines;
}

export function buildCalendar(events: IcsEvent[], reminderMin = 30): string {
  const head = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//kickoff26//EN', 'CALSCALE:GREGORIAN'];
  const body = events.flatMap((e) => eventLines(e, reminderMin));
  return [...head, ...body, 'END:VCALENDAR'].map(fold).join(CRLF) + CRLF;
}

export function downloadCalendar(events: IcsEvent[], filename = 'kickoff26.ics', reminderMin = 30): void {
  const blob = new Blob([buildCalendar(events, reminderMin)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
