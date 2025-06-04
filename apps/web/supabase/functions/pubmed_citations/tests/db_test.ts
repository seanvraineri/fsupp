// deno-lint-ignore-file
// @ts-nocheck
// db_test.ts - v2 2025-06-03

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { getTableColumns, upsertCitations, type CitationRecord } from "../lib/db.ts";

// Mock Supabase client
function createMockSupabase() {
  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: string) => ({
          // Mock table columns response
          data: table === 'information_schema.columns' ? [
            { column_name: 'recommendation_id' },
            { column_name: 'pmid' },
            { column_name: 'title' },
            { column_name: 'summary' },
            { column_name: 'score' },
            { column_name: 'created_at' }
          ] : null,
          error: null
        }),
        in: (column: string, values: string[]) => ({
          data: [],
          error: null
        }),
        single: () => ({
          data: {
            supplement_name: 'Magnesium Glycinate',
            user_id: 'test-user-123'
          },
          error: null
        }),
        limit: (n: number) => ({
          maybeSingle: () => ({
            data: {
              health_conditions: ['anxiety', 'insomnia'],
              health_goals: ['better sleep'],
              age: 35,
              gender: 'female'
            },
            error: null
          })
        }),
        order: (column: string, options: any) => ({
          limit: (n: number) => ({
            maybeSingle: () => ({
              data: {
                health_conditions: ['anxiety', 'insomnia'],
                health_goals: ['better sleep'],
                age: 35,
                gender: 'female'
              },
              error: null
            })
          })
        })
      }),
      upsert: (records: any[], options: any) => ({
        select: () => ({
          data: records,
          error: null
        })
      })
    })
  };
}

Deno.test("getTableColumns - successful retrieval", async () => {
  const mockSupabase = createMockSupabase();
  const columns = await getTableColumns(mockSupabase);
  
  assert(columns.has('recommendation_id'));
  assert(columns.has('pmid'));
  assert(columns.has('title'));
  assert(columns.has('summary'));
  assert(columns.has('score'));
  assert(columns.has('created_at'));
});

Deno.test("upsertCitations - successful insert", async () => {
  const mockSupabase = createMockSupabase();
  
  const citations: CitationRecord[] = [
    {
      recommendation_id: 'rec-123',
      pmid: '12345678',
      title: 'Test Study on Magnesium',
      summary: 'This study shows benefits of magnesium supplementation.',
      score: 0.85
    },
    {
      recommendation_id: 'rec-123',
      pmid: '87654321',
      title: 'Another Magnesium Study',
      summary: 'Additional research on magnesium benefits.',
      score: 0.72
    }
  ];
  
  const result = await upsertCitations(mockSupabase, citations);
  
  assert(result.success);
  assertEquals(result.inserted.length, 2);
  assertEquals(result.skipped.length, 0);
  assertEquals(result.inserted[0].pmid, '12345678');
});

Deno.test("upsertCitations - empty array", async () => {
  const mockSupabase = createMockSupabase();
  
  const result = await upsertCitations(mockSupabase, []);
  
  assert(result.success);
  assertEquals(result.inserted.length, 0);
  assertEquals(result.skipped.length, 0);
});

Deno.test("upsertCitations - type conversion", async () => {
  const mockSupabase = createMockSupabase();
  
  const citations: CitationRecord[] = [
    {
      recommendation_id: 'rec-123',
      pmid: '12345678',
      title: 'Test Study',
      summary: 'Test summary',
      score: "0.75" as any // String score should be converted to number
    }
  ];
  
  const result = await upsertCitations(mockSupabase, citations);
  
  assert(result.success);
  assertEquals(result.inserted.length, 1);
}); 