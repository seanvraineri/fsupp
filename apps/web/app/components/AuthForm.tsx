"use client";
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function AuthForm({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        // Note: User will need to confirm email before signing in
        setError('Check your email to confirm your account before signing in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {mode === 'signup' && (
        <div className="mb-6 p-4 bg-primary-from/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">$20/month</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Billed monthly • Cancel anytime</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-800"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-800"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-primary-from to-primary-to text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
        >
          {loading ? 'Loading...' : mode === 'signup' ? 'Create Account & Subscribe' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
          {' '}
          <a
            href={mode === 'signup' ? '/auth' : '/auth?mode=signup'}
            className="text-primary-from hover:underline"
          >
            {mode === 'signup' ? 'Sign in' : 'Sign up'}
          </a>
        </p>
      </div>

      {mode === 'signup' && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            By signing up, you agree to our subscription terms. You'll be charged $20/month after sign up.
            You can cancel anytime from your dashboard.
          </p>
        </div>
      )}
    </div>
  );
} 