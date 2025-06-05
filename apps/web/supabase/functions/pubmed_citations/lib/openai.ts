// deno-lint-ignore-file
// @ts-nocheck
// openai.ts - v2 2025-06-03
// Safe OpenAI wrapper for abstract summarization with optional API key

export interface UserProfile { [key:string]:any }

export interface SummaryRequest {
  abstract: string;
  supplementName: string;
  userProfile: UserProfile;
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_ORG = Deno.env.get('OPENAI_ORG');

/**
 * Summarize an abstract into 1-3 personalized sentences
 * Returns empty string if OpenAI unavailable or request fails
 */
export async function summarizeAbstract(request: SummaryRequest): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not configured - skipping summarization');
    return '';
  }

  try {
    const prompt = buildPersonalizedPrompt(request);
    const truncatedAbstract = request.abstract.slice(0, 3000); // 3k char limit
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        ...(OPENAI_ORG && { 'OpenAI-Organization': OPENAI_ORG }),
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: `Abstract: ${truncatedAbstract}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      return '';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
    
  } catch (error) {
    console.error('Error in summarizeAbstract:', error);
    return '';
  }
}

function buildPersonalizedPrompt(request: SummaryRequest): string {
  const { supplementName, userProfile } = request;
  
  // Build concise user context (≤150 tokens)
  const contextParts: string[] = [];
  
  if (userProfile.healthConditions && userProfile.healthConditions.length > 0) {
    contextParts.push(`Health conditions: ${userProfile.healthConditions.slice(0, 2).join(', ')}`);
  }
  
  if (userProfile.healthGoals && userProfile.healthGoals.length > 0) {
    contextParts.push(`Goals: ${userProfile.healthGoals[0]}`);
  }
  
  if (userProfile.age) {
    contextParts.push(`Age: ${userProfile.age}`);
  }
  
  const userContext = contextParts.length > 0 
    ? `Patient profile: ${contextParts.join('; ')}.` 
    : 'General supplement inquiry.';
  
  return `You are a medical research summarizer. Given a research abstract about ${supplementName}, provide a 1-3 sentence summary explaining the relevance to this specific patient. ${userContext} Focus on practical implications and be concise.`;
}

