"use client";
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { RecWithProduct } from './RecommendationCard';
import { X, ExternalLink, Clock, AlertTriangle, TrendingUp, ShoppingCart } from 'lucide-react';
import { useCitations } from '../../utils/useCitations';
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function RecommendationModal({ rec, open, onOpenChange }: { rec: RecWithProduct; open: boolean; onOpenChange: (o: boolean) => void }) {
  const product = rec.product_links?.[0];
  const { citations, isLoading } = useCitations(rec.id);
  const [enhancedData, setEnhancedData] = useState<any>(null);
  const [loadingCitations, setLoadingCitations] = useState(false);
  const supabase = createClientComponentClient();

  const extractGeneticInfo = useCallback((reasoning: string): string | undefined => {
    const geneticPatterns = ['MTHFR', 'COMT', 'APOE', 'FADS', 'VDR', 'CYP', 'rs\\d+'];
    for (const pattern of geneticPatterns) {
      const match = reasoning.match(new RegExp(pattern, 'i'));
      if (match) return match[0];
    }
    return undefined;
  }, []);

  const loadEnhancedData = useCallback(async () => {
    try {
      // Get enhanced recommendation data
      const { data: recData } = await supabase
        .from('supplement_recommendations')
        .select(`
          *,
          timing,
          interaction_warnings,
          monitoring_needed,
          genetic_reasoning,
          biomarker_reasoning
        `)
        .eq('id', rec.id)
        .single();

      if (recData) {
        setEnhancedData(recData);
      }

      // Generate citations if none exist
      if (citations.length === 0 && !loadingCitations) {
        setLoadingCitations(true);
        try {
          await supabase.functions.invoke('pubmed_citations', {
            body: {
              recommendation_id: rec.id,
              supplement_name: rec.supplement_name,
              health_condition: 'general health',
              genetic_variant: extractGeneticInfo(rec.recommendation_reason)
            }
          });
        } catch (error) {
          console.error('Error generating citations:', error);
        } finally {
          setLoadingCitations(false);
        }
      }
    } catch (error) {
      console.error('Error loading enhanced data:', error);
    }
  }, [supabase, rec.id, rec.supplement_name, rec.recommendation_reason, citations.length, loadingCitations, extractGeneticInfo]);

  // Load enhanced recommendation data when modal opens
  useEffect(() => {
    if (open && rec.id) {
      loadEnhancedData();
    }
  }, [open, rec.id, loadEnhancedData]);

  const handleBuyNow = async () => {
    if (product?.product_url) {
      window.open(product.product_url, '_blank');
    } else {
      // Use product search to find a product
      try {
        const { data } = await supabase.functions.invoke('product_search', {
          body: { supplement_name: rec.supplement_name }
        });
        
        if (data?.success && data.product_url) {
          window.open(data.product_url, '_blank');
        } else {
          // Fallback to generic search
          window.open(`https://www.vitacost.com/search?t=${encodeURIComponent(rec.supplement_name)}`, '_blank');
        }
      } catch (error) {
        console.error('Product search error:', error);
        window.open(`https://www.vitacost.com/search?t=${encodeURIComponent(rec.supplement_name)}`, '_blank');
      }
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-full max-w-4xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="flex flex-col h-full max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-4">
                <div className="text-4xl">
                  {rec.supplement_name.toLowerCase().includes('vitamin d') ? '☀️' :
                   rec.supplement_name.toLowerCase().includes('magnesium') ? '🧲' :
                   rec.supplement_name.toLowerCase().includes('omega') ? '🐟' :
                   rec.supplement_name.toLowerCase().includes('b12') ? '🔋' :
                   rec.supplement_name.toLowerCase().includes('folate') ? '🧬' :
                   '💊'}
                </div>
                <div>
                  <Dialog.Title className="text-2xl font-semibold">{rec.supplement_name}</Dialog.Title>
                  <div className="flex gap-2 mt-2">
                    {rec.priority_score && (
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                        rec.priority_score >= 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
                        rec.priority_score >= 3 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {rec.priority_score >= 5 ? 'High Priority' : rec.priority_score >= 3 ? 'Medium Priority' : 'Low Priority'}
                      </span>
                    )}
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      rec.evidence_quality === 'high' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' :
                      rec.evidence_quality === 'moderate' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {rec.evidence_quality === 'high' ? 'Strong Evidence' : rec.evidence_quality === 'moderate' ? 'Moderate Evidence' : 'Limited Evidence'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBuyNow}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 text-sm font-medium"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {product?.brand ? `Buy from ${product.brand}` : 'Find Best Price'}
                  {product?.price && <span className="text-blue-100">${product.price}</span>}
                </button>
                <Dialog.Close asChild>
                  <button className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs.Root defaultValue="overview" className="h-full flex flex-col">
                <Tabs.List className="flex gap-1 px-6 pt-4 border-b">
                  <Tabs.Trigger value="overview" className="px-4 py-2 rounded-md text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300">
                    Overview
                  </Tabs.Trigger>
                  <Tabs.Trigger value="personalization" className="px-4 py-2 rounded-md text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300">
                    Why For You
                  </Tabs.Trigger>
                  <Tabs.Trigger value="timing" className="px-4 py-2 rounded-md text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300">
                    How to Take
                  </Tabs.Trigger>
                  <Tabs.Trigger value="safety" className="px-4 py-2 rounded-md text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300">
                    Safety
                  </Tabs.Trigger>
                  <Tabs.Trigger value="research" className="px-4 py-2 rounded-md text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300">
                    Research ({citations.length})
                  </Tabs.Trigger>
                  <Tabs.Trigger value="purchase" className="px-4 py-2 rounded-md text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300">
                    Where to Buy
                  </Tabs.Trigger>
                </Tabs.List>

                <div className="flex-1 overflow-y-auto">
                  <Tabs.Content value="overview" className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Dosage & Frequency</h3>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                              {rec.dosage_amount} {rec.dosage_unit}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Take {rec.frequency}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Expected Benefits</h3>
                          {rec.expected_benefits && rec.expected_benefits.length > 0 ? (
                            <ul className="space-y-1">
                              {rec.expected_benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Benefits typically seen within 2-8 weeks of consistent use
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Why This Supplement</h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {rec.recommendation_reason}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg mb-2">Evidence Quality</h3>
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                            rec.evidence_quality === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
                            rec.evidence_quality === 'moderate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {rec.evidence_quality === 'high' ? '🟢 Strong' : rec.evidence_quality === 'moderate' ? '🟡 Moderate' : '🔵 Limited'} Research Support
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="personalization" className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Personalized for Your Health Profile</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">🧬 Based on Your Data</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          {rec.recommendation_reason}
                        </p>
                      </div>

                      {enhancedData?.genetic_reasoning && (
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-lg">
                          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">🧬 Genetic Considerations</h4>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {enhancedData.genetic_reasoning}
                          </p>
                        </div>
                      )}

                      {enhancedData?.biomarker_reasoning && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">📊 Lab Results Impact</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {enhancedData.biomarker_reasoning}
                          </p>
                        </div>
                      )}
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="timing" className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Optimal Usage Guidelines</h3>
                    
                    <div className="grid gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <h4 className="font-medium text-blue-800 dark:text-blue-200">When to Take</h4>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {enhancedData?.timing || 'Take with food for best absorption'}
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Absorption Tips</h4>
                        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                          <li>• Take consistently at the same time each day</li>
                          <li>• {rec.supplement_name.toLowerCase().includes('fat-soluble') || rec.supplement_name.toLowerCase().includes('vitamin d') || rec.supplement_name.toLowerCase().includes('omega') ? 'Take with a meal containing healthy fats' : 'Can be taken with or without food'}</li>
                          <li>• Stay hydrated (8+ glasses of water daily)</li>
                        </ul>
                      </div>

                      {enhancedData?.monitoring_needed && enhancedData.monitoring_needed.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Monitoring Recommendations</h4>
                          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            {enhancedData.monitoring_needed.map((item: string, idx: number) => (
                              <li key={idx}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="safety" className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Safety Information</h3>
                    
                    <div className="space-y-4">
                      {/* AI-Powered Interaction Warnings */}
                      {rec.interaction_warnings && rec.interaction_warnings.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                            🤖 AI Safety Analysis
                          </h4>
                          {rec.interaction_warnings.map((warning, idx) => {
                            // Categorize warnings by type for appropriate styling
                            const isAllergyWarning = warning.includes('❌ ALLERGY') || warning.toLowerCase().includes('allergy');
                            const isDrugInteraction = warning.includes('⚠️ DRUG') || warning.toLowerCase().includes('medication');
                            const isBiomarkerWarning = warning.includes('🩸 BIOMARKER') || warning.toLowerCase().includes('biomarker');
                            const isGeneticWarning = warning.includes('🧬 GENETIC') || warning.toLowerCase().includes('genetic');
                            const isAIWarning = warning.includes('🤖 AI') || warning.toLowerCase().includes('ai ');
                            const isComplexInteraction = warning.includes('🚨 COMPLEX') || warning.toLowerCase().includes('complex');
                            
                            let bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
                            let borderColor = 'border-yellow-200 dark:border-yellow-800';
                            let textColor = 'text-yellow-700 dark:text-yellow-400';
                            let titleColor = 'text-yellow-800 dark:text-yellow-200';
                            let icon = '⚠️';
                            let title = 'General Warning';
                            
                            if (isAllergyWarning) {
                              bgColor = 'bg-red-50 dark:bg-red-900/20';
                              borderColor = 'border-red-200 dark:border-red-800';
                              textColor = 'text-red-700 dark:text-red-400';
                              titleColor = 'text-red-800 dark:text-red-200';
                              icon = '❌';
                              title = 'Allergy Contraindication';
                            } else if (isGeneticWarning) {
                              bgColor = 'bg-purple-50 dark:bg-purple-900/20';
                              borderColor = 'border-purple-200 dark:border-purple-800';
                              textColor = 'text-purple-700 dark:text-purple-400';
                              titleColor = 'text-purple-800 dark:text-purple-200';
                              icon = '🧬';
                              title = 'Genetic Safety Concern';
                            } else if (isBiomarkerWarning) {
                              bgColor = 'bg-blue-50 dark:bg-blue-900/20';
                              borderColor = 'border-blue-200 dark:border-blue-800';
                              textColor = 'text-blue-700 dark:text-blue-400';
                              titleColor = 'text-blue-800 dark:text-blue-200';
                              icon = '🩸';
                              title = 'Lab-Based Safety Alert';
                            } else if (isAIWarning) {
                              bgColor = 'bg-green-50 dark:bg-green-900/20';
                              borderColor = 'border-green-200 dark:border-green-800';
                              textColor = 'text-green-700 dark:text-green-400';
                              titleColor = 'text-green-800 dark:text-green-200';
                              icon = '🤖';
                              title = 'AI Safety Adjustment';
                            } else if (isComplexInteraction) {
                              bgColor = 'bg-orange-50 dark:bg-orange-900/20';
                              borderColor = 'border-orange-200 dark:border-orange-800';
                              textColor = 'text-orange-700 dark:text-orange-400';
                              titleColor = 'text-orange-800 dark:text-orange-200';
                              icon = '🚨';
                              title = 'Complex Health Interaction';
                            } else if (isDrugInteraction) {
                              bgColor = 'bg-amber-50 dark:bg-amber-900/20';
                              borderColor = 'border-amber-200 dark:border-amber-800';
                              textColor = 'text-amber-700 dark:text-amber-400';
                              titleColor = 'text-amber-800 dark:text-amber-200';
                              icon = '💊';
                              title = 'Drug Interaction';
                            }
                            
                            return (
                              <div key={idx} className={`${bgColor} border ${borderColor} p-4 rounded-lg`}>
                                <div className="flex items-start gap-3">
                                  <span className="text-lg flex-shrink-0">{icon}</span>
                                  <div className="flex-1">
                                    <h5 className={`font-medium ${titleColor} mb-2`}>{title}</h5>
                                    <p className={`text-sm ${textColor} leading-relaxed`}>
                                      {warning.replace(/^[^A-Z]*([A-Z])/, '$1')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Traditional Contraindications */}
                      {rec.contraindications && rec.contraindications.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <h4 className="font-medium text-red-800 dark:text-red-200">Important Safety Notes</h4>
                          </div>
                          <ul className="text-sm text-red-700 dark:text-red-300 space-y-2">
                            {rec.contraindications.map((warning, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-red-500 flex-shrink-0 mt-1">•</span>
                                <span>{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Monitoring Requirements */}
                      {enhancedData?.monitoring_needed && enhancedData.monitoring_needed.length > 0 && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">📊</span>
                            <h4 className="font-medium text-indigo-800 dark:text-indigo-200">Monitoring Required</h4>
                          </div>
                          <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-2">
                            {enhancedData.monitoring_needed.map((item: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-indigo-500 flex-shrink-0 mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* General Safety Guidelines */}
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">General Safety Guidelines</h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-gray-500 flex-shrink-0 mt-1">•</span>
                            <span>Consult your healthcare provider before starting any new supplement</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-gray-500 flex-shrink-0 mt-1">•</span>
                            <span>Start with the lowest recommended dose and increase gradually</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-gray-500 flex-shrink-0 mt-1">•</span>
                            <span>Stop use and consult a doctor if you experience adverse effects</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-gray-500 flex-shrink-0 mt-1">•</span>
                            <span>Keep all supplements out of reach of children</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-gray-500 flex-shrink-0 mt-1">•</span>
                            <span>Store in a cool, dry place away from direct sunlight</span>
                          </li>
                        </ul>
                      </div>

                      {/* Safety Score Display */}
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🛡️</span>
                          <h4 className="font-medium text-emerald-800 dark:text-emerald-200">AI Safety Assessment</h4>
                        </div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          This recommendation has been analyzed against your complete health profile including genetics, 
                          lab results, medications, allergies, and medical conditions using advanced AI safety protocols.
                        </p>
                      </div>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="research" className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">
                      Supporting Research
                      {loadingCitations && <span className="text-sm font-normal text-gray-500"> (Loading...)</span>}
                    </h3>
                    
                    {citations.length === 0 && !isLoading && !loadingCitations ? (
                      <p className="text-gray-600 dark:text-gray-400">No research citations available yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {citations.map((citation) => (
                          <div key={citation.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                  {citation.title || `PubMed Study ${citation.pmid}`}
                                </h4>
                                {citation.summary && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    {citation.summary}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>PMID: {citation.pmid}</span>
                                  {citation.year && <span>• {citation.year}</span>}
                                </div>
                              </div>
                              <a
                                href={`https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View Study
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Tabs.Content>

                  <Tabs.Content value="purchase" className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Where to Buy</h3>
                    
                    {product ? (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg text-green-800 dark:text-green-200">
                              {product.brand}
                            </h4>
                            <p className="text-green-700 dark:text-green-300">
                              {product.product_name || rec.supplement_name}
                            </p>
                          </div>
                          {product.price && (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                ${product.price}
                              </div>
                              <div className="text-sm text-green-600 dark:text-green-400">
                                Best price found
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={handleBuyNow}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 font-medium"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Buy Now from {product.brand}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Compare prices from multiple trusted retailers:
                        </p>
                        
                        <div className="grid gap-3">
                          <button
                            onClick={() => window.open(`https://www.vitacost.com/search?t=${encodeURIComponent(rec.supplement_name)}`, '_blank')}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="text-left">
                              <div className="font-medium">Vitacost</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Competitive prices, frequent sales</div>
                            </div>
                            <ExternalLink className="w-5 h-5 text-gray-400" />
                          </button>
                          
                          <button
                            onClick={() => window.open(`https://www.iherb.com/search?kw=${encodeURIComponent(rec.supplement_name)}`, '_blank')}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="text-left">
                              <div className="font-medium">iHerb</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Global shipping, quality brands</div>
                            </div>
                            <ExternalLink className="w-5 h-5 text-gray-400" />
                          </button>
                          
                          <button
                            onClick={() => window.open(`https://www.amazon.com/s?k=${encodeURIComponent(rec.supplement_name)}`, '_blank')}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="text-left">
                              <div className="font-medium">Amazon</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Fast shipping, customer reviews</div>
                            </div>
                            <ExternalLink className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg mt-6">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">💡 Shopping Tips</h4>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        <li>• Look for third-party tested products (USP, NSF, or ConsumerLab certified)</li>
                        <li>• Check expiration dates and storage requirements</li>
                        <li>• Read customer reviews for real-world experiences</li>
                        <li>• Consider subscription discounts for long-term use</li>
                        <li>• Verify the exact form and dosage matches your recommendation</li>
                      </ul>
                    </div>
                  </Tabs.Content>
                </div>
              </Tabs.Root>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 
