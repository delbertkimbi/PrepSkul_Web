import type { DayTimeSlot } from '@/lib/services/offline-schedule';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const DOW_TOKEN = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

function normalizeDayToken(day: string) {
  return day.trim().toLowerCase().slice(0, 3);
}

/** First calendar date in the month that matches an enabled weekday (for historical imports). */
export function deriveStartDateFromMonthYear(
  year: number,
  month: number,
  dayTimeSlots: DayTimeSlot[]
): string {
  const enabled = new Set(dayTimeSlots.map((s) => normalizeDayToken(s.day)));
  const monthIndex = month - 1;
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, monthIndex, d);
    if (date.getMonth() !== monthIndex) break;
    const token = DOW_TOKEN[date.getDay()];
    if (enabled.has(token)) {
      const y = date.getFullYear();
      const mo = String(date.getMonth() + 1).padStart(2, '0');
      const da = String(date.getDate()).padStart(2, '0');
      return `${y}-${mo}-${da}`;
    }
  }
  const fallback = new Date(year, monthIndex, 1);
  const y = fallback.getFullYear();
  const mo = String(fallback.getMonth() + 1).padStart(2, '0');
  return `${y}-${mo}-01`;
}

/** Billing month label for storage and UI, e.g. "Apr 2025" (no day in brackets). */
export function formatStartMonthLabel(year: number, month: number, _startDate?: string | null) {
  const short = MONTH_SHORT[month - 1] || 'Month';
  return `${short} ${year}`;
}

/** Display label; strips legacy "Apr (2)" day suffix and adds year from period_start when missing. */
export function displayBillingMonthLabel(
  startMonthLabel?: string | null,
  periodStart?: string | null
): string {
  const yearFromPeriod = periodStart && periodStart.length >= 7 ? parseInt(periodStart.slice(0, 4), 10) : 0;
  const monthFromPeriod =
    periodStart && periodStart.length >= 7 ? parseInt(periodStart.slice(5, 7), 10) : 0;

  if (startMonthLabel?.trim()) {
    const cleaned = startMonthLabel.trim().replace(/\s*\(\d{1,2}\)\s*$/, '');
    if (yearFromPeriod && monthFromPeriod && !/\d{4}/.test(cleaned)) {
      return formatStartMonthLabel(yearFromPeriod, monthFromPeriod);
    }
    return cleaned;
  }

  if (yearFromPeriod && monthFromPeriod) {
    return formatStartMonthLabel(yearFromPeriod, monthFromPeriod);
  }

  return periodStart?.slice(0, 7) || '—';
}

export function monthKeyFromYearMonth(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function enumerateMonthRange(
  start: { year: number; month: number },
  end: { year: number; month: number }
) {
  const startIndex = start.year * 12 + (start.month - 1);
  const endIndex = end.year * 12 + (end.month - 1);
  if (endIndex < startIndex) return [];

  const months: Array<{ year: number; month: number; key: string; label: string }> = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const year = Math.floor(i / 12);
    const month = (i % 12) + 1;
    months.push({
      year,
      month,
      key: monthKeyFromYearMonth(year, month),
      label: `${MONTH_NAMES[month - 1]} ${year}`,
    });
  }
  return months;
}

export function monthYearOptions(yearsBack = 2, yearsForward = 1) {
  const now = new Date();
  const years: number[] = [];
  for (let y = now.getFullYear() - yearsBack; y <= now.getFullYear() + yearsForward; y++) {
    years.push(y);
  }
  return {
    months: MONTH_NAMES.map((label, i) => ({ value: i + 1, label })),
    years,
  };
}
