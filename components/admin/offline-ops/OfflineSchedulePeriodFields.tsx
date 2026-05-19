'use client';

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
  startMonthYear: StartMonthValue;
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
    startMonthYear: { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  };
}

export function buildSchedulePayload(state: SchedulePeriodFormState, opts?: { historical?: boolean }) {
  const cleanedSubjects = state.subjects.map((s) => s.trim()).filter(Boolean);
  const enabled = state.daySlots.filter((d) => d.enabled);
  const dayTimeSlots = enabled.map((d) => ({ day: d.day, time: d.time }));
  let startDate = state.startDate;
  let startMonthLabel = state.startMonthLabel.trim() || null;
  if (opts?.historical) {
    startDate = deriveStartDateFromMonthYear(
      state.startMonthYear.year,
      state.startMonthYear.month,
      dayTimeSlots
    );
    startMonthLabel = formatStartMonthLabel(state.startMonthYear.year, state.startMonthYear.month, startDate);
  }
  return {
    cleanedSubjects,
    enabled,
    schedule: {
      weeks: Number(state.weeks),
      sessionsPerWeek: Number(state.sessionsPerWeek),
      dayTimeSlots,
      durationMinutes: Number(state.durationMinutes),
      startDate,
      deliveryMode: state.deliveryMode,
      subjects: cleanedSubjects,
      meetLink: state.meetLink.trim() || null,
      onsiteLocation: state.onsiteLocation.trim() || null,
      onsitePhotoUrl: state.onsitePhotoUrl.trim() || null,
      payPerMonthXaf: state.payPerMonth ? Number(state.payPerMonth) : null,
      payMonthsCount: state.payMonths ? Number(state.payMonths) : null,
      operationState: state.operationState,
      startMonthLabel,
    },
  };
}

export function validateSchedulePeriodState(
  state: SchedulePeriodFormState,
  opts?: { requireTutor?: boolean; historical?: boolean }
): string | null {
  if (opts?.requireTutor !== false && !state.tutor?.tutorUserId) return 'Select a tutor.';
  const { cleanedSubjects, enabled } = buildSchedulePayload(state, { historical: opts?.historical });
  if (!cleanedSubjects.length) return 'Add at least one subject.';
  if (!enabled.length) return 'Select at least one session day.';
  if (!opts?.historical && !state.startDate) return 'Start date is required.';
  if (opts?.historical && !state.startMonthYear.month) return 'Select a start month.';
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
}: {
  state: SchedulePeriodFormState;
  onChange: (patch: Partial<SchedulePeriodFormState>) => void;
  learners?: Array<{ id: string; full_name?: string | null }>;
  showTutorPicker?: boolean;
  showLearnerSelect?: boolean;
  historicalDefaults?: boolean;
}) {
  const opState = historicalDefaults ? 'stopped' : state.operationState;

  return (
    <div className="space-y-5">
      {showTutorPicker && (
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

      <SubjectListInput
        count={state.subjectCount}
        subjects={state.subjects}
        onCountChange={(n) => onChange({ subjectCount: n })}
        onSubjectsChange={(s) => onChange({ subjects: s })}
      />

      <PerDaySchedulePanel slots={state.daySlots} onChange={(daySlots) => onChange({ daySlots })} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <div>
          <Label>Sessions / week</Label>
          <Input
            type="number"
            min={1}
            value={state.sessionsPerWeek}
            onChange={(e) => onChange({ sessionsPerWeek: e.target.value })}
            className="mt-1 border-[#1B2C4F]/20"
          />
        </div>
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

      {historicalDefaults && (
        <div className="rounded-md border border-[#1B2C4F]/15 bg-slate-50 p-4">
          <p className="text-xs text-slate-600 mb-3">
            Pick the calendar month when this period started. Sessions are generated from your weekly schedule and stored as past (evaluated) records, so they show up in analytics and tutor session counts.
          </p>
          <StartMonthPicker
            value={state.startMonthYear}
            onChange={(startMonthYear) => onChange({ startMonthYear })}
          />
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

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Pay / month (XAF)</Label>
          <Input
            type="number"
            value={state.payPerMonth}
            onChange={(e) => onChange({ payPerMonth: e.target.value })}
            className="mt-1 border-[#1B2C4F]/20"
          />
        </div>
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
    </div>
  );
}
