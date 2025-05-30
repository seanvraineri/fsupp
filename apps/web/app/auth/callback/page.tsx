"use client";
import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const handleOAuth = async () => {
      await supabase.auth.exchangeCodeForSession(window.location.href);
      router.replace('/dashboard');
    };
    handleOAuth();
  }, []);
  return <p className="p-8">Signing you in...</p>;
} 