'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function AmbassadorForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/ambassadors/set-password`,
      });
      if (err) throw err;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%)' }}>
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <div className="flex justify-center mb-4">
                <Image src="/logo.svg" alt="PrepSkul logo" width={48} height={48} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600 text-sm mb-6">
                We sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
              </p>
              <Link
                href="/ambassadors/login"
                className="inline-block text-primary font-medium hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%)' }}>
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex flex-col items-center text-center mb-8 gap-3">
              <Image src="/logo.svg" alt="PrepSkul logo" width={48} height={48} />
              <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
              <p className="text-gray-600 mt-2 text-sm">
                Enter the email you use for the Ambassador Dashboard. We&apos;ll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 rounded-lg font-medium disabled:opacity-50 transition-all bg-primary hover:bg-primary/90"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              <Link href="/ambassadors/login" className="text-primary font-medium hover:underline">
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
