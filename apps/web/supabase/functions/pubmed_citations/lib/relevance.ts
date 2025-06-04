// relevance.ts - v2 2025-06-03
// Cosine similarity utility for scoring PubMed results against supplement context

export interface RelevanceContext {
  supplementName: string;
  healthGoals: string[];
  conditions: string[];
}

/**
 * Simple cosine similarity between two text strings
 * Returns score 0-1 where 1 is perfect match
 */
export function cosineSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  
  const vocab = new Set([...tokens1, ...tokens2]);
  const vector1: number[] = [];
  const vector2: number[] = [];
  
  for (const token of vocab) {
    vector1.push(countOccurrences(tokens1, token));
    vector2.push(countOccurrences(tokens2, token));
  }
  
  return dotProduct(vector1, vector2) / (magnitude(vector1) * magnitude(vector2));
}

/**
 * Calculate relevance score for a PubMed title against user context
 */
export function calculateRelevanceScore(title: string, context: RelevanceContext): number {
  const contextText = [
    context.supplementName,
    ...context.healthGoals,
    ...context.conditions.slice(0, 2) // limit to top 2 conditions
  ].join(' ').toLowerCase();
  
  return cosineSimilarity(title.toLowerCase(), contextText);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2);
}

function countOccurrences(tokens: string[], target: string): number {
  return tokens.filter(token => token === target).length;
}

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function magnitude(vector: number[]): number {
  return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
} 
