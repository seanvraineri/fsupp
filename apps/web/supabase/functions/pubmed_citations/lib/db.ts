// deno-lint-ignore-file
// @ts-nocheck
// db.ts - v2 2025-06-03
// Database utilities for column-safe operations and introspection

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

export interface CitationRecord {
  recommendation_id: string;
  pmid: string;
  title: string;
  summary: string;
  score: number;
  created_at?: string;
  raw_json?: Record<string, unknown>;
}

export interface DatabaseResult {
  success: boolean;
  inserted: CitationRecord[];
  skipped: string[];
  error?: string;
}

/**
 * Get available columns for recommendation_citations table
 */
export async function getTableColumns(supabase: any): Promise<Set<string>> {
  try {
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'recommendation_citations');
    
    if (error) {
      console.error('Failed to get table columns:', error);
      return new Set(['recommendation_id', 'pmid', 'title', 'summary']); // fallback
    }
    
    return new Set(columns?.map((col: any) => col.column_name) || []);
  } catch (error) {
    console.error('Column introspection error:', error);
    return new Set(['recommendation_id', 'pmid', 'title', 'summary']); // fallback
  }
}

/**
 * Safely upsert citation records with column validation
 */
export async function upsertCitations(
  supabase: any,
  citations: CitationRecord[]
): Promise<DatabaseResult> {
  if (citations.length === 0) {
    return { success: true, inserted: [], skipped: [] };
  }

  try {
    // Get available columns
    const availableColumns = await getTableColumns(supabase);
    
    // Prepare records for insert
    const preparedRecords = citations.map(citation => {
      const record: Record<string, unknown> = {
        created_at: new Date().toISOString()
      };
      
      // Add fields that exist as columns
      for (const [key, value] of Object.entries(citation)) {
        if (availableColumns.has(key)) {
          // Type conversion for numeric fields
          if (key === 'score' && typeof value === 'string') {
            record[key] = parseFloat(value) || 0;
          } else {
            record[key] = value;
          }
        }
      }
      
      // Store extra fields in raw_json if column exists
      if (availableColumns.has('raw_json')) {
        const extraFields: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(citation)) {
          if (!availableColumns.has(key)) {
            extraFields[key] = value;
          }
        }
        if (Object.keys(extraFields).length > 0) {
          record.raw_json = extraFields;
        }
      }
      
      return record;
    });

    // Perform upsert
    const { data: insertedData, error: insertError } = await supabase
      .from('recommendation_citations')
      .upsert(preparedRecords, { 
        onConflict: 'recommendation_id,pmid',
        ignoreDuplicates: false 
      })
      .select();

    if (insertError) {
      console.error({ stage: 'upsert', error: insertError });
      return {
        success: false,
        inserted: [],
        skipped: [],
        error: insertError.message
      };
    }

    return {
      success: true,
      inserted: insertedData || [],
      skipped: []
    };

  } catch (error) {
    console.error({ stage: 'upsertCitations', error });
    return {
      success: false,
      inserted: [],
      skipped: [],
      error: String(error)
    };
  }
}

/**
 * Check for existing citations to avoid duplicates
 */
export async function getExistingCitations(
  supabase: any,
  recommendationId: string,
  pmids: string[]
): Promise<string[]> {
  try {
    const { data: existing, error } = await supabase
      .from('recommendation_citations')
      .select('pmid')
      .eq('recommendation_id', recommendationId)
      .in('pmid', pmids);

    if (error) {
      console.error('Error checking existing citations:', error);
      return [];
    }

    return existing?.map((row: any) => row.pmid) || [];
    
  } catch (error) {
    console.error('Error in getExistingCitations:', error);
    return [];
  }
}

/**
 * Get recommendation details for citation context
 */
export async function getRecommendationContext(
  supabase: any,
  recommendationId: string
): Promise<{
  supplementName: string;
  userId: string;
  userProfile: Record<string, unknown>;
} | null> {
  try {
    console.log({ stage: 'db_query_start', recommendationId });
    
    // Get recommendation details
    const { data: recommendation, error: recError } = await supabase
      .from('supplement_recommendations')
      .select('supplement_name, user_id')
      .eq('id', recommendationId)
      .single();

    console.log({ 
      stage: 'recommendation_query', 
      error: recError, 
      hasData: !!recommendation,
      data: recommendation 
    });

    if (recError || !recommendation) {
      console.error('Recommendation not found:', recError);
      return null;
    }

    // Get user health assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('health_assessments')
      .select('health_conditions, health_goals, age, gender, allergies')
      .eq('user_id', recommendation.user_id)
      .eq('is_complete', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log({ 
      stage: 'assessment_query', 
      error: assessmentError, 
      hasData: !!assessment,
      userId: recommendation.user_id 
    });

    if (assessmentError) {
      console.warn('Could not fetch user assessment:', assessmentError);
    }

    return {
      supplementName: recommendation.supplement_name,
      userId: recommendation.user_id,
      userProfile: assessment || {}
    };

  } catch (error) {
    console.error('Error in getRecommendationContext:', error);
    return null;
  }
} 
