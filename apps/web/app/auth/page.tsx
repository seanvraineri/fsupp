"use client";
import { useSearchParams } from 'next/navigation';
import AuthForm from '../components/AuthForm';
import Layout from '../components/Layout';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as 'signin' | 'signup' | null;

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <AuthForm mode={mode === 'signup' ? 'signup' : 'signin'} />
        </div>
      </div>
    </Layout>
  );
} 