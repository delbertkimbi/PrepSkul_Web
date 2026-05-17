'use client';



import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

import { useMemo } from 'react';



const WEEKDAYS = [

  { key: 'mon', label: 'Mon' },

  { key: 'tue', label: 'Tue' },

  { key: 'wed', label: 'Wed' },

  { key: 'thu', label: 'Thu' },

  { key: 'fri', label: 'Fri' },

  { key: 'sat', label: 'Sat' },

  { key: 'sun', label: 'Sun' },

] as const;



export function SubjectListInput({

  count,

  subjects,

  onCountChange,

  onSubjectsChange,

}: {

  count: number;

  subjects: string[];

  onCountChange: (n: number) => void;

  onSubjectsChange: (s: string[]) => void;

}) {

  const syncCount = (n: number) => {

    const next = Math.max(1, Math.min(12, n));

    onCountChange(next);

    const padded = [...subjects];

    while (padded.length < next) padded.push('');

    onSubjectsChange(padded.slice(0, next));

  };



  return (

    <div className="space-y-3">

      <div>

        <Label className="text-slate-700 font-medium">Number of subjects *</Label>

        <Input

          type="number"

          min={1}

          max={12}

          value={count}

          onChange={(e) => syncCount(Number(e.target.value) || 1)}

          className="mt-1 max-w-[120px] border-[#1B2C4F]/20"

        />

      </div>

      <div className="grid gap-2 sm:grid-cols-2">

        {subjects.map((s, i) => (

          <div key={i}>

            <Label className="text-xs text-slate-600">Subject {i + 1}</Label>

            <Input

              value={s}

              onChange={(e) => {

                const next = [...subjects];

                next[i] = e.target.value;

                onSubjectsChange(next);

              }}

              placeholder="e.g. Mathematics"

              className="mt-1 border-[#1B2C4F]/20"

            />

          </div>

        ))}

      </div>

    </div>

  );

}



export type DaySlot = { day: string; time: string; enabled: boolean };



/** Always returns all 7 weekdays so toggles never silently no-op. */

export function normalizeDaySlots(slots: DaySlot[]): DaySlot[] {

  return WEEKDAYS.map(({ key }) => {

    const existing = slots.find((s) => s.day === key);

    return {

      day: key,

      time: existing?.time || '16:00',

      enabled: existing?.enabled ?? false,

    };

  });

}



export function PerDaySchedulePanel({

  slots,

  onChange,

}: {

  slots: DaySlot[];

  onChange: (s: DaySlot[]) => void;

}) {

  const normalized = useMemo(() => normalizeDaySlots(slots), [slots]);



  const update = (next: DaySlot[]) => {

    onChange(normalizeDaySlots(next));

  };



  const toggle = (key: string) => {

    update(

      normalized.map((s) =>

        s.day === key ? { ...s, enabled: !s.enabled, time: s.time || '16:00' } : s

      )

    );

  };



  const setTime = (key: string, time: string) => {

    update(normalized.map((s) => (s.day === key ? { ...s, time } : s)));

  };



  return (

    <div className="space-y-3">

      <Label className="text-slate-700 font-medium">Session days & times *</Label>

      <p className="text-xs text-slate-500">Click a day to include it, then set the session time.</p>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">

        {WEEKDAYS.map(({ key, label }) => {

          const slot = normalized.find((s) => s.day === key)!;

          return (

            <div

              key={key}

              role="button"

              tabIndex={0}

              onClick={() => toggle(key)}

              onKeyDown={(e) => {

                if (e.key === 'Enter' || e.key === ' ') {

                  e.preventDefault();

                  toggle(key);

                }

              }}

              className={`flex items-center gap-2 border p-2 rounded-md cursor-pointer select-none transition-colors ${

                slot.enabled

                  ? 'border-[#4A6FBF] bg-[#4A6FBF]/10 ring-1 ring-[#4A6FBF]/30'

                  : 'border-slate-200 bg-white hover:border-slate-300'

              }`}

            >

              <span

                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold ${

                  slot.enabled

                    ? 'border-[#4A6FBF] bg-[#4A6FBF] text-white'

                    : 'border-slate-300 bg-white text-transparent'

                }`}

                aria-hidden

              >

                ✓

              </span>

              <span

                className={`text-sm font-semibold w-9 shrink-0 ${

                  slot.enabled ? 'text-[#1B2C4F]' : 'text-slate-500'

                }`}

              >

                {label}

              </span>

              <Input

                type="time"

                disabled={!slot.enabled}

                value={slot.time}

                onClick={(e) => e.stopPropagation()}

                onChange={(e) => setTime(key, e.target.value)}

                className="border-slate-200 h-9 flex-1 min-w-0"

              />

            </div>

          );

        })}

      </div>

    </div>

  );

}



export function defaultDaySlots(): DaySlot[] {

  return WEEKDAYS.map(({ key }) => ({

    day: key,

    time: '16:00',

    enabled: false,

  }));

}


