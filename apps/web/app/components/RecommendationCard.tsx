"use client";
import Image from 'next/image';
import { Pill, Dna, Activity, Clock, AlertTriangle } from 'lucide-react';
import { useIntake } from '../../utils/useIntake';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface RecWithProduct {
  id: string;
  supplement_name: string;
  dosage_amount: number;
  dosage_unit: string;
  frequency: string;
  recommendation_reason: string;
  evidence_quality: string;
  contraindications: string[] | null;
  priority_score?: number;
  expected_benefits?: string[] | null;
  timing?: string;
  interaction_warnings?: string[] | null;
  monitoring_needed?: string[] | null;
  genetic_reasoning?: string;
  biomarker_reasoning?: string;
  product_links?: {
    id?: string;
    product_url: string | null;
    product_name?: string | null;
    brand?: string | null;
    image_url: string | null;
    price: number | null;
    verified?: boolean;
  }[];
}

export default function RecommendationCard({ rec, onDetails }: { rec: RecWithProduct; onDetails: () => void }) {
  const product = rec.product_links?.[0];
  const { count, mutate } = useIntake(rec.id);
  const [isSearching, setIsSearching] = useState(false);
  const supabase = createClientComponentClient();

  const handleBuyClick = async () => {
    setIsSearching(true);
    try {
      // First, try to use existing product links if available
      if (product?.product_url && product.verified !== false) {
        console.log(`Using existing product link: ${product.brand} - ${product.product_url}`);
        window.open(product.product_url, '_blank');
        return;
      }

      // If no product links exist, call the product_search function
      console.log(`No existing links found, searching for: ${rec.supplement_name}`);
      const { data, error } = await supabase.functions.invoke('product_search', {
        body: { supplement_name: rec.supplement_name }
      });
      
      if (!error && data?.success && data?.product_url) {
        console.log(`Found via search: ${data.brand} - ${data.product_url}`);
        window.open(data.product_url, '_blank');
      } else {
        console.log('Search failed, using generic fallback');
        // Fallback to generic search
        window.open(`https://www.vitacost.com/search?t=${encodeURIComponent(rec.supplement_name)}`, '_blank');
      }
    } catch (error) {
      console.error('Product search error:', error);
      // Fallback to generic search
      window.open(`https://www.vitacost.com/search?t=${encodeURIComponent(rec.supplement_name)}`, '_blank');
    } finally {
      setIsSearching(false);
    }
  };

  // Get button text and subtitle based on what's available
  const getButtonInfo = () => {
    if (isSearching) return { text: 'Finding Best Price...', subtitle: null };
    
    if (product?.product_url && product.verified !== false) {
      const brandText = product.brand || 'Shop Now';
      const priceText = product.price ? ` - $${product.price}` : '';
      return { 
        text: `Buy from ${brandText}`, 
        subtitle: product.price ? `$${product.price}` : null 
      };
    }
    
    return { text: 'Find Best Price', subtitle: 'Multiple retailers' };
  };

  const buttonInfo = getButtonInfo();

  // Extract genetic/biomarker insights from reasoning
  const extractInsights = (reasoning: string) => {
    const hasGenetic = /\b(MTHFR|COMT|APOE|FADS|VDR|CYP|rs\d+)\b/i.test(reasoning);
    const hasBiomarker = /\b(vitamin|mineral|cholesterol|glucose|iron|B12|folate|magnesium|omega)\b/i.test(reasoning);
    return { hasGenetic, hasBiomarker };
  };

  const insights = extractInsights(rec.recommendation_reason);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow flex flex-col h-full hover:shadow-lg transition-shadow">
      {product?.image_url ? (
        <div className="relative w-full h-40 mb-4">
          <Image 
            src={product.image_url} 
            alt={rec.supplement_name} 
            fill
            className="object-contain" 
            loading="lazy" 
          />
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-40 mb-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
          {/* Enhanced supplement emoji based on type */}
          <div className="text-6xl">
            {rec.supplement_name.toLowerCase().includes('vitamin d') ? '☀️' :
             rec.supplement_name.toLowerCase().includes('magnesium') ? '🧲' :
             rec.supplement_name.toLowerCase().includes('omega') || rec.supplement_name.toLowerCase().includes('fish') || rec.supplement_name.toLowerCase().includes('dha') ? '🐟' :
             rec.supplement_name.toLowerCase().includes('b12') || rec.supplement_name.toLowerCase().includes('b-12') ? '🔋' :
             rec.supplement_name.toLowerCase().includes('iron') ? '⚡' :
             rec.supplement_name.toLowerCase().includes('calcium') ? '🦴' :
             rec.supplement_name.toLowerCase().includes('zinc') ? '✨' :
             rec.supplement_name.toLowerCase().includes('vitamin c') ? '🍊' :
             rec.supplement_name.toLowerCase().includes('folate') || rec.supplement_name.toLowerCase().includes('folic') ? '🧬' :
             rec.supplement_name.toLowerCase().includes('betaine') || rec.supplement_name.toLowerCase().includes('tmg') ? '🔬' :
             rec.supplement_name.toLowerCase().includes('same') ? '⚗️' :
             rec.supplement_name.toLowerCase().includes('tyrosine') ? '🎯' :
             rec.supplement_name.toLowerCase().includes('theanine') ? '🍃' :
             rec.supplement_name.toLowerCase().includes('nac') ? '🛡️' :
             rec.supplement_name.toLowerCase().includes('selenium') ? '⚡' :
             rec.supplement_name.toLowerCase().includes('manganese') ? '🔋' :
             rec.supplement_name.toLowerCase().includes('curcumin') ? '🌶️' :
             rec.supplement_name.toLowerCase().includes('berberine') ? '🌿' :
             '💊'}
          </div>
        </div>
      )}
      
      {/* Enhanced Priority & Evidence Badges */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {rec.priority_score && (
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
            rec.priority_score >= 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
            rec.priority_score >= 3 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
            'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
          }`}>
            {rec.priority_score >= 5 ? 'High Priority' : rec.priority_score >= 3 ? 'Medium Priority' : 'Low Priority'}
          </span>
        )}
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
          rec.evidence_quality === 'high' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' :
          rec.evidence_quality === 'moderate' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' :
          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {rec.evidence_quality === 'high' ? 'Strong Evidence' : rec.evidence_quality === 'moderate' ? 'Moderate Evidence' : 'Limited Evidence'}
        </span>
      </div>

      {/* Personalization Indicators */}
      {(insights.hasGenetic || insights.hasBiomarker) && (
        <div className="flex gap-1 mb-2">
          {insights.hasGenetic && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded-full">
              <Dna className="w-3 h-3" />
              Genetic
            </span>
          )}
          {insights.hasBiomarker && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full">
              <Activity className="w-3 h-3" />
              Lab-Based
            </span>
          )}
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2 flex-1">{rec.supplement_name}</h3>
      
      {/* Enhanced dosage display */}
      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dosage</p>
            <p className="font-semibold text-blue-600 dark:text-blue-400">
              {rec.dosage_amount} {rec.dosage_unit}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Frequency</p>
            <p className="text-sm capitalize">{rec.frequency}</p>
          </div>
        </div>
        {rec.timing && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{rec.timing}</span>
          </div>
        )}
      </div>

      {/* Enhanced reasoning display */}
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3 leading-relaxed">
        {rec.recommendation_reason}
      </p>
      
      {/* Timeline from expected_benefits */}
      {rec.expected_benefits && rec.expected_benefits.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg mb-3">
          <p className="text-xs text-green-700 dark:text-green-400 font-medium">
            ⏱️ {rec.expected_benefits[0]}
          </p>
        </div>
      )}
      
      {/* Enhanced comprehensive safety warnings display */}
      {(rec.contraindications && rec.contraindications.length > 0) || (rec.interaction_warnings && rec.interaction_warnings.length > 0) && (
        <div className="space-y-2 mb-3">
          {rec.interaction_warnings && rec.interaction_warnings.length > 0 && (
            rec.interaction_warnings.map((warning, idx) => {
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
              let icon = '⚠️';
              
              if (isAllergyWarning) {
                bgColor = 'bg-red-50 dark:bg-red-900/20';
                borderColor = 'border-red-200 dark:border-red-800';
                textColor = 'text-red-700 dark:text-red-400';
                icon = '❌';
              } else if (isGeneticWarning) {
                bgColor = 'bg-purple-50 dark:bg-purple-900/20';
                borderColor = 'border-purple-200 dark:border-purple-800';
                textColor = 'text-purple-700 dark:text-purple-400';
                icon = '🧬';
              } else if (isBiomarkerWarning) {
                bgColor = 'bg-blue-50 dark:bg-blue-900/20';
                borderColor = 'border-blue-200 dark:border-blue-800';
                textColor = 'text-blue-700 dark:text-blue-400';
                icon = '🩸';
              } else if (isAIWarning) {
                bgColor = 'bg-green-50 dark:bg-green-900/20';
                borderColor = 'border-green-200 dark:border-green-800';
                textColor = 'text-green-700 dark:text-green-400';
                icon = '🤖';
              } else if (isComplexInteraction) {
                bgColor = 'bg-orange-50 dark:bg-orange-900/20';
                borderColor = 'border-orange-200 dark:border-orange-800';
                textColor = 'text-orange-700 dark:text-orange-400';
                icon = '🚨';
              }
              
              return (
                <div key={idx} className={`${bgColor} border ${borderColor} p-2 rounded-lg`}>
                  <div className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0">{icon}</span>
                    <p className={`text-xs ${textColor} leading-relaxed`}>
                      {warning.replace(/^[^A-Z]*([A-Z])/, '$1')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          
          {rec.contraindications && rec.contraindications.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-2 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Safety Notes</p>
                  {rec.contraindications.slice(0, 2).map((contraindication, idx) => (
                    <p key={idx} className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      • {contraindication}
                    </p>
                  ))}
                  {rec.contraindications.length > 2 && (
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                      +{rec.contraindications.length - 2} more safety notes
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monitoring requirements */}
      {rec.monitoring_needed && rec.monitoring_needed.length > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-2 rounded-lg mb-3">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-sm">📊</span>
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">Monitoring Required</p>
          </div>
          <p className="text-xs text-indigo-700 dark:text-indigo-400">
            {rec.monitoring_needed[0]}
            {rec.monitoring_needed.length > 1 && <span className="text-indigo-600"> +{rec.monitoring_needed.length - 1} more</span>}
          </p>
        </div>
      )}

      {/* Usage tracking */}
      <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg mb-4">
        <p className="text-xs text-gray-600 dark:text-gray-400">This week: <span className="font-medium">{count} taken</span></p>
      </div>

      {/* Action buttons */}
      <div className="mt-auto space-y-2">
        <div className="flex gap-2">
          <button
            onClick={async () => {
              await fetch('/api/intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recommendation_id: rec.id }) });
              mutate();
            }}
            className="flex-1 inline-block text-center py-2 text-sm font-medium rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            ✓ Taken
          </button>
          <button 
            onClick={onDetails} 
            className="flex-1 inline-block text-center py-2 text-sm font-medium rounded-lg border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            📋 Details
          </button>
        </div>
        
        {/* Enhanced buy button */}
        <button
          onClick={handleBuyClick}
          disabled={isSearching}
          className="inline-block text-center w-full py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
        >
          {buttonInfo.text}
        </button>
        {buttonInfo.subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
            {buttonInfo.subtitle}
          </p>
        )}
      </div>
    </div>
  );
} 
