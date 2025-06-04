"use client";
import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const handleOAuth = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error('OAuth callback error', error);
        router.replace(`/signin?error=${encodeURIComponent(error.message)}`);
      } else {
        router.replace('/dashboard');
      }
    };
    handleOAuth();
  }, []);
  return <p className="p-8">Signing you in...</p>;
} 