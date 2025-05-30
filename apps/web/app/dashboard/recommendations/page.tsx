"use client";
import { useEffect, useState } from 'react';
import DashboardShell from '../../components/DashboardShell';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AlertTriangle } from 'lucide-react';
import RecommendationCard, { RecWithProduct } from '../../components/RecommendationCard';

interface Recommendation {
  id: string;
  supplement_name: string;
  dosage_amount: number;
  dosage_unit: string;
  frequency: string;
  recommendation_reason: string;
  evidence_quality: string;
  contraindications: string[] | null;
}

export default function RecommendationsPage() {
  const supabase = createClientComponentClient();
  const [recs, setRecs] = useState<RecWithProduct[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      // Latest analysis id & warnings
      const { data: analysis } = await supabase
        .from('ai_analyses')
        .select('id, interaction_warnings')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (analysis?.interaction_warnings) {
        setWarnings(analysis.interaction_warnings);
      }

      const { data: recommendations } = await supabase
        .from('supplement_recommendations')
        .select('*, product_links(*)')
        .eq('user_id', user.id)
        .eq('analysis_id', analysis?.id || '')
        .eq('is_active', true)
        .order('priority_score', { ascending: false });

      setRecs(recommendations ?? []);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Your Supplement Plan</h1>

        {warnings.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h2 className="font-semibold text-red-700 dark:text-red-300 mb-1">Interaction Warnings</h2>
                <ul className="list-disc list-inside text-red-700 dark:text-red-300 space-y-1 text-sm">
                  {warnings.map((w) => <li key={w}>{w}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recs.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}

          {recs.length === 0 && (
            <p className="text-gray-600 dark:text-gray-400">No recommendations yet. Complete your health assessment and upload data to generate personalized supplements.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
} 