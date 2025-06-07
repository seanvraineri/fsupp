"use client";
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { ChevronDown, ChevronRight, Dna, AlertCircle, CheckCircle } from 'lucide-react';

interface GeneticData {
  user_id: string;
  snp_data: { [rsid: string]: string };
  snp_count: number;
  source_company: string;
  uploaded_at: string;
}

interface SNPInfo {
  rsid: string;
  gene: string;
  pathway: string;
  description: string;
  variants: {
    [genotype: string]: {
      phenotype: string;
      frequency: string;
      supplements: string[];
      dosages: string[];
      timing: string[];
      interactions: string[];
      contraindications: string[];
      research_pmids: string[];
    }
  };
}

interface GeneticDataCardProps {
  geneticData: GeneticData[];
  snpDatabase: { [rsid: string]: SNPInfo };
}

export default function GeneticDataCard({ geneticData, snpDatabase }: GeneticDataCardProps) {
  const [expandedPathways, setExpandedPathways] = useState<Set<string>>(new Set());
  const [expandedSNPs, setExpandedSNPs] = useState<Set<string>>(new Set());

  if (!geneticData?.length) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Dna className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Genetic Analysis</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">No genetic data uploaded yet. Upload your genetic test results to see comprehensive genetic insights.</p>
      </Card>
    );
  }

  // Organize SNPs by pathway
  const snpsByPathway = new Map<string, Array<{ rsid: string; genotype: string; snpInfo: SNPInfo }>>();
  let totalAnalyzed = 0;
  let knownSNPs = 0;

  for (const data of geneticData) {
    totalAnalyzed += data.snp_count || Object.keys(data.snp_data).length;
    
    for (const [rsid, genotype] of Object.entries(data.snp_data)) {
      const snpInfo = snpDatabase[rsid];
      if (snpInfo) {
        knownSNPs++;
        const pathway = snpInfo.pathway;
        if (!snpsByPathway.has(pathway)) {
          snpsByPathway.set(pathway, []);
        }
        snpsByPathway.get(pathway)!.push({ rsid, genotype, snpInfo });
      }
    }
  }

  const togglePathway = (pathway: string) => {
    const newExpanded = new Set(expandedPathways);
    if (newExpanded.has(pathway)) {
      newExpanded.delete(pathway);
    } else {
      newExpanded.add(pathway);
    }
    setExpandedPathways(newExpanded);
  };

  const toggleSNP = (rsid: string) => {
    const newExpanded = new Set(expandedSNPs);
    if (newExpanded.has(rsid)) {
      newExpanded.delete(rsid);
    } else {
      newExpanded.add(rsid);
    }
    setExpandedSNPs(newExpanded);
  };

  const getRiskLevel = (snpInfo: SNPInfo, genotype: string): 'low' | 'moderate' | 'high' => {
    const variant = snpInfo.variants[genotype];
    if (!variant) return 'low';
    
    if (variant.contraindications.length > 0 || variant.phenotype.toLowerCase().includes('high risk') ||
        variant.phenotype.toLowerCase().includes('significantly') || variant.phenotype.toLowerCase().includes('poor')) {
      return 'high';
    }
    if (variant.phenotype.toLowerCase().includes('reduced') || variant.phenotype.toLowerCase().includes('moderate') ||
        variant.supplements.length > 2) {
      return 'moderate';
    }
    return 'low';
  };

  const getRiskColor = (level: 'low' | 'moderate' | 'high') => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getRiskIcon = (level: 'low' | 'moderate' | 'high') => {
    switch (level) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'moderate': return <AlertCircle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Dna className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Comprehensive Genetic Analysis</h3>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{totalAnalyzed}</div>
          <div className="text-sm text-purple-800 dark:text-purple-200">Total SNPs</div>
        </div>
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{knownSNPs}</div>
          <div className="text-sm text-blue-800 dark:text-blue-200">Analyzed</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{snpsByPathway.size}</div>
          <div className="text-sm text-green-800 dark:text-green-200">Pathways</div>
        </div>
      </div>

      {/* Pathways */}
      <div className="space-y-4">
        {Array.from(snpsByPathway.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([pathway, snps]) => {
            const isExpanded = expandedPathways.has(pathway);
            const highRiskCount = snps.filter(({ snpInfo, genotype }) => getRiskLevel(snpInfo, genotype) === 'high').length;
            const moderateRiskCount = snps.filter(({ snpInfo, genotype }) => getRiskLevel(snpInfo, genotype) === 'moderate').length;

            return (
              <div key={pathway} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => togglePathway(pathway)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <div className="text-left">
                      <div className="font-medium">{pathway}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {snps.length} variants
                        {highRiskCount > 0 && (
                          <span className="ml-2 text-red-600">• {highRiskCount} high priority</span>
                        )}
                        {moderateRiskCount > 0 && (
                          <span className="ml-2 text-orange-600">• {moderateRiskCount} moderate</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {snps.map(({ rsid, genotype, snpInfo }) => {
                      const riskLevel = getRiskLevel(snpInfo, genotype);
                      const variant = snpInfo.variants[genotype];
                      const isSNPExpanded = expandedSNPs.has(rsid);

                      return (
                        <div key={rsid} className={`border rounded-lg ${getRiskColor(riskLevel)}`}>
                          <button
                            onClick={() => toggleSNP(rsid)}
                            className="w-full p-3 flex items-center justify-between hover:opacity-80"
                          >
                            <div className="flex items-center gap-3">
                              {getRiskIcon(riskLevel)}
                              <div className="text-left">
                                <div className="font-medium">{rsid} ({snpInfo.gene})</div>
                                <div className="text-sm">
                                  {genotype} - {variant?.phenotype || 'Unknown variant'}
                                </div>
                              </div>
                            </div>
                            {isSNPExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>

                          {isSNPExpanded && variant && (
                            <div className="px-3 pb-3 space-y-3 text-sm">
                              <div>
                                <div className="font-medium mb-1">Description:</div>
                                <div>{snpInfo.description}</div>
                              </div>

                              <div>
                                <div className="font-medium mb-1">Population Frequency:</div>
                                <div>{variant.frequency}</div>
                              </div>

                              {variant.supplements.length > 0 && (
                                <div>
                                  <div className="font-medium mb-1">Recommended Supplements:</div>
                                  <div className="space-y-1">
                                    {variant.supplements.map((supplement, idx) => (
                                      <div key={idx} className="flex justify-between">
                                        <span>{supplement}</span>
                                        <span className="text-gray-600">{variant.dosages[idx]} {variant.timing[idx]}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {variant.contraindications.length > 0 && (
                                <div>
                                  <div className="font-medium mb-1 text-red-600">⚠️ Important Considerations:</div>
                                  <div className="space-y-1">
                                    {variant.contraindications.map((contraindication, idx) => (
                                      <div key={idx} className="text-red-600">• {contraindication}</div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {variant.interactions.length > 0 && (
                                <div>
                                  <div className="font-medium mb-1">Interactions:</div>
                                  <div>{variant.interactions.join('; ')}</div>
                                </div>
                              )}

                              {variant.research_pmids.length > 0 && (
                                <div>
                                  <div className="font-medium mb-1">Research:</div>
                                  <div className="text-xs text-gray-600">
                                    PubMed IDs: {variant.research_pmids.join(', ')}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {snpsByPathway.size === 0 && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <Dna className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Genetic data uploaded but no known variants found in our database.</p>
          <p className="text-sm mt-2">Upload genetic data from 23andMe, AncestryDNA, or other providers for analysis.</p>
        </div>
      )}
    </Card>
  );
} 