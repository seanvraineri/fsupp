"use client";
import Image from 'next/image';
import { Pill } from 'lucide-react';
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

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow flex flex-col h-full">
      {product?.image_url ? (
        <div className="relative w-full h-40 mb-4">
          <img src={product.image_url} alt={rec.supplement_name} className="object-contain w-full h-full" loading="lazy" />
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-40 mb-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
          {/* Supplement emoji based on type */}
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
      
      {/* Priority & Evidence Badges */}
      <div className="flex gap-2 mb-2">
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

      <h3 className="text-lg font-semibold mb-1 flex-1">{rec.supplement_name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        {rec.dosage_amount} {rec.dosage_unit} • {rec.frequency}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
        {rec.recommendation_reason}
      </p>
      
      {/* Timeline from expected_benefits */}
      {rec.expected_benefits && rec.expected_benefits.length > 0 && (
        <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
          Timeline: {rec.expected_benefits[0]}
        </p>
      )}
      
      {rec.contraindications && (
        <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-2">
          Caution: {rec.contraindications.join(', ')}
        </p>
      )}
      <p className="text-xs text-gray-500 mb-2">This week: {count} taken</p>
      <div className="mt-auto flex gap-2">
        <button
          onClick={async () => {
            await fetch('/api/intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recommendation_id: rec.id }) });
            mutate();
          }}
          className="flex-1 inline-block text-center py-2 text-sm font-medium rounded-lg border border-primary-from text-primary-from hover:bg-primary-from/10"
        >
          Taken
        </button>
        <button onClick={onDetails} className="flex-1 inline-block text-center py-2 text-sm font-medium rounded-lg border border-primary-from text-primary-from hover:bg-primary-from/10">Details</button>
      </div>
      {/* Enhanced buy button with better info */}
      <div className="mt-2">
        <button
          onClick={handleBuyClick}
          disabled={isSearching}
          className="inline-block text-center w-full py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-primary-from to-primary-to text-white hover:opacity-90 disabled:opacity-50"
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
