'use client';

import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TutorPicker, { type TutorPickerValue } from '@/components/admin/offline-ops/TutorPicker';
import DeliveryModeFields, { type DeliveryMode } from '@/components/admin/offline-ops/DeliveryModeFields';
import {
  SubjectListInput,
  PerDaySchedulePanel,
  defaultDaySlots,
  type DaySlot,
} from '@/components/admin/offline-ops/SubjectListInput';
import StartMonthPicker, { type StartMonthValue } from '@/components/admin/offline-ops/StartMonthPicker';
import {
  deriveStartDateFromMonthYear,
  formatStartMonthLabel,
} from '@/lib/offline-month-utils';

export type HistoricalMonthRecord = {
  id: string;
  monthYear: StartMonthValue;
  tutor: TutorPickerValue | null;
  subjectCount: number;
  subjects: string[];
  daySlots: DaySlot[];
  sessionsPerWeek: string;
  durationMinutes: string;
  payPerMonth: string;
};

export function defaultHistoricalMonthRecord(payPerMonth = ''): HistoricalMonthRecord {
  const slots = defaultDaySlots();
  const enabledCount = slots.filter((d) => d.enabled).length;
  const now = new Date();
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    monthYear: { month: now.getMonth() + 1, year: now.getFullYear() },
    tutor: null,
    subjectCount: 1,
    subjects: [''],
    daySlots: slots,
    sessionsPerWeek: String(Math.max(1, enabledCount)),
    durationMinutes: '60',
    payPerMonth,
  };
}

export type SchedulePeriodFormState = {
  tutor: TutorPickerValue;
  learnerUserId: string;
  subjectCount: number;
  subjects: string[];
  daySlots: DaySlot[];
  weeks: string;
  sessionsPerWeek: string;
  durationMinutes: string;
  startDate: string;
  deliveryMode: DeliveryMode;
  meetLink: string;
  onsiteLocation: string;
  onsitePhotoUrl: string;
  payPerMonth: string;
  payMonths: string;
  operationState: 'active' | 'paused' | 'stopped';
  startMonthLabel: string;
  /** One row per billing month for historical import (replaces start/end range). */
  historicalMonthRecords: HistoricalMonthRecord[];
};

export function defaultSchedulePeriodState(): SchedulePeriodFormState {
  return {
    tutor: null,
    learnerUserId: '',
    subjectCount: 1,
    subjects: [''],
    daySlots: defaultDaySlots(),
    weeks: '4',
    sessionsPerWeek: '2',
    durationMinutes: '60',
    startDate: '',
    deliveryMode: 'online',
    meetLink: '',
    onsiteLocation: '',
    onsitePhotoUrl: '',
    payPerMonth: '',
    payMonths: '1',
    operationState: 'active',
    startMonthLabel: '',
    historicalMonthRecords: [],
  };
}

export function buildSchedulePayload(state: SchedulePeriodFormState, opts?: { historical?: boolean }) {
  const cleanedSubjects = state.subjects.map((s) => s.trim()).filter(Boolean);
  const enabled = state.daySlots.filter((d) => d.enabled);
  const dayTimeSlots = enabled.map((d) => ({ day: d.day, time: d.time }));
  const sessionsPerWeek = Math.max(1, enabled.length);
  let startDate = state.startDate;
  let startMonthLabel = state.startMonthLabel.trim() || null;
  if (opts?.historical && state.historicalMonthRecords[0]) {
    const first = state.historicalMonthRecords[0];
    const firstEnabled = first.daySlots.filter((d) => d.enabled);
    const firstDayTimeSlots = firstEnabled.map((d) => ({ day: d.day, time: d.time }));
    startDate = deriveStartDateFromMonthYear(first.monthYear.year, first.monthYear.month, firstDayTimeSlots);
    startMonthLabel = formatStartMonthLabel(first.monthYear.year, first.monthYear.month, startDate);
  }
  return {
    cleanedSubjects,
    enabled,
    schedule: {
      weeks: opts?.historical ? 4 : Number(state.weeks),
      sessionsPerWeek,
      dayTimeSlots,
      durationMinutes: Number(state.durationMinutes),
      startDate,
      deliveryMode: state.deliveryMode,
      subjects: cleanedSubjects,
      meetLink: state.meetLink.trim() || null,
      onsiteLocation: state.onsiteLocation.trim() || null,
      onsitePhotoUrl: state.onsitePhotoUrl.trim() || null,
      payPerMonthXaf: state.payPerMonth ? Number(state.payPerMonth) : null,
      payMonthsCount: opts?.historical ? 1 : state.payMonths ? Number(state.payMonths) : null,
      operationState: opts?.historical ? undefined : state.operationState,
      startMonthLabel,
    },
  };
}

export function buildHistoricalMonthlyPayloads(state: SchedulePeriodFormState) {
  return state.historicalMonthRecords.map((record) => {
    const cleanedSubjects = record.subjects.map((s) => s.trim()).filter(Boolean);
    const enabled = record.daySlots.filter((d) => d.enabled);
    const dayTimeSlots = enabled.map((d) => ({ day: d.day, time: d.time }));
    const startDate = deriveStartDateFromMonthYear(
      record.monthYear.year,
      record.monthYear.month,
      dayTimeSlots
    );
    return {
      weeks: 4,
      sessionsPerWeek: Number(record.sessionsPerWeek || enabled.length || 1),
      dayTimeSlots,
      durationMinutes: Number(record.durationMinutes || state.durationMinutes || 60),
      startDate,
      deliveryMode: state.deliveryMode,
      subjects: cleanedSubjects,
      meetLink: state.meetLink.trim() || null,
      onsiteLocation: state.onsiteLocation.trim() || null,
      onsitePhotoUrl: state.onsitePhotoUrl.trim() || null,
      payPerMonthXaf: record.payPerMonth ? Number(record.payPerMonth) : null,
      payMonthsCount: 1,
      operationState: 'paused' as const,
      startMonthLabel: formatStartMonthLabel(record.monthYear.year, record.monthYear.month, startDate),
      tutorUserId: record.tutor?.tutorUserId,
    };
  });
}

export function validateSchedulePeriodState(
  state: SchedulePeriodFormState,
  opts?: { requireTutor?: boolean; historical?: boolean; historicalMonthOnly?: boolean }
): string | null {
  const historicalMonthOnly = opts?.historicalMonthOnly ?? false;

  if (!historicalMonthOnly) {
    if (opts?.requireTutor !== false && !state.tutor?.tutorUserId) return 'Select a tutor.';
    const { cleanedSubjects, enabled } = buildSchedulePayload(state, { historical: opts?.historical });
    if (!cleanedSubjects.length) return 'Add at least one subject.';
    if (!enabled.length) return 'Select at least one session day.';
    if (!opts?.historical && !state.startDate) return 'Start date is required.';
  }

  if (opts?.historical) {
    if (!state.historicalMonthRecords.length) return 'Add at least one month of past data.';
    for (let i = 0; i < state.historicalMonthRecords.length; i++) {
      const rec = state.historicalMonthRecords[i];
      if (!rec.tutor?.tutorUserId) return `Month ${i + 1}: select a tutor.`;
      const subs = rec.subjects.map((s) => s.trim()).filter(Boolean);
      if (!subs.length) return `Month ${i + 1}: add at least one subject.`;
      const enabled = rec.daySlots.filter((d) => d.enabled);
      if (!enabled.length) return `Month ${i + 1}: select at least one session day and time.`;
      if (!rec.payPerMonth?.trim()) return `Month ${i + 1}: enter pay per month (XAF).`;
    }
  }

  if ((state.deliveryMode === 'online' || state.deliveryMode === 'hybrid') && !state.meetLink.trim()) {
    return 'Google Meet link is required for online/hybrid.';
  }
  if ((state.deliveryMode === 'onsite' || state.deliveryMode === 'hybrid') && !state.onsiteLocation.trim()) {
    return 'Onsite location is required for onsite/hybrid.';
  }
  return null;
}

export default function OfflineSchedulePeriodFields({
  state,
  onChange,
  learners,
  showTutorPicker = true,
  showLearnerSelect = false,
  historicalDefaults = false,
  historicalMonthOnly = false,
}: {
  state: SchedulePeriodFormState;
  onChange: (patch: Partial<SchedulePeriodFormState>) => void;
  learners?: Array<{ id: string; full_name?: string | null }>;
  showTutorPicker?: boolean;
  showLearnerSelect?: boolean;
  /** Show per-month blocks (import / CSV helper). */
  historicalDefaults?: boolean;
  /** Import past period: only learner + month cards + shared delivery (no global schedule fields). */
  historicalMonthOnly?: boolean;
}) {
  const opState = state.operationState;
  const enabledDayCount = useMemo(
    () => state.daySlots.filter((d) => d.enabled).length,
    [state.daySlots]
  );
  const patchHistoricalRecord = (id: string, patch: Partial<HistoricalMonthRecord>) => {
    onChange({
      historicalMonthRecords: state.historicalMonthRecords.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      ),
    });
  };

  const handleDaySlotsChange = (daySlots: DaySlot[]) => {
    const enabledCount = daySlots.filter((d) => d.enabled).length;
    onChange({
      daySlots,
      sessionsPerWeek: String(Math.max(1, enabledCount)),
    });
  };

  const handleHistoricalDaySlotsChange = (recordId: string, daySlots: DaySlot[]) => {
    const enabledCount = daySlots.filter((d) => d.enabled).length;
    patchHistoricalRecord(recordId, {
      daySlots,
      sessionsPerWeek: String(Math.max(1, enabledCount)),
    });
  };

  const showStandardScheduleFields = !historicalMonthOnly;

  return (
    <div className="space-y-5">
      {showStandardScheduleFields && showTutorPicker && (
        <div>
          <Label className="text-slate-700 font-medium">Tutor *</Label>
          <div className="mt-2">
            <TutorPicker value={state.tutor} onChange={(t) => onChange({ tutor: t })} />
          </div>
        </div>
      )}

      {showLearnerSelect && learners && learners.length >= 1 && (
        <div>
          <Label>Learner</Label>
          <Select value={state.learnerUserId} onValueChange={(v) => onChange({ learnerUserId: v })}>
            <SelectTrigger className="mt-1 border-[#1B2C4F]/20 max-w-md">
              <SelectValue placeholder="Select learner" />
            </SelectTrigger>
            <SelectContent>
              {learners.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.full_name || l.id.slice(0, 8)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showStandardScheduleFields && (
        <>
          <SubjectListInput
            count={state.subjectCount}
            subjects={state.subjects}
            onCountChange={(n) => onChange({ subjectCount: n })}
            onSubjectsChange={(s) => onChange({ subjects: s })}
          />

          <PerDaySchedulePanel slots={state.daySlots} onChange={handleDaySlotsChange} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {!historicalDefaults && (
              <div>
                <Label>Weeks</Label>
                <Input
                  type="number"
                  min={1}
                  value={state.weeks}
                  onChange={(e) => onChange({ weeks: e.target.value })}
                  className="mt-1 border-[#1B2C4F]/20"
                />
              </div>
            )}
            {!historicalDefaults && (
              <div>
                <Label>Sessions / week</Label>
                <Input
                  type="number"
                  min={1}
                  value={String(enabledDayCount || state.sessionsPerWeek)}
                  readOnly
                  className="mt-1 border-[#1B2C4F]/20 bg-slate-50"
                />
                <p className="text-[11px] text-slate-500 mt-1">Auto-filled from selected session days.</p>
              </div>
            )}
            <div>
              <Label>Duration (min)</Label>
              <Input
                type="number"
                value={state.durationMinutes}
                onChange={(e) => onChange({ durationMinutes: e.target.value })}
                className="mt-1 border-[#1B2C4F]/20"
              />
            </div>
            {!historicalDefaults && (
              <div>
                <Label>Start date *</Label>
                <Input
                  type="date"
                  value={state.startDate}
                  onChange={(e) => onChange({ startDate: e.target.value })}
                  className="mt-1 border-[#1B2C4F]/20"
                />
              </div>
            )}
          </div>
        </>
      )}

      {historicalDefaults && (
        <div className="rounded-md border border-[#1B2C4F]/15 bg-slate-50 p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-600 max-w-xl">
              {historicalMonthOnly
                ? 'Add each past month on its own — billing month, tutor, subjects, weekly schedule, and pay. Nothing outside these month cards is required.'
                : 'Add each past month separately — tutor, subjects, and pay for that month. Each month is stored as its own billing period (4 weeks, evaluated sessions).'}
            </p>
            <button
              type="button"
              className="text-xs font-semibold text-[#1B2C4F] border border-[#1B2C4F]/25 rounded-md px-3 py-1.5 bg-white hover:bg-slate-50"
              onClick={() =>
                onChange({
                  historicalMonthRecords: [
                    ...state.historicalMonthRecords,
                    defaultHistoricalMonthRecord(),
                  ],
                })
              }
            >
              + Add month
            </button>
          </div>
          {state.historicalMonthRecords.length === 0 ? (
            <p className="text-sm text-slate-500">No months yet. Click &quot;Add month&quot; to record past data.</p>
          ) : (
            <div className="space-y-4">
              {state.historicalMonthRecords.map((record, index) => (
                <div
                  key={record.id}
                  className="bg-white border border-[#1B2C4F]/12 rounded-lg p-4 space-y-4"
                >
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-sm font-semibold text-[#1B2C4F]">Month {index + 1}</p>
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:underline"
                      onClick={() =>
                        onChange({
                          historicalMonthRecords: state.historicalMonthRecords.filter((r) => r.id !== record.id),
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <StartMonthPicker
                      label="Billing month *"
                      value={record.monthYear}
                      onChange={(monthYear) => patchHistoricalRecord(record.id, { monthYear })}
                    />
                    <div>
                      <Label className="text-slate-700 font-medium">Tutor for this month *</Label>
                      <div className="mt-2">
                        <TutorPicker
                          value={record.tutor}
                          onChange={(t) => patchHistoricalRecord(record.id, { tutor: t })}
                        />
                      </div>
                    </div>
                  </div>
                  <SubjectListInput
                    count={record.subjectCount}
                    subjects={record.subjects}
                    onCountChange={(n) => patchHistoricalRecord(record.id, { subjectCount: n })}
                    onSubjectsChange={(s) => patchHistoricalRecord(record.id, { subjects: s })}
                  />
                  <div>
                    <Label className="text-slate-700 font-medium">Session days & times *</Label>
                    <div className="mt-2">
                      <PerDaySchedulePanel
                        slots={record.daySlots}
                        onChange={(slots) => handleHistoricalDaySlotsChange(record.id, slots)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <Label>Sessions / week</Label>
                      <Input
                        type="number"
                        min={1}
                        max={7}
                        readOnly
                        value={String(
                          Math.max(1, record.daySlots.filter((d) => d.enabled).length || Number(record.sessionsPerWeek) || 1)
                        )}
                        className="mt-1 border-[#1B2C4F]/20 bg-slate-50"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">From selected session days.</p>
                    </div>
                    <div>
                      <Label>Duration (min)</Label>
                      <Input
                        type="number"
                        min={15}
                        value={record.durationMinutes}
                        onChange={(e) =>
                          patchHistoricalRecord(record.id, { durationMinutes: e.target.value })
                        }
                        className="mt-1 border-[#1B2C4F]/20"
                      />
                    </div>
                    <div>
                      <Label>Pay / month (XAF) *</Label>
                      <Input
                        type="number"
                        value={record.payPerMonth}
                        onChange={(e) => patchHistoricalRecord(record.id, { payPerMonth: e.target.value })}
                        className="mt-1 border-[#1B2C4F]/20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <DeliveryModeFields
        mode={state.deliveryMode}
        meetLink={state.meetLink}
        onsiteLocation={state.onsiteLocation}
        onsitePhotoUrl={state.onsitePhotoUrl}
        onModeChange={(deliveryMode) => onChange({ deliveryMode })}
        onMeetLinkChange={(meetLink) => onChange({ meetLink })}
        onLocationChange={(onsiteLocation) => onChange({ onsiteLocation })}
        onPhotoUrlChange={(onsitePhotoUrl) => onChange({ onsitePhotoUrl })}
      />

      {showStandardScheduleFields && (
        <div className="grid gap-4 sm:grid-cols-3">
          {!historicalDefaults && (
            <div>
              <Label>Pay / month (XAF)</Label>
              <Input
                type="number"
                value={state.payPerMonth}
                onChange={(e) => onChange({ payPerMonth: e.target.value })}
                className="mt-1 border-[#1B2C4F]/20"
              />
            </div>
          )}
          {!historicalDefaults && (
            <div>
              <Label>Pay months</Label>
              <Input
                type="number"
                min={1}
                value={state.payMonths}
                onChange={(e) => onChange({ payMonths: e.target.value })}
                className="mt-1 border-[#1B2C4F]/20"
              />
            </div>
          )}
          {!historicalDefaults && (
            <div>
              <Label>Start month label</Label>
              <Input
                value={state.startMonthLabel}
                onChange={(e) => onChange({ startMonthLabel: e.target.value })}
                placeholder="e.g. Jan (12)"
                className="mt-1 border-[#1B2C4F]/20"
              />
            </div>
          )}
          {!historicalDefaults && (
            <div>
              <Label>Operation state</Label>
              <Select
                value={opState}
                onValueChange={(v) => onChange({ operationState: v as SchedulePeriodFormState['operationState'] })}
              >
                <SelectTrigger className="mt-1 border-[#1B2C4F]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
