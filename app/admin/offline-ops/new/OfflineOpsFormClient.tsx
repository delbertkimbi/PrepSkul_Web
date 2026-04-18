'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
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
  agent_name: z.enum(['Brian', 'Delbert', 'Calvin', 'Brinzel', 'Brandon'], { required_error: 'Agent is required' }),
  source_channel: z.enum(['whatsapp_ads', 'whatsapp_direct', 'phone_call', 'walk_in', 'referral']),
  customer_name: z.string().min(2, 'Customer name is required'),
  customer_whatsapp: z.string().min(6, 'WhatsApp number is required'),
  customer_role: z.enum(['Parent', 'Student']),
  number_of_learners: z.string().min(1, 'Number of learners is required'),
  learner_educational_level: z.string().min(1, 'Educational level is required'),
  subjects_of_interest: z.string().min(1, 'Subjects are required'),
  tutor_match_type: z.enum(['platform_tutor', 'off_platform_tutor']),
  delivery_mode: z.enum(['online', 'onsite', 'hybrid']),
  onboarding_stage: z.enum(['new_lead', 'qualified', 'matched', 'active_sessions', 'completed', 'dropped']),
  sessions_completed: z.string().optional(),
  payment_status: z.enum(['unpaid', 'partial', 'paid', 'refunded']),
  payment_environment: z.enum(['real', 'sandbox']),
  amount_paid: z.string().optional(),
  started_at: z.string().optional(),
  next_followup_at: z.string().optional(),
  converted_to_platform: z.enum(['yes', 'no']),
  notes: z.string().min(5, 'Add context notes'),
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
      agent_name: undefined,
      source_channel: 'whatsapp_direct',
      customer_name: '',
      customer_whatsapp: '',
      customer_role: undefined,
      number_of_learners: '1',
      learner_educational_level: '',
      subjects_of_interest: '',
      tutor_match_type: 'platform_tutor',
      delivery_mode: 'online',
      onboarding_stage: 'new_lead',
      sessions_completed: '0',
      payment_status: 'unpaid',
      payment_environment: 'real',
      amount_paid: '0',
      started_at: '',
      next_followup_at: '',
      converted_to_platform: 'no',
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      const { error } = await supabase.from('offline_operations').insert({
        agent_name: data.agent_name,
        source_channel: data.source_channel,
        customer_name: data.customer_name.trim(),
        customer_whatsapp: data.customer_whatsapp.trim(),
        customer_role: data.customer_role,
        number_of_learners: Number(data.number_of_learners || 1),
        learner_educational_level: data.learner_educational_level.trim(),
        subjects_of_interest: data.subjects_of_interest.trim(),
        tutor_match_type: data.tutor_match_type,
        delivery_mode: data.delivery_mode,
        onboarding_stage: data.onboarding_stage,
        sessions_completed: Number(data.sessions_completed || 0),
        payment_status: data.payment_status,
        payment_environment: data.payment_environment,
        amount_paid: Number(data.amount_paid || 0),
        started_at: data.started_at ? new Date(data.started_at).toISOString() : null,
        next_followup_at: data.next_followup_at ? new Date(data.next_followup_at).toISOString() : null,
        converted_to_platform: data.converted_to_platform === 'yes',
        notes: data.notes.trim(),
      });

      if (error) throw error;
      router.push('/admin/offline-ops');
      router.refresh();
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to save record');
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
        <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Customer Intake</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Agent *</Label>
              <Select value={watch('agent_name')} onValueChange={(v) => setValue('agent_name', v as FormData['agent_name'])}>
                <SelectTrigger className="mt-1 border-gray-300"><SelectValue placeholder="Select agent" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brian">Brian</SelectItem>
                  <SelectItem value="Delbert">Delbert</SelectItem>
                  <SelectItem value="Calvin">Calvin</SelectItem>
                  <SelectItem value="Brinzel">Brinzel</SelectItem>
                  <SelectItem value="Brandon">Brandon</SelectItem>
                </SelectContent>
              </Select>
              {errors.agent_name && <p className="mt-1 text-sm text-red-600">{errors.agent_name.message}</p>}
            </div>
            <div>
              <Label>Source channel *</Label>
              <Select value={watch('source_channel')} onValueChange={(v) => setValue('source_channel', v as FormData['source_channel'])}>
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
              <Label htmlFor="customer_name">Customer name *</Label>
              <Input id="customer_name" {...register('customer_name')} className="mt-1 border-gray-300" />
              {errors.customer_name && <p className="mt-1 text-sm text-red-600">{errors.customer_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="customer_whatsapp">Customer WhatsApp *</Label>
              <Input id="customer_whatsapp" {...register('customer_whatsapp')} className="mt-1 border-gray-300" />
              {errors.customer_whatsapp && <p className="mt-1 text-sm text-red-600">{errors.customer_whatsapp.message}</p>}
            </div>
            <div>
              <Label>Customer role *</Label>
              <Select value={watch('customer_role')} onValueChange={(v) => setValue('customer_role', v as FormData['customer_role'])}>
                <SelectTrigger className="mt-1 border-gray-300"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="number_of_learners">Number of learners *</Label>
              <Input id="number_of_learners" type="number" min={1} {...register('number_of_learners')} className="mt-1 border-gray-300" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Academic & Matching</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="learner_educational_level">Educational level *</Label>
              <Input id="learner_educational_level" {...register('learner_educational_level')} className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label htmlFor="subjects_of_interest">Subjects of interest *</Label>
              <Input id="subjects_of_interest" {...register('subjects_of_interest')} className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label>Delivery mode *</Label>
              <Select value={watch('delivery_mode')} onValueChange={(v) => setValue('delivery_mode', v as FormData['delivery_mode'])}>
                <SelectTrigger className="mt-1 border-gray-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tutor match type *</Label>
              <Select value={watch('tutor_match_type')} onValueChange={(v) => setValue('tutor_match_type', v as FormData['tutor_match_type'])}>
                <SelectTrigger className="mt-1 border-gray-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform_tutor">Platform tutor</SelectItem>
                  <SelectItem value="off_platform_tutor">Off-platform tutor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Journey stage *</Label>
              <Select value={watch('onboarding_stage')} onValueChange={(v) => setValue('onboarding_stage', v as FormData['onboarding_stage'])}>
                <SelectTrigger className="mt-1 border-gray-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_lead">New lead</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                  <SelectItem value="active_sessions">Active sessions</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sessions_completed">Sessions completed</Label>
              <Input id="sessions_completed" type="number" min={0} {...register('sessions_completed')} className="mt-1 border-gray-300" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Payments & Follow-up</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Payment status *</Label>
              <Select value={watch('payment_status')} onValueChange={(v) => setValue('payment_status', v as FormData['payment_status'])}>
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
              <Select value={watch('payment_environment')} onValueChange={(v) => setValue('payment_environment', v as FormData['payment_environment'])}>
                <SelectTrigger className="mt-1 border-gray-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="real">Real</SelectItem>
                  <SelectItem value="sandbox">Sandbox/Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount_paid">Amount paid (XAF)</Label>
              <Input id="amount_paid" type="number" min={0} step="0.01" {...register('amount_paid')} className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label htmlFor="started_at">Start date</Label>
              <Input id="started_at" type="date" {...register('started_at')} className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label htmlFor="next_followup_at">Next follow-up</Label>
              <Input id="next_followup_at" type="datetime-local" {...register('next_followup_at')} className="mt-1 border-gray-300" />
            </div>
            <div>
              <Label>Converted to platform?</Label>
              <Select value={watch('converted_to_platform')} onValueChange={(v) => setValue('converted_to_platform', v as 'yes' | 'no')}>
                <SelectTrigger className="mt-1 border-gray-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Operational notes *</Label>
            <Textarea id="notes" rows={4} {...register('notes')} className="mt-1 border-gray-300" placeholder="Context from onboarding, matching and follow-up calls/messages." />
            {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
          </div>
        </section>

        {submitError && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{submitError}</div>}

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
