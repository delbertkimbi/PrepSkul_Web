'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import AmbassadorHeader from '@/components/ambassador-header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';

const referralSchema = z.object({
  ambassador_name: z.string().min(1, 'Ambassador name is required'),
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_whatsapp: z.string().min(1, "Customer's WhatsApp number is required"),
  contact_date: z.string().min(1, 'Date is required'),
  additional_notes: z.string().optional(),
});

type ReferralFormData = z.infer<typeof referralSchema>;

function todayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function ReferralTrackPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      ambassador_name: '',
      customer_name: '',
      customer_whatsapp: '',
      contact_date: todayISO(),
      additional_notes: '',
    },
  });

  const onSubmit = async (data: ReferralFormData) => {
    setSubmitError(null);
    try {
      const { error } = await supabase.from('ambassador_referrals').insert({
        ambassador_name: data.ambassador_name.trim(),
        customer_name: data.customer_name.trim(),
        customer_whatsapp: data.customer_whatsapp.trim(),
        contact_date: data.contact_date,
        additional_notes: data.additional_notes?.trim() || null,
      });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        router.push('/ambassadors');
        router.refresh();
      }, 2000);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to submit. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AmbassadorHeader />

      <main className="flex-1 bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-xl">
          <div className="mb-6">
            <Link
              href="/ambassadors"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Ambassadors
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-primary/5">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Referral Track
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Log someone you talked to about PrepSkul. All fields except &quot;Additional notes&quot; are required.
              </p>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <p className="text-green-600 font-medium">Referral submitted successfully. Redirecting...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                <div>
                  <Label htmlFor="ambassador_name">Your name (ambassador) *</Label>
                  <Input
                    id="ambassador_name"
                    {...register('ambassador_name')}
                    placeholder="e.g. Jane Doe"
                    className="mt-1 border-gray-300 focus:border-primary focus:ring-primary/20"
                  />
                  {errors.ambassador_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.ambassador_name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="customer_name">Customer name *</Label>
                  <Input
                    id="customer_name"
                    {...register('customer_name')}
                    placeholder="Person you talked to"
                    className="mt-1 border-gray-300 focus:border-primary focus:ring-primary/20"
                  />
                  {errors.customer_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="customer_whatsapp">Customer WhatsApp number *</Label>
                  <Input
                    id="customer_whatsapp"
                    {...register('customer_whatsapp')}
                    placeholder="e.g. +237 6XX XXX XXX"
                    className="mt-1 border-gray-300 focus:border-primary focus:ring-primary/20"
                  />
                  {errors.customer_whatsapp && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_whatsapp.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="contact_date">Date of contact *</Label>
                  <Input
                    id="contact_date"
                    type="date"
                    {...register('contact_date')}
                    className="mt-1 border-gray-300 focus:border-primary focus:ring-primary/20"
                  />
                  {errors.contact_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact_date.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="additional_notes">Additional notes (optional)</Label>
                  <Textarea
                    id="additional_notes"
                    {...register('additional_notes')}
                    placeholder="Any extra context about this person"
                    rows={3}
                    className="mt-1 border-gray-300 focus:border-primary focus:ring-primary/20"
                  />
                </div>

                {submitError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {submitError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit referral'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
