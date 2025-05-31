import useSWR from 'swr';

export function useAdherence() {
  const { data, isLoading } = useSWR('/api/intake/summary', (url) => fetch(url).then(r => r.json()));
  const taken = data?.taken ?? 0;
  const expected = data?.expected ?? 0;
  const percent = expected ? Math.min(100, Math.round((taken / expected) * 100)) : 0;
  return { taken, expected, percent, isLoading };
} 