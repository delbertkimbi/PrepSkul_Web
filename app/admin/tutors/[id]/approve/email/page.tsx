'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '../../../../components/AdminNav';
import EmailPreview from '../../../../components/EmailPreview';

interface ApprovalEmailPageProps {
  params: Promise<{ id: string }>;
}

export default function ApprovalEmailPage({ params }: ApprovalEmailPageProps) {
  const router = useRouter();
  const [tutorId, setTutorId] = useState<string>('');
  const [tutorName, setTutorName] = useState<string>('');
  const [tutorEmail, setTutorEmail] = useState<string>('');
  const [rating, setRating] = useState<string>('');
  const [sessionPrice, setSessionPrice] = useState<string>('');
  const [pricingTier, setPricingTier] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => {
      setTutorId(id);
      // Fetch tutor data
      fetch(`/api/admin/tutors/${id}/approval-data`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTutorName(data.tutorName || 'Tutor');
            setTutorEmail(data.tutorEmail || '');
            setRating(data.rating || '');
            setSessionPrice(data.sessionPrice || '');
            setPricingTier(data.pricingTier || '');
            
            // Set default subject
            setSubject(`Your PrepSkul Tutor Profile Has Been Approved! 🎉`);
            
            // Set default body with rating and pricing info
            const defaultBody = `Hi ${data.tutorName || 'Tutor'},

Great news! Your PrepSkul tutor profile has been reviewed and approved by our admin team.

Your Initial Rating: ${data.rating || 'N/A'} ⭐
Your Session Price: ${data.sessionPrice || 'N/A'} XAF
Pricing Tier: ${data.pricingTier || 'N/A'}

Important Note: This is your initial rating based on your credentials and qualifications. Starting from your 3rd student review onwards, your rating will be dynamically updated based on actual student feedback and reviews.

Your profile is now live and visible to students. You can start receiving booking requests!

Log in to your dashboard to manage your profile and view your bookings.

Welcome to the PrepSkul community! 🎓

Best regards,
The PrepSkul Team`;

            setBody(defaultBody);
          }
        })
        .catch(err => {
          console.error('Error fetching tutor data:', err);
          setError('Failed to load tutor information');
        });
    });
  }, [params]);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Please fill in both subject and body');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/tutors/${tutorId}/approve/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          body,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/admin/tutors?success=approved&tutor=${tutorId}`);
      } else {
        setError(data.error || 'Failed to send approval email');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <Link href={`/admin/tutors/${tutorId}/approve/rating-pricing`} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Rating & Pricing
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Send Approval Email</h1>
            <p className="text-sm text-gray-500 mt-1">Step 2 of 2: Review and send approval email</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}

          {/* Email Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To:
              </label>
              <p className="text-gray-900">{tutorEmail || 'Loading...'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject:
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Email subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Body:
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Email body"
              />
            </div>

            {/* Preview */}
            <EmailPreview subject={subject} body={body} tutorName={tutorName} />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link
              href={`/admin/tutors/${tutorId}/approve/rating-pricing`}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-medium transition-colors"
            >
              ← Back
            </Link>
            <button
              onClick={handleSend}
              disabled={loading || !subject.trim() || !body.trim()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-center font-medium transition-colors"
            >
              {loading ? 'Sending...' : 'Send Approval Email'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
