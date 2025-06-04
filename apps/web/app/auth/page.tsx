"use client";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthForm from '../components/AuthForm';
import Layout from '../components/Layout';

function AuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as 'signin' | 'signup' | null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
        </h2>
        <AuthForm mode={mode === 'signup' ? 'signup' : 'signin'} />
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-from mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }>
        <AuthContent />
      </Suspense>
    </Layout>
  );
} 
