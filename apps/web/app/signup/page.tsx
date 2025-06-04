"use client";
import { Suspense } from "react";
import Layout from "../components/Layout";
import AuthForm from "../components/AuthForm";
import Logo from "../components/Logo";

export default function SignUpPage() {
  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <Logo className="h-10 mx-auto" />
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Create Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            Precision supplement coaching for $20&nbsp;/&nbsp;month
          </p>
        </div>

        {/* Price Card */}
        <div className="mb-6 w-full max-w-md">
          <div className="rounded-lg bg-primary-from/5 p-4 text-center">
            <p className="uppercase tracking-wide text-sm font-medium text-primary-from mb-1">
              Precision Plan
            </p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
              $20 <span className="text-xl font-medium">/ month</span>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Billed today — cancel anytime.</p>
          </div>
        </div>

        {/* Sign-up form */}
        <Suspense fallback={<div className="animate-pulse">Loading…</div>}>
          <AuthForm mode="signup" />
        </Suspense>

        {/* Benefits */}
        <div className="mt-10 w-full max-w-md">
          <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">
            What you get
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
            <li>✅ Personalised supplement plan in &lt; 5 min</li>
            <li>✅ AI chat concierge</li>
            <li>✅ Lab &amp; DNA integration</li>
            <li>✅ Cancel anytime in Settings</li>
          </ul>
        </div>

        {/* Support footer */}
        <p className="mt-12 text-xs text-gray-500 dark:text-gray-400 text-center">
          Need help? Email <a href="mailto:support@suppscribe.com" className="underline">support@suppscribe.com</a> — replies within a day.
        </p>
      </div>
    </Layout>
  );
}
