"use client";
import { useState } from 'react';
import DashboardShell from '../../components/DashboardShell';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AlertTriangle } from 'lucide-react';
import RecommendationCard, { RecWithProduct } from '../../components/RecommendationCard';
import FilterBar from '../../components/FilterBar';
import useSWR from 'swr';
import RecommendationModal from '../../components/RecommendationModal';
import { useAdherence } from '../../../utils/useAdherence';
import AdherenceRing from '../../components/AdherenceRing';

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

  const { percent } = useAdherence();

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

    const { count: markersCount } = await supabase.from('genetic_markers').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    const { count: labsCount } = await supabase.from('lab_biomarkers').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

    const { data: recommendations } = await supabase
      .from('supplement_recommendations')
      .select('*, product_links(*)')
      .eq('user_id', user.id)
      .eq('analysis_id', analysis?.id || '')
      .eq('is_active', true)
      .order('priority_score');

    return { recs: recommendations ?? [], warnings: analysis?.interaction_warnings ?? [], markers_count: markersCount ?? 0, labs_count: labsCount ?? 0 };
  };

  const { data, isLoading, mutate } = useSWR('recommendations', fetcher);
  const warnings = data?.warnings ?? [];
  const recsFiltered = (data?.recs ?? []).filter((r: any) => {
    if (filter === 'all') return true;
    if (filter === 'core') return r.priority_score <= 3;
    if (filter === 'optional') return r.priority_score > 3 && r.priority_score <= 6;
    return r.priority_score > 6; // experimental
  });

  // banners helpers
  const noRecs = (data?.recs ?? []).length === 0;
  const noUploads = (data?.markers_count ?? 0) === 0 && (data?.labs_count ?? 0) === 0;

  if (isLoading) return <div className="p-8">Loading...</div>;

  // Show CTA if user finished assessment but has no plan yet
  if (noRecs) {
    return (
      <DashboardShell>
        <div className="max-w-md mx-auto text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Get your starter supplement plan</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You can always upload labs or genetics later to refine accuracy.</p>
          <button
            onClick={async () => {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;
              await supabase.functions.invoke('generate_analysis', { body: { user_id: user.id } });
              mutate();
            }}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary-from to-primary-to text-white font-medium"
          >
            Generate My Plan
          </button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AdherenceRing percent={percent} size={56} />
            <h1 className="text-3xl font-bold">Your Supplement Plan</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => mutate()} className="px-3 py-1 rounded-md border text-sm">Refresh Plan</button>
            <button 
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                try {
                  await supabase.functions.invoke('populate_existing_links', { 
                    body: { user_id: user.id } 
                  });
                  mutate(); // Refresh to show new links
                } catch (error) {
                  console.error('Error populating links:', error);
                }
              }}
              className="px-3 py-1 rounded-md border text-sm bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              Fix Links
            </button>
          </div>
        </div>

        <FilterBar value={filter} onChange={setFilter} />

        {warnings.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h2 className="font-semibold text-red-700 dark:text-red-300 mb-1">Interaction Warnings</h2>
                <ul className="list-disc list-inside text-red-700 dark:text-red-300 space-y-1 text-sm">
                  {warnings.map((w: string) => <li key={w}>{w}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* accuracy banner */}
        {noUploads && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm">Upload your genetics or recent labs to upgrade plan accuracy and get genotype-specific dosing.</p>
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