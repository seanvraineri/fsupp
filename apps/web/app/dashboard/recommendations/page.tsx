"use client";
import { useState } from 'react';
import DashboardShell from '../../components/DashboardShell';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AlertTriangle, Database, Dna, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import RecommendationCard, { RecWithProduct } from '../../components/RecommendationCard';
import FilterBar from '../../components/FilterBar';
import useSWR from 'swr';
import RecommendationModal from '../../components/RecommendationModal';
import { useAdherence } from '../../../utils/useAdherence';
import AdherenceRing from '../../components/AdherenceRing';
import Link from 'next/link';

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
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);

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

    // Get counts using proper count queries with error handling
    const { count: markersCount, error: markersCountError } = await supabase
      .from('genetic_data')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (markersCountError) {
      console.error('Error counting genetic data:', markersCountError);
    }

    const { count: labsCount, error: labsCountError } = await supabase
      .from('lab_data')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (labsCountError) {
      console.error('Error counting lab data:', labsCountError);
    }

    // Get genetic and lab data counts with SNP/biomarker details
    const { data: geneticDetails, error: geneticError } = await supabase
      .from('genetic_data')
      .select('snp_count, snp_data')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (geneticError) {
      console.error('Error fetching genetic details:', geneticError);
    }

    const { data: labDetails, error: labError } = await supabase
      .from('lab_data')
      .select('biomarker_count, biomarker_data')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (labError) {
      console.error('Error fetching lab details:', labError);
    }

    // Get recommendations for this user
    let recommendations = [];
    try {
      const { data: recs, error } = await supabase
        .from('supplement_recommendations')
        .select(`
          *,
          product_links!recommendation_id(
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
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) {
        console.error('Error fetching recommendations:', error);
        recommendations = [];
      } else {
        recommendations = recs || [];
      }
    } catch (err) {
      console.error('Exception fetching recommendations:', err);
      recommendations = [];
    }

    return { 
      recs: recommendations, 
      warnings: analysis?.interaction_warnings ?? [], 
      analysis_summary: analysis?.analysis_summary || null,
      relevant_genes: analysis?.relevant_genes || [],
      relevant_biomarkers: analysis?.relevant_biomarkers || [],
      markers_count: markersCount || 0, 
      labs_count: labsCount || 0,
      genetic_snp_count: geneticDetails?.snp_count || 0,
      analyzed_snps: geneticDetails?.snp_count || 0, // Use the direct count instead of calculating from JSON
      lab_biomarker_count: labDetails?.biomarker_count || 0,
      analyzed_biomarkers: labDetails?.biomarker_count || 0 // Use the direct count instead of calculating from JSON
    };
  };

  const { data, isLoading, mutate } = useSWR('recommendations', fetcher);
  const warnings = data?.warnings ?? [];
  const recsFiltered = (data?.recs ?? []).filter((r: any) => {
    if (filter === 'all') return true;
    if (filter === 'high') return r.priority >= 3;
    if (filter === 'medium') return r.priority == 2;
    if (filter === 'low') return r.priority == 1;
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
            <Link
              href="/dashboard/analysis"
              className="px-3 py-1 rounded-md border text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              View Analysis
            </Link>
            <button 
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                await supabase.functions.invoke('generate_analysis', { body: { user_id: user.id } });
                mutate();
              }}
              className="px-3 py-1 rounded-md border text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Refresh Analysis
            </button>
            <button onClick={() => mutate()} className="px-3 py-1 rounded-md border text-sm">Refresh Plan</button>
          </div>
        </div>

        <FilterBar value={filter} onChange={setFilter} />

        {/* 🎯 MAIN FOCUS: SUPPLEMENT RECOMMENDATIONS */}
        <div className="space-y-6">
          {/* Enhanced Personalization Header */}
          <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-green-900/20 border-2 border-purple-200 dark:border-purple-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎯</span>
              <h2 className="text-xl font-bold text-purple-800 dark:text-purple-200">Your Personalized Supplements</h2>
            </div>
            <p className="text-purple-700 dark:text-purple-300 text-sm leading-relaxed mb-3">
              These supplements are specifically chosen for <strong>YOUR</strong> unique biology. We analyzed your genetics, lab results, and health goals to determine exactly what we think will work best for you.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs">
                {(data?.markers_count ?? 0) > 0 && (
                  <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                    <Dna className="w-4 h-4" />
                    <span>{data?.analyzed_snps?.toLocaleString() ?? 0} genetic variants analyzed from your file</span>
                  </div>
                )}
                {(data?.labs_count ?? 0) > 0 && (
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Activity className="w-4 h-4" />
                    <span>{data?.analyzed_biomarkers ?? 0} biomarkers analyzed from your labs</span>
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                {recsFiltered.length} personalized recommendations
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {recsFiltered.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} onDetails={() => setSelected(rec)} />
            ))}

            {recsFiltered.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No recommendations match your current filter.</p>
                <button 
                  onClick={() => setFilter('all')}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Show all supplements
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Analysis Details Section */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <button 
            onClick={() => setShowAnalysisDetails(!showAnalysisDetails)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="font-medium">Analysis Details</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View genetic insights, biomarker findings, and safety information
                </p>
              </div>
            </div>
            {showAnalysisDetails ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {showAnalysisDetails && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-6">
              {/* Enhanced Data Coverage Display */}
              {!noUploads && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(data?.markers_count ?? 0) > 0 && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Dna className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-purple-800 dark:text-purple-200">Genetic Analysis</h3>
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">
                        <div className="flex justify-between">
                          <span>Total SNPs analyzed:</span>
                          <span className="font-medium">{(data?.genetic_snp_count ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Known variants found:</span>
                          <span className="font-medium">{data?.analyzed_snps ?? 0}</span>
                        </div>
                        <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                          Comprehensive analysis: 113+ variants across methylation, detoxification, neurotransmitters, cardiovascular, vitamin metabolism, iron metabolism, drug metabolism & more
                        </div>
                      </div>
                    </div>
                  )}

                  {(data?.labs_count ?? 0) > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200">Lab Analysis</h3>
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        <div className="flex justify-between">
                          <span>Total biomarkers tested:</span>
                          <span className="font-medium">{data?.lab_biomarker_count ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Analyzed markers:</span>
                          <span className="font-medium">{data?.analyzed_biomarkers ?? 0}</span>
                        </div>
                        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                          Comprehensive analysis: CBC, CMP, lipid panels, thyroid, hormones, vitamins (D,B12,folate), minerals, inflammatory markers, liver function, kidney function & more
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Analysis Summary */}
              {data?.analysis_summary && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
                  <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    🎯 Your Personalized Plan Analysis
                  </h2>
                  <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">{data?.analysis_summary}</p>
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
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-blue-800 dark:text-blue-200 text-sm font-medium mb-1">
                        Upgrade to Precision Analysis
                      </p>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        Upload your genetics or recent labs to get genotype-specific dosing and comprehensive analysis of 22+ genetic variants and 40+ biomarkers.
                      </p>
                      <Link
                        href="/dashboard/analysis"
                        className="inline-flex items-center gap-2 mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <Database className="w-4 h-4" />
                        Learn More About Our Analysis
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {data?.relevant_genes?.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
                  <h2 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">Key Genetic Insights</h2>
                  <p className="text-purple-800 dark:text-purple-200 text-sm">
                    {data?.relevant_genes?.join(', ')}
                  </p>
                  <Link
                    href="/dashboard/analysis"
                    className="inline-flex items-center gap-1 mt-2 text-purple-600 hover:text-purple-700 text-sm"
                  >
                    <Dna className="w-4 h-4" />
                    View detailed genetic analysis
                  </Link>
                </div>
              )}

              {data?.relevant_biomarkers?.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                  <h2 className="font-semibold text-green-800 dark:text-green-200 mb-1">Key Biomarker Findings</h2>
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    {data?.relevant_biomarkers?.join(', ')}
                  </p>
                  <Link
                    href="/dashboard/analysis"
                    className="inline-flex items-center gap-1 mt-2 text-green-600 hover:text-green-700 text-sm"
                  >
                    <Activity className="w-4 h-4" />
                    View detailed biomarker analysis
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {selected && (
        <RecommendationModal rec={selected} open={!!selected} onOpenChange={() => setSelected(null)} />
      )}
    </DashboardShell>
  );
} 
