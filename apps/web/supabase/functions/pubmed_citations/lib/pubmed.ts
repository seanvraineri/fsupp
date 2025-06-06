// deno-lint-ignore-file
// @ts-nocheck
// pubmed.ts - v2 2025-06-03
// PubMed eUtils wrapper with exponential backoff and Storage caching

export interface PubMedResult {
  pmid: string;
  title: string;
  abstract: string;
}

export interface SearchOptions {
  maxResults?: number;
  retryAttempts?: number;
  cacheEnabled?: boolean;
}

const PUBMED_API_KEY = Deno.env.get('PUBMED_API_KEY');
const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

/**
 * Search PubMed and fetch abstracts with retry logic and caching
 */
export async function searchPubMed(
  searchTerm: string, 
  options: SearchOptions = {}
): Promise<PubMedResult[]> {
  const {
    maxResults = 5,
    retryAttempts = 3,
    cacheEnabled = true
  } = options;

  try {
    // Step 1: Search for PMIDs
    const pmids = await searchPMIDs(searchTerm, maxResults, retryAttempts);
    if (pmids.length === 0) return [];

    // Step 2: Get titles from eSummary
    const summaries = await getSummaries(pmids, retryAttempts);
    
    // Step 3: Fetch abstracts (limit to first 3)
    const results: PubMedResult[] = [];
    const limitedPmids = pmids.slice(0, 3);
    
    for (const pmid of limitedPmids) {
      const title = summaries[pmid] || 'No title available';
      const abstract = await getAbstract(pmid, retryAttempts, cacheEnabled);
      
      results.push({
        pmid,
        title,
        abstract
      });
    }

    return results;
    
  } catch (error) {
    console.error({ stage: 'searchPubMed', searchTerm, error });
    return [];
  }
}

/**
 * Search for PMIDs using eSearch
 */
async function searchPMIDs(searchTerm: string, maxResults: number, retryAttempts: number): Promise<string[]> {
  const url = `${BASE_URL}/esearch.fcgi?db=pubmed&retmode=json&retmax=${maxResults}&sort=relevance&term=${encodeURIComponent(searchTerm)}${PUBMED_API_KEY ? `&api_key=${PUBMED_API_KEY}` : ''}`;
  
  const response = await fetchWithRetry(url, retryAttempts);
  if (!response) return [];
  
  const data = await response.json();
  return data.esearchresult?.idlist || [];
}

/**
 * Get article summaries using eSummary
 */
async function getSummaries(pmids: string[], retryAttempts: number): Promise<Record<string, string>> {
  const url = `${BASE_URL}/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json${PUBMED_API_KEY ? `&api_key=${PUBMED_API_KEY}` : ''}`;
  
  const response = await fetchWithRetry(url, retryAttempts);
  if (!response) return {};
  
  const data = await response.json();
  const summaries: Record<string, string> = {};
  
  for (const pmid of pmids) {
    summaries[pmid] = data.result?.[pmid]?.title || 'No title available';
  }
  
  return summaries;
}

/**
 * Get abstract for a single PMID with caching
 */
async function getAbstract(pmid: string, retryAttempts: number, cacheEnabled: boolean): Promise<string> {
  const cacheKey = `pubmed_abstract_${pmid}`;
  
  // Try cache first
  if (cacheEnabled) {
    try {
      const cached = await getCachedAbstract(cacheKey);
      if (cached) return cached;
    } catch (error) {
      console.warn('Cache read failed:', error);
    }
  }
  
  // Fetch from PubMed
  const url = `${BASE_URL}/efetch.fcgi?db=pubmed&id=${pmid}&rettype=abstract&retmode=text${PUBMED_API_KEY ? `&api_key=${PUBMED_API_KEY}` : ''}`;
  
  const response = await fetchWithRetry(url, retryAttempts);
  if (!response) return '';
  
  const abstract = await response.text();
  
  // Cache the result
  if (cacheEnabled && abstract) {
    try {
      await cacheAbstract(cacheKey, abstract);
    } catch (error) {
      console.warn('Cache write failed:', error);
    }
  }
  
  return abstract;
}

/**
 * Fetch with exponential backoff retry logic
 */
async function fetchWithRetry(url: string, maxAttempts: number): Promise<Response | null> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url);
      
      if (response.ok) {
        return response;
      }
      
      // Handle rate limiting
      if (response.status === 429 || response.status >= 500) {
        const delay = Math.min(500 * Math.pow(2, attempt - 1), 5000); // Cap at 5s
        console.warn(`PubMed API ${response.status}, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Non-retryable error
      console.error(`PubMed API error: ${response.status}`);
      return null;
      
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        const delay = Math.min(500 * Math.pow(2, attempt - 1), 5000);
        console.warn(`Fetch error, retrying in ${delay}ms:`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('All retry attempts failed:', lastError);
  return null;
}

/**
 * Get cached abstract from Supabase Storage
 */
async function getCachedAbstract(cacheKey: string): Promise<string | null> {
  try {
    // This would require Supabase client - simplified for now
    // In practice, we'd inject the Supabase client or use a global
    return null; // TODO: Implement with actual Supabase Storage
  } catch {
    return null;
  }
}

/**
 * Cache abstract in Supabase Storage with 24h TTL
 */
async function cacheAbstract(cacheKey: string, abstract: string): Promise<void> {
  try {
    // This would require Supabase client - simplified for now
    // In practice, we'd inject the Supabase client or use a global
    // TODO: Implement with actual Supabase Storage
  } catch (error) {
    console.warn('Failed to cache abstract:', error);
  }
} 
