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

export const reachoutSchema = z.object({
  agent_name: z.enum(['Brian', 'Delbert', 'Calvin', 'Brinzel', 'Brandon'], {
    required_error: 'Agent name is required',
  }),
  customer_whatsapp: z.string().min(1, "Customer's WhatsApp number is required"),
  customer_role: z.enum(['Parent', 'Student'], { required_error: 'Customer role is required' }),
  number_of_learners: z.string().min(1, 'Number of learners is required'),
  learner_educational_level: z.string().min(1, 'Learner(s) educational level is required'),
  subjects_of_interest: z.string().min(1, 'Subjects of interest is required'),
  examination_status: z.enum(
    ['None', 'FSLC', 'GCE O/L', 'GCE A/L', 'Concours', 'Other exam'],
    { required_error: 'Examination status is required' },
  ),
  session_type_preference: z.enum(['online', 'onsite'], { required_error: 'Session type is required' }),
  frequency_of_sessions: z.string().optional(),
  start_date_time_preference: z.string().optional(),
  price_range: z.string().min(1, 'Price range is required'),
  next_followup_at: z.string().optional(),
  followup_context: z.string().min(1, 'Follow-up context is required'),
  additional_info: z.string().min(1, 'Additional info is required'),
  status: z.enum(
    ['new', 'in_followup', 'ready_to_pay', 'payment_pending', 'paid', 'not_interested'],
    { required_error: 'Status is required' },
  ),
});

export type ReachoutFormData = z.infer<typeof reachoutSchema>;

export default function ReachoutFormClient() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReachoutFormData>({
    resolver: zodResolver(reachoutSchema),
    defaultValues: {
      agent_name: undefined,
      customer_whatsapp: '',
      customer_role: undefined,
      number_of_learners: '',
      learner_educational_level: '',
      subjects_of_interest: '',
      examination_status: 'None',
      session_type_preference: undefined,
      frequency_of_sessions: '',
      start_date_time_preference: '',
      price_range: '',
      next_followup_at: '',
      followup_context: '',
      additional_info: '',
      status: 'new',
    },
  });

  const customerRole = watch('customer_role');
  const sessionType = watch('session_type_preference');
  const status = watch('status');
  const examStatus = watch('examination_status');

  const onSubmit = async (data: ReachoutFormData) => {
    setSubmitError(null);
    try {
      const nextFollowup =
        data.next_followup_at && data.next_followup_at.trim()
          ? new Date(data.next_followup_at).toISOString()
          : null;

      const { error } = await supabase.from('reachout_track').insert({
        agent_name: data.agent_name.trim(),
        customer_whatsapp: data.customer_whatsapp.trim(),
        customer_role: data.customer_role,
        number_of_learners: data.number_of_learners.trim(),
        learner_educational_level: data.learner_educational_level.trim(),
        subjects_of_interest: data.subjects_of_interest.trim(),
        examination_status: data.examination_status,
        session_type_preference: data.session_type_preference,
        frequency_of_sessions: data.frequency_of_sessions?.trim() ?? '',
        start_date_time_preference: data.start_date_time_preference?.trim() ?? '',
        price_range: data.price_range.trim(),
        next_followup_at: nextFollowup,
        followup_context: data.followup_context.trim(),
        additional_info: data.additional_info.trim(),
        status: data.status,
      });

      if (error) throw error;
      router.push('/admin/reachout');
      router.refresh();
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to submit. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/reachout"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reachout Track
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Agent & customer info */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Agent & Customer Info
          </h2>
          <p className="text-sm text-gray-500">
            Who attended this customer and the customer&apos;s contact.
          </p>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="agent_name">Your name (agent) *</Label>
              <Select
                value={watch('agent_name')}
                onValueChange={(v) => setValue('agent_name', v as ReachoutFormData['agent_name'])}
                required
              >
                <SelectTrigger className="mt-1 w-full border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20">
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brian">Brian</SelectItem>
                  <SelectItem value="Delbert">Delbert</SelectItem>
                  <SelectItem value="Calvin">Calvin</SelectItem>
                  <SelectItem value="Brinzel">Brinzel</SelectItem>
                  <SelectItem value="Brandon">Brandon</SelectItem>
                </SelectContent>
              </Select>
              {errors.agent_name && (
                <p className="mt-1 text-sm text-red-600">{errors.agent_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="customer_whatsapp">Customer WhatsApp number *</Label>
              <Input
                id="customer_whatsapp"
                {...register('customer_whatsapp')}
                placeholder="e.g. +237 6XX XXX XXX"
                className="mt-1 border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20"
              />
              {errors.customer_whatsapp && (
                <p className="mt-1 text-sm text-red-600">{errors.customer_whatsapp.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Main fields */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Customer & Learning Details
          </h2>
          <div className="grid gap-4">
            <div>
              <Label>Customer role *</Label>
              <Select
                value={customerRole}
                onValueChange={(v) => setValue('customer_role', v as 'Parent' | 'Student')}
                required
              >
                <SelectTrigger className="mt-1 w-full border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                </SelectContent>
              </Select>
              {errors.customer_role && (
                <p className="mt-1 text-sm text-red-600">{errors.customer_role.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="number_of_learners">Number of learners involved *</Label>
              <Input
                id="number_of_learners"
                {...register('number_of_learners')}
                placeholder="e.g. 1 or 2"
                className="mt-1 border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20"
              />
              {errors.number_of_learners && (
                <p className="mt-1 text-sm text-red-600">{errors.number_of_learners.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="learner_educational_level">Learner(s) educational level *</Label>
              <Input
                id="learner_educational_level"
                {...register('learner_educational_level')}
                placeholder="e.g. Primary 5, Form 3"
                className="mt-1 border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20"
              />
              {errors.learner_educational_level && (
                <p className="mt-1 text-sm text-red-600">{errors.learner_educational_level.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="subjects_of_interest">Subjects of interest *</Label>
              <Input
                id="subjects_of_interest"
                {...register('subjects_of_interest')}
                placeholder="e.g. Mathematics, Physics"
                className="mt-1 border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20"
              />
              {errors.subjects_of_interest && (
                <p className="mt-1 text-sm text-red-600">{errors.subjects_of_interest.message}</p>
              )}
            </div>
            <div>
              <Label>Examination status *</Label>
              <Select
                value={examStatus}
                onValueChange={(v) => setValue('examination_status', v as ReachoutFormData['examination_status'])}
                required
              >
                <SelectTrigger className="mt-1 w-full border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="FSLC">FSLC</SelectItem>
                  <SelectItem value="GCE O/L">GCE O/L</SelectItem>
                  <SelectItem value="GCE A/L">GCE A/L</SelectItem>
                  <SelectItem value="Concours">Concours</SelectItem>
                  <SelectItem value="Other exam">Other exam</SelectItem>
                </SelectContent>
              </Select>
              {errors.examination_status && (
                <p className="mt-1 text-sm text-red-600">{errors.examination_status.message}</p>
              )}
            </div>
            <div>
              <Label>Session type preference *</Label>
              <Select
                value={sessionType}
                onValueChange={(v) => setValue('session_type_preference', v as 'online' | 'onsite')}
                required
              >
                <SelectTrigger className="mt-1 w-full border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                </SelectContent>
              </Select>
              {errors.session_type_preference && (
                <p className="mt-1 text-sm text-red-600">{errors.session_type_preference.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="frequency_of_sessions">Frequency of sessions</Label>
              <Input
                id="frequency_of_sessions"
                {...register('frequency_of_sessions')}
                placeholder="e.g. Twice per week (optional)"
                className="mt-1 border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20"
              />
              {errors.frequency_of_sessions && (
                <p className="mt-1 text-sm text-red-600">{errors.frequency_of_sessions.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="start_date_time_preference">Start date and time preference</Label>
              <Input
                id="start_date_time_preference"
                {...register('start_date_time_preference')}
                placeholder="e.g. Next week, mornings (optional)"
                className="mt-1 border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20"
              />
              {errors.start_date_time_preference && (
                <p className="mt1 text-sm text-red-600">{errors.start_date_time_preference.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="price_range">Price range *</Label>
              <Input
                id="price_range"
                {...register('price_range')}
                placeholder="e.g. 15,000 - 25,000 XAF/session"
                className="mt-1 border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20"
              />
              {errors.price_range && (
                <p className="mt-1 text-sm text-red-600">{errors.price_range.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Follow-up & status section */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Follow-up
          </h2>
          <p className="text-sm text-gray-500">
            When to reach out next and any follow-up context.
          </p>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="next_followup_at">When to reach out next (date & time)</Label>
              <Input
                id="next_followup_at"
                type="datetime-local"
                {...register('next_followup_at')}
                className="mt-1 border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20"
              />
            </div>
            <div>
              <Label htmlFor="followup_context">Follow-up context *</Label>
              <Textarea
                id="followup_context"
                {...register('followup_context')}
                placeholder="Details on next steps and follow-up for this customer"
                rows={4}
                className="mt-1 border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20"
              />
              {errors.followup_context && (
                <p className="mt-1 text-sm text-red-600">{errors.followup_context.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="additional_info">Additional info *</Label>
              <Textarea
                id="additional_info"
                {...register('additional_info')}
                placeholder="Any other relevant information"
                rows={3}
                className="mt-1 border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20"
              />
              {errors.additional_info && (
                <p className="mt-1 text-sm text-red-600">{errors.additional_info.message}</p>
              )}
            </div>
            <div>
              <Label>Status *</Label>
              <Select
                value={status}
                onValueChange={(v) =>
                  setValue('status', v as ReachoutFormData['status'], { shouldValidate: true })
                }
                required
              >
                <SelectTrigger className="mt-1 w-full border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20">
                  <SelectValue placeholder="Select current status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New / initial</SelectItem>
                  <SelectItem value="in_followup">In follow-up</SelectItem>
                  <SelectItem value="ready_to_pay">Ready to pay</SelectItem>
                  <SelectItem value="payment_pending">Payment pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="not_interested">Not interested</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>
        </section>

        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {submitError}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#1B2C4F] hover:bg-[#1B2C4F]/90 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/reachout')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
