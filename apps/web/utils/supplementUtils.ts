// Client-side utility for supplement matching
export interface SupplementMatch {
  url: string;
  brand: string;
  productName: string;
  price?: string;
  supplement: string;
}

export async function findSupplementPurchaseLink(supplementName: string): Promise<SupplementMatch | null> {
  try {
    console.log(`🔍 Finding purchase link for: ${supplementName}`);
    
    const response = await fetch('/api/supplement-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ supplementName }),
    });

    const data = await response.json();

    if (data.success && data.match) {
      console.log(`✅ Found purchase link: ${supplementName} → ${data.match.brand}`);
      return data.match;
    }

    console.log(`❌ No purchase link found for: ${supplementName}`);
    return null;
    
  } catch (error) {
    console.error('Error finding supplement purchase link:', error);
    return null;
  }
}

// Cache to avoid repeated API calls for the same supplement
const supplementCache = new Map<string, SupplementMatch | null>();

export async function getCachedSupplementLink(supplementName: string): Promise<SupplementMatch | null> {
  // Check cache first
  if (supplementCache.has(supplementName)) {
    return supplementCache.get(supplementName) || null;
  }

  // Fetch from API and cache result
  const result = await findSupplementPurchaseLink(supplementName);
  supplementCache.set(supplementName, result);
  
  return result;
} 