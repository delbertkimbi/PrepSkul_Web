'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '../../../components/AdminNav';

export default function UnhideTutorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [tutorId, setTutorId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => setTutorId(id));
  }, [params]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/tutors/${tutorId}/hide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: '' }), // Empty reason for unhide
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/admin/tutors?success=unhidden&tutor=${tutorId}`);
      } else {
        setError(data.error || 'Failed to unhide tutor');
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
            <h1 className="text-2xl font-bold text-gray-900">Unhide Tutor</h1>
            <p className="text-sm text-gray-500 mt-1">Make this tutor visible to students again</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>}

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-700">Are you sure you want to make this tutor visible to students again?</p>
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
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-center font-medium transition-colors"
            >
              {loading ? 'Unhiding...' : 'Unhide Tutor'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
