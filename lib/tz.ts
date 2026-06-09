// Timezone helpers — all conversion via Intl + IANA zones so DST is always correct. Kickoffs are
// stored as UTC ISO; we convert at render time only. (Ported from the fixture-timezone-engine skill.)

export function detectZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function allZones(): string[] {
  const intl = Intl as typeof Intl & { supportedValuesOf?: (k: string) => string[] };
  return typeof intl.supportedValuesOf === 'function' ? intl.supportedValuesOf('timeZone') : [];
}

/** e.g. "Fri, Jun 12, 12:00 AM" */
export function formatKickoff(utcIso: string, timeZone: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(utcIso));
}

/** e.g. "12:00 AM" */
export function formatTime(utcIso: string, timeZone: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { timeZone, hour: 'numeric', minute: '2-digit' }).format(new Date(utcIso));
}

/** The LOCAL calendar date as "YYYY-MM-DD" — bucket the schedule by THIS, never the UTC date. */
export function localDateKey(utcIso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(utcIso));
}

/** e.g. "Friday, June 12" — a friendly local day heading. */
export function formatDayHeading(utcIso: string, timeZone: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { timeZone, weekday: 'long', month: 'long', day: 'numeric' }).format(
    new Date(utcIso),
  );
}

export function groupByLocalDate<T extends { kickoff_utc: string }>(items: T[], timeZone: string): [string, T[]][] {
  const buckets = new Map<string, T[]>();
  for (const it of items) {
    const key = localDateKey(it.kickoff_utc, timeZone);
    const arr = buckets.get(key) ?? [];
    arr.push(it);
    buckets.set(key, arr);
  }
  return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b));
}
