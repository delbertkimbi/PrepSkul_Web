'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '../../../../components/AdminNav';

const REJECTION_REASONS = [
  'Insufficient qualifications for requested subjects',
  'Poor quality profile photo',
  'Incomplete profile information',
  'Video introduction quality is too low',
  'Missing or unclear identification documents',
  'Does not meet minimum teaching experience requirements',
  'Requested rate is too high for qualifications',
  'Other (please specify below)'
];

export default function RejectReasonsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [tutorId, setTutorId] = useState<string>('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => setTutorId(id));
  }, [params]);

  const handleReasonToggle = (reason: string) => {
    if (reason === 'Other (please specify below)') {
      setSelectedReasons(prev => prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]);
    } else {
      setSelectedReasons(prev => prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev.filter(r => r !== 'Other (please specify below)'), reason]);
    }
  };

  const handleNext = () => {
    if (selectedReasons.length === 0) {
      setError('Please select at least one rejection reason');
      return;
    }
    if (selectedReasons.includes('Other (please specify below)') && !customReason.trim()) {
      setError('Please specify the custom rejection reason');
      return;
    }

    const reasons = selectedReasons.filter(r => r !== 'Other (please specify below)').concat(customReason.trim() ? [`Other: ${customReason.trim()}`] : []).join(', ');
    router.push(`/admin/tutors/${tutorId}/reject/email?reasons=${encodeURIComponent(reasons)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <Link href={`/admin/tutors/${tutorId}`} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Tutor Details
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Reject Tutor Application</h1>
            <p className="text-sm text-gray-500 mt-1">Step 1 of 2: Select rejection reasons</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>}

          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Select Rejection Reasons</h2>
            <p className="text-sm text-gray-600">Select the reasons why this tutor application is being rejected. These will be included in the rejection email.</p>

            <div className="space-y-3">
              {REJECTION_REASONS.map((reason) => (
                <label key={reason} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" checked={selectedReasons.includes(reason)} onChange={() => handleReasonToggle(reason)} className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                  <span className="flex-1 text-gray-900">{reason}</span>
                </label>
              ))}
            </div>

            {selectedReasons.includes('Other (please specify below)') && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Please specify:</label>
                <textarea value={customReason} onChange={(e) => setCustomReason(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Enter custom rejection reason..." />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link href={`/admin/tutors/${tutorId}`} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-medium transition-colors">
              Cancel
            </Link>
            <button onClick={handleNext} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-center font-medium transition-colors">
              Next: Send Rejection Email →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}



