import useSWR from 'swr';

export interface Citation {
  id: string;
  pmid: string;
  title: string | null;
  summary: string | null;
}

export function useCitations(recId: string) {
  const { data, isLoading } = useSWR(recId ? `/api/citations?rec=${recId}` : null, (url) => fetch(url).then(r => r.json()));
  return { citations: (data?.citations ?? []) as Citation[], isLoading };
} 
