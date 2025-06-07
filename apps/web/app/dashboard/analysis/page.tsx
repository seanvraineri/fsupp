"use client";
import { useState } from 'react';
import DashboardShell from '../../components/DashboardShell';
import GeneticDataCard from '../../components/GeneticDataCard';
import BiomarkerDataCard from '../../components/BiomarkerDataCard';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import useSWR from 'swr';
import { Database, RefreshCw, Upload } from 'lucide-react';
import Link from 'next/link';

// Import our comprehensive databases from client-accessible location
import { SNP_DATABASE } from '../../../lib/databases/snp_database';
import { BIOMARKER_DATABASE } from '../../../lib/databases/biomarker_database';
import { EXTENDED_BIOMARKER_DATABASE } from '../../../lib/databases/extended_biomarker_database';

interface AnalysisData {
  geneticData: any[];
  labData: any[];
  isLoading: boolean;
  error: string | null;
}

export default function AnalysisPage() {
  const supabase = createClientComponentClient();
  const [refreshing, setRefreshing] = useState(false);

  const fetcher = async (): Promise<AnalysisData> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Auth error: ${authError.message}`);
      }
      
      if (!user) throw new Error('Not authenticated');

      // Fetch genetic data
      const { data: geneticData, error: geneticError } = await supabase
        .from('genetic_markers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (geneticError) {
        console.error('Genetic data error:', geneticError);
        throw new Error(`Genetic data error: ${geneticError.message}`);
      }

      // Fetch lab data
      const { data: labData, error: labError } = await supabase
        .from('lab_biomarkers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (labError) {
        console.error('Lab data error:', labError);
        throw new Error(`Lab data error: ${labError.message}`);
      }

      return {
        geneticData: geneticData || [],
        labData: labData || [],
        isLoading: false,
        error: null
      };
    } catch (error) {
      console.error('Fetcher error:', error);
      return {
        geneticData: [],
        labData: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const { data, mutate, isLoading } = useSWR('analysis-data', fetcher);

  const refreshAnalysis = async () => {
    setRefreshing(true);
    try {
      await mutate();
    } finally {
      setRefreshing(false);
    }
  };

  // Combine biomarker databases
  const combinedBiomarkerDatabase = { ...BIOMARKER_DATABASE, ...EXTENDED_BIOMARKER_DATABASE };

  if (isLoading || !data) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading your comprehensive health analysis...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const hasGeneticData = data.geneticData.length > 0;
  const hasLabData = data.labData.length > 0;
  const hasAnyData = hasGeneticData || hasLabData;

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Comprehensive Health Analysis</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Deep dive into your genetic variants and biomarker patterns
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refreshAnalysis}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {data.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <p className="text-red-700 dark:text-red-300">Error loading data: {data.error}</p>
          </div>
        )}

        {!hasAnyData && !data.error && (
          <div className="text-center py-16">
            <Upload className="w-16 h-16 mx-auto mb-6 text-gray-400" />
            <h2 className="text-2xl font-semibold mb-4">No Health Data Uploaded</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Upload your genetic test results and lab work to see comprehensive analysis with our expanded knowledge base covering hundreds of genetic variants and biomarkers.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard/upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
              >
                <Upload className="w-4 h-4" />
                Upload Health Data
              </Link>
              <Link
                href="/dashboard/tests"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Order Tests
              </Link>
            </div>
          </div>
        )}

        {hasAnyData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Object.keys(SNP_DATABASE).length}
                </div>
                <div className="text-purple-800 dark:text-purple-200 font-medium">
                  Genetic Variants in Database
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                  Covering 20+ metabolic pathways
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Object.keys(combinedBiomarkerDatabase).length}
                </div>
                <div className="text-blue-800 dark:text-blue-200 font-medium">
                  Biomarkers in Database
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Complete Blood Count, CMP, hormones & more
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {hasGeneticData && hasLabData ? '360°' : hasGeneticData ? 'Genetic' : 'Lab'}
                </div>
                <div className="text-green-800 dark:text-green-200 font-medium">
                  Analysis Coverage
                </div>
                <div className="text-sm text-green-600 dark:text-green-300 mt-1">
                  {hasGeneticData && hasLabData 
                    ? 'Complete genetic & biomarker analysis'
                    : hasGeneticData 
                    ? 'Genetic variants analyzed'
                    : 'Biomarker patterns analyzed'
                  }
                </div>
              </div>
            </div>

            {/* Genetic Data Section */}
            {hasGeneticData && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold">Genetic Analysis</h2>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm rounded-full">
                    {data.geneticData.length} file{data.geneticData.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <GeneticDataCard 
                  geneticData={data.geneticData} 
                  snpDatabase={SNP_DATABASE}
                />
              </div>
            )}

            {/* Biomarker Data Section */}
            {hasLabData && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold">Biomarker Analysis</h2>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                    {data.labData.length} test{data.labData.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <BiomarkerDataCard 
                  labData={data.labData} 
                  biomarkerDatabase={combinedBiomarkerDatabase}
                />
              </div>
            )}

            {/* Data Upload Encouragement */}
            {(hasGeneticData && !hasLabData) || (!hasGeneticData && hasLabData) ? (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
                <div className="flex items-center gap-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Complete Your Analysis
                    </h3>
                    <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
                      {hasGeneticData 
                        ? 'Upload your lab results to see how your genetic variants affect your current biomarker levels.'
                        : 'Upload your genetic test results to understand the genetic basis of your biomarker patterns.'
                      }
                    </p>
                    <Link
                      href="/dashboard/upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      <Upload className="w-4 h-4" />
                      Upload {hasGeneticData ? 'Lab Results' : 'Genetic Data'}
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Knowledge Base Info */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">📚 Our Comprehensive Knowledge Base</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium mb-2 text-purple-800 dark:text-purple-200">Genetic Variants Covered:</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Methylation pathway (MTHFR, MTRR, MTR)</li>
                    <li>• Detoxification (COMT, MAOA, CYP2D6, NAT2, GSTP1)</li>
                    <li>• Cardiovascular health (APOE, CAD risk variants)</li>
                    <li>• Vitamin D metabolism (VDR, GC)</li>
                    <li>• Iron metabolism (HFE, TMPRSS6)</li>
                    <li>• Caffeine sensitivity (CYP1A2)</li>
                    <li>• Inflammation markers (IL6, PPARG)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Biomarker Categories:</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Complete Blood Count (CBC)</li>
                    <li>• Comprehensive Metabolic Panel (CMP)</li>
                    <li>• Lipid profiles & cardiovascular markers</li>
                    <li>• Hormone panels (thyroid, sex hormones)</li>
                    <li>• Vitamin & mineral status</li>
                    <li>• Iron studies & anemia markers</li>
                    <li>• Inflammatory & immune markers</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                Each variant and biomarker includes detailed supplement protocols, dosage recommendations, timing, interactions, contraindications, and research citations.
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
} 