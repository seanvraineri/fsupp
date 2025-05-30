"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Pill } from 'lucide-react';
import { useIntake } from '../../utils/useIntake';

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

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow flex flex-col h-full">
      {product?.image_url ? (
        <div className="relative w-full h-40 mb-4">
          <Image src={product.image_url} alt={rec.supplement_name} fill className="object-contain" />
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 mb-4 bg-gray-100 dark:bg-gray-700 rounded">
          <Pill className="w-8 h-8 text-primary-from" />
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
        {product?.product_url && (
          <Link
            href={product.product_url}
            target="_blank"
            className="inline-block text-center w-full py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-primary-from to-primary-to text-white hover:opacity-90"
          >
            Buy • {product.price ? `$${product.price}` : 'Shop'}
          </Link>
        )}
      </div>
    </div>
  );
} 