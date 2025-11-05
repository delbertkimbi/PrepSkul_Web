'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '../../../components/AdminNav';

export default function BlockTutorPage({ params }: { params: Promise<{ id: string }> }) {
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
      setError('Please provide a reason for blocking the tutor');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/tutors/${tutorId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/admin/tutors?success=blocked&tutor=${tutorId}`);
      } else {
        setError(data.error || 'Failed to block tutor');
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
            <h1 className="text-2xl font-bold text-gray-900">Block Tutor</h1>
            <p className="text-sm text-gray-500 mt-1">Block this tutor from the platform</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>}

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Warning: This action will block the tutor and suspend their account.</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for blocking (required):
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter reason for blocking this tutor..."
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
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-center font-medium transition-colors"
            >
              {loading ? 'Blocking...' : 'Block Tutor'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
