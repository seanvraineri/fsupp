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
    if (!user) return { recs: [], warnings: [], health_goal_focus: null };
    
    const { data: analysis } = await supabase
      .from('ai_analyses')
      .select('id, interaction_warnings, analysis_summary, relevant_genes, relevant_biomarkers')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { count: markersCount } = await supabase.from('genetic_markers').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    const { count: labsCount } = await supabase.from('lab_biomarkers').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

    // Get recommendations with their product links
    const { data: recommendations } = await supabase
      .from('supplement_recommendations')
      .select(`
        *,
        product_links:product_links!recommendation_id(
          id,
          product_name,
          brand,
          product_url,
          image_url,
          price,
          verified
        )
      `)
      .eq('user_id', user.id)
      .eq('analysis_id', analysis?.id || '')
      .eq('is_active', true)
      .order('priority_score', { ascending: false });

    return { 
      recs: recommendations ?? [], 
      warnings: analysis?.interaction_warnings ?? [], 
      analysis_summary: analysis?.analysis_summary || null,
      relevant_genes: analysis?.relevant_genes || [],
      relevant_biomarkers: analysis?.relevant_biomarkers || [],
      markers_count: markersCount ?? 0, 
      labs_count: labsCount ?? 0 
    };
  };

  const populateProductLinks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    try {
      console.log('Populating product links for existing recommendations...');
      const { data, error } = await supabase.functions.invoke('populate_recommendation_links', {
        body: { user_id: user.id }
      });
      
      if (error) {
        console.error('Error populating product links:', error);
      } else {
        console.log('Product links populated:', data);
        mutate(); // Refresh the data
      }
    } catch (error) {
      console.error('Error calling populate_recommendation_links:', error);
    }
  };

  const { data, isLoading, mutate } = useSWR('recommendations', fetcher);
  const warnings = data?.warnings ?? [];
  const recsFiltered = (data?.recs ?? []).filter((r: any) => {
    if (filter === 'all') return true;
    if (filter === 'high') return r.priority_score >= 5;
    if (filter === 'medium') return r.priority_score >= 3 && r.priority_score < 5;
    if (filter === 'low') return r.priority_score < 3;
    return true;
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
            <button 
              onClick={populateProductLinks} 
              className="px-3 py-1 rounded-md border text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Link Products
            </button>
            <button onClick={() => mutate()} className="px-3 py-1 rounded-md border text-sm">Refresh Plan</button>
          </div>
        </div>

        <FilterBar value={filter} onChange={setFilter} />

        {/* AI Analysis Summary */}
        {data?.analysis_summary && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
            <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              🎯 Your Personalized Plan Analysis
            </h2>
            <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">{data.analysis_summary}</p>
          </div>
        )}

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

        {data?.relevant_genes?.length > 0 && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
            <h2 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">Key Genetic Insights</h2>
            <p className="text-purple-800 dark:text-purple-200 text-sm">
              {data.relevant_genes.join(', ')}
            </p>
          </div>
        )}

        {data?.relevant_biomarkers?.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
            <h2 className="font-semibold text-green-800 dark:text-green-200 mb-1">Key Biomarker Findings</h2>
            <p className="text-green-800 dark:text-green-200 text-sm">
              {data.relevant_biomarkers.join(', ')}
            </p>
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
