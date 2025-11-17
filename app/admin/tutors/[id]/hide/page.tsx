'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '../../../components/AdminNav';

export default function HideTutorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [tutorId, setTutorId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => setTutorId(id));
  }, [params]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for hiding the tutor');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/tutors/${tutorId}/hide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/admin/tutors?success=hidden&tutor=${tutorId}`);
      } else {
        setError(data.error || 'Failed to hide tutor');
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
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <Link href={`/admin/tutors/${tutorId}`} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Tutor Details
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Hide Tutor</h1>
            <p className="text-sm text-gray-500 mt-1">Hide this tutor from public view</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>}

          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for hiding (required):
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Enter reason for hiding this tutor..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link
              href={`/admin/tutors/${tutorId}`}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading || !reason.trim()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-center font-medium transition-colors"
            >
              {loading ? 'Hiding...' : 'Hide Tutor'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
