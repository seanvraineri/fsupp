"use client";
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AuthForm({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4
  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const search = useSearchParams();
  const initialError = search.get('error');
  const [error, setError] = useState<string | null>(initialError);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // simple strength calc
  useEffect(()=>{
    let score = 0;
    if(password.length >= 8) score++;
    if(/[0-9]/.test(password)) score++;
    if(/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    if(/[A-Z]/.test(password)) score++;
    setPasswordStrength(score);
  },[password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        // Ensure form complete
        if(passwordStrength<3){
          setError('Password is too weak.');
          setLoading(false);
          return;
        }
        if(password!==confirmPassword){
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        if(!agreeTerms){
          setError('You must agree to the terms.');
          setLoading(false);
          return;
        }
        if(!/^\+?[0-9]{7,15}$/.test(phone)){
          setError('Enter a valid phone number.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { phone },
          },
        });
        if (error) {
          if (error.message && error.message.toLowerCase().includes('registered')) {
            // User exists – try sign-in instead
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) throw signInError;
            router.push('/dashboard');
            return;
          }
          throw error;
        }
        if (data?.session) {
          // email confirmations disabled; user already signed in
          router.push('/dashboard');
        } else {
          // confirmations still enabled
          setError('Check your email to confirm your account before signing in.');
        }
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
        
        {/* phone */}
        {mode==='signup' && (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e)=>setPhone(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-800"
            />
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword?"text":"password"}
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-800"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={()=>setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
          {/* strength bar – only show once user starts typing */}
          {password.length>0 && (
            <div className="mt-2 h-2 w-full bg-gray-200 rounded">
              <div
                className={`h-full rounded ${passwordStrength>=3?'bg-green-500':passwordStrength===2?'bg-yellow-500':'bg-red-500'}`}
                style={{width:`${(passwordStrength/4)*100}%`}}
              />
            </div>
          )}
        </div>

        {mode==='signup' && (
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e)=>setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-800"
            />
          </div>
        )}

        {mode==='signup' && (
          <div>
            <button type="button" className="text-sm text-primary-from underline" onClick={()=>setCouponOpen(!couponOpen)}>
              {couponOpen?"Hide code":"Have a code?"}
            </button>
            {couponOpen && (
              <input type="text" placeholder="Coupon code" value={coupon} onChange={e=>setCoupon(e.target.value)} className="mt-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-800" />
            )}
          </div>
        )}

        {mode==='signup' && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <input type="checkbox" id="agree" checked={agreeTerms} onChange={e=>setAgreeTerms(e.target.checked)} className="h-4 w-4" />
            <label htmlFor="agree">
              I agree to the <a href="/terms" className="underline">Terms of Service</a> &amp; <a href="/privacy" className="underline">Privacy Policy</a>
            </label>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (mode==='signup' && (!agreeTerms || passwordStrength<3 || password!==confirmPassword))}
          className="w-full py-3 bg-gradient-to-r from-primary-from to-primary-to text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={18}/>} {loading ? 'Processing…' : mode === 'signup' ? 'Create Account & Subscribe' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {mode === 'signup' ? 'Already have an account?' : "Don&apos;t have an account?"}
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
        <div className="mt-8">
          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-gray-500 text-xs">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div className="grid gap-3">
            <button type="button" className="w-full border border-gray-300 rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
              Continue with Google
            </button>
            <button type="button" className="w-full border border-gray-300 rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
              Continue with Apple
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 