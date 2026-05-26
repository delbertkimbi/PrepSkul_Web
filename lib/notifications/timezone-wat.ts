export const WAT_TIMEZONE = 'Africa/Douala';

/** Calendar date parts in West Africa Time (UTC+1, no DST). */
export function getWatDateParts(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  weekday: number;
} {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: WAT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  const day = Number(parts.find((p) => p.type === 'day')?.value);
  const weekdayStr = parts.find((p) => p.type === 'weekday')?.value || 'Mon';
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return { year, month, day, weekday: weekdayMap[weekdayStr] ?? 1 };
}

/** Start of calendar day in WAT as UTC ISO string for DB comparisons. */
export function getStartOfDayWatIso(date: Date = new Date()): string {
  const { year, month, day } = getWatDateParts(date);
  // WAT = UTC+1 → midnight WAT = previous day 23:00 UTC
  const utcMs = Date.UTC(year, month - 1, day, 0, 0, 0, 0) - 60 * 60 * 1000;
  return new Date(utcMs).toISOString();
}

export function isMondayInWat(date: Date = new Date()): boolean {
  return getWatDateParts(date).weekday === 1;
}

export function isFirstOfMonthInWat(date: Date = new Date()): boolean {
  return getWatDateParts(date).day === 1;
}

export function formatWatDateKey(date: Date = new Date()): string {
  const { year, month, day } = getWatDateParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
