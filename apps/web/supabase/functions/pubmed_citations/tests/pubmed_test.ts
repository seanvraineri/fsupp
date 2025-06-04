// deno-lint-ignore-file
// @ts-nocheck
// pubmed_test.ts - v2 2025-06-03

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { searchPubMed } from "../lib/pubmed.ts";

// Mock fetch for testing
const originalFetch = globalThis.fetch;

Deno.test("searchPubMed - successful search", async () => {
  // Mock PubMed API responses
  globalThis.fetch = async (url: string) => {
    if (url.includes('esearch.fcgi')) {
      return new Response(JSON.stringify({
        esearchresult: {
          idlist: ["12345678", "87654321"]
        }
      }), { status: 200 });
    }
    
    if (url.includes('esummary.fcgi')) {
      return new Response(JSON.stringify({
        result: {
          "12345678": {
            title: "Magnesium supplementation improves sleep quality"
          },
          "87654321": {
            title: "Effects of magnesium on anxiety and stress"
          }
        }
      }), { status: 200 });
    }
    
    if (url.includes('efetch.fcgi')) {
      if (url.includes('12345678')) {
        return new Response("This study examined the effects of magnesium supplementation on sleep quality in adults with insomnia...", { status: 200 });
      }
      if (url.includes('87654321')) {
        return new Response("A randomized controlled trial investigating magnesium's impact on anxiety levels...", { status: 200 });
      }
    }
    
    return originalFetch(url);
  };
  
  const results = await searchPubMed("magnesium supplementation", {
    maxResults: 2,
    retryAttempts: 1,
    cacheEnabled: false
  });
  
  assertEquals(results.length, 2);
  assertEquals(results[0].pmid, "12345678");
  assertEquals(results[0].title, "Magnesium supplementation improves sleep quality");
  assert(results[0].abstract.includes("sleep quality"));
  
  // Restore original fetch
  globalThis.fetch = originalFetch;
});

Deno.test("searchPubMed - no results", async () => {
  // Mock empty search response
  globalThis.fetch = async (url: string) => {
    if (url.includes('esearch.fcgi')) {
      return new Response(JSON.stringify({
        esearchresult: {
          idlist: []
        }
      }), { status: 200 });
    }
    return originalFetch(url);
  };
  
  const results = await searchPubMed("nonexistent supplement xyz", {
    maxResults: 5,
    retryAttempts: 1,
    cacheEnabled: false
  });
  
  assertEquals(results.length, 0);
  
  // Restore original fetch
  globalThis.fetch = originalFetch;
});

Deno.test("searchPubMed - API error handling", async () => {
  // Mock API error
  globalThis.fetch = async (url: string) => {
    if (url.includes('esearch.fcgi')) {
      return new Response('Server Error', { status: 500 });
    }
    return originalFetch(url);
  };
  
  const results = await searchPubMed("test search", {
    maxResults: 3,
    retryAttempts: 1,
    cacheEnabled: false
  });
  
  assertEquals(results.length, 0);
  
  // Restore original fetch
  globalThis.fetch = originalFetch;
}); 