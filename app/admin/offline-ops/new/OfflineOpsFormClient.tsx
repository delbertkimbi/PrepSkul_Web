'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TutorPicker, { type TutorPickerValue } from '@/components/admin/offline-ops/TutorPicker';
import LearnerPicker, { type LearnerPickerValue } from '@/components/admin/offline-ops/LearnerPicker';
import DeliveryModeFields, { type DeliveryMode } from '@/components/admin/offline-ops/DeliveryModeFields';
import {
  SubjectListInput,
  PerDaySchedulePanel,
  defaultDaySlots,
} from '@/components/admin/offline-ops/SubjectListInput';

const panel =
  'bg-white border border-[#1B2C4F]/12 shadow-sm p-5 sm:p-6 rounded-lg';

export default function OfflineOpsFormClient() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [enrollmentKind, setEnrollmentKind] = useState<'new' | 'existing'>('new');
  const [existingUser, setExistingUser] = useState<LearnerPickerValue>(null);
  const [agentName, setAgentName] = useState('Brian');
  const [sourceChannel, setSourceChannel] = useState('whatsapp_direct');
  const [primaryRole, setPrimaryRole] = useState<'parent' | 'student'>('parent');
  const [primaryFullName, setPrimaryFullName] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [childFullName, setChildFullName] = useState('');
  const [tutor, setTutor] = useState<TutorPickerValue>(null);

  const [subjectCount, setSubjectCount] = useState(1);
  const [subjects, setSubjects] = useState(['']);
  const [daySlots, setDaySlots] = useState(() => defaultDaySlots());
  const [weeks, setWeeks] = useState('4');
  const [sessionsPerWeek, setSessionsPerWeek] = useState('2');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [startDate, setStartDate] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('online');
  const [meetLink, setMeetLink] = useState('');
  const [onsiteLocation, setOnsiteLocation] = useState('');
  const [onsitePhotoUrl, setOnsitePhotoUrl] = useState('');
  const [payPerMonth, setPayPerMonth] = useState('');
  const [payMonths, setPayMonths] = useState('1');
  const [operationState, setOperationState] = useState<'active' | 'paused' | 'stopped'>('active');
  const [startMonthLabel, setStartMonthLabel] = useState('');

  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [paymentEnvironment, setPaymentEnvironment] = useState('real');
  const [amountPaid, setAmountPaid] = useState('0');
  const [packageTotalAmount, setPackageTotalAmount] = useState('');
  const [nextFollowupAt, setNextFollowupAt] = useState('');
  const [notes, setNotes] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!tutor?.tutorUserId) {
      setSubmitError('Select a tutor from the list.');
      return;
    }
    if (enrollmentKind === 'existing' && !existingUser?.userId) {
      setSubmitError('Search and select the existing PrepSkul account.');
      return;
    }
    if (enrollmentKind === 'new' && !primaryEmail.trim()) {
      setSubmitError('Email is required for new accounts.');
      return;
    }
    if (enrollmentKind === 'new' && primaryRole === 'parent' && !childFullName.trim()) {
      setSubmitError('Learner full name is required for parent accounts.');
      return;
    }
    if (enrollmentKind === 'existing' && existingUser?.userType === 'parent' && !childFullName.trim()) {
      setSubmitError('Enter the learner full name for this parent account.');
      return;
    }
    const cleanedSubjects = subjects.map((s) => s.trim()).filter(Boolean);
    if (!cleanedSubjects.length) {
      setSubmitError('Add at least one subject.');
      return;
    }
    const enabled = daySlots.filter((d) => d.enabled);
    if (!enabled.length) {
      setSubmitError('Select at least one session day.');
      return;
    }
    if ((deliveryMode === 'online' || deliveryMode === 'hybrid') && !meetLink.trim()) {
      setSubmitError('Google Meet link is required for online/hybrid delivery.');
      return;
    }
    if ((deliveryMode === 'onsite' || deliveryMode === 'hybrid') && !onsiteLocation.trim()) {
      setSubmitError('Onsite location is required for onsite/hybrid delivery.');
      return;
    }
    if (!notes.trim() || notes.trim().length < 8) {
      setSubmitError('Operational notes must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedPackageTotal = Number(packageTotalAmount || 0);
      const normalizedAmountPaid =
        paymentStatus === 'paid' ? normalizedPackageTotal : paymentStatus === 'unpaid' ? 0 : Number(amountPaid || 0);

      const payload = {
        agentName,
        sourceChannel,
        enrollmentKind,
        existingPrimaryUserId: enrollmentKind === 'existing' ? existingUser?.userId : undefined,
        primary: {
          role:
            enrollmentKind === 'existing' && existingUser
              ? existingUser.userType
              : primaryRole,
          fullName:
            enrollmentKind === 'existing' && existingUser
              ? existingUser.fullName
              : primaryFullName.trim(),
          email:
            enrollmentKind === 'existing' && existingUser
              ? existingUser.email
              : primaryEmail.trim(),
          phone: primaryPhone.trim(),
        },
        child: primaryRole === 'parent' || (existingUser?.userType === 'parent')
          ? { fullName: childFullName.trim() }
          : null,
        tutor: { tutorUserId: tutor.tutorUserId },
        schedule: {
          weeks: Number(weeks),
          sessionsPerWeek: Number(sessionsPerWeek),
          dayTimeSlots: enabled.map((d) => ({ day: d.day, time: d.time })),
          weekDays: enabled.map((d) => d.day),
          sessionTime: enabled[0].time,
          durationMinutes: Number(durationMinutes),
          startDate,
          deliveryMode,
          subject: cleanedSubjects[0],
          subjects: cleanedSubjects,
          meetLink: meetLink.trim() || null,
          onsiteLocation: onsiteLocation.trim() || null,
          onsitePhotoUrl: onsitePhotoUrl.trim() || null,
          payPerMonthXaf: payPerMonth ? Number(payPerMonth) : null,
          payMonthsCount: payMonths ? Number(payMonths) : null,
          operationState,
          startMonthLabel: startMonthLabel.trim() || null,
        },
        notes: notes.trim(),
        tracking: {
          paymentStatus,
          paymentEnvironment,
          amountPaid: normalizedAmountPaid,
          packageTotalAmount: packageTotalAmount.trim() ? normalizedPackageTotal : undefined,
          nextFollowupAt: nextFollowupAt || undefined,
        },
      };

      const response = await fetch('/api/admin/offline-ops/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error || 'Failed to sync offline onboarding');

      router.push('/admin/offline-ops/users');
      router.refresh();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-none px-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#1B2C4F]/15 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#4A6FBF]">Offline operations</p>
          <h1 className="text-2xl font-bold text-[#1B2C4F]">New offline enrollment</h1>
          <p className="text-sm text-slate-600 mt-1">
            Enroll a new family or link an existing PrepSkul account to offline tutoring.
          </p>
        </div>
        <Link
          href="/admin/offline-ops/users"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#1B2C4F] hover:text-[#4A6FBF]"
        >
          <ArrowLeft className="h-4 w-4" />
          Offline users
        </Link>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className={`${panel} xl:col-span-7 space-y-5`}>
          <h2 className="text-base font-semibold text-[#1B2C4F] border-l-4 border-[#1B2C4F] pl-3">Identity & contact</h2>

          <div className="rounded-md border border-[#1B2C4F]/15 bg-slate-50 p-4 space-y-3">
            <Label className="text-slate-700 font-medium">Enrollment type</Label>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="enrollmentKind" checked={enrollmentKind === 'new'} onChange={() => { setEnrollmentKind('new'); setExistingUser(null); }} />
                New user (not on PrepSkul yet)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="enrollmentKind" checked={enrollmentKind === 'existing'} onChange={() => setEnrollmentKind('existing')} />
                Existing PrepSkul account
              </label>
            </div>
          </div>

          {enrollmentKind === 'existing' && (
            <div className="space-y-4 mb-2">
              <LearnerPicker value={existingUser} onChange={setExistingUser} filterRole="all" />
              {existingUser?.userType === 'parent' && (
                <div>
                  <Label>Learner full name *</Label>
                  <Input value={childFullName} onChange={(e) => setChildFullName(e.target.value)} placeholder="Child being tutored" className="mt-1 border-[#1B2C4F]/20" />
                </div>
              )}
            </div>
          )}

          {enrollmentKind === 'new' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Agent</Label>
              <Select value={agentName} onValueChange={setAgentName}>
                <SelectTrigger className="mt-1 border-[#1B2C4F]/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Brian', 'Delbert', 'Calvin', 'Brinzel', 'Brandon'].map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Source</Label>
              <Select value={sourceChannel} onValueChange={setSourceChannel}>
                <SelectTrigger className="mt-1 border-[#1B2C4F]/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp_ads">WhatsApp ads</SelectItem>
                  <SelectItem value="whatsapp_direct">WhatsApp direct</SelectItem>
                  <SelectItem value="phone_call">Phone call</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Primary role</Label>
              <Select value={primaryRole} onValueChange={(v) => setPrimaryRole(v as 'parent' | 'student')}>
                <SelectTrigger className="mt-1 border-[#1B2C4F]/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Primary full name</Label>
              <Input value={primaryFullName} onChange={(e) => setPrimaryFullName(e.target.value)} className="mt-1 border-[#1B2C4F]/20" required />
            </div>
            <div>
              <Label>Primary email (unique account)</Label>
              <Input type="email" value={primaryEmail} onChange={(e) => setPrimaryEmail(e.target.value)} className="mt-1 border-[#1B2C4F]/20" required />
            </div>
            <div>
              <Label>Phone / WhatsApp</Label>
              <Input value={primaryPhone} onChange={(e) => setPrimaryPhone(e.target.value)} className="mt-1 border-[#1B2C4F]/20" />
              <p className="text-xs text-slate-500 mt-1">Not required to be unique across accounts.</p>
            </div>
            {primaryRole === 'parent' && (
              <div className="sm:col-span-2">
                <Label>Learner full name</Label>
                <Input value={childFullName} onChange={(e) => setChildFullName(e.target.value)} className="mt-1 border-[#1B2C4F]/20" required />
              </div>
            )}
          </div>
          )}
        </section>

        <section className={`${panel} xl:col-span-5`}>
          <h2 className="text-base font-semibold text-[#1B2C4F] border-l-4 border-[#1B2C4F] pl-3 mb-4">Tutor match</h2>
          <TutorPicker value={tutor} onChange={setTutor} />
        </section>

        <section className={`${panel} xl:col-span-12 space-y-5`}>
          <h2 className="text-base font-semibold text-[#1B2C4F] border-l-4 border-[#1B2C4F] pl-3">Scheduling period</h2>
          <SubjectListInput
            count={subjectCount}
            subjects={subjects}
            onCountChange={setSubjectCount}
            onSubjectsChange={setSubjects}
          />
          <PerDaySchedulePanel slots={daySlots} onChange={setDaySlots} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Start date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 border-[#1B2C4F]/20" required />
            </div>
            <div>
              <Label>Weeks</Label>
              <Input type="number" min={1} max={24} value={weeks} onChange={(e) => setWeeks(e.target.value)} className="mt-1 border-[#1B2C4F]/20" />
            </div>
            <div>
              <Label>Sessions / week (reference)</Label>
              <Input type="number" min={1} max={7} value={sessionsPerWeek} onChange={(e) => setSessionsPerWeek(e.target.value)} className="mt-1 border-[#1B2C4F]/20" />
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input type="number" min={30} step={15} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className="mt-1 border-[#1B2C4F]/20" />
            </div>
            <div>
              <Label>Pay / month (XAF)</Label>
              <Input type="number" min={0} value={payPerMonth} onChange={(e) => setPayPerMonth(e.target.value)} className="mt-1 border-[#1B2C4F]/20" />
            </div>
            <div>
              <Label># Pay-months</Label>
              <Input type="number" min={0.5} step={0.5} value={payMonths} onChange={(e) => setPayMonths(e.target.value)} className="mt-1 border-[#1B2C4F]/20" />
            </div>
            <div>
              <Label>Start month label</Label>
              <Input value={startMonthLabel} onChange={(e) => setStartMonthLabel(e.target.value)} placeholder="Jan (12)" className="mt-1 border-[#1B2C4F]/20" />
            </div>
            <div>
              <Label>Operation state</Label>
              <Select value={operationState} onValueChange={(v) => setOperationState(v as typeof operationState)}>
                <SelectTrigger className="mt-1 border-[#1B2C4F]/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className={`${panel} xl:col-span-6`}>
          <h2 className="text-base font-semibold text-[#1B2C4F] border-l-4 border-[#1B2C4F] pl-3 mb-4">Delivery</h2>
          <DeliveryModeFields
            mode={deliveryMode}
            meetLink={meetLink}
            onsiteLocation={onsiteLocation}
            onsitePhotoUrl={onsitePhotoUrl}
            onModeChange={setDeliveryMode}
            onMeetLinkChange={setMeetLink}
            onLocationChange={setOnsiteLocation}
            onPhotoUrlChange={setOnsitePhotoUrl}
          />
        </section>

        <section className={`${panel} xl:col-span-6 space-y-4`}>
          <h2 className="text-base font-semibold text-[#1B2C4F] border-l-4 border-[#1B2C4F] pl-3">Payments & notes</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Payment status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="mt-1 border-[#1B2C4F]/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Environment</Label>
              <Select value={paymentEnvironment} onValueChange={setPaymentEnvironment}>
                <SelectTrigger className="mt-1 border-[#1B2C4F]/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="real">Real</SelectItem>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Total due (XAF)</Label>
              <Input type="number" min={0} value={packageTotalAmount} onChange={(e) => setPackageTotalAmount(e.target.value)} className="mt-1 border-[#1B2C4F]/20" />
            </div>
            {paymentStatus === 'partial' && (
              <div>
                <Label>Amount paid</Label>
                <Input type="number" min={0} value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="mt-1 border-[#1B2C4F]/20" />
              </div>
            )}
          </div>
          <div>
            <Label>Operational notes</Label>
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 border-[#1B2C4F]/20" />
          </div>
        </section>

        {submitError && (
          <div className="xl:col-span-12 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{submitError}</div>
        )}

        <div className="xl:col-span-12 flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting} className="bg-[#1B2C4F] hover:bg-[#15243d] text-white">
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Enrolling…</> : 'Complete enrollment'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/offline-ops/users')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

