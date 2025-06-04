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
  product_links?: {
    product_url: string | null;
    image_url: string | null;
    price: number | null;
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
      // Call Supabase edge function for intelligent product search
      const { data, error } = await supabase.functions.invoke('product_search', {
        body: { supplement_name: rec.supplement_name }
      });
      
      if (!error && data?.success && data?.product_url) {
        // Open the best product link found
        window.open(data.product_url, '_blank');
      } else {
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
             rec.supplement_name.toLowerCase().includes('omega') || rec.supplement_name.toLowerCase().includes('fish') ? '🐟' :
             rec.supplement_name.toLowerCase().includes('b12') || rec.supplement_name.toLowerCase().includes('b-12') ? '🔋' :
             rec.supplement_name.toLowerCase().includes('iron') ? '⚡' :
             rec.supplement_name.toLowerCase().includes('calcium') ? '🦴' :
             rec.supplement_name.toLowerCase().includes('zinc') ? '✨' :
             rec.supplement_name.toLowerCase().includes('vitamin c') ? '🍊' :
             '💊'}
          </div>
        </div>
      )}
      <h3 className="text-lg font-semibold mb-1 flex-1">{rec.supplement_name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        {rec.dosage_amount} {rec.dosage_unit} • {rec.frequency}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
        {rec.recommendation_reason}
      </p>
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
      {/* Always show intelligent buy button */}
      <div className="mt-2">
        <button
          onClick={handleBuyClick}
          disabled={isSearching}
          className="inline-block text-center w-full py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-primary-from to-primary-to text-white hover:opacity-90 disabled:opacity-50"
        >
          {isSearching ? 'Finding Best Price...' : 'Buy Now'}
        </button>
      </div>
    </div>
  );
} 
