"use client";
import { useState, useEffect } from 'react';
import DashboardShell from '../../components/DashboardShell';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import useSWR from 'swr';
import { Database, RefreshCw, Upload, Dna, Activity, Shield, Target, BookOpen, AlertTriangle, CheckCircle, Info, Beaker, TrendingUp, TrendingDown, Minus, Search, Archive as ArchiveIcon, Zap, Heart, Brain, Leaf, Flame, Calendar, FileText, User, Download, Eye, ChevronDown, ChevronRight, HelpCircle, Star } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface AnalysisData {
  analysis: any | null;
  geneticData: any[];
  labData: any[];
  isLoading: boolean;
  error: string | null;
}

// Helper function to extract gene name from rsID
const extractGeneFromRsid = (rsid: string): string => {
  // Common gene-rsID mappings
  const geneMap: { [key: string]: string } = {
    'rs1801133': 'MTHFR',
    'rs1801131': 'MTHFR', 
    'rs4680': 'COMT',
    'rs2228570': 'VDR',
    'rs731236': 'VDR',
    'rs10735810': 'VDR',
    'rs1544410': 'VDR',
    'rs429358': 'APOE',
    'rs7412': 'APOE',
    'rs174547': 'FADS1',
    'rs174537': 'FADS1',
    'rs6265': 'BDNF',
    'rs1042713': 'ADRB2',
    'rs1042714': 'ADRB2',
    'rs1800497': 'DRD2',
    'rs4988235': 'LCT',
    'rs662': 'PON1',
    'rs854560': 'PON1',
    'rs4244285': 'CYP2C19',
    'rs4986893': 'CYP2C19',
    'rs12248560': 'CYP2C19',
    'rs776746': 'CYP3A5',
    'rs28399504': 'CYP2D6',
    'rs3892097': 'CYP2D6',
    'rs1065852': 'CYP2D6',
    'rs5030655': 'CYP2D6',
    'rs1799853': 'CYP2C9',
    'rs1057910': 'CYP2C9',
    'rs9923231': 'VKORC1',
    'rs2108622': 'CYP4F2'
  };
  
  return geneMap[rsid] || 'Unknown';
};

// Helper function to extract units for biomarkers
const extractBiomarkerUnit = (biomarkerName: string): string => {
  const unitMap: { [key: string]: string } = {
    'vitamin_d': 'ng/mL',
    'vitamin_b12': 'pg/mL',
    'folate': 'ng/mL',
    'iron': 'μg/dL',
    'ferritin': 'ng/mL',
    'magnesium': 'mg/dL',
    'zinc': 'μg/dL',
    'total_cholesterol': 'mg/dL',
    'ldl_cholesterol': 'mg/dL',
    'hdl_cholesterol': 'mg/dL',
    'triglycerides': 'mg/dL',
    'glucose': 'mg/dL',
    'hba1c': '%',
    'tsh': 'mIU/L',
    'free_t4': 'ng/dL',
    'free_t3': 'pg/mL',
    'cortisol': 'μg/dL',
    'testosterone': 'ng/dL',
    'estradiol': 'pg/mL',
    'crp': 'mg/L',
    'homocysteine': 'μmol/L'
  };
  
  return unitMap[biomarkerName.toLowerCase()] || '';
};

// Helper function to assess biomarker status
const assessBiomarkerStatus = (biomarkerName: string, value: number): string => {
  // Simplified optimal ranges - in production this should use the biomarker database
  const ranges: { [key: string]: { low: number; high: number } } = {
    'vitamin_d': { low: 30, high: 100 },
    'vitamin_b12': { low: 300, high: 900 },
    'folate': { low: 4, high: 20 },
    'iron': { low: 60, high: 170 },
    'ferritin': { low: 15, high: 150 },
    'magnesium': { low: 1.7, high: 2.2 },
    'total_cholesterol': { low: 125, high: 200 },
    'ldl_cholesterol': { low: 50, high: 100 },
    'hdl_cholesterol': { low: 40, high: 80 },
    'triglycerides': { low: 50, high: 150 },
    'glucose': { low: 70, high: 99 },
    'hba1c': { low: 4.0, high: 5.6 },
    'tsh': { low: 0.5, high: 3.0 },
    'crp': { low: 0, high: 3.0 }
  };
  
  const range = ranges[biomarkerName.toLowerCase()];
  if (!range) return 'Unknown';
  
  if (value < range.low) return 'Low';
  if (value > range.high) return 'High';
  return 'Optimal';
};

// Sleek, professional color system with modern palette
const HEALTH_SYSTEMS = {
  'Methylation': {
    color: 'slate',
    icon: Dna,
    gradient: 'from-slate-600 to-slate-800',
    bgGradient: 'from-slate-50 to-slate-100',
    darkBgGradient: 'from-slate-800/10 to-slate-900/10',
    genes: ['MTHFR', 'COMT', 'MTR', 'MTRR'],
    biomarkers: ['folate', 'vitamin_b12', 'homocysteine', 'sam_same'],
    description: 'DNA repair, neurotransmitter production, and cellular detoxification',
    importance: 'critical',
    keyFunctions: ['DNA synthesis', 'Neurotransmitter metabolism', 'Detox pathways'],
    riskFactors: ['Folate deficiency', 'B12 deficiency', 'High homocysteine']
  },
  'Cardiovascular': {
    color: 'rose', 
    icon: Heart,
    gradient: 'from-rose-500 to-rose-700',
    bgGradient: 'from-rose-50 to-rose-100',
    darkBgGradient: 'from-rose-800/10 to-rose-900/10',
    genes: ['APOE', 'CETP', 'PON1'],
    biomarkers: ['total_cholesterol', 'ldl_cholesterol', 'hdl_cholesterol', 'triglycerides', 'homocysteine', 'crp'],
    description: 'Heart health, circulation, lipid metabolism, and vascular function',
    importance: 'critical',
    keyFunctions: ['Cholesterol transport', 'Arterial health', 'Blood pressure regulation'],
    riskFactors: ['High LDL', 'Low HDL', 'Elevated triglycerides', 'Inflammation']
  },
  'Detoxification': {
    color: 'emerald',
    icon: Leaf,
    gradient: 'from-emerald-500 to-emerald-700',
    bgGradient: 'from-emerald-50 to-emerald-100',
    darkBgGradient: 'from-emerald-800/10 to-emerald-900/10',
    genes: ['CYP2D6', 'CYP2C19', 'CYP2C9', 'CYP3A5', 'GST', 'NAT2'],
    biomarkers: ['liver_enzymes', 'bilirubin', 'creatinine'],
    description: 'Processing and elimination of toxins, drugs, and metabolic waste',
    importance: 'high',
    keyFunctions: ['Drug metabolism', 'Toxin elimination', 'Liver function'],
    riskFactors: ['Elevated liver enzymes', 'Poor drug clearance', 'Toxin accumulation']
  },
  'Inflammation': {
    color: 'amber',
    icon: Flame,
    gradient: 'from-amber-500 to-amber-700',
    bgGradient: 'from-amber-50 to-amber-100',
    darkBgGradient: 'from-amber-800/10 to-amber-900/10',
    genes: ['TNF', 'IL6', 'IL1B'],
    biomarkers: ['crp', 'esr', 'white_blood_cell_count'],
    description: 'Immune response, inflammatory processes, and tissue repair',
    importance: 'high',
    keyFunctions: ['Immune defense', 'Tissue healing', 'Inflammatory response'],
    riskFactors: ['Chronic inflammation', 'Elevated CRP', 'Autoimmune activity']
  },
  'Neurotransmitters': {
    color: 'violet',
    icon: Brain,
    gradient: 'from-violet-500 to-violet-700',
    bgGradient: 'from-violet-50 to-violet-100',
    darkBgGradient: 'from-violet-800/10 to-violet-900/10',
    genes: ['COMT', 'BDNF', 'DRD2', 'SERT'],
    biomarkers: ['dopamine', 'serotonin', 'gaba', 'neurotransmitter_metabolites'],
    description: 'Mood regulation, cognitive function, and neurological health',
    importance: 'high',
    keyFunctions: ['Mood balance', 'Cognitive performance', 'Stress response'],
    riskFactors: ['Neurotransmitter imbalance', 'Poor stress tolerance', 'Mood disorders']
  },
  'Energy Production': {
    color: 'blue',
    icon: Zap,
    gradient: 'from-blue-500 to-blue-700',
    bgGradient: 'from-blue-50 to-blue-100',
    darkBgGradient: 'from-blue-800/10 to-blue-900/10',
    genes: ['DIO1', 'DIO2', 'TPO', 'PPARG'],
    biomarkers: ['tsh', 'free_t4', 'free_t3', 'glucose', 'hba1c'],
    description: 'Thyroid function, metabolic rate, and cellular energy production',
    importance: 'critical',
    keyFunctions: ['Metabolic rate', 'Energy production', 'Temperature regulation'],
    riskFactors: ['Thyroid dysfunction', 'Insulin resistance', 'Metabolic slowdown']
  },
  'Nutrient Processing': {
    color: 'teal',
    icon: Star,
    gradient: 'from-teal-500 to-teal-700',
    bgGradient: 'from-teal-50 to-teal-100',
    darkBgGradient: 'from-teal-800/10 to-teal-900/10',
    genes: ['VDR', 'GC', 'HFE', 'SLC30A8'],
    biomarkers: ['vitamin_d', 'vitamin_b12', 'folate', 'iron', 'ferritin', 'magnesium', 'zinc'],
    description: 'Vitamin and mineral absorption, transport, and utilization',
    importance: 'high',
    keyFunctions: ['Nutrient absorption', 'Mineral transport', 'Vitamin activation'],
    riskFactors: ['Nutrient deficiencies', 'Poor absorption', 'Mineral imbalances']
  }
};

// Function to categorize genetic and biomarker data by system
const categorizeBySystem = (geneticData: any[], labData: any[]) => {
  const systemData: { [key: string]: { genes: any[]; biomarkers: any[]; status: string } } = {};
  
  // Initialize all systems
  Object.keys(HEALTH_SYSTEMS).forEach(system => {
    systemData[system] = { genes: [], biomarkers: [], status: 'normal' };
  });
  
  // Categorize genetic data
  geneticData.forEach(marker => {
    Object.entries(HEALTH_SYSTEMS).forEach(([systemName, systemInfo]) => {
      if (systemInfo.genes.includes(marker.gene)) {
        systemData[systemName].genes.push(marker);
      }
    });
  });
  
  // Categorize biomarker data
  labData.forEach(biomarker => {
    Object.entries(HEALTH_SYSTEMS).forEach(([systemName, systemInfo]) => {
      if (systemInfo.biomarkers.some(b => biomarker.biomarker_name.toLowerCase().includes(b))) {
        systemData[systemName].biomarkers.push(biomarker);
      }
    });
  });
  
  // Determine system status based on concerning variants and flagged biomarkers
  Object.keys(systemData).forEach(systemName => {
    const system = systemData[systemName];
    const hasRiskVariants = system.genes.some(g => 
      g.genotype && (g.genotype.includes('TT') || g.genotype.includes('CC') || g.genotype.includes('AA'))
    );
    const hasFlaggedBiomarkers = system.biomarkers.some(b => 
      b.status === 'High' || b.status === 'Low'
    );
    
    if (hasRiskVariants && hasFlaggedBiomarkers) {
      system.status = 'red';
    } else if (hasRiskVariants || hasFlaggedBiomarkers) {
      system.status = 'amber';
    } else if (system.genes.length > 0 || system.biomarkers.length > 0) {
      system.status = 'green';
    }
  });
  
  return systemData;
};

interface MarkdownComponentProps {
  content: string;
}

// Custom markdown renderer for beautiful formatting
const MarkdownRenderer = ({ content }: MarkdownComponentProps) => {
  return (
    <ReactMarkdown
      className="prose prose-slate dark:prose-invert max-w-none"
      components={{
        h1: ({children}) => (
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            {children}
          </h1>
        ),
        h2: ({children}) => (
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-8 flex items-center gap-2">
            {String(children).includes('🧬') && <Dna className="w-6 h-6 text-purple-600" />}
            {String(children).includes('📊') && <Activity className="w-6 h-6 text-blue-600" />}
            {String(children).includes('🎯') && <Target className="w-6 h-6 text-green-600" />}
            {String(children).includes('🌟') && <BookOpen className="w-6 h-6 text-yellow-600" />}
            {children}
          </h2>
        ),
        h3: ({children}) => (
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 mt-6 flex items-center gap-2">
            {String(children).includes('⚠️') && <AlertTriangle className="w-5 h-5 text-orange-500" />}
            {String(children).includes('✅') && <CheckCircle className="w-5 h-5 text-green-500" />}
            {String(children).includes('🎯') && <Target className="w-5 h-5 text-blue-500" />}
            {String(children).includes('📋') && <Info className="w-5 h-5 text-gray-500" />}
            {String(children).includes('🔬') && <Activity className="w-5 h-5 text-purple-500" />}
            {String(children).includes('🛡️') && <Shield className="w-5 h-5 text-green-500" />}
            {children}
          </h3>
        ),
        p: ({children}) => (
          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            {children}
          </p>
        ),
        ul: ({children}) => (
          <ul className="list-disc list-inside space-y-2 mb-4 text-gray-600 dark:text-gray-300">
            {children}
          </ul>
        ),
        li: ({children}) => (
          <li className="leading-relaxed">
            {children}
          </li>
        ),
        strong: ({children}) => (
          <strong className="font-semibold text-gray-800 dark:text-gray-200">
            {children}
          </strong>
        ),
        em: ({children}) => (
          <em className="italic text-gray-500 dark:text-gray-400">
            {children}
          </em>
        ),
        hr: () => (
          <hr className="border-t border-gray-200 dark:border-gray-700 my-8" />
        ),
        blockquote: ({children}) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-r text-blue-800 dark:text-blue-200 mb-4">
            {children}
          </blockquote>
        ),
        code: ({children}) => (
          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
            {children}
          </code>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// Gene information for educational content
const GENE_INFO = {
  'MTHFR': {
    name: 'MTHFR',
    fullName: 'Methylenetetrahydrofolate Reductase',
    function: 'Converts folate into its active form (methylfolate) for DNA synthesis and methylation',
    importance: 'Critical for folate metabolism, DNA repair, and neurotransmitter production'
  },
  'COMT': {
    name: 'COMT',
    fullName: 'Catechol-O-Methyltransferase', 
    function: 'Breaks down neurotransmitters like dopamine, norepinephrine, and epinephrine',
    importance: 'Affects stress response, mood, attention, and methylation balance'
  },
  'VDR': {
    name: 'VDR',
    fullName: 'Vitamin D Receptor',
    function: 'Determines how effectively your body responds to vitamin D',
    importance: 'Controls vitamin D sensitivity and calcium absorption'
  },
  'APOE': {
    name: 'APOE',
    fullName: 'Apolipoprotein E',
    function: 'Transports cholesterol and affects brain health',
    importance: 'Influences cardiovascular health and cognitive function'
  }
};

// Biomarker categories and information
const BIOMARKER_CATEGORIES = {
  'Cardiovascular': {
    color: 'red',
    icon: '❤️',
    markers: ['total_cholesterol', 'ldl_cholesterol', 'hdl_cholesterol', 'triglycerides', 'homocysteine']
  },
  'Vitamins': {
    color: 'yellow',
    icon: '🍊',
    markers: ['vitamin_d', 'vitamin_b12', 'folate', 'vitamin_c']
  },
  'Minerals': {
    color: 'green',
    icon: '⚡',
    markers: ['magnesium', 'zinc', 'iron', 'ferritin']
  },
  'Hormones': {
    color: 'purple',
    icon: '🏃',
    markers: ['testosterone', 'cortisol', 'thyroid_tsh']
  },
  'Inflammation': {
    color: 'orange',
    icon: '🔥',
    markers: ['crp', 'esr']
  }
};

// Individual Gene Card Component
const GeneCard = ({ gene, variants }: { gene: string; variants: any[] }) => {
  const geneInfo = GENE_INFO[gene as keyof typeof GENE_INFO] || {
    name: gene,
    fullName: gene,
    function: 'Gene function information',
    importance: 'Health importance information'
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Dna className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {geneInfo.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {geneInfo.fullName}
            </p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Function:</strong> {geneInfo.function}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Why it matters:</strong> {geneInfo.importance}
          </p>
        </div>
      </div>

      <div className="p-6">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Variants:</h4>
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h5 className="font-medium text-gray-900 dark:text-gray-100">
                    {variant.variant_id || variant.rsid}
                  </h5>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    variant.genotype === 'Normal' || variant.genotype?.includes('GG') || variant.genotype?.includes('AA') || variant.genotype?.includes('CC')
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                    {variant.genotype || 'Unknown'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {variant.variant_type || 'SNP'}
                </div>
              </div>
              
              {variant.impact && (
                <div className="mb-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Impact:</strong> {variant.impact}
                  </p>
                </div>
              )}
              
              {variant.recommendation && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Personalized Recommendation:</strong> {variant.recommendation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Individual Biomarker Card Component
const BiomarkerCard = ({ biomarker }: { biomarker: any }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      case 'low': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'normal': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'high': return <TrendingUp className="w-4 h-4" />;
      case 'low': return <TrendingDown className="w-4 h-4" />;
      case 'normal': return <Minus className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Beaker className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {biomarker.biomarker_name || biomarker.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {biomarker.unit && `Units: ${biomarker.unit}`}
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium ${getStatusColor(biomarker.status)}`}>
            {getStatusIcon(biomarker.status)}
            <span className="text-sm">{biomarker.status || 'Unknown'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {biomarker.value && (
            <div>
              <p className="text-gray-500 dark:text-gray-400">Your Value</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{biomarker.value}</p>
            </div>
          )}
          {biomarker.reference_range && (
            <div>
              <p className="text-gray-500 dark:text-gray-400">Reference Range</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{biomarker.reference_range}</p>
            </div>
          )}
          {biomarker.optimal_range && (
            <div>
              <p className="text-gray-500 dark:text-gray-400">Optimal Range</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{biomarker.optimal_range}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {biomarker.description && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What This Means:</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">{biomarker.description}</p>
          </div>
        )}

        {biomarker.health_implications && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Health Implications:</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">{biomarker.health_implications}</p>
          </div>
        )}

        {biomarker.recommendation && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Action Plan:</h4>
            <p className="text-sm text-green-700 dark:text-green-300">{biomarker.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AnalysisPage() {
  const supabase = createClientComponentClient();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSystems, setExpandedSystems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const fetcher = async (): Promise<AnalysisData> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Auth error: ${authError.message}`);
      }
      
      if (!user) throw new Error('Not authenticated');

      // Fetch the latest comprehensive AI analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from('ai_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (analysisError) {
        console.error('Analysis data error:', analysisError);
      }

      // Fetch genetic data from the correct table
      const { data: rawGeneticData, error: geneticError } = await supabase
        .from('genetic_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (geneticError) {
        console.error('Genetic data error:', geneticError);
      }

      // Convert JSON-based genetic data to row-based format for the UI
      const geneticData = [];
      if (rawGeneticData && rawGeneticData.length > 0) {
        for (const geneticRow of rawGeneticData) {
          // Extract SNPs from the snp_data JSON object
          if (geneticRow.snp_data && typeof geneticRow.snp_data === 'object') {
            for (const [rsid, genotype] of Object.entries(geneticRow.snp_data)) {
              if (genotype && String(genotype).trim() !== '') {
                geneticData.push({
                  rsid: rsid,
                  genotype: String(genotype).trim(),
                  gene: extractGeneFromRsid(rsid), // We'll need to add this helper
                  user_id: geneticRow.user_id,
                  source_company: geneticRow.source_company,
                  created_at: geneticRow.created_at
                });
              }
            }
          }
        }
      }

      // Fetch lab data from the correct table  
      const { data: rawLabData, error: labError } = await supabase
        .from('lab_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (labError) {
        console.error('Lab data error:', labError);
      }

      // Convert JSON-based biomarker data to row-based format for the UI
      const labData = [];
      if (rawLabData && rawLabData.length > 0) {
        for (const labRow of rawLabData) {
          if (labRow.biomarker_data && typeof labRow.biomarker_data === 'object') {
            for (const [biomarkerName, value] of Object.entries(labRow.biomarker_data)) {
              if (value !== null && value !== undefined) {
                const numericValue = Number(value);
                labData.push({
                  biomarker_name: biomarkerName,
                  value: value,
                  numeric_value: numericValue,
                  unit: extractBiomarkerUnit(biomarkerName),
                  status: isNaN(numericValue) ? 'Unknown' : assessBiomarkerStatus(biomarkerName, numericValue),
                  user_id: labRow.user_id,
                  lab_name: labRow.lab_name,
                  test_date: labRow.test_date,
                  created_at: labRow.created_at
                });
              }
            }
          }
        }
      }

      return {
        analysis: analysisData?.[0] || null,
        geneticData: geneticData || [],
        labData: labData || [],
        isLoading: false,
        error: null
      };
    } catch (error) {
      console.error('Fetcher error:', error);
      return {
        analysis: null,
        geneticData: [],
        labData: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const { data, mutate, isLoading } = useSWR('comprehensive-analysis-data', fetcher);

  const refreshAnalysis = async () => {
    setRefreshing(true);
    try {
      await mutate();
    } finally {
      setRefreshing(false);
    }
  };

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
  const hasAnalysis = data.analysis && data.analysis.content;

  // Group genetic data by gene
  const geneticsByGene = data.geneticData.reduce((acc: any, marker: any) => {
    const gene = marker.gene || marker.gene_name || 'Unknown';
    if (!acc[gene]) acc[gene] = [];
    acc[gene].push(marker);
    return acc;
  }, {});

  // Categorize data by health systems
  const systemData = categorizeBySystem(data.geneticData, data.labData);
  const systemsWithData = Object.entries(systemData).filter(([_, system]) => 
    system.genes.length > 0 || system.biomarkers.length > 0
  );

  const toggleSystem = (systemName: string) => {
    const newExpanded = new Set(expandedSystems);
    if (newExpanded.has(systemName)) {
      newExpanded.delete(systemName);
    } else {
      newExpanded.add(systemName);
    }
    setExpandedSystems(newExpanded);
  };

  // Filter systems based on search
  const filteredSystems = systemsWithData.filter(([systemName, system]) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return systemName.toLowerCase().includes(searchLower) ||
           system.genes.some(g => g.gene.toLowerCase().includes(searchLower) || g.rsid.toLowerCase().includes(searchLower)) ||
           system.biomarkers.some(b => b.biomarker_name.toLowerCase().includes(searchLower));
  });

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Your Personalized Health Analysis</h1>
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
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
              <Upload className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">No Health Data Uploaded</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Upload your genetic test results and lab work to see comprehensive analysis with our expanded knowledge base covering hundreds of genetic variants and biomarkers.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard/upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload Health Data
              </Link>
              <Link
                href="/dashboard/tests"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Order Tests
              </Link>
            </div>
          </div>
        )}

        {hasAnyData && (
          <>
            {/* Enhanced Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-600 to-slate-800 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Dna className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold tracking-tight">
                        {data.geneticData.length}
                      </div>
                      <div className="text-slate-200 text-sm">
                        variants
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-lg">Genetic Analysis</div>
                    <div className="text-slate-200 text-sm">
                      {hasGeneticData ? `${Object.keys(geneticsByGene).length} genes analyzed` : 'Upload genetic data'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Beaker className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold tracking-tight">
                        {data.labData.length}
                      </div>
                      <div className="text-blue-200 text-sm">
                        markers
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-lg">Lab Analysis</div>
                    <div className="text-blue-200 text-sm">
                      {hasLabData ? 'Biomarkers processed' : 'Upload lab results'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Target className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold tracking-tight">
                        {systemsWithData.length}
                      </div>
                      <div className="text-emerald-200 text-sm">
                        systems
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-lg">Health Systems</div>
                    <div className="text-emerald-200 text-sm">
                      Analyzed & categorized
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold tracking-tight">
                        AI
                      </div>
                      <div className="text-violet-200 text-sm">
                        powered
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-lg">Precision Medicine</div>
                    <div className="text-violet-200 text-sm">
                      Personalized insights
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comprehensive System-Based Analysis */}
            {hasAnyData && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        🎯 Comprehensive Health Systems Analysis
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Your genetic variants and biomarkers organized by health system
                      </p>
                    </div>
                  </div>
                  
                  {/* Search and Export Controls */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search genes, SNPs, biomarkers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm w-64"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      className="flex items-center gap-2"
                    >
                      <ArchiveIcon className="w-4 h-4" />
                      Export PDF
                    </Button>
                  </div>
                </div>

                {/* Enhanced System Summary Chips */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredSystems.map(([systemName, system]) => {
                    const systemInfo = HEALTH_SYSTEMS[systemName as keyof typeof HEALTH_SYSTEMS];
                    const isExpanded = expandedSystems.has(systemName);
                    const IconComponent = systemInfo.icon;
                    
                    return (
                      <button
                        key={systemName}
                        onClick={() => toggleSystem(systemName)}
                        className={`group relative overflow-hidden p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-gradient-to-br ${systemInfo.gradient} text-white ${isExpanded ? 'ring-4 ring-slate-300 scale-105' : ''}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                        <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className={`flex items-center gap-2 ${
                              systemInfo.importance === 'critical' ? 'text-yellow-200' : ''
                            }`}>
                              {systemInfo.importance === 'critical' && (
                                <AlertTriangle className="w-3 h-3" />
                              )}
                              <div className={`w-2 h-2 rounded-full ${
                                system.status === 'red' ? 'bg-red-200' 
                                : system.status === 'amber' ? 'bg-yellow-200' 
                                : 'bg-green-200'
                              }`} />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="font-semibold text-sm leading-tight">
                              {systemName}
                            </div>
                            <div className="text-xs opacity-90">
                              {system.genes.length} genes • {system.biomarkers.length} markers
                            </div>
                            <div className="text-xs opacity-80 leading-tight">
                              {systemInfo.description.substring(0, 50)}...
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <ChevronDown className="w-5 h-5 text-white animate-bounce" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Enhanced Expanded System Details */}
                {filteredSystems.map(([systemName, system]) => {
                  const systemInfo = HEALTH_SYSTEMS[systemName as keyof typeof HEALTH_SYSTEMS];
                  const isExpanded = expandedSystems.has(systemName);
                  const IconComponent = systemInfo.icon;
                  
                  if (!isExpanded) return null;

                  return (
                    <div key={`${systemName}-details`} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
                      <div className={`p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r ${systemInfo.bgGradient} dark:${systemInfo.darkBgGradient}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${systemInfo.gradient} text-white shadow-lg`}>
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                {systemName} System
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {systemInfo.description}
                              </p>
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                systemInfo.importance === 'critical' 
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              }`}>
                                {systemInfo.importance === 'critical' && <AlertTriangle className="w-3 h-3" />}
                                {systemInfo.importance.toUpperCase()} PRIORITY
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {system.genes.length + system.biomarkers.length}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              total markers
                            </div>
                          </div>
                        </div>
                        
                        {/* Key Functions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Key Functions</h4>
                            <ul className="space-y-1">
                              {systemInfo.keyFunctions.map((func, idx) => (
                                <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  {func}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Risk Factors</h4>
                            <ul className="space-y-1">
                              {systemInfo.riskFactors.map((risk, idx) => (
                                <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                                  {risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Your Status</h4>
                            <div className={`flex items-center gap-2 p-2 rounded-lg ${
                              system.status === 'red' 
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : system.status === 'amber'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${
                                system.status === 'red' ? 'bg-red-500' 
                                : system.status === 'amber' ? 'bg-amber-500' 
                                : 'bg-green-500'
                              }`} />
                              <span className="text-xs font-medium">
                                {system.status === 'red' ? 'Needs Attention' 
                                  : system.status === 'amber' ? 'Monitor Closely' 
                                  : 'Optimal Range'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Genetic Variants Section */}
                        {system.genes.length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                              <Dna className="w-4 h-4" />
                              Genetic Variants ({system.genes.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {system.genes.map((gene, index) => (
                                <div key={index} className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium text-purple-900 dark:text-purple-100">
                                      {gene.gene} ({gene.rsid})
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                                      gene.genotype && (gene.genotype.includes('TT') || gene.genotype.includes('CC') || gene.genotype.includes('AA'))
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                    }`}>
                                      {gene.genotype || 'Unknown'}
                                    </div>
                                  </div>
                                  <div className="text-sm text-purple-700 dark:text-purple-300">
                                    Source: {gene.source_company || 'Unknown'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Biomarkers Section */}
                        {system.biomarkers.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                              <Beaker className="w-4 h-4" />
                              Biomarkers ({system.biomarkers.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {system.biomarkers.map((biomarker, index) => (
                                <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium text-blue-900 dark:text-blue-100">
                                      {biomarker.biomarker_name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                                      biomarker.status === 'High' || biomarker.status === 'Low'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                    }`}>
                                      {biomarker.status}
                                    </div>
                                  </div>
                                  <div className="text-sm text-blue-700 dark:text-blue-300">
                                    Value: {biomarker.value} {biomarker.unit}
                                  </div>
                                  {biomarker.lab_name && (
                                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                      Lab: {biomarker.lab_name}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Analysis Summary */}
            {hasAnalysis && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 p-8 rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    🎯 Your Personalized Protocol Summary
                  </h2>
                </div>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Protocol Overview</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Based on your genetic variants and current biomarker levels, we&apos;ve designed a precision medicine approach 
                      that addresses your specific biological needs. This protocol integrates your genetic predispositions 
                      with your current health status to provide targeted interventions.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                          🧬 Genetic-Based Recommendations:
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {Object.keys(geneticsByGene).length} genes analyzed with personalized interventions 
                          based on your specific variants and their functional impacts.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          📊 Lab-Driven Interventions:
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {data.labData.length} biomarkers evaluated with targeted protocols to optimize 
                          your current health metrics and address any imbalances.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interaction Warnings */}
                {data.analysis.interaction_warnings && data.analysis.interaction_warnings.length > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                        Important Safety Considerations
                      </h3>
                    </div>
                    <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                      {data.analysis.interaction_warnings.map((warning: string, index: number) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Quick Data Upload Encouragement */}
            {(hasGeneticData && !hasLabData) || (!hasGeneticData && hasLabData) ? (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg">
                <div className="flex items-center gap-4">
                  <Upload className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      Complete Your Health Profile
                    </h3>
                    <p className="text-green-800 dark:text-green-200 text-sm mb-4">
                      {hasGeneticData 
                        ? 'Upload your lab results to see how your genetic variants affect your current biomarker levels and get more targeted recommendations.'
                        : 'Upload your genetic test results to understand the genetic basis of your biomarker patterns and get precision supplementation.'
                      }
                    </p>
                    <Link
                      href="/dashboard/upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      Upload {hasGeneticData ? 'Lab Results' : 'Genetic Data'}
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Educational Footer */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Understanding Your Precision Medicine Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium mb-2 text-purple-800 dark:text-purple-200">🧬 Genetic Analysis Shows:</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• How each gene functions in your body</li>
                    <li>• Impact of your specific variants</li>
                    <li>• Why certain supplements are chosen for your genetics</li>
                    <li>• Personalized explanations for each variant</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">📊 Biomarker Analysis Shows:</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• What each lab value means for your health</li>
                    <li>• Health implications of being high or low</li>
                    <li>• Specific action plans for each marker</li>
                    <li>• How biomarkers guide intervention choices</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                Your analysis combines genetic variants, biomarker patterns, medications, diet, and health goals into one personalized protocol with complete safety screening.
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
} 