const WEEKDAY_MAP: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export type DayTimeSlot = {
  day: string;
  time: string;
};

export type OfflineScheduleInputV2 = {
  weeks: number;
  sessionsPerWeek?: number;
  /** Legacy: same time for all weekDays */
  weekDays?: string[];
  sessionTime?: string;
  /** Preferred: per-day times */
  dayTimeSlots?: DayTimeSlot[];
  durationMinutes: number;
  startDate: string;
  deliveryMode: 'online' | 'onsite' | 'hybrid';
  subjects: string[];
  meetLink?: string | null;
  onsiteLocation?: string | null;
  onsitePhotoUrl?: string | null;
};

function mondayOfWeekContaining(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

function normalizeDayToken(day: string) {
  return day.trim().toLowerCase().slice(0, 3);
}

export function parseTimeToHms(time: string): string {
  const [h, m] = time.split(':').map((x) => parseInt(x, 10));
  return `${String(h || 9).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}:00`;
}

/** Build day→time map from v2 input (supports legacy weekDays + sessionTime). */
export function resolveDayTimeMap(input: OfflineScheduleInputV2): Map<string, string> {
  const map = new Map<string, string>();
  if (input.dayTimeSlots?.length) {
    for (const slot of input.dayTimeSlots) {
      const token = normalizeDayToken(slot.day);
      if (WEEKDAY_MAP[token] === undefined) {
        throw new Error(`Invalid weekday: ${slot.day}`);
      }
      map.set(token, parseTimeToHms(slot.time));
    }
    return map;
  }
  if (input.weekDays?.length && input.sessionTime) {
    const t = parseTimeToHms(input.sessionTime);
    for (const wd of input.weekDays) {
      const token = normalizeDayToken(wd);
      if (WEEKDAY_MAP[token] === undefined) {
        throw new Error(`Invalid weekday: ${wd}`);
      }
      map.set(token, t);
    }
    return map;
  }
  throw new Error('Provide dayTimeSlots or weekDays with sessionTime');
}

/** Each occurrence: calendar date + time for that weekday */
export type SessionOccurrence = { date: string; time: string };

export function enumerateSessionOccurrences(input: OfflineScheduleInputV2): SessionOccurrence[] {
  const dayTimeMap = resolveDayTimeMap(input);
  const anchor = new Date(`${input.startDate}T12:00:00`);
  const monday0 = mondayOfWeekContaining(anchor);
  const tokens = [...dayTimeMap.keys()];
  const out: SessionOccurrence[] = [];

  for (let w = 0; w < input.weeks; w++) {
    const weekStart = new Date(monday0);
    weekStart.setDate(weekStart.getDate() + w * 7);
    for (const token of tokens) {
      const targetDow = WEEKDAY_MAP[token];
      const d = new Date(weekStart);
      d.setDate(d.getDate() + ((targetDow + 7 - d.getDay()) % 7));
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      out.push({ date: `${y}-${mo}-${da}`, time: dayTimeMap.get(token)! });
    }
  }

  const seen = new Set<string>();
  return out
    .filter((o) => {
      const k = `${o.date}|${o.time}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));
}

/** Back-compat: date strings only (uses first time if multiple — prefer enumerateSessionOccurrences). */
export function enumerateSessionDatesFromV2(input: OfflineScheduleInputV2): string[] {
  return [...new Set(enumerateSessionOccurrences(input).map((o) => o.date))].sort();
}
