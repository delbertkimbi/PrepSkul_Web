'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '../../../components/AdminNav';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ApprovalPageProps {
  params: Promise<{ id: string }>;
}

export default function ApprovalPage({ params }: ApprovalPageProps) {
  const router = useRouter();
  const [ambassadorId, setAmbassadorId] = useState<string>('');
  const [ambassadorName, setAmbassadorName] = useState<string>('');
  const [ambassadorEmail, setAmbassadorEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadAmbassadorData = async () => {
      try {
        const { id } = await params;
        setAmbassadorId(id);
        
        // Fetch ambassador data
        const response = await fetch(`/api/admin/ambassadors/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch ambassador data');
        }
        
        if (data.success && data.ambassador) {
          const fullName = data.ambassador.full_name || 'Ambassador';
          const email = data.ambassador.email || '';
          
          setAmbassadorName(fullName);
          setAmbassadorEmail(email);
          
          // Set default subject and body
          setSubject('🎉 Congratulations! Your PrepSkul Ambassador Application Has Been Approved');
          setBody(`Dear ${fullName},

We are thrilled to inform you that your application to become a PrepSkul Ambassador has been approved! 🎊

You are now officially a PrepSkul Ambassador, and we're excited to have you join our growing community of passionate individuals helping PrepSkul expand access to learning opportunities.

What's Next?

You will receive a WhatsApp message from our team within the next few days with more details about your ambassador journey. We'll share information about exclusive ambassador resources, opportunities, and how you can start making an impact.

Keep an eye on your email for updates and ambassador portal access information.

As a PrepSkul Ambassador, you play a crucial role in:
• Representing PrepSkul's mission in your school, community, and online
• Helping students, parents, and tutors discover meaningful opportunities
• Building trust in education and expanding access to learning

We believe in your passion for education and community, and we're confident you'll do well in representing PrepSkul and helping us grow.

Welcome to the PrepSkul Ambassador family! 🌟

Best regards,
The PrepSkul Team`);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err: any) {
        console.error('Error fetching ambassador data:', err);
        setError(err.message || 'Failed to load ambassador information');
      } finally {
        setLoadingData(false);
      }
    };

    loadAmbassadorData();
  }, [params]);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Please fill in both subject and body');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/ambassadors/${ambassadorId}/approve`, {
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

      if (!response.ok) {
        if (data.requiresDomainVerification) {
          setError(
            data.message || 
            `Resend's default email can only send to the account owner's email. To send to other recipients, please verify a domain at resend.com/domains.`
          );
        } else {
          setError(data.message || data.error || 'Failed to send approval email');
        }
        setLoading(false);
        return;
      }

      if (data.success) {
        // Check if email was actually sent
        if (!data.emailSent) {
          setError(
            data.message || 
            `Ambassador approved but email failed to send: ${data.emailError || 'Unknown error'}. Please check your Resend configuration.`
          );
          setLoading(false);
          return;
        }
        
        router.push(`/admin/ambassadors?success=approved&id=${ambassadorId}`);
        router.refresh();
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
            <Link href={`/admin/ambassadors/${ambassadorId}`} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Application Details
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Approve Ambassador Application</h1>
            <p className="text-sm text-gray-500 mt-1">Review and customize the approval email before sending</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">Email Sending Issue</h3>
                  <p className="text-sm text-red-700 mb-2">{error}</p>
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-xs text-red-600 mb-2 font-semibold">Troubleshooting steps:</p>
                    <ol className="text-xs text-red-600 list-decimal list-inside space-y-1">
                      <li>Check your server terminal/console for detailed error messages</li>
                      <li>Verify <code className="bg-red-100 px-1 rounded">RESEND_API_KEY</code> is set in environment variables</li>
                      <li>Go to <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline font-medium">resend.com/domains</a> and verify <code className="bg-red-100 px-1 rounded">mail.prepskul.com</code> domain</li>
                      <li>Check <a href="https://resend.com/emails" target="_blank" rel="noopener noreferrer" className="underline font-medium">resend.com/emails</a> to see if email was sent and delivery status</li>
                      <li>Ask the applicant to check their spam/junk folder</li>
                      <li>Verify the email address is correct: <strong>{ambassadorEmail}</strong></li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loadingData ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <p className="text-gray-600">Loading ambassador data...</p>
            </div>
          ) : (
          <>
          {/* Email Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <Label htmlFor="recipient" className="text-sm font-medium text-gray-700">Recipient</Label>
              <div className="mt-1 text-sm text-gray-900">
                {ambassadorName} &lt;{ambassadorEmail}&gt;
              </div>
            </div>

            <div>
              <Label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</Label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                placeholder="Email subject"
              />
            </div>

            <div>
              <Label htmlFor="body" className="text-sm font-medium text-gray-700">Message</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={20}
                className="mt-1 font-mono text-sm"
                placeholder="Email body"
              />
              <p className="mt-2 text-xs text-gray-500">
                You can edit this message before sending. The application will be marked as approved when you click "Send Approval Email".
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Link href={`/admin/ambassadors/${ambassadorId}`}>
                <Button variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button
                onClick={handleSend}
                disabled={loading || !subject.trim() || !body.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? 'Sending...' : 'Send Approval Email'}
              </Button>
            </div>
          </div>
          </>
          )}
        </div>
      </main>
    </div>
  );
}

