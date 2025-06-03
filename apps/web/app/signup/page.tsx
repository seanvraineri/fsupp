import { Suspense } from 'react';
import Layout from '../components/Layout';
import AuthForm from '../components/AuthForm';

export default function SignUpPage() {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <Suspense fallback={
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-from mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        }>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </Layout>
  );
}