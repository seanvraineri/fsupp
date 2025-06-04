import useSWR from 'swr';

export function useIntake(recId: string) {
  const { data, mutate, isLoading } = useSWR(recId ? `/api/intake?recommendation_id=${recId}` : null, (url) => fetch(url).then(r => r.json()));
  return { count: data?.count ?? 0, mutate, isLoading };
} 
