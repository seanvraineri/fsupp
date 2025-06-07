"use client";
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { ChevronDown, ChevronRight, Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface LabData {
  user_id: string;
  biomarker_data: { [biomarkerName: string]: number };
  biomarker_count: number;
  test_date: string;
  lab_name: string;
}

interface BiomarkerInfo {
  name: string;
  category: string;
  description: string;
  units: string[];
  optimal_range: { min: number; max: number; unit: string };
  functional_range: { min: number; max: number; unit: string };
  low_values: {
    causes: string[];
    symptoms: string[];
    supplements: string[];
    dosages: string[];
    timing: string[];
    interactions: string[];
    research_pmids: string[];
  };
  high_values: {
    causes: string[];
    symptoms: string[];
    supplements: string[];
    dosages: string[];
    timing: string[];
    interactions: string[];
    research_pmids: string[];
  };
}

interface BiomarkerDataCardProps {
  labData: LabData[];
  biomarkerDatabase: { [biomarkerName: string]: BiomarkerInfo };
}

type BiomarkerStatus = 'low' | 'optimal' | 'high' | 'unknown';

export default function BiomarkerDataCard({ labData, biomarkerDatabase }: BiomarkerDataCardProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedBiomarkers, setExpandedBiomarkers] = useState<Set<string>>(new Set());

  if (!labData?.length) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Lab Results Analysis</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">No lab data uploaded yet. Upload your lab results to see comprehensive biomarker analysis.</p>
      </Card>
    );
  }

  // Organize biomarkers by category
  const biomarkersByCategory = new Map<string, Array<{ name: string; value: number; info: BiomarkerInfo; status: BiomarkerStatus }>>();
  let totalBiomarkers = 0;
  let knownBiomarkers = 0;
  let flaggedCount = 0;

  const assessBiomarkerStatus = (biomarkerInfo: BiomarkerInfo, value: number): BiomarkerStatus => {
    if (value < biomarkerInfo.optimal_range.min) return 'low';
    if (value > biomarkerInfo.optimal_range.max) return 'high';
    return 'optimal';
  };

  for (const data of labData) {
    totalBiomarkers += data.biomarker_count || Object.keys(data.biomarker_data).length;
    
    for (const [biomarkerName, value] of Object.entries(data.biomarker_data)) {
      if (typeof value === 'number') {
        const normalizedName = biomarkerName.toLowerCase().replace(/[-_\s]/g, '_');
        const biomarkerInfo = biomarkerDatabase[normalizedName];
        
        if (biomarkerInfo) {
          knownBiomarkers++;
          const status = assessBiomarkerStatus(biomarkerInfo, value);
          if (status !== 'optimal') flaggedCount++;
          
          const category = biomarkerInfo.category;
          if (!biomarkersByCategory.has(category)) {
            biomarkersByCategory.set(category, []);
          }
          biomarkersByCategory.get(category)!.push({
            name: biomarkerName,
            value,
            info: biomarkerInfo,
            status
          });
        }
      }
    }
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleBiomarker = (biomarkerName: string) => {
    const newExpanded = new Set(expandedBiomarkers);
    if (newExpanded.has(biomarkerName)) {
      newExpanded.delete(biomarkerName);
    } else {
      newExpanded.add(biomarkerName);
    }
    setExpandedBiomarkers(newExpanded);
  };

  const getStatusColor = (status: BiomarkerStatus) => {
    switch (status) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'optimal': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: BiomarkerStatus) => {
    switch (status) {
      case 'high': return <TrendingUp className="w-4 h-4" />;
      case 'low': return <TrendingDown className="w-4 h-4" />;
      case 'optimal': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getUrgencyLevel = (biomarkerInfo: BiomarkerInfo, value: number, status: BiomarkerStatus): 'low' | 'moderate' | 'high' => {
    if (status === 'optimal') return 'low';
    
    const optimalRange = biomarkerInfo.optimal_range;
    if (status === 'low') {
      const deviation = (optimalRange.min - value) / optimalRange.min;
      return deviation > 0.3 ? 'high' : deviation > 0.15 ? 'moderate' : 'low';
    } else if (status === 'high') {
      const deviation = (value - optimalRange.max) / optimalRange.max;
      return deviation > 0.3 ? 'high' : deviation > 0.15 ? 'moderate' : 'low';
    }
    return 'low';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Comprehensive Lab Analysis</h3>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalBiomarkers}</div>
          <div className="text-sm text-blue-800 dark:text-blue-200">Total Tests</div>
        </div>
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{knownBiomarkers}</div>
          <div className="text-sm text-purple-800 dark:text-purple-200">Analyzed</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{knownBiomarkers - flaggedCount}</div>
          <div className="text-sm text-green-800 dark:text-green-200">Optimal</div>
        </div>
        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{flaggedCount}</div>
          <div className="text-sm text-orange-800 dark:text-orange-200">Flagged</div>
        </div>
      </div>

      {/* Test Info */}
      {labData.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Most recent test: {labData[0].lab_name} on {new Date(labData[0].test_date).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-4">
        {Array.from(biomarkersByCategory.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, biomarkers]) => {
            const isExpanded = expandedCategories.has(category);
            const flaggedInCategory = biomarkers.filter(b => b.status !== 'optimal').length;
            const highUrgencyCount = biomarkers.filter(b => getUrgencyLevel(b.info, b.value, b.status) === 'high').length;

            return (
              <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <div className="text-left">
                      <div className="font-medium">{category}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {biomarkers.length} biomarkers
                        {flaggedInCategory > 0 && (
                          <span className="ml-2 text-orange-600">• {flaggedInCategory} flagged</span>
                        )}
                        {highUrgencyCount > 0 && (
                          <span className="ml-2 text-red-600">• {highUrgencyCount} urgent</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {biomarkers
                      .sort((a, b) => {
                        // Sort by urgency first, then by status
                        const urgencyA = getUrgencyLevel(a.info, a.value, a.status);
                        const urgencyB = getUrgencyLevel(b.info, b.value, b.status);
                        const urgencyOrder = { 'high': 3, 'moderate': 2, 'low': 1 };
                        return urgencyOrder[urgencyB] - urgencyOrder[urgencyA];
                      })
                      .map(({ name, value, info, status }) => {
                        const isBiomarkerExpanded = expandedBiomarkers.has(name);
                        const urgencyLevel = getUrgencyLevel(info, value, status);
                        const relevantData = status === 'low' ? info.low_values : 
                                           status === 'high' ? info.high_values : null;

                        return (
                          <div key={name} className={`border rounded-lg ${getStatusColor(status)}`}>
                            <button
                              onClick={() => toggleBiomarker(name)}
                              className="w-full p-3 flex items-center justify-between hover:opacity-80"
                            >
                              <div className="flex items-center gap-3">
                                {getStatusIcon(status)}
                                <div className="text-left">
                                  <div className="font-medium">{info.name}</div>
                                  <div className="text-sm">
                                    {value} {info.optimal_range.unit} 
                                    <span className="ml-2 text-gray-600">
                                      (Optimal: {info.optimal_range.min}-{info.optimal_range.max})
                                    </span>
                                    {urgencyLevel === 'high' && (
                                      <span className="ml-2 text-red-600 font-medium">URGENT</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {isBiomarkerExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>

                            {isBiomarkerExpanded && (
                              <div className="px-3 pb-3 space-y-3 text-sm">
                                <div>
                                  <div className="font-medium mb-1">Description:</div>
                                  <div>{info.description}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="font-medium mb-1">Optimal Range:</div>
                                    <div>{info.optimal_range.min}-{info.optimal_range.max} {info.optimal_range.unit}</div>
                                  </div>
                                  <div>
                                    <div className="font-medium mb-1">Functional Range:</div>
                                    <div>{info.functional_range.min}-{info.functional_range.max} {info.functional_range.unit}</div>
                                  </div>
                                </div>

                                {relevantData && (
                                  <>
                                    {relevantData.causes.length > 0 && (
                                      <div>
                                        <div className="font-medium mb-1">Possible Causes:</div>
                                        <div>{relevantData.causes.join(', ')}</div>
                                      </div>
                                    )}

                                    {relevantData.symptoms.length > 0 && (
                                      <div>
                                        <div className="font-medium mb-1">Associated Symptoms:</div>
                                        <div>{relevantData.symptoms.join(', ')}</div>
                                      </div>
                                    )}

                                    {relevantData.supplements.length > 0 && (
                                      <div>
                                        <div className="font-medium mb-1">Recommended Supplements:</div>
                                        <div className="space-y-1">
                                          {relevantData.supplements.map((supplement, idx) => (
                                            <div key={idx} className="flex justify-between">
                                              <span>{supplement}</span>
                                              <span className="text-gray-600">
                                                {relevantData.dosages[idx]} {relevantData.timing[idx]}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {relevantData.interactions.length > 0 && (
                                      <div>
                                        <div className="font-medium mb-1">Important Notes:</div>
                                        <div>{relevantData.interactions.join('; ')}</div>
                                      </div>
                                    )}

                                    {relevantData.research_pmids.length > 0 && (
                                      <div>
                                        <div className="font-medium mb-1">Research:</div>
                                        <div className="text-xs text-gray-600">
                                          PubMed IDs: {relevantData.research_pmids.join(', ')}
                                        </div>
                                      </div>
                                    )}
                                  </>
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

      {biomarkersByCategory.size === 0 && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Lab data uploaded but no known biomarkers found in our database.</p>
          <p className="text-sm mt-2">Upload lab results from Quest, LabCorp, or other providers for analysis.</p>
        </div>
      )}
    </Card>
  );
} 