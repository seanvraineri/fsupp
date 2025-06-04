// deno-lint-ignore-file
// @ts-nocheck
// pubmed_citations - v2 2025-06-03
// Fetch and store PubMed citations for supplement recommendations

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

import { searchPubMed, type PubMedResult } from "./lib/pubmed.ts";
import { summarizeAbstract, type UserProfile } from "./lib/openai.ts";
import { calculateRelevanceScore, type RelevanceContext } from "./lib/relevance.ts";
import { 
  upsertCitations, 
  getExistingCitations, 
  getRecommendationContext,
  type CitationRecord,
  type DatabaseResult 
} from "./lib/db.ts";

interface CitationRequest {
  recommendation_id: string;
}

interface CitationResult {
  success: boolean;
  citations_found: number;
  citations_new: number;
  recommendation_id: string;
  execution_time_ms: number;
  error?: string;
}

Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Initialize Supabase with environment variables
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not set in environment');
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request
    const { recommendation_id }: CitationRequest = await req.json();
    
    if (!recommendation_id) {
      return new Response(JSON.stringify({ 
        error: 'recommendation_id is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log({ stage: 'start', recommendation_id });

    // Get recommendation context
    const context = await getRecommendationContext(supabase, recommendation_id);
    if (!context) {
      return new Response(JSON.stringify({ 
        error: 'Recommendation not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Search PubMed
    const searchTerm = `${context.supplementName} supplement benefits safety`;
    console.log({ stage: 'pubmed_search', searchTerm });
    
    const pubmedResults = await searchPubMed(searchTerm, {
      maxResults: 5,
      retryAttempts: 3,
      cacheEnabled: true
    });

    if (pubmedResults.length === 0) {
      console.log({ stage: 'no_results', searchTerm });
      
      const result: CitationResult = {
        success: true,
        citations_found: 0,
        citations_new: 0,
        recommendation_id,
        execution_time_ms: Date.now() - startTime
      };

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check for existing citations
    const pmids = pubmedResults.map(r => r.pmid);
    const existingPmids = await getExistingCitations(supabase, recommendation_id, pmids);
    
    // Filter to new citations only
    const newResults = pubmedResults.filter(r => !existingPmids.includes(r.pmid));
    
    if (newResults.length === 0) {
      console.log({ stage: 'all_existing', existingCount: existingPmids.length });
      
      const result: CitationResult = {
        success: true,
        citations_found: pubmedResults.length,
        citations_new: 0,
        recommendation_id,
        execution_time_ms: Date.now() - startTime
      };

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process new citations
    const citations: CitationRecord[] = [];
    
    const relevanceContext: RelevanceContext = {
      supplementName: context.supplementName,
      healthGoals: Array.isArray(context.userProfile.health_goals) 
        ? context.userProfile.health_goals 
        : [],
      conditions: Array.isArray(context.userProfile.health_conditions) 
        ? context.userProfile.health_conditions 
        : []
    };

    const userProfile: UserProfile = {
      healthConditions: relevanceContext.conditions,
      healthGoals: relevanceContext.healthGoals,
      age: typeof context.userProfile.age === 'number' ? context.userProfile.age : undefined,
      gender: typeof context.userProfile.gender === 'string' ? context.userProfile.gender : undefined
    };

    for (const result of newResults) {
      const score = calculateRelevanceScore(result.title, relevanceContext);
      
      // Get personalized summary if OpenAI is available
      let summary = result.abstract;
      if (result.abstract) {
        const aiSummary = await summarizeAbstract({
          abstract: result.abstract,
          supplementName: context.supplementName,
          userProfile
        });
        
        if (aiSummary) {
          summary = aiSummary;
        }
      }

      citations.push({
        recommendation_id,
        pmid: result.pmid,
        title: result.title,
        summary: summary || 'Abstract not available',
        score: Math.round(score * 100) / 100 // round to 2 decimals
      });
    }

    // Store citations
    console.log({ stage: 'storing_citations', count: citations.length });
    
    const dbResult: DatabaseResult = await upsertCitations(supabase, citations);
    
    if (!dbResult.success) {
      console.error({ stage: 'db_error', error: dbResult.error });
      
      return new Response(JSON.stringify({ 
        error: `Database error: ${dbResult.error}` 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return success
    const result: CitationResult = {
      success: true,
      citations_found: pubmedResults.length,
      citations_new: dbResult.inserted.length,
      recommendation_id,
      execution_time_ms: Date.now() - startTime
    };

    console.log({ stage: 'complete', result });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error({ stage: 'error', error });
    
    const result: CitationResult = {
      success: false,
      citations_found: 0,
      citations_new: 0,
      recommendation_id: '',
      execution_time_ms: Date.now() - startTime,
      error: String(error)
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}); 