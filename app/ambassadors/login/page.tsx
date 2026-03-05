'use client';


export default function AmbassadorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      const userEmail = data.user?.email?.trim();
      if (!userEmail) throw new Error('No email returned');

      const res = await fetch('/api/ambassadors/check-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      const checkData = await res.json();

      if (!checkData?.allowed) {
        await supabase.auth.signOut();
        throw new Error('No approved ambassador account found for this email.');
      }

      window.location.href = '/ambassadors/dashboard';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%)' }}>
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex flex-col items-center text-center mb-8 gap-3">
              <Image src="/logo.svg" alt="PrepSkul logo" width={48} height={48} />
              <h1 className="text-2xl font-bold text-gray-900">Ambassador Dashboard</h1>
              <p className="text-gray-600 mt-2">Sign in with the email you used in your ambassador application</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
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
                    placeholder="••••••••"
                    required
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

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 rounded-lg font-medium disabled:opacity-50 transition-all bg-primary hover:bg-primary/90"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="flex flex-col gap-2 text-center">
                <Link
                  href="/ambassadors/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Approved ambassadors only. Use the email from your application.
            </p>
            <p className="text-center text-sm text-gray-600 mt-2">
              Don&apos;t have an account yet?{' '}
              <Link href="/ambassadors/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
