'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '../../../../components/AdminNav';
import EmailPreview from '../../../../components/EmailPreview';

export default function RejectEmailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tutorId, setTutorId] = useState<string>('');
  const [tutorName, setTutorName] = useState<string>('');
  const [tutorEmail, setTutorEmail] = useState<string>('');
  const [reasons, setReasons] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => {
      setTutorId(id);
      const reasonsParam = searchParams.get('reasons') || '';
      setReasons(reasonsParam);
      
      fetch(`/api/admin/tutors/${id}/approval-data`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTutorName(data.tutorName || 'Tutor');
            setTutorEmail(data.tutorEmail || '');
            setSubject('Your PrepSkul Tutor Application Status Update');
            setBody(`Hi ${data.tutorName || 'Tutor'},

Thank you for your interest in becoming a tutor on PrepSkul.

After careful review, we regret to inform you that your application has not been approved at this time.

Reasons:
${reasonsParam.split(', ').map((r, i) => `${i + 1}. ${r}`).join('\n')}

We encourage you to address these concerns and reapply in the future. If you have any questions, please feel free to contact our support team.

Best regards,
The PrepSkul Team`);
          }
        });
    });
  }, [params, searchParams]);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Please fill in both subject and body');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/tutors/${tutorId}/reject/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, reasons }),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/admin/tutors?success=rejected&tutor=${tutorId}`);
      } else {
        setError(data.error || 'Failed to send rejection email');
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
          <div>
            <Link href={`/admin/tutors/${tutorId}/reject/reasons`} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Reasons
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Send Rejection Email</h1>
            <p className="text-sm text-gray-500 mt-1">Step 2 of 2: Review and send rejection email</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>}

          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To:</label>
              <p className="text-gray-900">{tutorEmail || 'Loading...'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Body:</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={15} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm" />
            </div>
            <EmailPreview subject={subject} body={body} tutorName={tutorName} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link href={`/admin/tutors/${tutorId}/reject/reasons`} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-medium transition-colors">
              ← Back
            </Link>
            <button onClick={handleSend} disabled={loading || !subject.trim() || !body.trim()} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-center font-medium transition-colors">
              {loading ? 'Sending...' : 'Send Rejection Email'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
