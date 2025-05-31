"use client";
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { RecWithProduct } from './RecommendationCard';
import { X } from 'lucide-react';
import { useCitations } from '../../utils/useCitations';

export default function RecommendationModal({ rec, open, onOpenChange }: { rec: RecWithProduct; open: boolean; onOpenChange: (o: boolean) => void }) {
  const product = rec.product_links?.[0];
  const { citations, isLoading } = useCitations(rec.id);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold">{rec.supplement_name}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                <X />
              </button>
            </Dialog.Close>
          </div>

          <Tabs.Root defaultValue="overview">
            <Tabs.List className="flex gap-4 mb-4">
              <Tabs.Trigger value="overview" className="px-3 py-1 rounded-md data-[state=active]:bg-primary-from data-[state=active]:text-white">Overview</Tabs.Trigger>
              <Tabs.Trigger value="interactions" className="px-3 py-1 rounded-md data-[state=active]:bg-primary-from data-[state=active]:text-white">Interactions</Tabs.Trigger>
              <Tabs.Trigger value="citations" className="px-3 py-1 rounded-md data-[state=active]:bg-primary-from data-[state=active]:text-white">Citations</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="overview" className="space-y-2 text-sm">
              <p><strong>Dosage:</strong> {rec.dosage_amount} {rec.dosage_unit} • {rec.frequency}</p>
              <p><strong>Reason:</strong> {rec.recommendation_reason}</p>
              <p><strong>Evidence:</strong> {rec.evidence_quality}</p>
              {product?.product_url && (
                <a href={product.product_url} target="_blank" className="text-primary-from underline">Buy product</a>
              )}
            </Tabs.Content>
            <Tabs.Content value="interactions" className="space-y-2 text-sm">
              {rec.contraindications?.length ? rec.contraindications.map((c) => <p key={c}>• {c}</p>) : <p>No specific contraindications.</p>}
            </Tabs.Content>
            <Tabs.Content value="citations" className="space-y-3 text-sm">
              {isLoading && <p>Loading citations...</p>}
              {!isLoading && citations.length === 0 && <p>No citations found.</p>}
              {citations.map((c) => (
                <div key={c.id}>
                  <a href={`https://pubmed.ncbi.nlm.nih.gov/${c.pmid}`} target="_blank" className="underline text-primary-from font-medium">{c.title || `PubMed ${c.pmid}`}</a>
                  {c.summary && <p className="mt-1 text-gray-600 dark:text-gray-300">{c.summary}</p>}
                </div>
              ))}
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 