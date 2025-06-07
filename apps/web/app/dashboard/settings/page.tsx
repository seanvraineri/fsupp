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
  const [genes, setGenes] = useState<string[]>([]);
  const [labs, setLabs] = useState<any | null>(null);

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

        // Fetch latest AI analysis for gene list
        const { data: analysis } = await supabase
          .from('ai_analyses')
          .select('relevant_genes')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        setGenes(analysis?.relevant_genes || []);

        // Fetch latest lab row
        const { data: latestLab } = await supabase
          .from('lab_biomarkers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        setLabs(latestLab);
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

        {/* Genetic highlights */}
        {genes.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Genetic Highlights</h2>
            <p className="text-sm">Key variants used in your current supplement plan:</p>
            <ul className="list-disc list-inside mt-2 text-sm space-y-1">
              {genes.map(g => (<li key={g}>{g}</li>))}
            </ul>
          </div>
        )}

        {/* Latest labs */}
        {labs && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Latest Lab Results</h2>
            <p className="text-sm mb-2 text-gray-500">{labs.lab_name || 'Lab'} – {labs.test_date ? new Date(labs.test_date).toLocaleDateString() : new Date(labs.created_at).toLocaleDateString()}</p>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              {Object.entries(labs).filter(([k,v])=>['vitamin_d','vitamin_b12','iron','ferritin','magnesium','cholesterol_total','hdl','ldl','triglycerides','glucose','hba1c','tsh'].includes(k) && v!==null).map(([k,v])=> (
                <div key={k} className="flex justify-between">
                  <span className="capitalize">{k.replace(/_/g,' ')}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
} 