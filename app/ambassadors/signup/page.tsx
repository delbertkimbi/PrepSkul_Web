'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff } from 'lucide-react';
import AmbassadorHeader from '@/components/ambassador-header';

export default function AmbassadorSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const trimmed = email.trim();
      const checkRes = await fetch('/api/ambassadors/check-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const checkData = await checkRes.json();

      if (!checkData?.allowed || !checkData?.email) {
        setError(
          'No approved ambassador found for this email. Use the exact email from your approved application, or contact support.'
        );
        setLoading(false);
        return;
      }

      const { error: authError } = await supabase.auth.signUp({
        email: checkData.email,
        password,
        options: { emailRedirectTo: undefined },
      });

      if (authError) throw authError;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <AmbassadorHeader />
        <div className="flex-1 flex items-center justify-center py-12 px-4" style={{ background: 'linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%)' }}>
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Account created</h2>
              <p className="text-gray-600 text-sm mb-6">
                You can now sign in with your email and password.
              </p>
              <Link
                href="/ambassadors/login"
                className="inline-block w-full text-center text-white py-3 rounded-lg font-medium bg-primary hover:bg-primary/90"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AmbassadorHeader />
      <div className="flex-1 flex items-center justify-center py-12 px-4" style={{ background: 'linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%)' }}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
              <p className="text-gray-600 mt-2 text-sm">
                Use the <strong>same email</strong> you used in your ambassador application. Only approved ambassadors can create an account.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 rounded-lg font-medium disabled:opacity-50 transition-all bg-primary hover:bg-primary/90"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link href="/ambassadors/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
