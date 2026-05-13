'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  agentName: z.enum(['Brian', 'Delbert', 'Calvin', 'Brinzel', 'Brandon']),
  sourceChannel: z.enum(['whatsapp_ads', 'whatsapp_direct', 'phone_call', 'walk_in', 'referral']),
  primaryRole: z.enum(['parent', 'student']),
  primaryFullName: z.string().min(2),
  primaryEmail: z.string().email(),
  primaryPhone: z.string().min(6),
  childFullName: z.string().optional(),
  tutorUserId: z.string().optional(),
  tutorEmail: z.string().optional(),
  subject: z.string().min(2),
  weeks: z.string().min(1),
  sessionsPerWeek: z.string().min(1),
  weekDaysCsv: z.string().min(3),
  sessionTime: z.string().min(4),
  durationMinutes: z.string().min(2),
  startDate: z.string().min(8),
  deliveryMode: z.enum(['online', 'onsite', 'hybrid']),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid', 'refunded']),
  paymentEnvironment: z.enum(['real', 'sandbox']),
  amountPaid: z.string().default('0'),
  /** Full package / quoted total (XAF). Leave 0 to default tracking to amount paid only. */
  packageTotalAmount: z.string().optional(),
  nextFollowupAt: z.string().optional(),
  notes: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export default function OfflineOpsFormClient() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      agentName: 'Brian',
      sourceChannel: 'whatsapp_direct',
      primaryRole: 'parent',
      primaryFullName: '',
      primaryEmail: '',
      primaryPhone: '',
      childFullName: '',
      tutorUserId: '',
      tutorEmail: '',
      subject: '',
      weeks: '4',
      sessionsPerWeek: '2',
      weekDaysCsv: 'mon,wed',
      sessionTime: '16:00',
      durationMinutes: '60',
      startDate: '',
      deliveryMode: 'online',
      paymentStatus: 'unpaid',
      paymentEnvironment: 'real',
      amountPaid: '0',
      packageTotalAmount: '',
      nextFollowupAt: '',
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      if (!data.tutorUserId && !data.tutorEmail) {
        throw new Error('Provide Tutor User ID or Tutor Email to match the learner.');
      }
      if (data.primaryRole === 'parent' && !data.childFullName?.trim()) {
        throw new Error('For parent onboarding, the learner full name is required.');
      }

      const weekDays = data.weekDaysCsv
        .split(',')
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
        agentName: data.agentName,
        sourceChannel: data.sourceChannel,
        primary: {
          role: data.primaryRole,
          fullName: data.primaryFullName.trim(),
          email: data.primaryEmail.trim(),
          phone: data.primaryPhone.trim(),
        },
        child:
          data.primaryRole === 'parent'
            ? {
                fullName: (data.childFullName || '').trim(),
              }
            : null,
        tutor: {
          tutorUserId: data.tutorUserId?.trim() || undefined,
          tutorEmail: data.tutorEmail?.trim() || undefined,
        },
        schedule: {
          weeks: Number(data.weeks),
          sessionsPerWeek: Number(data.sessionsPerWeek),
          weekDays,
          sessionTime: data.sessionTime,
          durationMinutes: Number(data.durationMinutes),
          startDate: data.startDate,
          deliveryMode: data.deliveryMode,
          subject: data.subject.trim(),
        },
        notes: data.notes.trim(),
        tracking: {
          paymentStatus: data.paymentStatus,
          paymentEnvironment: data.paymentEnvironment,
          amountPaid: Number(data.amountPaid || 0),
          packageTotalAmount: data.packageTotalAmount?.trim()
            ? Number(data.packageTotalAmount)
            : undefined,
          nextFollowupAt: data.nextFollowupAt || undefined,
        },
      };

      const response = await fetch('/api/admin/offline-ops/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || 'Failed to sync offline onboarding');
      }

      router.push('/admin/offline-ops');
      router.refresh();
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to save and sync record');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/offline-ops" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Back to Offline Operations
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="bg-white rounded-none border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Platform Account Creation</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Agent *</Label>
              <Select value={watch('agentName')} onValueChange={(v) => setValue('agentName', v as FormData['agentName'])}>
                <SelectTrigger className="mt-1 border-gray-300"><SelectValue placeholder="Select agent" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brian">Brian</SelectItem>
                  <SelectItem value="Delbert">Delbert</SelectItem>
                  <SelectItem value="Calvin">Calvin</SelectItem>
                  <SelectItem value="Brinzel">Brinzel</SelectItem>
                  <SelectItem value="Brandon">Brandon</SelectItem>
                </SelectContent>
              </Select>
              {errors.agentName && <p className="mt-1 text-sm text-red-600">{errors.agentName.message}</p>}
            </div>
            <div>
              <Label>Source channel *</Label>
              <Select value={watch('sourceChannel')} onValueChange={(v) => setValue('sourceChannel', v as FormData['sourceChannel'])}>
                <SelectTrigger className="mt-1 border-gray-300"><SelectValue /></SelectTrigger>
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
              <Label>Primary role *</Label>
              <Select value={watch('primaryRole')} onValueChange={(v) => setValue('primaryRole', v as FormData['primaryRole'])}>
                <SelectTrigger className="mt-1 border-gray-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="student">Student/Learner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="primaryFullName">Primary full name *</Label>
              <Input id="primaryFullName" {...register('primaryFullName')} className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label htmlFor="primaryEmail">Primary email *</Label>
              <Input id="primaryEmail" type="email" {...register('primaryEmail')} className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label htmlFor="primaryPhone">Primary phone/WhatsApp *</Label>
              <Input id="primaryPhone" {...register('primaryPhone')} className="mt-1 border-gray-300" />
            </div>
            {watch('primaryRole') === 'parent' && (
              <div>
                <Label htmlFor="childFullName">Learner full name *</Label>
                <Input id="childFullName" {...register('childFullName')} className="mt-1 border-gray-300" />
                <p className="text-xs text-gray-500 mt-1">
                  Contact email and WhatsApp for the family are taken from the primary parent fields above. A secure
                  login email for the learner account is created automatically.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-none border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Verified Tutor Matching</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="tutorUserId">Tutor user ID</Label>
              <Input id="tutorUserId" {...register('tutorUserId')} className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label htmlFor="tutorEmail">Tutor email (if no ID)</Label>
              <Input id="tutorEmail" type="email" {...register('tutorEmail')} className="mt-1 border-gray-300" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-none border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Auto Session Scheduling</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input id="subject" {...register('subject')} className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label htmlFor="startDate">Start date *</Label>
              <Input id="startDate" type="date" {...register('startDate')} className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label htmlFor="weeks">Number of weeks *</Label>
              <Input id="weeks" type="number" min={1} max={24} {...register('weeks')} className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label htmlFor="sessionsPerWeek">Sessions per week *</Label>
              <Input id="sessionsPerWeek" type="number" min={1} max={7} {...register('sessionsPerWeek')} className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label htmlFor="weekDaysCsv">Week days (csv) *</Label>
              <Input id="weekDaysCsv" {...register('weekDaysCsv')} placeholder="mon,wed,fri" className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label htmlFor="sessionTime">Session time (HH:mm) *</Label>
              <Input id="sessionTime" type="time" {...register('sessionTime')} className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label htmlFor="durationMinutes">Duration minutes *</Label>
              <Input id="durationMinutes" type="number" min={30} step={15} {...register('durationMinutes')} className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label>Delivery mode *</Label>
              <Select value={watch('deliveryMode')} onValueChange={(v) => setValue('deliveryMode', v as FormData['deliveryMode'])}>
                <SelectTrigger className="mt-1 border-gray-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-none border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Payments, Ops Tracking & Notes</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Payment status *</Label>
              <Select value={watch('paymentStatus')} onValueChange={(v) => setValue('paymentStatus', v as FormData['paymentStatus'])}>
                <SelectTrigger className="mt-1 border-gray-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partially paid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment environment *</Label>
              <Select value={watch('paymentEnvironment')} onValueChange={(v) => setValue('paymentEnvironment', v as FormData['paymentEnvironment'])}>
                <SelectTrigger className="mt-1 border-gray-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="real">Real</SelectItem>
                  <SelectItem value="sandbox">Sandbox/Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amountPaid">Amount paid (XAF)</Label>
              <Input id="amountPaid" type="number" min={0} step="0.01" {...register('amountPaid')} className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label htmlFor="packageTotalAmount">Package / total due (XAF)</Label>
              <Input
                id="packageTotalAmount"
                type="number"
                min={0}
                step="0.01"
                {...register('packageTotalAmount')}
                className="mt-1 border-gray-300"
                placeholder="Optional — for partial/unpaid balance tracking"
              />
            </div>
            <div>
              <Label htmlFor="nextFollowupAt">Next follow-up</Label>
              <Input id="nextFollowupAt" type="datetime-local" {...register('nextFollowupAt')} className="mt-1 border-gray-300" />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Operational notes *</Label>
            <Textarea id="notes" rows={4} {...register('notes')} className="mt-1 border-gray-300" placeholder="Context from onboarding, matching and follow-up calls/messages." />
            {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
          </div>
        </section>

        {submitError && <div className="rounded-none border border-red-200 bg-red-50 p-4 text-sm text-red-800">{submitError}</div>}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="bg-[#1B2C4F] hover:bg-[#1B2C4F]/90 text-white">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save record'
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/offline-ops')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
