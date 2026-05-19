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

export function formatStartMonthLabel(year: number, month: number, startDate?: string | null) {
  const short = MONTH_SHORT[month - 1] || 'Month';
  if (startDate) {
    const day = parseInt(startDate.split('-')[2] || '1', 10);
    return `${short} (${day})`;
  }
  return `${short} ${year}`;
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
