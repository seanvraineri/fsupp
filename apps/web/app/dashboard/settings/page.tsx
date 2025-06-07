"use client";
import { useEffect, useState } from 'react';
import DashboardShell from '../../components/DashboardShell';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SettingsPage() {
  const supabase = createClientComponentClient();
  const [assessment, setAssessment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Not signed in');
          return;
        }
        const { data, error } = await supabase
          .from('health_assessments')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_complete', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        setAssessment(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      // Placeholder: call your billing cancel function / stripe portal etc.
      alert('Subscription cancellation flow would start here.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>

        {/* Health Assessment */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Saved Health Assessment</h2>
          {loading && <p>Loading assessment…</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && !assessment && (
            <p>No completed assessment found. Complete the questionnaire to generate your personalised plan.</p>
          )}
          {assessment && (
            <div className="space-y-2 text-sm">
              <p><strong>Health Goals:</strong> {assessment.health_goals?.join(', ') || '—'}</p>
              <p><strong>Health Conditions:</strong> {assessment.health_conditions?.join(', ') || '—'}</p>
              <p><strong>Medications:</strong> {assessment.current_medications?.join(', ') || '—'}</p>
              <p><strong>Allergies:</strong> {assessment.allergies?.join(', ') || '—'}</p>
              <p><strong>Diet Type:</strong> {assessment.diet_type || '—'}</p>
              <p><strong>Activity Level:</strong> {assessment.activity_level || '—'}</p>
              <p className="text-gray-500">Created: {new Date(assessment.created_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Billing */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription</h2>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">Manage your subscription or cancel anytime.</p>
          <button
            disabled={cancelling}
            onClick={handleCancel}
            className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
          >
            {cancelling ? 'Processing…' : 'Cancel Subscription'}
          </button>
        </div>
      </div>
    </DashboardShell>
  );
} 