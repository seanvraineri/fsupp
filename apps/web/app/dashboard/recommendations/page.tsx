"use client";
import { useEffect, useState } from 'react';
import DashboardShell from '../../components/DashboardShell';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AlertTriangle } from 'lucide-react';
import RecommendationCard, { RecWithProduct } from '../../components/RecommendationCard';
import FilterBar from '../../components/FilterBar';
import useSWR from 'swr';
import RecommendationModal from '../../components/RecommendationModal';

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
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<RecWithProduct | null>(null);

  const fetcher = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { recs: [], warnings: [] };
    const { data: analysis } = await supabase
      .from('ai_analyses')
      .select('id, interaction_warnings')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: recommendations } = await supabase
      .from('supplement_recommendations')
      .select('*, product_links(*)')
      .eq('user_id', user.id)
      .eq('analysis_id', analysis?.id || '')
      .eq('is_active', true)
      .order('priority_score');

    return { recs: recommendations ?? [], warnings: analysis?.interaction_warnings ?? [] };
  };

  const { data, isLoading, mutate } = useSWR('recommendations', fetcher);
  const [warnings, setWarnings] = useState<string[]>([]);
  const recsFiltered = (data?.recs ?? []).filter((r: any) => {
    if (filter === 'all') return true;
    if (filter === 'core') return r.priority_score <= 3;
    if (filter === 'optional') return r.priority_score > 3 && r.priority_score <= 6;
    return r.priority_score > 6; // experimental
  });

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Supplement Plan</h1>
          <button onClick={() => mutate()} className="px-3 py-1 rounded-md border text-sm">Refresh Plan</button>
        </div>

        <FilterBar value={filter} onChange={setFilter} />

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
          {recsFiltered.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} onDetails={() => setSelected(rec)} />
          ))}

          {recsFiltered.length === 0 && (
            <p className="text-gray-600 dark:text-gray-400">No recommendations yet. Complete your health assessment and upload data to generate personalized supplements.</p>
          )}
        </div>
      </div>
      {selected && (
        <RecommendationModal rec={selected} open={!!selected} onOpenChange={() => setSelected(null)} />
      )}
    </DashboardShell>
  );
} 